import API from "./client.js";

export const signup = (data) => API.post("/api/auth/register", data);
export const login = (data) => API.post("/api/auth/login", data);
export const refresh = () => API.post("/api/auth/refresh");
export const logout = () => API.post("/api/auth/logout");

export default API;