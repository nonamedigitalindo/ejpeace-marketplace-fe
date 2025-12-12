import { useEffect, useState } from "react";
import { FaSpinner, FaMapMarkerAlt, FaFileImage, FaTrash, FaPlus, FaTimes, FaImages } from "react-icons/fa";

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
    <div className="w-full min-h-screen font-sans pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Event Management</h1>
          <p className="text-gray-500 mt-1">Create and manage events and tickets.</p>
        </div>
        <button
          onClick={() => setOpenAdd(true)}
          className="bg-gradient-to-r from-yellow-400 to-amber-500 text-black px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2"
        >
          <FaPlus /> Add Event
        </button>
      </div>

      {/* Custom Alert */}
      {alert.show && (
        <div className={`mb-6 p-4 rounded-xl flex items-center justify-between shadow-lg animate-slide-down ${alert.type === 'success' ? 'bg-green-100 border-l-4 border-green-500 text-green-700' :
            'bg-red-100 border-l-4 border-red-500 text-red-700'
          }`}>
          <div className="flex items-center">
            {alert.type === 'success' ? (
              <span className="text-xl mr-2">✅</span>
            ) : (
              <span className="text-xl mr-2">⚠️</span>
            )}
            <span className="font-bold">{alert.message}</span>
          </div>
          <button
            onClick={() => setAlert({ show: false, type: '', message: '' })}
            className="ml-4 opacity-70 hover:opacity-100 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Loading Overlay */}
      {submitting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 shadow-2xl flex flex-col items-center animate-bounce-in">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-yellow-500 mb-6"></div>
            <p className="text-gray-900 font-bold text-lg">Processing...</p>
            <p className="text-gray-500 text-sm mt-2">Uploading images and saving details</p>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmDelete.show && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-md w-full mx-4 border-t-8 border-red-500">
            <div className="flex items-center mb-6">
              <div className="bg-red-100 rounded-full p-4 mr-4">
                <FaTrash className="text-red-600 text-xl" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Delete Event</h3>
                <p className="text-sm text-gray-500">This action implies data loss</p>
              </div>
            </div>

            <p className="text-gray-700 mb-8 leading-relaxed">
              Are you sure you want to delete <span className="font-bold bg-red-50 px-2 py-0.5 rounded text-red-800">"{confirmDelete.title}"</span>? This cannot be undone.
            </p>

            <div className="flex gap-4">
              <button
                onClick={handleCancelDelete}
                className="flex-1 px-6 py-3 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-bold shadow-lg shadow-red-200"
              >
                Delete Event
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <FaSpinner className="animate-spin text-4xl text-yellow-500 mb-4" />
          <span className="text-gray-500 font-medium">Loading events...</span>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left border-collapse">
              <thead>
                <tr className="bg-yellow-50 text-gray-600">
                  <th className="p-5 font-bold uppercase text-xs tracking-wider">Event Details</th>
                  <th className="p-5 font-bold uppercase text-xs tracking-wider">Schedule</th>
                  <th className="p-5 font-bold uppercase text-xs tracking-wider">Gallery</th>
                  <th className="p-5 font-bold uppercase text-xs tracking-wider text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {events.length === 0 ? (
                  <tr><td colSpan="4" className="p-10 text-center text-gray-500">No events found. Start by creating one!</td></tr>
                ) : events.map((ev) => {
                  const eventImages = ev.images
                    ? (Array.isArray(ev.images) ? ev.images : [ev.images])
                    : (ev.image ? [ev.image] : []);

                  return (
                    <tr key={ev.id} className="hover:bg-yellow-50/30 transition-colors group">
                      <td className="p-5">
                        <p className="font-bold text-gray-900 text-lg">{ev.title}</p>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <FaMapMarkerAlt className="mr-1 text-yellow-500" /> {ev.location}
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="text-sm">
                          <p className="font-medium text-gray-800">
                            {new Date(ev.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                          <p className="text-gray-500 text-xs">
                            to {new Date(ev.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </td>
                      <td className="p-5">
                        {eventImages.length > 0 ? (
                          <div className="flex -space-x-3 hover:space-x-1 transition-all">
                            {eventImages.slice(0, 3).map((img, idx) => (
                              <img
                                key={idx}
                                src={resolveImageSrc(img)}
                                alt={`Img ${idx}`}
                                className="w-10 h-10 object-cover rounded-full border-2 border-white shadow-sm hover:scale-125 transition-transform z-10"
                              />
                            ))}
                            {eventImages.length > 3 && (
                              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-xs font-bold text-yellow-700 border-2 border-white z-0">
                                +{eventImages.length - 3}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic bg-gray-100 px-2 py-1 rounded-full">No Images</span>
                        )}
                      </td>
                      <td className="p-5 text-right">
                        <div className="flex justify-end gap-2 opacity-100 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEditForm(ev.id)}
                            className="p-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>

                          <button
                            onClick={() => handleDeleteClick(ev.id, ev.title)}
                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD MODAL */}
      {openAdd && (
        <ModalCard title="Create New Event" onClose={() => setOpenAdd(false)}>
          <div className="space-y-6">
            {/* Row 1: Title & Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Event Title"
                value={addForm.title}
                onChange={(e) =>
                  setAddForm({ ...addForm, title: e.target.value })
                }
                required
                placeholder="e.g. Summer Festival 2024"
              />

              <Input
                label="Location"
                value={addForm.location}
                onChange={(e) =>
                  setAddForm({ ...addForm, location: e.target.value })
                }
                required
                placeholder="e.g. Jakarta Convention Center"
                icon={<FaMapMarkerAlt className="text-gray-400" />}
              />
            </div>

            {/* Row 2: Description (Full Width) */}
            <div>
              <label className="font-bold text-gray-700 block mb-2 text-sm">Description</label>
              <textarea
                value={addForm.description}
                onChange={(e) =>
                  setAddForm({ ...addForm, description: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-xl min-h-[100px] focus:ring-4 focus:ring-yellow-100 focus:border-yellow-400 focus:bg-white bg-gray-50 transition-all outline-none"
                required
                placeholder="Describe your event..."
              />
            </div>

            {/* Row 3: Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-yellow-50/50 p-4 rounded-2xl border border-yellow-100">
              <div>
                <label className="font-bold text-gray-700 block mb-2 text-sm">Start Date & Time</label>
                <input
                  type="datetime-local"
                  value={addForm.start_date}
                  onChange={(e) => setAddForm(prev => ({ ...prev, start_date: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-2 text-sm">End Date & Time</label>
                <input
                  type="datetime-local"
                  value={addForm.end_date}
                  onChange={(e) => setAddForm(prev => ({ ...prev, end_date: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 outline-none"
                  required
                />
              </div>
            </div>

            {/* Row 4: Images */}
            <div>
              <label className="font-bold text-gray-700 block mb-3 text-sm flex items-center gap-2">
                <FaImages className="text-yellow-500" /> Event Gallery
              </label>

              {/* Preview Section */}
              {addForm.images.length > 0 && (
                <div className="mb-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <p className="text-xs text-gray-500 mb-3 font-bold uppercase tracking-wider">
                    Selected Images ({addForm.images.length})
                  </p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {addForm.images.map((file, idx) => (
                      <div key={idx} className="relative group aspect-square">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${idx + 1}`}
                          className="w-full h-full object-cover rounded-xl border-2 border-yellow-200 shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={() => removeNewImage(idx, false)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 shadow-md opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110"
                        >
                          <FaTimes size={10} />
                        </button>
                        <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-md backdrop-blur-sm">
                          #{idx + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Button */}
              <div className="relative group">
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
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-yellow-300 rounded-2xl cursor-pointer bg-yellow-50 group-hover:bg-yellow-100 transition-all group-hover:border-yellow-400"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <div className="bg-yellow-200 p-3 rounded-full mb-2 group-hover:scale-110 transition-transform">
                      <FaFileImage className="w-6 h-6 text-yellow-700" />
                    </div>
                    <p className="mb-1 text-sm text-yellow-800 font-bold">
                      Click to upload images
                    </p>
                    <p className="text-xs text-yellow-600">JPG, PNG (Max 5MB)</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleAdd}
              disabled={submitting}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 ${submitting
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed transform-none'
                  : 'bg-gradient-to-r from-yellow-400 to-amber-500 text-black'
                }`}
            >
              {submitting ? 'Creating Event...' : 'Create Event'}
            </button>
          </div>
        </ModalCard>
      )}

      {/* EDIT MODAL */}
      {openEdit && (
        <ModalCard title="Edit Event Details" onClose={() => setOpenEdit(false)}>
          <div className="space-y-6">
            {/* Row 1: Title & Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Event Title"
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
                icon={<FaMapMarkerAlt className="text-gray-400" />}
              />
            </div>

            {/* Row 2: Description (Full Width) */}
            <div>
              <label className="font-bold text-gray-700 block mb-2 text-sm">Description</label>
              <textarea
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-xl min-h-[100px] focus:ring-4 focus:ring-yellow-100 focus:border-yellow-400 focus:bg-white bg-gray-50 transition-all outline-none"
              />
            </div>

            {/* Row 3: Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-yellow-50/50 p-4 rounded-2xl border border-yellow-100">
              <div>
                <label className="font-bold text-gray-700 block mb-2 text-sm">Start Date & Time</label>
                <input
                  type="datetime-local"
                  value={editForm.start_date}
                  onChange={(e) => setEditForm(prev => ({ ...prev, start_date: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-2 text-sm">End Date & Time</label>
                <input
                  type="datetime-local"
                  value={editForm.end_date}
                  onChange={(e) => setEditForm(prev => ({ ...prev, end_date: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 outline-none"
                  required
                />
              </div>
            </div>

            {/* Row 4: Images */}
            <div>
              <label className="font-bold text-gray-700 block mb-3 text-sm flex items-center gap-2">
                <FaImages className="text-yellow-500" /> Event Gallery
              </label>

              {/* Existing Images */}
              {editForm.existingImages.length > 0 && (
                <div className="mb-4 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                  <p className="text-xs text-gray-500 mb-3 font-bold uppercase tracking-wider">
                    Current Images ({editForm.existingImages.length})
                  </p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {editForm.existingImages.map((img, idx) => (
                      <div key={idx} className="relative group aspect-square">
                        <img
                          src={resolveImageSrc(img)}
                          alt={`Existing ${idx + 1}`}
                          className="w-full h-full object-cover rounded-xl border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(idx)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 shadow-md opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110"
                        >
                          <FaTimes size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Images Preview */}
              {editForm.images.length > 0 && (
                <div className="mb-4 p-4 bg-green-50 rounded-2xl border border-green-200">
                  <p className="text-xs text-green-700 mb-3 font-bold uppercase tracking-wider">
                    New Uploads ({editForm.images.length})
                  </p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {editForm.images.map((file, idx) => (
                      <div key={idx} className="relative group aspect-square">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`New ${idx + 1}`}
                          className="w-full h-full object-cover rounded-xl border-2 border-green-400 shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={() => removeNewImage(idx, true)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 shadow-md opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110"
                        >
                          <FaTimes size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Button */}
              <div className="relative group">
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
                  className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-yellow-300 rounded-2xl cursor-pointer bg-yellow-50 group-hover:bg-yellow-100 transition-all group-hover:border-yellow-400"
                >
                  <div className="flex items-center justify-center gap-3">
                    <FaPlus className="text-yellow-600" />
                    <span className="text-sm text-yellow-800 font-bold">Add more images</span>
                  </div>
                  <p className="text-xs text-yellow-600 mt-1">Existing images will be kept</p>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleUpdate}
              disabled={submitting}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 ${submitting
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed transform-none'
                  : 'bg-gradient-to-r from-yellow-400 to-amber-500 text-black'
                }`}
            >
              {submitting ? 'Updating Event...' : 'Update Changes'}
            </button>
          </div>
        </ModalCard>
      )}
    </div>
  );
}

function Input({ label, icon, ...props }) {
  return (
    <div>
      <label className="font-bold text-gray-700 block mb-2 text-sm">{label}</label>
      <div className="relative">
        {icon && <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">{icon}</div>}
        <input
          {...props}
          className={`w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none ${icon ? 'pl-11' : ''}`}
        />
      </div>
    </div>
  );
}

function ModalCard({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-slide-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-400 to-amber-500 p-6 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold text-black">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-black font-bold hover:bg-white/40 transition-colors">
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-8 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}