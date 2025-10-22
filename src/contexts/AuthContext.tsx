import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, apiUtils } from '../services/api';

interface User {
  id?: string;
  email: string;
  fullName: string;
  proStatus: boolean;
  emailVerified?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<any>;
  register: (userData: any) => Promise<any>;
  logout: () => Promise<void>;
  verifyEmail: (token: string) => Promise<any>;
  resendVerification: (email: string) => Promise<any>;
  forgotPassword: (email: string) => Promise<any>;
  resetPassword: (token: string, password: string) => Promise<any>;
  checkPasswordStrength: (password: string) => Promise<any>;
  updateUser: (userData: User) => void;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Handle forced logout from API interceptor
  useEffect(() => {
    const handleAuthLogout = () => {
      setUser(null);
      setIsAuthenticated(false);
      apiUtils.clearAuth();
    };

    window.addEventListener('auth:logout', handleAuthLogout);
    return () => window.removeEventListener('auth:logout', handleAuthLogout);
  }, []);

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      if (apiUtils.isAuthenticated()) {
        try {
          const result = await authAPI.getCurrentUser();
          if (result.success) {
            setUser(result.data);
            setIsAuthenticated(true);
          } else {
            // Token is invalid, clear it
            apiUtils.clearAuth();
            setUser(null);
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          apiUtils.clearAuth();
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string, rememberMe?: boolean) => {
    try {
      const result = await authAPI.login(email, password, rememberMe);
      
      if (result.success) {
        setUser(result.data.user);
        setIsAuthenticated(true);
        return { success: true, user: result.data.user };
      } else {
        return { success: false, error: result.error, code: result.code };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const register = async (userData: any) => {
    try {
      const result = await authAPI.register(userData);
      
      if (result.success) {
        // Note: User needs to verify email before they can login
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error, details: result.details, code: result.code };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      apiUtils.clearAuth();
    }
  };

  const verifyEmail = async (token: string) => {
    try {
      const result = await authAPI.verifyEmail(token);
      if (result.success && result.data) {
        return { success: true, message: result.data.message || 'Email verified successfully' };
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      throw new Error(error.message || 'Email verification failed');
    }
  };

  const resendVerification = async (email: string) => {
    try {
      const result = await authAPI.resendVerification(email);
      if (result.success && result.data) {
        return { success: true, message: result.data.message || 'Verification email sent' };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { 
        success: false, 
        error: 'Failed to resend verification email' 
      };
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      const result = await authAPI.forgotPassword(email);
      return result;
    } catch (error) {
      console.error('Forgot password error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const resetPassword = async (token: string, password: string) => {
    try {
      const result = await authAPI.resetPassword(token, password);
      return result;
    } catch (error) {
      console.error('Reset password error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const checkPasswordStrength = async (password: string) => {
    try {
      const result = await authAPI.checkPasswordStrength(password);
      return result;
    } catch (error) {
      console.error('Password strength check error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const updateUser = (userData: User) => {
    setUser(userData);
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    verifyEmail,
    resendVerification,
    forgotPassword,
    resetPassword,
    checkPasswordStrength,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 