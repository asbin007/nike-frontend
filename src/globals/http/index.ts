import axios, { AxiosError, AxiosResponse, AxiosHeaders, InternalAxiosRequestConfig } from "axios";

// Function to get backend URL with fallback
// const getBackendUrl = async () => {
//   try {
//     // Try Render first
//     const response = await fetch("https://nike-backend-1-g9i6.onrender.com/api/health", {
//       method: 'GET',
//       signal: AbortSignal.timeout(5000)
//     });
    
//     if (response.ok) {
//       console.log("🌐 Using Render backend URL");
//       return "https://nike-backend-1-g9i6.onrender.com/api";
//     }
//   } catch (error) {
//     console.log("🏠 Render not available, using localhost:", error);
//   }
  
//   return "http://localhost:5000/api";
// };

// Simple static configuration to prevent UI crashes
const API = axios.create({
  baseURL: "https://nike-backend-1-g9i6.onrender.com/api",
  // baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 60000, // Increased timeout to 60 seconds for Render delays
});

const APIS = axios.create({
  baseURL: "https://nike-backend-1-g9i6.onrender.com/api",
  // baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 60000, // Increased timeout to 60 seconds for Render delays
});

// Enhanced request interceptor for Render backend
APIS.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("tokenauth");
    const headers: AxiosHeaders = (config.headers ?? new AxiosHeaders()) as AxiosHeaders;
    if (token) headers.set("Authorization", token);
    else headers.delete("Authorization");
    config.headers = headers;
    console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error: AxiosError) => {
    console.error("❌ Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Enhanced response interceptor for Render backend
APIS.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`✅ API Response: ${response.status} ${response.config?.url}`);
    return response;
  },
  (error: AxiosError) => {
    console.error(`❌ API Error: ${error.response?.status} ${error.config?.url}`, error.response?.data);
    
    // Handle 401 errors
    if (error.response?.status === 401) {
      console.log("🔐 Authentication error, clearing token");
      localStorage.removeItem("tokenauth");
      localStorage.removeItem("userData");
      // Don't redirect automatically, let components handle it
    }
    
    return Promise.reject(error);
  }
);

export { API, APIS };
