import React, { useState, useRef, useEffect } from 'react';
import { User, ChevronDown, Settings, Crown, LogOut, X, Eye, EyeOff, Check, CreditCard, Calendar, AlertTriangle, Mail, Gift } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { userAPI } from '../services/api';
import { stripeService } from '../services/stripe';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY!);

const mockFeatures = {
  free: [
    'Basic LED control',
    'Simple color patterns',
    'Manual brightness adjustment',
    'Basic scheduling',
    'Up to 3 saved presets'
  ],
  pro: [
    'Advanced LED control',
    'Complex animations & effects',
    'Auto brightness based on time',
    'Advanced scheduling with conditions',
    'Unlimited saved presets',
    'Music sync capabilities',
    'Priority customer support',
    'Early access to new features'
  ]
};

// Type definitions
interface AlertState {
  type: 'success' | 'error';
  message: string;
  details?: string;
}

interface ProStatusData {
  proStatus: boolean;
  features: typeof mockFeatures;
}

interface SubscriptionData {
  status: string;
  currentPeriodEnd: Date;
  plan: string;
  amount: number;
  currency: string;
  cancelAtPeriodEnd: boolean;
  paymentMethod: {
    type: string;
    last4: string;
    brand: string;
  };
}

interface UserProfileProps {
  onOpenStripeCheckout?: () => void;
  handlePageChange?: (page: string) => void;
  hasReferralReward?: boolean;
  onOpenReferralReward?: () => void;
}

// Simple Alert component
const Alert = ({ type, message, details, onClose }: {
  type: 'success' | 'error';
  message: string;
  details?: string;
  onClose: () => void;
}) => (
  <div className={`p-4 rounded-lg border ${
    type === 'success' ? 'bg-green-900/50 border-green-500 text-green-100' : 
    'bg-red-900/50 border-red-500 text-red-100'
  }`}>
    <div className="flex justify-between items-start">
      <div>
        <p className="font-medium">{message}</p>
        {details && <p className="text-sm mt-1 opacity-80">{details}</p>}
      </div>
      <button onClick={onClose} className="ml-4 opacity-70 hover:opacity-100">
        <X className="w-4 h-4" />
      </button>
    </div>
  </div>
);

