import API from "./client.js";

export const getAvailableSlots = (seniorId) =>
  API.get("/api/interviews/slots", { params: { seniorId } });

export const createSlot = (startTime, endTime) =>
  API.post("/api/interviews/slots", { startTime, endTime });

export const bookInterview = (slotId, notes) =>
  API.post("/api/interviews/book", { slotId, notes });

export const completeInterview = (bookingId, notes) =>
  API.patch(`/api/interviews/bookings/${bookingId}/complete`, { notes });

export const cancelInterview = (id) =>
  API.patch(`/api/interviews/bookings/${id}/cancel`);

export const getStudentHistory = () =>
  API.get("/api/interviews/student/history");

export const getSeniorHistory = () =>
  API.get("/api/interviews/senior/history");

export const getInterviewStats = () =>
  API.get("/api/interviews/stats");
