import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Create axios instance with default config
const stripeApi = axios.create({
  baseURL: `${API_BASE_URL}/api/stripe`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
stripeApi.interceptors.request.use(
  async (config) => {
    // Get Clerk session token
    if (typeof window !== 'undefined' && window.Clerk) {
      try {
        const token = await window.Clerk.session?.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.warn('Failed to get Clerk token for Stripe API:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
stripeApi.interceptors.response.use(
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
            return stripeApi.request(originalRequest);
          }
        }
      } catch (retryError) {
        console.warn('Failed to retry Stripe request with fresh Clerk token:', retryError);
      }
      
      // If we can't get a fresh token, dispatch logout event
      window.dispatchEvent(new CustomEvent('auth:logout'));
    }
    
    return Promise.reject(error);
  }
);

export const stripeService = {
  // Get pricing plans
  async getPricingPlans() {
    try {
      const response = await stripeApi.get('/pricing-plans');
      return response.data;
    } catch (error) {
      console.error('Error fetching pricing plans:', error);
      throw error;
    }
  },

  // Create payment intent for one-time payments
  async createPaymentIntent(priceId, paymentMethodTypes = ['card']) {
    try {
      const response = await stripeApi.post('/create-payment-intent', {
        price_id: priceId,
        payment_method_types: paymentMethodTypes,
      });
      return response.data;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  },

  // Create subscription
  async createSubscription(priceId, paymentMethodId) {
    try {
      console.log('📡 Sending to backend:', {
        price_id: priceId,
        payment_method_id: paymentMethodId,
        url: '/create-subscription'
      });
      
      const response = await stripeApi.post('/create-subscription', {
        price_id: priceId,
        payment_method_id: paymentMethodId,
      });
      
      console.log('✅ Backend response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating subscription:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      
      // Provide more specific error handling
      if (error.code === 'NETWORK_ERROR' || error.message?.includes('fetch')) {
        throw new Error('Network connection error. Please check your internet connection.');
      } else if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in again.');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      }
      
      throw error;
    }
  },

  // Get subscription status
  async getSubscriptionStatus() {
    try {
      const response = await stripeApi.get('/subscription-status');
      return response.data;
    } catch (error) {
      console.error('Error fetching subscription status:', error);
      
      // Provide more specific error handling
      if (error.code === 'NETWORK_ERROR' || error.message?.includes('fetch')) {
        throw new Error('Network connection error. Please check your internet connection.');
      } else if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in again.');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      }
      
      throw error;
    }
  },

  // Cancel subscription
  async cancelSubscription() {
    try {
      const response = await stripeApi.post('/cancel-subscription');
      return response.data;
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw error;
    }
  },

  // Reactivate subscription
  async reactivateSubscription() {
    try {
      const response = await stripeApi.post('/reactivate-subscription');
      return response.data;
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      
      // Provide more specific error handling
      if (error.code === 'NETWORK_ERROR' || error.message?.includes('fetch')) {
        throw new Error('Network connection error. Please check your internet connection.');
      } else if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in again.');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      }
      
      throw error;
    }
  },

  // Get customer invoices
  async getInvoices() {
    try {
      const response = await stripeApi.get('/invoices');
      return response.data;
    } catch (error) {
      console.error('Error fetching invoices:', error);
      
      // Provide more specific error handling
      if (error.code === 'NETWORK_ERROR' || error.message?.includes('fetch')) {
        throw new Error('Network connection error. Please check your internet connection.');
      } else if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in again.');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      }
      
      throw error;
    }
  },

  // Create customer portal session (DEPRECATED - using direct API now)
  /*
  async createPortalSession(returnUrl = window.location.href) {
    try {
      const response = await stripeApi.post('/create-portal-session', {
        return_url: returnUrl
      });
      return response.data;
    } catch (error) {
      console.error('Error creating portal session:', error);
      
      // Check if we have specific error details from the backend
      if (error.response?.data?.error_type === 'configuration_missing') {
        const backendError = new Error(error.response.data.message);
        backendError.details = error.response.data.details;
        throw backendError;
      }
      
      // Provide more specific error handling
      if (error.code === 'NETWORK_ERROR' || error.message?.includes('fetch')) {
        throw new Error('Network connection error. Please check your internet connection.');
      } else if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in again.');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else if (error.response?.data?.message) {
        // Use backend error message if available
        const backendError = new Error(error.response.data.message);
        if (error.response.data.details) {
          backendError.details = error.response.data.details;
        }
        throw backendError;
      }
      
      throw error;
    }
  },
  */

  // Get detailed subscription information
  async getSubscriptionDetails() {
    try {
      const response = await stripeApi.get('/subscription-details');
      return response.data;
    } catch (error) {
      console.error('Error fetching subscription details:', error);
      
      // Provide more specific error handling
      if (error.code === 'NETWORK_ERROR' || error.message?.includes('fetch')) {
        throw new Error('Network connection error. Please check your internet connection.');
      } else if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in again.');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      }
      
      throw error;
    }
  },

  // Update payment method
  async updatePaymentMethod(paymentMethodId) {
    try {
      const response = await stripeApi.post('/update-payment-method', {
        payment_method_id: paymentMethodId,
      });
      return response.data;
    } catch (error) {
      console.error('Error updating payment method:', error);
      
      // Provide more specific error handling
      if (error.code === 'NETWORK_ERROR' || error.message?.includes('fetch')) {
        throw new Error('Network connection error. Please check your internet connection.');
      } else if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in again.');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      throw error;
    }
  },
};

export default stripeService; 