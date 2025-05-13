import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5001/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },  
});

const APIS = axios.create({
  baseURL: "http://localhost:5001/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ✅ Interceptor with raw token (no Bearer prefix)
APIS.interceptors.request.use((config) => {
  const token = localStorage.getItem("tokenauth");
  if (token) {
    config.headers.Authorization = token;
  }
  return config;
});

export { API, APIS };
