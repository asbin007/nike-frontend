import axios from "axios";

const API = axios.create({
  baseURL: "https://nike-backend-1-g9i6.onrender.com/api",
  // baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  // withCredentials: true, // Temporarily disabled due to CORS wildcard issue
  timeout: 10000, // 10 second timeout
});

const APIS = axios.create({
  baseURL: "https://nike-backend-1-g9i6.onrender.com/api",
  // baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  // withCredentials: true, // Temporarily disabled due to CORS wildcard issue
  timeout: 10000, // 10 second timeout
});

// ✅ Interceptor with raw token in Authorization and x-auth-token for compatibility
APIS.interceptors.request.use((config) => {
  const token = localStorage.getItem("tokenauth");
  if (token) {
    // Many existing middlewares in this project expect raw token (no Bearer)
    (config.headers as Record<string, unknown>).Authorization = token;
    (config.headers as Record<string, unknown>)["x-auth-token"] = token;
  }
  return config;
});

// Error handling interceptors
const handleError = (error: unknown) => {
  if ((error as { code?: string }).code === 'ERR_NETWORK') {
    console.error('🌐 Network Error: Backend server unreachable or CORS issue');
        return Promise.reject({
          ...(error as object),
          message: 'Server connection failed. Please check your internet connection or try again later.'
        });
  }
  
  if ((error as { response?: { status?: number } }).response?.status === 403) {
    console.error('🚫 Forbidden: CORS policy or authentication issue');
    return Promise.reject({
      ...(error as object),
      message: 'Access denied. Please refresh the page and try again.'
    });
  }
  
  if ((error as { response?: { status?: number } }).response?.status === 404) {
    console.error('❌ Not Found: API endpoint does not exist');
    return Promise.reject({
      ...(error as object),
      message: 'Requested resource not found.'
    });
  }
  
  return Promise.reject(error);
};

// Add error interceptors
API.interceptors.response.use(
  (response) => response,
  handleError
);

APIS.interceptors.response.use(
  (response) => response,
  handleError
);

export { API, APIS };
