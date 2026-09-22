import API from "./client.js";

export const getMyProfile = () => API.get("/api/profiles/me");
export const createProfile = (data) => API.post("/api/profiles", data);
export const updateMyProfile = (data) => API.patch("/api/profiles/me", data);
export const getProfileById = (id) => API.get(`/api/profiles/${id}`);
export const getSeniors = (companyId) =>
  API.get("/api/profiles/seniors", { params: { companyId } });
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

// Memoization cache for data URIs converted to Blob URLs
const blobUrlCache = new Map();

export const dataUriToBlobUrl = (dataUri) => {
  if (!dataUri || typeof dataUri !== "string" || !dataUri.startsWith("data:")) return dataUri;
  if (blobUrlCache.has(dataUri)) {
    return blobUrlCache.get(dataUri);
  }
  try {
    const parts = dataUri.split(",");
    if (parts.length < 2) return dataUri;
    const mimeMatch = parts[0].match(/:(.*?);/);
    const contentType = mimeMatch ? mimeMatch[1] : "application/pdf";
    const base64Data = parts[1].trim().replace(/\s/g, "");
    const byteCharacters = atob(base64Data);
    const sliceSize = 1024;
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      byteArrays.push(new Uint8Array(byteNumbers));
    }
    const blob = new Blob(byteArrays, { type: contentType });
    const blobUrl = URL.createObjectURL(blob);
    blobUrlCache.set(dataUri, blobUrl);
    return blobUrl;
  } catch (err) {
    console.error("Error converting data URI to Blob URL:", err);
    return dataUri;
  }
};

export const getResumeViewUrl = (url, name = "Resume.pdf") => {
  if (!url) return "";
  if (url.startsWith("blob:")) return url;
  if (url.startsWith("data:")) return dataUriToBlobUrl(url);
  return `${API_BASE}/api/profiles/resume/view?url=${encodeURIComponent(url)}&name=${encodeURIComponent(name)}`;
};

export const getResumeDownloadUrl = (url, name = "Resume.pdf") => {
  if (!url) return "";
  if (url.startsWith("blob:")) return url;
  if (url.startsWith("data:")) return dataUriToBlobUrl(url);
  return `${API_BASE}/api/profiles/resume/download?url=${encodeURIComponent(url)}&name=${encodeURIComponent(name)}`;
};

