import axios from "axios";

const API = axios.create({
  baseURL: "https://nike-backend-1-g9i6.onrender.com/api/",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },  
});


const APIS = axios.create({
  baseURL: "https://nike-backend-1-g9i6.onrender.com/api/",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ✅ Interceptor with raw token in Authorization and x-auth-token for compatibility
APIS.interceptors.request.use((config) => {
  const token = localStorage.getItem("tokenauth");
  if (token) {
    // Many existing middlewares in this project expect raw token (no Bearer)
    (config.headers as any).Authorization = token;
    (config.headers as any)["x-auth-token"] = token;
  }
  return config;
});

export { API, APIS };
