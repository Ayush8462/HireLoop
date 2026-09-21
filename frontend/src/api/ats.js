import API from "./client.js";

export const uploadAndScoreResume = (file) => {
  const formData = new FormData();
  formData.append("resume", file);
  return API.post("/api/ats/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const scoreText = (text) => API.post("/api/ats/score", { text });

export const scoreResumeUrl = (url) => API.post("/api/ats/score-url", { url });

