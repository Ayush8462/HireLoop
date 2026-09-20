import API from "./client.js";

export const getAvailableSlots = (seniorId) =>
  API.get("/api/interviews/slots", { params: { seniorId } });

export const bookInterview = (slotId, notes) =>
  API.post("/api/interviews/book", { slotId, notes });

export const getStudentHistory = () =>
  API.get("/api/interviews/student/history");

export const cancelInterview = (id) =>
  API.patch(`/api/interviews/bookings/${id}/cancel`);

export const getInterviewStats = () =>
  API.get("/api/interviews/stats");
