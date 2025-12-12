import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      const protectedPaths = ['/admin', '/orders', '/cart', '/checkout', '/profile'];
      const isProtectedRoute = protectedPaths.some((path) =>
        currentPath.startsWith(path)
      );

      // Only clear tokens and redirect on protected routes
      if (isProtectedRoute) {
        localStorage.removeItem('token');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
      // For public routes (/home, etc.) - just reject, don't clear token
    }
    return Promise.reject(error);
  }
);

export default api;
