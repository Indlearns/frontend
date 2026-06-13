import axios from "axios";

/**
 * Axios instance - all API calls go through this
 * Base URL comes from .env file (VITE_API_URL)
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Attach JWT token to every request if user is logged in
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle common errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    if (
      error.response?.status === 403 &&
      error.response?.data?.message?.includes("not allowed to access")
    ) {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const staffPaths = ["/superadmin", "/admin"];
      if (
        ["tutor", "admin", "student"].includes(user.role) &&
        staffPaths.some((p) => window.location.pathname.startsWith(p))
      ) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        if (window.location.pathname.startsWith("/superadmin")) {
          window.location.href = "/superadmin/login";
        } else {
          window.location.href = "/admins/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
