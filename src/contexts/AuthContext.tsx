import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';
import axios from 'axios';

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
  const { user: clerkUser, isLoaded: clerkLoaded, isSignedIn } = useUser();
  const { signOut, openSignIn, openSignUp } = useClerk();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sync Clerk user with our backend database and local state
  useEffect(() => {
    const syncUser = async () => {
      if (clerkLoaded) {
        if (isSignedIn && clerkUser) {
          // Call backend to sync user with database
          try {
            const token = await window.Clerk?.session?.getToken();
            if (token) {
              console.log('🔄 Syncing user with backend...');
              console.log('🌐 Backend URL:', import.meta.env.VITE_API_URL || 'https://wledwebsite-production.up.railway.app');
              console.log('🔑 Token preview:', token.substring(0, 20) + '...');
              
              const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://wledwebsite-production.up.railway.app'}/api/user/sync`, {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                mode: 'cors',
                credentials: 'include'
              });
              
              console.log('📡 Response status:', response.status);
              
              if (response.ok) {
                const data = await response.json();
                console.log('✅ User synced with backend:', data.user);
                
                // Update local state with backend data
                setUser({
                  id: data.user.id,
                  email: data.user.email,
                  fullName: data.user.fullName,
                  proStatus: data.user.proStatus,
                  emailVerified: data.user.emailVerified
                });
              } else {
                const errorText = await response.text();
                console.warn('⚠️ Failed to sync user with backend:', response.status, errorText);
                // Fallback to Clerk data
                const proStatus = clerkUser.publicMetadata?.proStatus as boolean || false;
                setUser({
                  id: clerkUser.id,
                  email: clerkUser.primaryEmailAddress?.emailAddress || '',
                  fullName: clerkUser.fullName || clerkUser.firstName || '',
                  proStatus: proStatus,
                  emailVerified: clerkUser.primaryEmailAddress?.verification?.status === 'verified'
                });
              }
            } else {
              console.warn('⚠️ No Clerk token available');
              // Fallback to Clerk data without backend sync
              const proStatus = clerkUser.publicMetadata?.proStatus as boolean || false;
              setUser({
                id: clerkUser.id,
                email: clerkUser.primaryEmailAddress?.emailAddress || '',
                fullName: clerkUser.fullName || clerkUser.firstName || '',
                proStatus: proStatus,
                emailVerified: clerkUser.primaryEmailAddress?.verification?.status === 'verified'
              });
            }
          } catch (error) {
            console.error('❌ Error syncing user with backend:', error);
            console.error('❌ Error details:', {
              name: error.name,
              message: error.message,
              stack: error.stack
            });
            
            // Fallback to Clerk data
            const proStatus = clerkUser.publicMetadata?.proStatus as boolean || false;
            setUser({
              id: clerkUser.id,
              email: clerkUser.primaryEmailAddress?.emailAddress || '',
              fullName: clerkUser.fullName || clerkUser.firstName || '',
              proStatus: proStatus,
              emailVerified: clerkUser.primaryEmailAddress?.verification?.status === 'verified'
            });
          }
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    };
    
    syncUser();
  }, [clerkUser, isSignedIn, clerkLoaded]);

  // These methods are now handled by Clerk's UI components
  // We're keeping them for backward compatibility but redirecting to Clerk
  const login = async (email: string, password: string, rememberMe?: boolean) => {
    try {
      // Clerk handles authentication through their components
      // This method is kept for compatibility but redirects to Clerk sign-in
      openSignIn();
      return { success: false, error: 'Please use the Clerk sign-in component' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const register = async (userData: any) => {
    try {
      // Clerk handles registration through their components
      openSignUp();
      return { success: false, error: 'Please use the Clerk sign-up component' };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const logout = async () => {
    try {
      await signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Email verification is now handled by Clerk automatically
  const verifyEmail = async (token: string) => {
    return { success: true, message: 'Email verification is handled by Clerk' };
  };

  const resendVerification = async (email: string) => {
    return { success: true, message: 'Email verification is handled by Clerk' };
  };

  // Password reset is handled by Clerk
  const forgotPassword = async (email: string) => {
    return { success: true, message: 'Password reset is handled by Clerk' };
  };

  const resetPassword = async (token: string, password: string) => {
    return { success: true, message: 'Password reset is handled by Clerk' };
  };

  const checkPasswordStrength = async (password: string) => {
    // Simple client-side check for compatibility
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
  };

  const updateUser = (userData: User) => {
    setUser(userData);
  };

  const value = {
    user,
    isAuthenticated: isSignedIn || false,
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
