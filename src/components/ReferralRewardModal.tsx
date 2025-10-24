import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, Crown, CreditCard } from 'lucide-react';
import MeControlSVG from './referral_reward.jsx';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY!);

interface ReferralRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Payment form component
const ReferralPaymentForm = ({ onSuccess, onError }: { onSuccess: () => void; onError: (error: string) => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      onError('Card element not found');
      setIsLoading(false);
      return;
    }

    try {
      // Get Clerk token
      const token = await window.Clerk?.session?.getToken();
      if (!token) {
        onError('Authentication required');
        setIsLoading(false);
        return;
      }

      // Create payment method
      const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: name || undefined,
        },
      });

      if (pmError) {
        onError(pmError.message || 'Failed to process payment method');
        setIsLoading(false);
        return;
      }

      // Call backend to create subscription with trial
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://wledwebsite-production.up.railway.app'}/api/stripe/create-subscription`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          paymentMethodId: paymentMethod.id,
          priceId: import.meta.env.VITE_STRIPE_PRICE_ID,
          trialDays: 14, // 14-day trial for referral reward
          isReferralReward: true
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        onError(result.error || 'Failed to activate referral reward');
        setIsLoading(false);
        return;
      }

      // Handle 3D Secure if needed
      if (result.requiresAction && result.clientSecret) {
        const { error: confirmError } = await stripe.confirmCardPayment(result.clientSecret);
        
        if (confirmError) {
          onError(confirmError.message || 'Payment confirmation failed');
          setIsLoading(false);
          return;
        }
      }

      // Mark referral reward as claimed
      await fetch(`${import.meta.env.VITE_API_URL || 'https://wledwebsite-production.up.railway.app'}/api/referral/claim`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      onSuccess();
    } catch (error: any) {
      onError(error.message || 'An unexpected error occurred');
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
    hidePostalCode: false,
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Cardholder Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
          placeholder="John Doe"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Card Information
        </label>
        <div className="p-4 bg-slate-700/50 border border-slate-600 rounded-lg">
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-4">
        <div className="flex items-start">
          <Gift className="w-5 h-5 text-yellow-400 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-yellow-200 font-medium text-sm">14-Day Free Trial Included!</p>
            <p className="text-yellow-300 text-xs mt-1">
              Your card will not be charged for 14 days. After the trial, you'll be billed $9.99/month for the Pro subscription. Cancel anytime before the trial ends to avoid charges.
            </p>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={!stripe || isLoading}
        className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 disabled:from-slate-600 disabled:to-slate-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center text-lg"
      >
        {isLoading ? (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Activating...
          </div>
        ) : (
          <>
            <Crown className="w-5 h-5 mr-2" />
            Activate 14-Day Pro Trial
          </>
        )}
      </button>
    </form>
  );
};

const ReferralRewardModal: React.FC<ReferralRewardModalProps> = ({ isOpen, onClose }) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSuccess = () => {
    setShowSuccess(true);
    setTimeout(() => {
      onClose();
      setShowSuccess(false);
    }, 3000);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setTimeout(() => setError(null), 5000);
  };

  const handleClose = () => {
    if (!showSuccess) {
      onClose();
      setError(null);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="bg-slate-800/95 backdrop-blur-sm border border-yellow-500/50 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-yellow-900/40 to-orange-900/40 border-b border-yellow-500/50 p-6">
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-700/50"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="flex items-center justify-center mb-4">
                <div className="w-32 sm:w-40 max-w-full">
                  <MeControlSVG />
                </div>
              </div>
              
              <h2 className="text-3xl font-bold text-center text-white mb-2">
                🎉 Referral Reward Available!
              </h2>
              <p className="text-center text-yellow-200">
                Congratulations! You've earned a 14-day Pro trial.
              </p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {showSuccess ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-12"
                >
                  <div className="w-24 h-24 mx-auto mb-6 bg-green-500/20 rounded-full flex items-center justify-center">
                    <Crown className="w-12 h-12 text-yellow-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">Welcome to Pro! 🎊</h3>
                  <p className="text-slate-300 mb-2">Your 14-day trial has been activated.</p>
                  <p className="text-slate-400 text-sm">Enjoy all Pro features for free!</p>
                </motion.div>
              ) : (
                <>
                  {/* Benefits */}
                  <div className="bg-slate-700/30 border border-slate-600/50 rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                      <Crown className="w-5 h-5 text-yellow-400 mr-2" />
                      What You Get
                    </h3>
                    <ul className="space-y-3 text-slate-300">
                      <li className="flex items-start">
                        <span className="text-yellow-400 mr-2">✓</span>
                        <span>14 days of full Pro access - completely free!</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-yellow-400 mr-2">✓</span>
                        <span>Advanced LED control & premium effects</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-yellow-400 mr-2">✓</span>
                        <span>Cloud access from anywhere</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-yellow-400 mr-2">✓</span>
                        <span>Priority support & early features</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-yellow-400 mr-2">✓</span>
                        <span>Cancel anytime before trial ends - no charge!</span>
                      </li>
                    </ul>
                  </div>

                  {error && (
                    <div className="p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200">
                      {error}
                    </div>
                  )}

                  {/* Payment Form */}
                  <div>
                    <div className="flex items-center justify-center mb-4">
                      <CreditCard className="w-5 h-5 text-slate-400 mr-2" />
                      <h3 className="text-lg font-semibold text-white">Payment Information</h3>
                    </div>
                    <p className="text-slate-400 text-sm text-center mb-6">
                      We need your card to start your trial. You won't be charged for 14 days.
                    </p>
                    
                    <Elements stripe={stripePromise}>
                      <ReferralPaymentForm onSuccess={handleSuccess} onError={handleError} />
                    </Elements>
                  </div>

                  <div className="text-xs text-slate-400 text-center space-y-1">
                    <p>
                      By activating your trial, you'll be enrolled in a <strong className="text-white">monthly Pro subscription ($9.99/month)</strong>.
                    </p>
                    <p>
                      Your card will be charged after the 14-day trial. Cancel anytime in your account settings.
                    </p>
                    <p className="text-slate-500 mt-2">
                      By proceeding, you agree to our Terms of Service and Privacy Policy.
                    </p>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ReferralRewardModal;

