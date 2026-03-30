import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add JWT token
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

// Response interceptor to handle auto-logout on unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Clear local storage and redirect to login terminal
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  googleLogin: (credential) => api.post('/auth/google', { credential }),
  sendRegistrationOTP: (data) => api.post('/auth/send-registration-otp', data),
  requestOTP: (email) => api.post('/auth/otp/request', { email }),
  verifyOTP: (email, otp) => api.post('/auth/otp/verify', { email, otp }),
  resetPassword: (data) => api.post('/auth/password/reset', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

export const driverService = {
  goOnline: (data) => api.post('/drivers/go-online', data),
  updateLocation: (data) => api.post('/drivers/location/update', data),
  selectRoute: (routeId) => api.post('/drivers/route/select', { routeId }),
};

export const passengerService = {
  search: (pickup, drop) => api.post('/passengers/search', { pickup, drop }),
};

export const routeService = {
  getRoutes: () => api.get('/routes'),
};

export default api;
