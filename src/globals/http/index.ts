import axios, { AxiosError, AxiosResponse, AxiosHeaders, InternalAxiosRequestConfig } from "axios";

// Function to get backend URL with fallback - COMMENTED OUT FOR LOCAL DEVELOPMENT
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

// Simple static configuration for local development
const API = axios.create({
  // baseURL: "https://nike-backend-1-g9i6.onrender.com/api", // COMMENTED OUT FOR PRODUCTION
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 120000, // Increased timeout to 120 seconds for Render delays
});

const APIS = axios.create({
  // baseURL: "https://nike-backend-1-g9i6.onrender.com/api", // COMMENTED OUT FOR PRODUCTION
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 120000, // Increased timeout to 120 seconds for Render delays
});

// Enhanced request interceptor for local backend
APIS.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Check for admin token first, then fallback to regular token
    const adminToken = localStorage.getItem("adminToken");
    const regularToken = localStorage.getItem("tokenauth");
    const raw = adminToken || regularToken || "";
    const token = raw.startsWith("Bearer ") ? raw : (raw ? `Bearer ${raw}` : "");
    const headers: AxiosHeaders = (config.headers ?? new AxiosHeaders()) as AxiosHeaders;
    if (token) headers.set("Authorization", token);
    else headers.delete("Authorization");
    config.headers = headers;
    console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url} (using ${adminToken ? 'admin' : 'regular'} token)`);
    return config;
  },
  (error: AxiosError) => {
    console.error("❌ Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Enhanced response interceptor for local backend
APIS.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`✅ API Response: ${response.status} ${response.config?.url}`);
    return response;
  },
  (error: AxiosError) => {
    console.error(`❌ API Error: ${error.response?.status} ${error.config?.url}`, error.response?.data);
    
    // Handle 401 errors
    if (error.response?.status === 401) {
      // Keep token in storage to allow silent re-auth flows; components decide logout
      console.log("🔐 401 received. Preserving token; app will handle logout if needed.");
    }
    
    return Promise.reject(error);
  }
);

export { API, APIS };
