import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  withCredentials: true,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const signup = (data) => API.post("/api/auth/register", data);

export const login = (data) => API.post("/api/auth/login", data);

export const refresh = () => API.post("/api/auth/refresh");

export const logout = () => API.post("/api/auth/logout");

export default API;