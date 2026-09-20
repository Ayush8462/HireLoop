import API from "./client.js";

export const getMyProfile = () => API.get("/api/profiles/me");
export const createProfile = (data) => API.post("/api/profiles", data);
export const updateMyProfile = (data) => API.patch("/api/profiles/me", data);
export const getProfileById = (id) => API.get(`/api/profiles/${id}`);
