import API from "./client.js";

export const getMyProfile = () => API.get("/api/profiles/me");
export const createProfile = (data) => API.post("/api/profiles", data);
export const updateMyProfile = (data) => API.patch("/api/profiles/me", data);
export const getProfileById = (id) => API.get(`/api/profiles/${id}`);
export const uploadProfileResume = (file) => {
  const formData = new FormData();
  formData.append("resume", file);
  return API.post("/api/profiles/me/resume", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const getResumeViewUrl = (url, name = "Resume.pdf") => {
  if (!url) return "";
  if (url.startsWith("blob:")) return url;
  return `${API_BASE}/api/profiles/resume/view?url=${encodeURIComponent(url)}&name=${encodeURIComponent(name)}`;
};

export const getResumeDownloadUrl = (url, name = "Resume.pdf") => {
  if (!url) return "";
  if (url.startsWith("blob:")) return url;
  return `${API_BASE}/api/profiles/resume/download?url=${encodeURIComponent(url)}&name=${encodeURIComponent(name)}`;
};

