import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:8000",
    withCredentials: true,
})

export const signup = (data) => API.post("/api/v1/auth/register", data);

export const login = (data) => API.post("/api/v1/auth/login", data);