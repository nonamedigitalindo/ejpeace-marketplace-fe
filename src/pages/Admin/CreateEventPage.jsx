import { useEffect, useState } from "react";
import { FaSpinner } from "react-icons/fa";

import resolveImageSrc from "../../utils/image";
import {
  getEvents,
  getEventById,
  addEvent,
  updateEvent,
  deleteEvent,
} from "../../api/event";

// ============================================================
// TIMEZONE UTILITY FUNCTIONS
// ============================================================

function utcToLocalInput(utcString) {
  if (!utcString) return "";
  const date = new Date(utcString);
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - (offset * 60 * 1000));
  return localDate.toISOString().slice(0, 16);
}

function localInputToUTC(localString) {
  if (!localString) return "";
  const date = new Date(localString);
  return date.toISOString();
}

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  
  // Alert state
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  
  // Loading state for submit
  const [submitting, setSubmitting] = useState(false);
  
  // Confirmation modal state
  const [confirmDelete, setConfirmDelete] = useState({ show: false, id: null, title: '' });

  const emptyForm = {
    title: "",
    description: "",
    location: "",
    price: 0,
    discount_percentage: 0,
    start_date: "",
    end_date: "",
    images: [], // Changed to array for multiple images
    existingImages: [], // Track existing images
  };

  const [addForm, setAddForm] = useState(emptyForm);
  const [editForm, setEditForm] = useState(emptyForm);

  // Show alert function
  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => {
      setAlert({ show: false, type: '', message: '' });
    }, 5000);
  };

  // LOAD DATA
  const loadEvents = async () => {
    setLoading(true);
    try {
      const res = await getEvents();
      const data = res?.data ?? res;
      const payload = Array.isArray(data)
        ? data
        : data?.events ?? data?.results ?? data ?? [];
      setEvents(payload);
    } catch (err) {
      console.error("Failed to load events", err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  // OPEN EDIT FORM
  const openEditForm = async (id) => {
    try {
      const res = await getEventById(id);
      const data = res?.data ?? res ?? {};

      // Handle both single image (string) and multiple images (array)
      let existingImages = [];
      if (data.images && Array.isArray(data.images)) {
        existingImages = data.images;
      } else if (data.image) {
        existingImages = [data.image];
      }

      setSelectedId(id);
      setEditForm({
        title: data.title ?? "",
        description: data.description ?? "",
        location: data.location ?? "",
        price: data.price ?? 0,
        discount_percentage: data.discount_percentage ?? 0,
        start_date: utcToLocalInput(data.start_date),
        end_date: utcToLocalInput(data.end_date),
        images: [],
        existingImages: existingImages,
      });

      setOpenEdit(true);
    } catch (err) {
      console.error("Failed to load event", err);
    }
  };

  // Handle multiple file selection
  const handleFileChange = (e, isEdit = false) => {
    const files = Array.from(e.target.files || []);
    if (isEdit) {
      setEditForm(prev => ({ ...prev, images: [...prev.images, ...files] }));
    } else {
      setAddForm(prev => ({ ...prev, images: [...prev.images, ...files] }));
    }
    // Clear input to allow re-selecting same file
    e.target.value = '';
  };

  // Remove new image from queue
  const removeNewImage = (index, isEdit = false) => {
    if (isEdit) {
      setEditForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
    } else {
      setAddForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
    }
  };

  // Remove existing image
  const removeExistingImage = (index) => {
    setEditForm(prev => ({ ...prev, existingImages: prev.existingImages.filter((_, i) => i !== index) }));
  };

  // DELETE EVENT
  const handleDeleteClick = (id, title) => {
    setConfirmDelete({ show: true, id, title });
  };

  const handleConfirmDelete = async () => {
    const { id } = confirmDelete;
    setConfirmDelete({ show: false, id: null, title: '' });
    
    try {
      await deleteEvent(id);
      showAlert('success', 'Event deleted successfully!');
      loadEvents();
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message;
      showAlert('error', 'Failed to delete event: ' + errorMsg);
    }
  };

  const handleCancelDelete = () => {
    setConfirmDelete({ show: false, id: null, title: '' });
  };

  // ADD EVENT
const handleAdd = async (e) => {
  e.preventDefault();

  // Validation
  if (!addForm.title.trim()) {
    showAlert('error', 'Title is required');
    return;
  }
  if (!addForm.location.trim()) {
    showAlert('error', 'Location is required');
    return;
  }
  if (!addForm.start_date) {
    showAlert('error', 'Start date is required');
    return;
  }
  if (!addForm.end_date) {
    showAlert('error', 'End date is required');
    return;
  }

  setSubmitting(true);

  try {
    const startDateUTC = localInputToUTC(addForm.start_date);
    const endDateUTC = localInputToUTC(addForm.end_date);

    // ================================
    // STEP 1 — CREATE EVENT (with first image only)
    // ================================
    const fd = new FormData();
    fd.append("title", addForm.title.trim());
    fd.append("description", addForm.description.trim());
    fd.append("location", addForm.location.trim());
    fd.append("price", "0");
    fd.append("discount_percentage", "0");
    fd.append("start_date", startDateUTC);
    fd.append("end_date", endDateUTC);

    // Upload first image if exists
    if (addForm.images.length > 0 && addForm.images[0] instanceof File) {
      fd.append("image", addForm.images[0]);
    }

    const result = await addEvent(fd);
    const eventData = result.data || result;
    const eventId = eventData.id;

    if (!eventId) {
      throw new Error("The server did not return the event ID.");
    }

    // ================================
    // STEP 2 — UPLOAD ADDITIONAL IMAGES ONE BY ONE
    // Fetch event data after each upload to get current images
    // ================================
    if (addForm.images.length > 1) {
      console.log(`Uploading ${addForm.images.length - 1} additional images...`);

      for (let i = 1; i < addForm.images.length; i++) {
        // GET current event data to retrieve existing images
        const currentEvent = await getEventById(eventId);
        const currentData = currentEvent?.data ?? currentEvent ?? {};
        
        // Get current images
        let currentImages = [];
        if (currentData.images && Array.isArray(currentData.images)) {
          currentImages = currentData.images;
        } else if (currentData.image) {
          currentImages = [currentData.image];
        }

        // Clean image paths
        const cleanedImages = currentImages.map(img => {
          return typeof img === 'string'
            ? img.replace('http://localhost:3000', '')
                .replace('http://212.85.27.163', '')
                .replace(/^https?:\/\/[^\/]+/, '')
            : img;
        });

        const updateFd = new FormData();
        updateFd.append("title", addForm.title.trim());
        updateFd.append("description", addForm.description.trim());
        updateFd.append("location", addForm.location.trim());
        updateFd.append("price", "0");
        updateFd.append("discount_percentage", "0");
        updateFd.append("start_date", startDateUTC);
        updateFd.append("end_date", endDateUTC);

        // Keep existing images
        updateFd.append("existingImages", JSON.stringify(cleanedImages));

        // Upload ONE new image
        if (addForm.images[i] instanceof File) {
          updateFd.append("image", addForm.images[i]);
        }

        console.log(`Uploading image ${i + 1}/${addForm.images.length}...`);
        console.log(`Preserving ${cleanedImages.length} existing images`);
        
        await updateEvent(eventId, updateFd);
      }

      console.log('All images uploaded successfully');
    }

    showAlert('success', `Event created successfully with ${addForm.images.length} image(s)!`);
    setAddForm(emptyForm);
    setOpenAdd(false);
    loadEvents();

  } catch (err) {
    const errorMsg =
      err.response?.data?.error ||
      err.response?.data?.message ||
      err.message;

    showAlert('error', 'Failed to add event: ' + errorMsg);
  } finally {
    setSubmitting(false);
  }
};

  // UPDATE EVENT
 const handleUpdate = async (e) => {
  e.preventDefault();
  setSubmitting(true);

  try {
    console.log("=== UPDATE EVENT DEBUG ===");
    console.log("Event ID:", selectedId);
    console.log("Existing images:", editForm.existingImages);
    console.log("New images count:", editForm.images.length);

    const startDateUTC = localInputToUTC(editForm.start_date);
    const endDateUTC = localInputToUTC(editForm.end_date);

    // ================================
    // UPLOAD NEW IMAGES ONE BY ONE
    // Fetch event data after each upload to get current images
    // ================================
    if (editForm.images.length > 0) {
      console.log(`Uploading ${editForm.images.length} new images...`);

      for (let i = 0; i < editForm.images.length; i++) {
        // GET current event data to retrieve existing images
        const currentEvent = await getEventById(selectedId);
        const currentData = currentEvent?.data ?? currentEvent ?? {};
        
        // Get current images
        let currentImages = [];
        if (currentData.images && Array.isArray(currentData.images)) {
          currentImages = currentData.images;
        } else if (currentData.image) {
          currentImages = [currentData.image];
        }

        // Clean image paths
        const cleanedImages = currentImages.map(img => {
          return typeof img === 'string'
            ? img.replace('http://localhost:3000', '')
                .replace('http://212.85.27.163', '')
                .replace(/^https?:\/\/[^\/]+/, '')
            : img;
        });

        const fd = new FormData();
        fd.append("title", editForm.title ?? "");
        fd.append("description", editForm.description ?? "");
        fd.append("location", editForm.location ?? "");
        fd.append("price", editForm.price ?? 0);
        fd.append("discount_percentage", String(editForm.discount_percentage ?? 0));
        fd.append("start_date", startDateUTC);
        fd.append("end_date", endDateUTC);

        // Keep existing images
        fd.append("existingImages", JSON.stringify(cleanedImages));

        // Upload ONE new image
        if (editForm.images[i] instanceof File) {
          fd.append("image", editForm.images[i]);
        }

        console.log(`Uploading image ${i + 1}/${editForm.images.length}...`);
        console.log(`Preserving ${cleanedImages.length} existing images`);
        
        await updateEvent(selectedId, fd);
      }

      console.log('All images uploaded successfully');
    } else {
      // No new images, just update text data + preserve existing
      const fd = new FormData();
      fd.append("title", editForm.title ?? "");
      fd.append("description", editForm.description ?? "");
      fd.append("location", editForm.location ?? "");
      fd.append("price", editForm.price ?? 0);
      fd.append("discount_percentage", String(editForm.discount_percentage ?? 0));
      fd.append("start_date", startDateUTC);
      fd.append("end_date", endDateUTC);

      if (editForm.existingImages.length > 0) {
        const imagePaths = editForm.existingImages.map(img => {
          return typeof img === 'string'
            ? img.replace('http://localhost:3000', '')
                .replace('http://212.85.27.163', '')
                .replace(/^https?:\/\/[^\/]+/, '')
            : img;
        });
        fd.append("existingImages", JSON.stringify(imagePaths));
      }

      await updateEvent(selectedId, fd);
    }

    console.log("✅ Event updated successfully");
    showAlert('success', 'Event updated successfully!');
    setOpenEdit(false);
    loadEvents();
  } catch (err) {
    console.error("❌ Failed to update event", err);
    console.error("Error response:", err.response?.data);
    const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message;
    showAlert('error', 'Failed to update event: ' + errorMsg);
  } finally {
    setSubmitting(false);
  }
};
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Event Management</h1>

      {/* Custom Alert */}
      {alert.show && (
        <div className={`mb-4 p-4 rounded-lg flex items-center justify-between shadow-lg animate-slide-down ${
          alert.type === 'success' ? 'bg-green-100 border-l-4 border-green-500 text-green-700' : 
          'bg-red-100 border-l-4 border-red-500 text-red-700'
        }`}>
          <div className="flex items-center">
            {alert.type === 'success' ? (
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            <span className="font-medium">{alert.message}</span>
          </div>
          <button 
            onClick={() => setAlert({ show: false, type: '', message: '' })}
            className="ml-4 text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
      )}

      {/* Loading Overlay */}
      {submitting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-700 font-medium">Uploading event...</p>
            <p className="text-gray-500 text-sm mt-2">Please wait, this may take a moment</p>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmDelete.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="bg-red-100 rounded-full p-3 mr-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Delete Event</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete <span className="font-semibold">"{confirmDelete.title}"</span>?
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={handleCancelDelete}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpenAdd(true)}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4 hover:bg-blue-600 transition"
      >
        Add Event
      </button>

      {loading ? (
        <div className="flex items-center justify-center">
          <FaSpinner className="animate-spin mr-2" /> Loading...
        </div>
      ) : (
        <div className="overflow-x-auto bg-white p-4 rounded shadow">
          <table className="min-w-full border-collapse">
            <thead style={{ background: "#E1F4F3" }}>
              <tr>
                <th className="p-3 border-b">Title</th>
                <th className="p-3 border-b">Location</th>
                <th className="p-3 border-b">Start Date</th>
                <th className="p-3 border-b">End Date</th>
                <th className="p-3 border-b">Images</th>
                <th className="p-3 border-b">Action</th>
              </tr>
            </thead>

            <tbody>
              {events.map((ev) => {
                // Handle both single image and multiple images
                const eventImages = ev.images 
                  ? (Array.isArray(ev.images) ? ev.images : [ev.images])
                  : (ev.image ? [ev.image] : []);

                return (
                  <tr key={ev.id} className="border-b hover:bg-gray-100">
                    <td className="p-3">{ev.title}</td>
                    <td className="p-3">{ev.location}</td>
                    <td className="p-3">
                      {new Date(ev.start_date).toLocaleString('id-ID', {
                        timeZone: 'Asia/Jakarta',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="p-3">
                      {new Date(ev.end_date).toLocaleString('id-ID', {
                        timeZone: 'Asia/Jakarta',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="p-3">
                      {eventImages.length > 0 ? (
                        <div className="flex gap-1 flex-wrap">
                          {eventImages.slice(0, 3).map((img, idx) => (
                            <img
                              key={idx}
                              src={resolveImageSrc(img)}
                              alt={`${ev.title} ${idx + 1}`}
                              className="w-12 h-12 object-cover rounded shadow"
                            />
                          ))}
                          {eventImages.length > 3 && (
                            <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xs">
                              +{eventImages.length - 3}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">No Images</span>
                      )}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => openEditForm(ev.id)}
                        className="text-blue-600 mr-3 hover:underline"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDeleteClick(ev.id, ev.title)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ADD MODAL */}
      {openAdd && (
        <ModalCard title="Add Event" onClose={() => setOpenAdd(false)}>
          <div className="space-y-4">
            {/* Row 1: Title & Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Title"
                value={addForm.title}
                onChange={(e) =>
                  setAddForm({ ...addForm, title: e.target.value })
                }
                required
              />

              <Input
                label="Location"
                value={addForm.location}
                onChange={(e) =>
                  setAddForm({ ...addForm, location: e.target.value })
                }
                required
              />
            </div>

            {/* Row 2: Description (Full Width) */}
            <div>
              <label className="font-medium block mb-1">Description</label>
              <textarea
                value={addForm.description}
                onChange={(e) =>
                  setAddForm({ ...addForm, description: e.target.value })
                }
                className="w-full border p-2 rounded min-h-[80px]"
                required
              />
            </div>

            {/* Row 3: Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-medium block mb-1">Start Date</label>
                <input
                  type="date"
                  value={addForm.start_date}
                  onChange={(e) => setAddForm(prev => ({ ...prev, start_date: e.target.value }))}
                  className="w-full border p-2 rounded"
                  required
                />
              </div>

              <div>
                <label className="font-medium block mb-1">End Date</label>
                <input
                  type="date"
                  value={addForm.end_date}
                  onChange={(e) => setAddForm(prev => ({ ...prev, end_date: e.target.value }))}
                  className="w-full border p-2 rounded"
                  required
                />
              </div>
            </div>

            {/* Row 4: Images */}
            <div>
              <label className="font-medium block mb-2">Event Images</label>
              
              {/* Preview Section */}
              {addForm.images.length > 0 && (
                <div className="mb-3 p-3 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <p className="text-sm text-gray-600 mb-2 font-medium">
                    📸 Selected Images ({addForm.images.length})
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {addForm.images.map((file, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${idx + 1}`}
                          className="w-full h-24 object-cover rounded-lg border-2 border-green-400 shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={() => removeNewImage(idx, false)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ✕
                        </button>
                        <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                          {idx + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Button */}
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleFileChange(e, false)}
                  className="hidden"
                  id="add-image-input"
                />
                <label
                  htmlFor="add-image-input"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer bg-blue-50 hover:bg-blue-100 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-10 h-10 mb-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="mb-1 text-sm text-blue-600 font-medium">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, JPEG (MAX. 5MB each)</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              onClick={handleAdd}
              disabled={submitting}
              className={`w-full px-4 py-3 rounded-lg font-medium transition-colors shadow-md ${
                submitting 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {submitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                'Save Event'
              )}
            </button>
          </div>
        </ModalCard>
      )}

      {/* EDIT MODAL */}
      {openEdit && (
        <ModalCard title="Edit Event" onClose={() => setOpenEdit(false)}>
          <div className="space-y-4">
            {/* Row 1: Title & Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Title"
                value={editForm.title}
                onChange={(e) =>
                  setEditForm({ ...editForm, title: e.target.value })
                }
              />

              <Input
                label="Location"
                value={editForm.location}
                onChange={(e) =>
                  setEditForm({ ...editForm, location: e.target.value })
                }
              />
            </div>

            {/* Row 2: Description (Full Width) */}
            <div>
              <label className="font-medium block mb-1">Description</label>
              <textarea
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
                className="w-full border p-2 rounded min-h-[80px]"
              />
            </div>

            {/* Row 3: Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-medium block mb-1">Start Date</label>
                <input
                  type="date"
                  value={editForm.start_date}
                  onChange={(e) => setEditForm(prev => ({ ...prev, start_date: e.target.value }))}
                  className="w-full border p-2 rounded"
                  required
                />
              </div>

              <div>
                <label className="font-medium block mb-1">End Date</label>
                <input
                  type="date"
                  value={editForm.end_date}
                  onChange={(e) => setEditForm(prev => ({ ...prev, end_date: e.target.value }))}
                  className="w-full border p-2 rounded"
                  required
                />
              </div>
            </div>

            {/* Row 4: Images */}
            <div>
              <label className="font-medium block mb-2">Event Images</label>
              
              {/* Existing Images */}
              {editForm.existingImages.length > 0 && (
                <div className="mb-3 p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
                  <p className="text-sm text-blue-700 mb-2 font-medium">
                    🖼️ Current Images ({editForm.existingImages.length})
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {editForm.existingImages.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={resolveImageSrc(img)}
                          alt={`Existing ${idx + 1}`}
                          className="w-full h-24 object-cover rounded-lg border-2 border-blue-400 shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(idx)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ✕
                        </button>
                        <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                          {idx + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Images Preview */}
              {editForm.images.length > 0 && (
                <div className="mb-3 p-3 bg-green-50 rounded-lg border-2 border-green-200">
                  <p className="text-sm text-green-700 mb-2 font-medium">
                    ✨ New Images to Upload ({editForm.images.length})
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {editForm.images.map((file, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`New ${idx + 1}`}
                          className="w-full h-24 object-cover rounded-lg border-2 border-green-400 shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={() => removeNewImage(idx, true)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ✕
                        </button>
                        <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                          {idx + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Button */}
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleFileChange(e, true)}
                  className="hidden"
                  id="edit-image-input"
                />
                <label
                  htmlFor="edit-image-input"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer bg-blue-50 hover:bg-blue-100 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-10 h-10 mb-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="mb-1 text-sm text-blue-600 font-medium">
                      <span className="font-semibold">Add more images</span>
                    </p>
                    <p className="text-xs text-gray-500">Current images will be kept unless removed</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              onClick={handleUpdate}
              disabled={submitting}
              className={`w-full px-4 py-3 rounded-lg font-medium transition-colors shadow-md ${
                submitting 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {submitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating...
                </span>
              ) : (
                'Update Event'
              )}
            </button>
          </div>
        </ModalCard>
      )}
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div>
      <label className="font-medium block mb-1">{label}</label>
      <input {...props} className="w-full border p-2 rounded" />
    </div>
  );
}

function ModalCard({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="text-red-500 text-lg font-bold hover:text-red-700">
            ✕
          </button>
        </div>

        <div>{children}</div>
      </div>
    </div>
  );
}