import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  withCredentials: true,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && token !== "undefined" && token !== "null") {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      error.response.status === 401 &&
      !error.config?.url?.includes("/api/auth/login") &&
      !error.config?.url?.includes("/api/auth/register")
    ) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("auth-changed"));
    }
    return Promise.reject(error);
  }
);

export default API;
