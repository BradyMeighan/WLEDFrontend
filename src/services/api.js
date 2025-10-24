import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://wledwebsite-production.up.railway.app',
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor to add Clerk auth token
api.interceptors.request.use(
  async (config) => {
    // Get Clerk session token
    if (typeof window !== 'undefined' && window.Clerk) {
      try {
        const token = await window.Clerk.session?.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.warn('Failed to get Clerk token:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Try to get a fresh Clerk token and retry
      try {
        if (typeof window !== 'undefined' && window.Clerk) {
          const token = await window.Clerk.session?.getToken();
          if (token) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api.request(originalRequest);
          }
        }
      } catch (retryError) {
        console.warn('Failed to retry request with fresh Clerk token:', retryError);
      }
      
      // If we can't get a fresh token, dispatch logout event
      if (window.location.pathname !== '/' && 
          window.location.pathname !== '/login' && 
          window.location.pathname !== '/signup') {
        window.dispatchEvent(new CustomEvent('auth:logout'));
      }
    }

    return Promise.reject(error);
  }
);

// Authentication is now handled by Clerk - these are stubs for backward compatibility
export const authAPI = {
  register: async () => ({ success: false, error: 'Use Clerk for authentication' }),
  login: async () => ({ success: false, error: 'Use Clerk for authentication' }),
  logout: async () => ({ success: true }),
  getCurrentUser: async () => ({ success: false, error: 'Use Clerk for authentication' }),
  verifyEmail: async () => ({ success: true, message: 'Handled by Clerk' }),
  resendVerification: async () => ({ success: true, message: 'Handled by Clerk' }),
  forgotPassword: async () => ({ success: true, message: 'Handled by Clerk' }),
  resetPassword: async () => ({ success: true, message: 'Handled by Clerk' }),
  checkPasswordStrength: async (password) => {
    const strength = {
      score: 0,
      requirements: {
        minLength: password.length >= 8,
        hasUppercase: /[A-Z]/.test(password),
        hasLowercase: /[a-z]/.test(password),
        hasNumber: /\d/.test(password),
        hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
      }
    };
    strength.score = Object.values(strength.requirements).filter(Boolean).length;
    return { 
      success: true, 
      data: {
        strength: strength.score,
        isStrong: strength.score >= 4,
        requirements: strength.requirements
      }
    };
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

  // Get user sessions (now handled by Clerk)
  getSessions: async () => {
    return { success: true, data: [] };
  },

  // Revoke session (now handled by Clerk)
  revokeSession: async () => {
    return { success: true, message: 'Handled by Clerk' };
  }
};

// Utility functions
export const apiUtils = {
  // Authentication is now handled by Clerk
  isAuthenticated: () => {
    return window.Clerk?.session !== null;
  },
  clearAuth: () => {
    // Handled by Clerk
  },
  getToken: async () => {
    return await window.Clerk?.session?.getToken();
  }
};

export default api;
