import { useState, useEffect, useCallback } from 'react';
import { stripeService } from '../services/stripe';
import { useAuth } from '../contexts/AuthContext';

interface SubscriptionStatus {
  isLoading: boolean;
  isPro: boolean;
  subscription: any;
  error: string | null;
  refreshStatus: () => Promise<void>;
}

export const useSubscriptionStatus = (): SubscriptionStatus => {
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isPro, setIsPro] = useState(user?.proStatus || false);
  const [subscription, setSubscription] = useState(null);
  const [error, setError] = useState<string | null>(null);

  const refreshStatus = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await stripeService.getSubscriptionStatus();
      
      if (result.success) {
        const isProUser = result.status === 'pro';
        setIsPro(isProUser);
        setSubscription(result.subscription);
        
        // Update user context if pro status has changed
        if (user.proStatus !== isProUser) {
          updateUser({ ...user, proStatus: isProUser });
        }
      } else {
        setError('Failed to fetch subscription status');
      }
    } catch (err: any) {
      console.error('Error fetching subscription status:', err);
      setError(err.message || 'Failed to fetch subscription status');
    } finally {
      setIsLoading(false);
    }
  }, [user, updateUser]);

  // Check status on mount and when user changes
  useEffect(() => {
    if (user?.id) {
      refreshStatus();
    }
  }, [user?.id, refreshStatus]);

  // Update local state when user context changes
  useEffect(() => {
    if (user) {
      setIsPro(user.proStatus || false);
    }
  }, [user?.proStatus]);

  return {
    isLoading,
    isPro,
    subscription,
    error,
    refreshStatus
  };
}; 