// Payment Method Update Form Component
const PaymentMethodUpdateForm = ({ onSuccess, onCancel }: {
  onSuccess: (message: string) => void;
  onCancel: () => void;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError('Card element not found');
      setIsLoading(false);
      return;
    }

    try {
      // Create payment method
      const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (pmError) {
        setError(pmError.message || 'Failed to create payment method');
        setIsLoading(false);
        return;
      }

      // Update payment method via our API
      const result = await stripeService.updatePaymentMethod(paymentMethod.id);
      
      if (result.success) {
        onSuccess('Payment method updated successfully!');
      } else {
        setError(result.message || 'Failed to update payment method');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to update payment method');
    } finally {
      setIsLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#ffffff',
        backgroundColor: 'transparent',
        '::placeholder': {
          color: '#94a3b8',
        },
        iconColor: '#94a3b8',
      },
      invalid: {
        color: '#ef4444',
        iconColor: '#ef4444',
      },
    },
    hidePostalCode: true,
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          New Payment Method
        </label>
        <div className="p-4 bg-slate-700/50 border border-slate-600 rounded-lg">
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-900/50 border border-red-500 rounded-lg text-red-200 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={!stripe || isLoading}
          className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Updating...
            </div>
          ) : (
            'Update Payment Method'
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

const UserProfile: React.FC<UserProfileProps> = ({ onOpenStripeCheckout, handlePageChange, hasReferralReward = false, onOpenReferralReward }) => {
  
  // Intercept checkout opening if user has referral reward
  const handleOpenCheckout = () => {
    if (hasReferralReward) {
      alert('You have a referral reward available! Please use the "Referral Reward 🎁" option to activate your 14-day free trial instead.');
      console.log('⚠️ User tried to upgrade but has referral reward - redirecting to reward');
      onOpenReferralReward?.();
      return;
    }
    onOpenStripeCheckout?.();
  };
  
  const { user, logout, updateUser } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isProStatusModalOpen, setIsProStatusModalOpen] = useState(false);
  const [isManageSubscriptionModalOpen, setIsManageSubscriptionModalOpen] = useState(false);
  const [isUpdatePaymentModalOpen, setIsUpdatePaymentModalOpen] = useState(false);
  const [alert, setAlert] = useState<AlertState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [proStatusData, setProStatusData] = useState<ProStatusData | null>(null);
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [isCancellingSubscription, setIsCancellingSubscription] = useState(false);
  const [modalTransitions, setModalTransitions] = useState({
    profile: false,
    proStatus: false,
    manageSubscription: false,
    updatePayment: false
  });
  const [dropdownTransition, setDropdownTransition] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || ''
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        if (isDropdownOpen) {
          setDropdownTransition(false);
          setTimeout(() => {
            setIsDropdownOpen(false);
          }, 200);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  // Update profile form when user changes
  useEffect(() => {
    if (user) {
      setProfileForm({ fullName: user.fullName || '' });
    }
  }, [user]);

  // Check and update pro status on mount
  useEffect(() => {
    const checkProStatus = async () => {
      if (user) {
        try {
          const result = await stripeService.getSubscriptionStatus();
          if (result.success) {
            const isProUser = result.status === 'pro';
            // Update user context if pro status has changed
            if (user.proStatus !== isProUser) {
              updateUser({ ...user, proStatus: isProUser });
            }
          }
        } catch (error) {
          console.error('Error checking pro status:', error);
          // Don't show error to user, just log it
        }
      }
    };

    checkProStatus();
  }, [user?.id]); // Only run when user ID changes (login/logout)

  const handleProfileUpdate = async () => {
    setIsLoading(true);
    setAlert(null);

    try {
      const result = await userAPI.updateProfile(profileForm);
      
      if (result.success) {
        updateUser(result.data);
        setAlert({
          type: 'success',
          message: 'Profile updated successfully!'
        });
      } else {
        setAlert({
          type: 'error',
          message: result.error
        });
      }
    } catch (error) {
      setAlert({
        type: 'error',
        message: 'An unexpected error occurred'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    setIsLoading(true);
    setAlert(null);

    // Validate passwords match
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setAlert({
        type: 'error',
        message: 'New passwords do not match'
      });
      setIsLoading(false);
      return;
    }

    try {
      const result = await userAPI.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      
      if (result.success) {
        setAlert({
          type: 'success',
          message: 'Password changed successfully!'
        });
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setAlert({
          type: 'error',
          message: result.error
        });
      }
    } catch (error) {
      setAlert({
        type: 'error',
        message: 'An unexpected error occurred'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProStatusClick = async () => {
    setDropdownTransition(false);
    setTimeout(() => {
      setIsDropdownOpen(false);
    }, 200);
    setIsLoading(true);

    try {
      // Get real pro status data from Stripe instead of database
      const result = await stripeService.getSubscriptionStatus();
      
      if (result.success) {
        const isProUser = result.status === 'pro';
        
        // Update user context with current pro status
        if (user && user.proStatus !== isProUser) {
          updateUser({ ...user, proStatus: isProUser });
        }
        
        setProStatusData({
          proStatus: isProUser,
          features: mockFeatures
        });
      } else {
        // Fallback to using user's current pro status with mock features
        setProStatusData({
          proStatus: user?.proStatus || false,
          features: mockFeatures
        });
      }
      setIsProStatusModalOpen(true);
      // Start fade-in transition after modal opens
      setTimeout(() => {
        setModalTransitions(prev => ({ ...prev, proStatus: true }));
      }, 50);
    } catch (error) {
      // Fallback to using user's current pro status with mock features
      setProStatusData({
        proStatus: user?.proStatus || false,
        features: mockFeatures
      });
      setIsProStatusModalOpen(true);
      // Start fade-in transition after modal opens
      setTimeout(() => {
        setModalTransitions(prev => ({ ...prev, proStatus: true }));
      }, 50);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageSubscriptionClick = async () => {
    setIsLoading(true);
    
    try {
      // Get detailed subscription data from Stripe
      const result = await stripeService.getSubscriptionDetails();
      
      console.log('Subscription details result:', result); // Debug log
      
      if (result.success && result.subscription) {
        const subscription = result.subscription;
        const price = subscription.items?.data?.[0]?.price;
        const paymentMethod = subscription.default_payment_method;
        
        console.log('Subscription object:', subscription); // Debug log
        console.log('Current period end:', subscription.current_period_end); // Debug log
        console.log('Items:', subscription.items); // Debug log
        
        // Extract current_period_end from subscription items
        const currentPeriodEnd = subscription.items?.data?.[0]?.current_period_end || subscription.current_period_end;
        console.log('Extracted current_period_end:', currentPeriodEnd); // Debug log
        
        const subscriptionData = {
          status: subscription.status,
          currentPeriodEnd: currentPeriodEnd,
          plan: price?.nickname || `${price?.currency?.toUpperCase()} ${(price?.unit_amount / 100)} ${price?.recurring?.interval}ly` || 'Pro Plan',
          amount: price?.unit_amount ? (price.unit_amount / 100) : 9.99,
          currency: subscription.currency?.toUpperCase() || 'USD',
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          paymentMethod: {
            type: paymentMethod?.type || 'card',
            last4: paymentMethod?.card?.last4 || '****',
            brand: paymentMethod?.card?.brand || 'card'
          }
        };
        
        console.log('Processed subscription data:', subscriptionData); // Debug log
        
        setSubscriptionData(subscriptionData);
        setIsManageSubscriptionModalOpen(true);
        // Start fade-in transition after modal opens
        setTimeout(() => {
          setModalTransitions(prev => ({ ...prev, manageSubscription: true }));
        }, 50);
      } else {
        setAlert({
          type: 'error',
          message: 'No active subscription found'
        });
      }
    } catch (error) {
      setAlert({
        type: 'error',
        message: 'Failed to load subscription data'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    setIsCancellingSubscription(true);
    
    try {
      const result = await stripeService.cancelSubscription();
      
      if (result.success) {
        // Update subscription data to show cancellation
        setSubscriptionData(prev => prev ? ({
          ...prev,
          cancelAtPeriodEnd: true
        }) : null);
        
        setAlert({
          type: 'success',
          message: 'Subscription cancelled successfully. You will retain Pro access until the end of your billing period.'
        });
      } else {
        setAlert({
          type: 'error',
          message: result.message || 'Failed to cancel subscription'
        });
      }
    } catch (error) {
      setAlert({
        type: 'error',
        message: 'Failed to cancel subscription. Please try again or contact support.'
      });
    } finally {
      setIsCancellingSubscription(false);
    }
  };

  const handleReactivateSubscription = async () => {
    setIsLoading(true);
    
    try {
      const result = await stripeService.reactivateSubscription();
      
      if (result.success) {
        // Update subscription data to show reactivation
        setSubscriptionData(prev => prev ? ({
          ...prev,
          cancelAtPeriodEnd: false
        }) : null);
        
        setAlert({
          type: 'success',
          message: 'Subscription has been reactivated successfully!'
        });
      } else {
        setAlert({
          type: 'error',
          message: result.message || 'Failed to reactivate subscription'
        });
      }
    } catch (error) {
      setAlert({
        type: 'error',
        message: error.message || 'Failed to reactivate subscription. Please try again or contact support.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadInvoices = async () => {
    setIsLoading(true);
    
    try {
      const result = await stripeService.getInvoices();
      
      if (result.success && result.invoices.length > 0) {
        // For now, open the first invoice PDF in a new tab
        // In a real app, you might want to show a list of invoices
        const latestInvoice = result.invoices[0];
        if (latestInvoice.invoice_pdf) {
          window.open(latestInvoice.invoice_pdf, '_blank');
          setAlert({
            type: 'success',
            message: 'Invoice opened in new tab. You can download it from there.'
          });
        } else if (latestInvoice.hosted_invoice_url) {
          window.open(latestInvoice.hosted_invoice_url, '_blank');
          setAlert({
            type: 'success',
            message: 'Invoice opened in new tab.'
          });
        } else {
          setAlert({
            type: 'error',
            message: 'Invoice PDF not available. Please contact support.'
          });
        }
      } else {
        setAlert({
          type: 'error',
          message: 'No invoices found for your account.'
        });
      }
    } catch (error) {
      setAlert({
        type: 'error',
        message: error.message || 'Failed to fetch invoices. Please try again or contact support.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePaymentMethod = async () => {
    setIsUpdatePaymentModalOpen(true);
    // Start fade-in transition after modal opens
    setTimeout(() => {
      setModalTransitions(prev => ({ ...prev, updatePayment: true }));
    }, 50);
  };

  const handlePaymentMethodUpdateSuccess = (message: string) => {
    setIsUpdatePaymentModalOpen(false);
    setAlert({
      type: 'success',
      message: message
    });
    // Refresh subscription data to show new payment method
    handleManageSubscriptionClick();
  };

  const handlePaymentMethodUpdateCancel = () => {
    // Start fade-out transition
    setModalTransitions(prev => ({ ...prev, updatePayment: false }));
    
    // Close modal after transition completes
    setTimeout(() => {
      setIsUpdatePaymentModalOpen(false);
    }, 300);
  };

  const handleLogout = async () => {
    setDropdownTransition(false);
    setTimeout(() => {
      setIsDropdownOpen(false);
    }, 200);
    await logout();
  };

  const closeModals = () => {
    // Start fade-out transition
    setModalTransitions({
      profile: false,
      proStatus: false,
      manageSubscription: false,
      updatePayment: false
    });
    
    // Close modals after transition completes
    setTimeout(() => {
      setIsProfileModalOpen(false);
      setIsProStatusModalOpen(false);
      setIsManageSubscriptionModalOpen(false);
      setIsUpdatePaymentModalOpen(false);
      setAlert(null);
    }, 300);
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const formatDate = (date: Date | string | number) => {
    try {
      let dateObj: Date;
      
      if (typeof date === 'number') {
        // Stripe timestamps are in seconds, JavaScript Date expects milliseconds
        // If the number is less than a reasonable millisecond timestamp, assume it's seconds
        const timestamp = date < 10000000000 ? date * 1000 : date;
        dateObj = new Date(timestamp);
      } else if (typeof date === 'string') {
        dateObj = new Date(date);
      } else if (date instanceof Date) {
        dateObj = date;
      } else {
        throw new Error('Invalid date format');
      }
      
      // Check if the date is valid
      if (isNaN(dateObj.getTime())) {
        console.error('Invalid date created from:', date, 'Result:', dateObj);
        return 'Date unavailable';
      }
      
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error, 'Original date:', date);
      return 'Date unavailable';
    }
  };

  return (
    <div className="relative flex items-center" ref={dropdownRef}>
      {/* Welcome Text */}
      <span className="text-slate-300 mr-4 hidden sm:block font-medium">
        Welcome, {user?.fullName?.split(' ')[0] || 'User'}
      </span>

      {/* Profile Button */}
      <button
        onClick={() => {
          if (isDropdownOpen) {
            // Start fade-out transition
            setDropdownTransition(false);
            setTimeout(() => {
              setIsDropdownOpen(false);
            }, 200);
          } else {
            // Open dropdown and start fade-in transition
            setIsDropdownOpen(true);
            setTimeout(() => {
              setDropdownTransition(true);
            }, 10);
          }
        }}
        className="flex items-center space-x-3 bg-slate-800/80 backdrop-blur-sm border border-slate-600/50 text-white px-4 py-3 rounded-xl transition-all duration-200 hover:bg-slate-700/80 hover:border-slate-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 shadow-lg"
      >
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
          <User className="w-5 h-5 text-white" />
        </div>
        <div className="flex flex-col items-start">
          <span className="text-white font-medium">
            {user?.fullName || 'User'}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-300 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className={`absolute right-0 top-full mt-2 w-80 bg-slate-800/95 backdrop-blur-sm border border-slate-600/50 rounded-xl shadow-2xl z-[9998] transition-all duration-200 transform ${dropdownTransition ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          {/* User Header */}
          <div className="px-6 py-4 border-b border-slate-600/50 bg-gradient-to-r from-purple-900/30 to-blue-900/30">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white">Welcome, {user?.fullName?.split(' ')[0] || 'User'}!</h3>
                <p className="text-sm text-slate-300">{user?.email}</p>
                <div className="mt-1">
                  {user?.proStatus ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-yellow-400 text-black">
                      <Crown className="w-3 h-3 mr-1" />
                      PRO
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-green-400 text-black">
                      FREE
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-4 space-y-2">
            {/* Profile Settings */}
            <button
              onClick={() => {
                setDropdownTransition(false);
                setTimeout(() => {
                  setIsDropdownOpen(false);
                  setIsProfileModalOpen(true);
                  // Start fade-in transition after modal opens
                  setTimeout(() => {
                    setModalTransitions(prev => ({ ...prev, profile: true }));
                  }, 50);
                }, 200);
              }}
              className="w-full flex items-center space-x-3 p-3 rounded-lg text-slate-200 hover:bg-slate-700/50 hover:text-white transition-all duration-200"
            >
              <div className="w-10 h-10 bg-slate-700/50 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-slate-400" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-sm">Profile Settings</p>
                <p className="text-xs text-slate-400">Manage your account</p>
              </div>
            </button>

            {/* Referral Reward (if available) */}
            {hasReferralReward && (
              <button
                onClick={() => {
                  setDropdownTransition(false);
                  setTimeout(() => {
                    setIsDropdownOpen(false);
                    onOpenReferralReward?.();
                  }, 200);
                }}
                className="w-full flex items-center space-x-3 p-3 rounded-lg text-yellow-200 bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border border-yellow-500/50 hover:from-yellow-800/40 hover:to-orange-800/40 transition-all duration-200 animate-pulse"
              >
                <div className="w-10 h-10 bg-yellow-700/50 rounded-lg flex items-center justify-center">
                  <Gift className="w-5 h-5 text-yellow-400" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-bold text-sm">Referral Reward! 🎉</p>
                  <p className="text-xs text-yellow-300">Click to claim</p>
                </div>
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              </button>
            )}

            {/* Pro Status */}
            <button
              onClick={handleProStatusClick}
              className="w-full flex items-center space-x-3 p-3 rounded-lg text-slate-200 hover:bg-slate-700/50 hover:text-white transition-all duration-200"
            >
              <div className="w-10 h-10 bg-slate-700/50 rounded-lg flex items-center justify-center">
                <Crown className="w-5 h-5 text-slate-400" />
              </div>
              <div className="text-left flex-1">
                <p className="font-semibold text-sm">Pro Status</p>
                <p className="text-xs text-slate-400">View subscription</p>
              </div>
              {user?.proStatus && (
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              )}
            </button>

            {/* Contact Us */}
            <button
              onClick={() => {
                setDropdownTransition(false);
                setTimeout(() => {
                  setIsDropdownOpen(false);
                  handlePageChange?.('contact');
                }, 200);
              }}
              className="w-full flex items-center space-x-3 p-3 rounded-lg text-slate-200 hover:bg-slate-700/50 hover:text-white transition-all duration-200"
            >
              <div className="w-10 h-10 bg-slate-700/50 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-slate-400" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-sm">Contact Us</p>
                <p className="text-xs text-slate-400">Get help & support</p>
              </div>
            </button>

            {/* Divider */}
            <div className="border-t border-slate-600/50 my-2"></div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 p-3 rounded-lg text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-all duration-200"
            >
              <div className="w-10 h-10 bg-slate-700/50 rounded-lg flex items-center justify-center">
                <LogOut className="w-5 h-5 text-slate-400" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-sm">Sign Out</p>
                <p className="text-xs text-slate-400">Log out of account</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {isProfileModalOpen && (
        <div className={`fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 overflow-y-auto modal-scroll transition-all duration-300 ${modalTransitions.profile ? 'opacity-100' : 'opacity-0'}`}>
          <div className={`bg-slate-800/95 backdrop-blur-sm border border-slate-600/50 rounded-2xl shadow-2xl w-full max-w-md max-h-[calc(100vh-2rem)] overflow-y-auto my-auto modal-scroll transition-all duration-300 ${modalTransitions.profile ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-600/50">
              <h2 className="text-2xl font-bold text-white">Profile Settings</h2>
              <button
                onClick={closeModals}
                className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-700/50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-8">
              {alert && (
                <Alert 
                  type={alert.type}
                  message={alert.message}
                  details={alert.details}
                  onClose={() => setAlert(null)}
                />
              )}

              {/* Profile Information */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-purple-400" />
                  Profile Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profileForm.fullName}
                      onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your full name"
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      className="w-full px-4 py-3 bg-slate-600/50 border border-slate-500 rounded-lg text-slate-400 cursor-not-allowed"
                      disabled
                    />
                    <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
                  </div>

                  <button
                    onClick={handleProfileUpdate}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-slate-600 disabled:to-slate-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Updating...
                      </div>
                    ) : (
                      'Update Profile'
                    )}
                  </button>
                </div>
              </div>

              {/* Change Password */}
              <div className="border-t border-slate-600/50 pt-8">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <Eye className="w-5 h-5 mr-2 text-purple-400" />
                  Change Password
                </h3>
                <div className="space-y-4">
                  {/* Current Password */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? "text" : "password"}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        className="w-full px-4 py-3 pr-12 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        placeholder="Enter current password"
                        required
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('current')}
                        className="absolute inset-y-0 right-0 flex items-center justify-center w-12 text-slate-400 hover:text-slate-200 transition-colors"
                        disabled={isLoading}
                      >
                        {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? "text" : "password"}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        className="w-full px-4 py-3 pr-12 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        placeholder="Enter new password"
                        required
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('new')}
                        className="absolute inset-y-0 right-0 flex items-center justify-center w-12 text-slate-400 hover:text-slate-200 transition-colors"
                        disabled={isLoading}
                      >
                        {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        className="w-full px-4 py-3 pr-12 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        placeholder="Confirm new password"
                        required
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('confirm')}
                        className="absolute inset-y-0 right-0 flex items-center justify-center w-12 text-slate-400 hover:text-slate-200 transition-colors"
                        disabled={isLoading}
                      >
                        {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handlePasswordChange}
                    disabled={isLoading}
                    className="w-full bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Changing Password...
                      </div>
                    ) : (
                      'Change Password'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pro Status Modal */}
      {isProStatusModalOpen && proStatusData && (
        <div className={`fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 overflow-y-auto modal-scroll transition-all duration-300 ${modalTransitions.proStatus ? 'opacity-100' : 'opacity-0'}`}>
          <div className={`bg-slate-800/95 backdrop-blur-sm border border-slate-600/50 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[calc(100vh-2rem)] overflow-y-auto my-auto modal-scroll transition-all duration-300 ${modalTransitions.proStatus ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-600/50">
              <div className="flex items-center space-x-4">
                <Crown className="w-8 h-8 text-yellow-400" />
                <h2 className="text-2xl font-bold text-white">Pro Status</h2>
                {proStatusData.proStatus ? (
                  <div className="flex items-center bg-yellow-500/20 border border-yellow-400/50 rounded-full px-4 py-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse mr-2"></div>
                    <span className="text-yellow-400 text-sm font-bold">PRO PLAN</span>
                  </div>
                ) : (
                  <div className="flex items-center bg-green-500/20 border border-green-400/50 rounded-full px-4 py-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                    <span className="text-green-400 text-sm font-bold">FREE PLAN</span>
                  </div>
                )}
              </div>
              <button
                onClick={closeModals}
                className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-700/50"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {/* Free Features */}
                <div className="bg-slate-700/30 border border-slate-600/50 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <span className="w-4 h-4 bg-green-400 rounded-full mr-3"></span>
                    Free Features
                  </h3>
                  <ul className="space-y-3">
                    {proStatusData.features.free.map((feature, index) => (
                      <li key={index} className="flex items-start text-slate-300">
                        <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Pro Features */}
                <div className={`rounded-xl p-6 border ${proStatusData.proStatus 
                  ? 'bg-gradient-to-br from-purple-900/30 to-blue-900/30 border-purple-500/50' 
                  : 'bg-slate-700/20 border-slate-600/50'
                }`}>
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <Crown className="w-5 h-5 text-yellow-400 mr-3" />
                    Pro Features
                  </h3>
                  <ul className="space-y-3">
                    {proStatusData.features.pro.map((feature, index) => (
                      <li key={index} className={`flex items-start ${
                        proStatusData.proStatus ? 'text-white' : 'text-slate-400'
                      }`}>
                        <Check className={`w-5 h-5 mr-3 flex-shrink-0 mt-0.5 ${
                          proStatusData.proStatus ? 'text-yellow-400' : 'text-slate-500'
                        }`} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Upgrade Button (if not pro) */}
                {!proStatusData.proStatus ? (
                  <div className="flex-1 text-center bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/50 rounded-xl p-6">
                    <button 
                      onClick={() => {
                        closeModals();
                        handleOpenCheckout();
                      }}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-all duration-200 text-lg inline-flex items-center"
                    >
                      <Crown className="w-6 h-6 mr-2" />
                      Upgrade to Pro
                    </button>
                    <p className="text-slate-400 mt-4">
                      Unlock all premium features and take your LED control to the next level
                    </p>
                  </div>
                ) : (
                  /* Manage Subscription Button (if pro) */
                  <div className="flex-1">
                    <button 
                      onClick={handleManageSubscriptionClick}
                      disabled={isLoading}
                      className="w-full bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 disabled:cursor-not-allowed inline-flex items-center justify-center"
                    >
                      <CreditCard className="w-5 h-5 mr-2" />
                      Manage Subscription
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manage Subscription Modal */}
      {isManageSubscriptionModalOpen && subscriptionData && (
        <div className={`fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 overflow-y-auto modal-scroll transition-all duration-300 ${modalTransitions.manageSubscription ? 'opacity-100' : 'opacity-0'}`}>
          <div className={`bg-slate-800/95 backdrop-blur-sm border border-slate-600/50 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[calc(100vh-2rem)] overflow-y-auto my-auto modal-scroll transition-all duration-300 ${modalTransitions.manageSubscription ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-600/50">
              <div className="flex items-center space-x-4">
                <CreditCard className="w-8 h-8 text-purple-400" />
                <h2 className="text-2xl font-bold text-white">Manage Subscription</h2>
              </div>
              <button
                onClick={closeModals}
                className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-700/50"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {alert && (
                <Alert 
                  type={alert.type}
                  message={alert.message}
                  details={alert.details}
                  onClose={() => setAlert(null)}
                />
              )}

              {/* Subscription Status */}
              <div className="bg-slate-700/30 border border-slate-600/50 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <Crown className="w-5 h-5 text-yellow-400 mr-2" />
                  Current Subscription
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-400">Plan</p>
                    <p className="text-lg font-semibold text-white">{subscriptionData.plan}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Status</p>
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        subscriptionData.status === 'active' ? 'bg-green-400' : 'bg-red-400'
                      }`}></div>
                      <p className={`text-lg font-semibold capitalize ${
                        subscriptionData.status === 'active' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {subscriptionData.status}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Amount</p>
                    <p className="text-lg font-semibold text-white">
                      ${subscriptionData.amount}/{subscriptionData.plan.includes('Monthly') ? 'month' : 'year'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Next Billing Date</p>
                    <p className="text-lg font-semibold text-white flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(subscriptionData.currentPeriodEnd)}
                    </p>
                  </div>
                </div>

                {subscriptionData.cancelAtPeriodEnd && (
                  <div className="mt-4 p-4 bg-orange-900/30 border border-orange-500/50 rounded-lg">
                    <div className="flex items-center">
                      <AlertTriangle className="w-5 h-5 text-orange-400 mr-2" />
                      <p className="text-orange-200 font-medium">
                        Your subscription is set to cancel on {formatDate(subscriptionData.currentPeriodEnd)}
                      </p>
                    </div>
                    <p className="text-orange-300 text-sm mt-1">
                      You will retain Pro access until this date.
                    </p>
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div className="bg-slate-700/30 border border-slate-600/50 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Payment Method</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-8 bg-slate-600 rounded flex items-center justify-center mr-3">
                      <span className="text-xs font-bold text-white uppercase">
                        {subscriptionData.paymentMethod.brand}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        •••• •••• •••• {subscriptionData.paymentMethod.last4}
                      </p>
                      <p className="text-sm text-slate-400 capitalize">
                        {subscriptionData.paymentMethod.type}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={handleUpdatePaymentMethod}
                    className="text-purple-400 hover:text-purple-300 font-medium"
                  >
                    Update
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4">
                {!subscriptionData.cancelAtPeriodEnd ? (
                  <button 
                    onClick={handleCancelSubscription}
                    disabled={isCancellingSubscription}
                    className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 disabled:cursor-not-allowed"
                  >
                    {isCancellingSubscription ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Cancelling...
                      </div>
                    ) : (
                      'Cancel Subscription'
                    )}
                  </button>
                ) : (
                  <button 
                    onClick={handleReactivateSubscription}
                    disabled={isLoading}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Reactivating...
                      </div>
                    ) : (
                      'Reactivate Subscription'
                    )}
                  </button>
                )}
                
                <button 
                  onClick={handleDownloadInvoices}
                  disabled={isLoading}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Loading...
                    </div>
                  ) : (
                    'Download Invoices'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Method Update Modal */}
      {isUpdatePaymentModalOpen && (
        <div className={`fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 overflow-y-auto modal-scroll transition-all duration-300 ${modalTransitions.updatePayment ? 'opacity-100' : 'opacity-0'}`}>
          <div className={`bg-slate-800/95 backdrop-blur-sm border border-slate-600/50 rounded-2xl shadow-2xl w-full max-w-md max-h-[calc(100vh-2rem)] overflow-y-auto my-auto modal-scroll transition-all duration-300 ${modalTransitions.updatePayment ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-600/50">
              <div className="flex items-center space-x-4">
                <CreditCard className="w-8 h-8 text-purple-400" />
                <h2 className="text-2xl font-bold text-white">Update Payment Method</h2>
              </div>
              <button
                onClick={handlePaymentMethodUpdateCancel}
                className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-700/50"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <Elements stripe={stripePromise}>
                <PaymentMethodUpdateForm
                  onSuccess={handlePaymentMethodUpdateSuccess}
                  onCancel={handlePaymentMethodUpdateCancel}
                />
              </Elements>
            </div>
          </div>
        </div>
      )}

      {/* Global Alert */}
      {alert && !isProfileModalOpen && !isManageSubscriptionModalOpen && (
        <div className="fixed top-4 right-4 z-[9999] max-w-md">
          <Alert 
            type={alert.type}
            message={alert.message}
            details={alert.details || undefined}
            onClose={() => setAlert(null)}
          />
        </div>
      )}
    </div>
  );
};

export default UserProfile; 