import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://wledwebsite-production.up.railway.app',
  withCredentials: true, // Important for cookies
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  }
});

// Track if we're currently refreshing to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If we're already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api.request(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await api.post('/api/auth/refresh');
        const { accessToken } = response.data;
        
        localStorage.setItem('accessToken', accessToken);
        processQueue(null, accessToken);
        
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api.request(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear auth and redirect
        processQueue(refreshError, null);
        localStorage.removeItem('accessToken');
        
        // Only redirect if we're not already on a public page
        if (window.location.pathname !== '/' && 
            window.location.pathname !== '/login' && 
            window.location.pathname !== '/signup') {
          // Dispatch a custom event instead of direct redirect
          window.dispatchEvent(new CustomEvent('auth:logout'));
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Authentication API calls
export const authAPI = {
  // Register new user
  register: async (userData) => {
    try {
      const response = await api.post('/api/auth/register', userData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Registration failed',
        code: error.response?.status || error.response?.data?.code,
        details: error.response?.data?.details || []
      };
    }
  },

  // Login user
  login: async (email, password, rememberMe = false) => {
    try {
      const response = await api.post('/api/auth/login', { email, password, rememberMe });
      const { accessToken, user } = response.data;
      
      // Store token in localStorage
      localStorage.setItem('accessToken', accessToken);
      
      return { success: true, data: { user, accessToken } };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed',
        code: error.response?.status || error.response?.data?.code
      };
    }
  },

  // Logout user
  logout: async () => {
    try {
      await api.post('/api/auth/logout');
      localStorage.removeItem('accessToken');
      return { success: true };
    } catch (error) {
      // Even if logout fails on server, clear local storage
      localStorage.removeItem('accessToken');
      return { success: true };
    }
  },

  // Get current user info
  getCurrentUser: async () => {
    try {
      const response = await api.get('/api/auth/me');
      return { success: true, data: response.data.user };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to get user info'
      };
    }
  },

  // Verify email
  verifyEmail: async (token) => {
    try {
      const response = await api.post('/api/auth/verify-email', { token });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Email verification failed'
      };
    }
  },

  // Resend verification email
  resendVerification: async (email) => {
    try {
      const response = await api.post('/api/auth/resend-verification', { email });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to resend verification'
      };
    }
  },

  // Request password reset
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/api/auth/forgot-password', { email });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to send reset email'
      };
    }
  },

  // Reset password
  resetPassword: async (token, password) => {
    try {
      const response = await api.post('/api/auth/reset-password', { token, password });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Password reset failed'
      };
    }
  },

  // Check password strength
  checkPasswordStrength: async (password) => {
    try {
      const response = await api.post('/api/auth/check-password-strength', { password });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to check password strength'
      };
    }
  }
};

// User API calls
export const userAPI = {
  // Get user profile
  getProfile: async () => {
    try {
      const response = await api.get('/api/user/profile');
      return { success: true, data: response.data.user };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to get profile'
      };
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/api/user/profile', profileData);
      return { success: true, data: response.data.user };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to update profile',
        details: error.response?.data?.details || []
      };
    }
  },

  // Change password
  changePassword: async (passwordData) => {
    try {
      const response = await api.post('/api/user/change-password', passwordData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to change password',
        code: error.response?.data?.code
      };
    }
  },

  // Get pro status
  getProStatus: async () => {
    try {
      const response = await api.get('/api/user/pro-status');
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to get pro status'
      };
    }
  },

  // Get user sessions
  getSessions: async () => {
    try {
      const response = await api.get('/api/user/sessions');
      return { success: true, data: response.data.sessions };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to get sessions'
      };
    }
  },

  // Revoke session
  revokeSession: async (sessionId) => {
    try {
      const response = await api.delete(`/api/user/sessions/${sessionId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to revoke session'
      };
    }
  }
};

// Utility functions
export const apiUtils = {
  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('accessToken');
  },

  // Clear authentication
  clearAuth: () => {
    localStorage.removeItem('accessToken');
  },

  // Get stored token
  getToken: () => {
    return localStorage.getItem('accessToken');
  }
};

export default api; 