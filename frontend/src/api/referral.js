import API from "./client.js";

export const requestReferral = (data) =>
  API.post("/api/referrals/request", data);

export const getMySentReferrals = (status) =>
  API.get("/api/referrals/sent", { params: { status } });

export const cancelReferral = (id) =>
  API.patch(`/api/referrals/${id}/status`, { status: "CANCELLED" });
