import { api } from "./apiClient";

// GET ALL EVENTS
export const getEvents = async () => {
  const res = await api.get("/events");
  return res.data;
};

// GET EVENT BY ID
export const getEventById = async (id) => {
  const res = await api.get(`/events/${id}`);
  return res.data;
};

// ADD EVENT (multipart/form-data)
export const addEvent = async (formData) => {
  const res = await api.post("/events", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// UPDATE EVENT (multipart/form-data)
export const updateEvent = async (id, formData) => {
  const res = await api.put(`/events/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// DELETE EVENT
export const deleteEvent = async (id) => {
  const res = await api.delete(`/events/${id}`);
  return res.data;
};
