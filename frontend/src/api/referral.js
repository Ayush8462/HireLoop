import API from "./client.js";

export const requestReferral = (data) =>
  API.post("/api/referrals/request", data);

export const getMySentReferrals = (status) =>
  API.get("/api/referrals/sent", { params: { status } });

export const getMyReceivedReferrals = (status) =>
  API.get("/api/referrals/received", { params: { status } });

export const updateReferralStatus = (id, status, responseMessage) =>
  API.patch(`/api/referrals/${id}/status`, { status, responseMessage });

export const cancelReferral = (id) =>
  API.patch(`/api/referrals/${id}/status`, { status: "CANCELLED" });
