import axios from "axios";

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
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 10000,
});

const APIS = axios.create({
  baseURL: "https://nike-backend-1-g9i6.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 10000,
});

// Enhanced request interceptor for Render backend
APIS.interceptors.request.use(
  (config: any) => {
    const token = localStorage.getItem("tokenauth") || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyODgxOTE4My04MWM5LTRhYjktYmE2NS0wNGIxYzNlOTRmY2QiLCJpYXQiOjE3NTgyOTE5NzgsImV4cCI6MTc2MDg4Mzk3OH0.BjYDw7HHmAZcbUImpWfBd89YVGpJGT14E2AFpTl9z5k";
    if (token) {
      config.headers.Authorization = token;
    }
    console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error: any) => {
    console.error("❌ Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Enhanced response interceptor for Render backend
APIS.interceptors.response.use(
  (response: any) => {
    console.log(`✅ API Response: ${response.status} ${response.config?.url}`);
    return response;
  },
  (error: any) => {
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
