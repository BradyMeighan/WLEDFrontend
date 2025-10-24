import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Crown, CreditCard, Shield, X, Check, AlertCircle, Loader } from 'lucide-react';
import { stripeService } from '../services/stripe';

// Type definitions
interface Plan {
  id: string;
  name: string;
  price: number;
  period: string;
  features: string[];
  popular?: boolean;
  savings?: string;
}

interface CheckoutFormProps {
  selectedPlan: Plan;
  onSuccess: () => void;
  onCancel: () => void;
}

interface SuccessScreenProps {
  selectedPlan: Plan;
  onClose: () => void;
}

interface PlanSelectorProps {
  onSelectPlan: (plan: Plan) => void;
  selectedPlan: Plan | null;
  plans: Plan[];
  loading: boolean;
}

interface StripeCheckoutProps {
  isOpen: boolean;
  onClose: () => void;
}

// Initialize Stripe with your publishable key from environment
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!STRIPE_PUBLISHABLE_KEY) {
  throw new Error("Missing Stripe Publishable Key. Please add VITE_STRIPE_PUBLISHABLE_KEY to your .env file");
}

console.log('🔑 Using Stripe key:', STRIPE_PUBLISHABLE_KEY.substring(0, 20) + '...');

const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

// Custom appearance for Stripe Elements matching the homepage theme
const stripeAppearance = {
  theme: 'night' as const,
  variables: {
    colorPrimary: '#a855f7', // Purple-500
    colorBackground: '#1e293b', // Slate-800
    colorText: '#f8fafc', // Slate-50
    colorDanger: '#ef4444', // Red-500
    colorTextSecondary: '#94a3b8', // Slate-400
    colorTextPlaceholder: '#64748b', // Slate-500
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
    spacingUnit: '4px',
    borderRadius: '8px',
    fontSizeBase: '16px',
    fontWeightNormal: '400',
    fontWeightMedium: '500',
    fontWeightBold: '600'
  },
  rules: {
    '.Tab': {
      backgroundColor: '#334155', // Slate-700
      border: '1px solid #475569', // Slate-600
      boxShadow: 'none'
    },
    '.Tab--selected': {
      backgroundColor: '#a855f7', // Purple-500
      color: '#ffffff'
    },
    '.Tab:hover': {
      backgroundColor: '#475569' // Slate-600
    },
    '.Input': {
      backgroundColor: '#334155', // Slate-700
      border: '1px solid #475569', // Slate-600
      boxShadow: 'none'
    },
    '.Input:focus': {
      border: '1px solid #a855f7', // Purple-500
      boxShadow: '0 0 0 2px rgba(168, 85, 247, 0.2)'
    },
    '.Label': {
      color: '#f1f5f9', // Slate-100
      fontWeight: '500'
    },
    '.Block': {
      backgroundColor: '#1e293b', // Slate-800
      border: '1px solid #334155', // Slate-700
      borderRadius: '8px'
    }
  }
};

// Checkout Form Component
const CheckoutForm: React.FC<CheckoutFormProps> = ({ selectedPlan, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingStep, setProcessingStep] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setProcessingStep('Validating payment details...');

    try {
      // For free plan, just proceed without payment
      if (selectedPlan.price === 0) {
        setProcessingStep('Setting up free account...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsLoading(false);
        onSuccess();
        return;
      }

      // For paid plans, create subscription
      setProcessingStep('Processing payment...');

      try {
        // Submit the form to collect payment method
        const { error: submitError } = await elements.submit();
        if (submitError) {
          setError(submitError.message || 'Payment submission failed');
          setIsLoading(false);
          return;
        }

        setProcessingStep('Creating payment method...');

        // Create payment method manually
        const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
          elements,
        });

        if (paymentMethodError) {
          setError(paymentMethodError.message || 'Payment method creation failed');
          setIsLoading(false);
          return;
        }

        console.log('💳 Created payment method:', paymentMethod.id);
        console.log('💳 Payment method details:', {
          id: paymentMethod.id,
          type: paymentMethod.type,
          livemode: paymentMethod.livemode
        });

        setProcessingStep('Creating subscription...');

        // Create subscription on backend
        console.log('🚀 Calling backend with:', {
          planId: selectedPlan.id,
          paymentMethodId: paymentMethod.id
        });
        
        const result = await stripeService.createSubscription(selectedPlan.id, paymentMethod.id);
        
        if (result.success) {
          setProcessingStep('Finalizing subscription...');
          await new Promise(resolve => setTimeout(resolve, 500));
          setIsLoading(false);
          onSuccess();
        } else {
          setError(result.message || 'Failed to create subscription');
          setIsLoading(false);
        }
      } catch (stripeError: any) {
        console.error('Stripe error:', stripeError);
        // Handle specific Stripe errors
        if (stripeError.type === 'card_error') {
          setError(stripeError.message || 'Card error occurred');
        } else if (stripeError.type === 'validation_error') {
          setError('Please check your payment information');
        } else {
          setError('Payment processing failed. Please try again.');
        }
        setIsLoading(false);
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      setError(error.response?.data?.message || error.message || 'Payment failed');
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Plan Summary */}
      <div className="bg-slate-700/50 border border-slate-600/50 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Crown className="w-6 h-6 text-purple-400" />
            <div>
              <h3 className="text-lg font-semibold text-white">{selectedPlan.name}</h3>
              <p className="text-sm text-slate-400">
                {selectedPlan.period === 'forever' ? 'Free Plan' : `Billed ${selectedPlan.period}ly`}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">
              ${selectedPlan.price}
              {selectedPlan.period !== 'forever' && (
                <span className="text-lg text-slate-400">/{selectedPlan.period}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Form */}
      {selectedPlan.price > 0 && (
        <div className="space-y-6">
          {/* Payment Element */}
          <div className="bg-slate-800/50 border border-slate-600/50 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-purple-400" />
              Payment Details
            </h4>
            <PaymentElement 
              options={{
                layout: {
                  type: 'accordion',
                  defaultCollapsed: false,
                  radios: false,
                  spacedAccordionItems: true
                },
                fields: {
                  billingDetails: {
                    address: {
                      postalCode: 'auto' // Only collect postal code
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-900/50 border border-red-500/50 rounded-lg p-4 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-100 font-medium">Payment Failed</p>
            <p className="text-red-200 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Security Notice */}
      <div className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-4 flex items-center space-x-3">
        <Shield className="w-5 h-5 text-green-400" />
        <div className="text-sm text-slate-300">
          <p className="font-medium text-slate-200">Secure Payment</p>
          <p>Your payment information is encrypted and secure. Powered by Stripe.</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={onCancel}
          className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
        >
          Cancel
        </button>
        
        <button
          onClick={handleSubmit}
          disabled={!stripe || isLoading}
          className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-slate-600 disabled:to-slate-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <Loader className="w-5 h-5 animate-spin" />
              <span>{processingStep}</span>
            </div>
          ) : (
            selectedPlan.price > 0 ? `Pay $${selectedPlan.price}` : 'Continue with Free Plan'
          )}
        </button>
      </div>
    </div>
  );
};

// Success Component
const SuccessScreen: React.FC<SuccessScreenProps> = ({ selectedPlan, onClose }) => (
  <div className="text-center py-8">
    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
      <Check className="w-8 h-8 text-white" />
    </div>
    <h3 className="text-2xl font-bold text-white mb-2">Payment Successful!</h3>
    <p className="text-slate-300 mb-6">
      Welcome to WLED Studio {selectedPlan.name}! Your subscription is now active.
    </p>
    <div className="bg-slate-700/50 border border-slate-600/50 rounded-xl p-6 mb-6">
      <h4 className="text-lg font-semibold text-white mb-4">What's Next?</h4>
      <ul className="text-left space-y-2 text-slate-300">
        <li className="flex items-center">
          <Check className="w-4 h-4 text-green-400 mr-2" />
          Download the latest version of WLED Studio
        </li>
        <li className="flex items-center">
          <Check className="w-4 h-4 text-green-400 mr-2" />
          Access all Pro features immediately
        </li>
        <li className="flex items-center">
          <Check className="w-4 h-4 text-green-400 mr-2" />
          Check your email for setup instructions
        </li>
      </ul>
    </div>
    <button
      onClick={onClose}
      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200"
    >
      Get Started
    </button>
  </div>
);

// Plan Selection Component
const PlanSelector: React.FC<PlanSelectorProps> = ({ onSelectPlan, selectedPlan, plans, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 animate-spin text-purple-400" />
        <span className="ml-2 text-slate-300">Loading pricing plans...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-white mb-2">Choose Your Plan</h3>
        <p className="text-slate-300">Upgrade to Pro for advanced LED control features</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => {
          const isFreePlan = plan.price === 0;
          const isCurrentFreePlan = isFreePlan; // Assume user is on free plan by default
          const isSelectable = !isFreePlan; // Free plans are not selectable
          
          return (
            <div
              key={plan.id}
              className={`relative bg-slate-800/50 border rounded-xl p-6 transition-all duration-200 flex flex-col h-full ${
                isSelectable ? 'cursor-pointer' : 'cursor-default'
              } ${
                selectedPlan?.id === plan.id
                  ? 'border-purple-500 ring-2 ring-purple-500/20'
                  : isCurrentFreePlan && isFreePlan
                  ? 'border-green-500/50 bg-green-900/10'
                  : 'border-slate-600/50 hover:border-slate-500'
              } ${plan.popular ? 'ring-2 ring-purple-500/50' : ''}`}
              onClick={() => isSelectable && onSelectPlan(plan)}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              {isCurrentFreePlan && isFreePlan && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    Current Plan
                  </span>
                </div>
              )}
              
              <div className="text-center">
                <h4 className="text-xl font-bold text-white mb-2">{plan.name}</h4>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-white">${plan.price}</span>
                  {plan.period !== 'forever' && (
                    <span className="text-slate-400">/{plan.period}</span>
                  )}
                  {plan.savings && (
                    <div className="mt-2">
                      <span className="bg-green-500/20 text-green-400 text-xs font-semibold px-2 py-1 rounded-full">
                        {plan.savings}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <ul className="space-y-2 mb-6 flex-grow">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start text-sm text-slate-300">
                    <Check className="w-4 h-4 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>
              
              <button
                disabled={!isSelectable}
                className={`w-full font-semibold py-3 px-4 rounded-lg transition-all duration-200 mt-auto ${
                  selectedPlan?.id === plan.id
                    ? 'bg-purple-600 text-white'
                    : isCurrentFreePlan && isFreePlan
                    ? 'bg-green-600 text-white cursor-default'
                    : isSelectable
                    ? 'bg-slate-700 hover:bg-slate-600 text-white'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                {selectedPlan?.id === plan.id 
                  ? 'Selected' 
                  : isCurrentFreePlan && isFreePlan 
                  ? 'Current Plan' 
                  : 'Select Plan'
                }
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Main Stripe Checkout Component
const StripeCheckout: React.FC<StripeCheckoutProps> = ({ isOpen, onClose }) => {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadPricingPlans();
    }
  }, [isOpen]);

  const loadPricingPlans = async () => {
    try {
      setLoading(true);
      const response = await stripeService.getPricingPlans();
      if (response.success) {
        setPlans(response.plans);
      }
    } catch (error) {
      console.error('Failed to load pricing plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
  };

  const handleContinueToCheckout = async () => {
    if (selectedPlan) {
      // For free plans, just show success immediately
      if (selectedPlan.price === 0) {
        setShowSuccess(true);
        return;
      }
      
      // For paid plans, proceed to checkout
      setShowCheckout(true);
    }
  };

  const handlePaymentSuccess = () => {
    setShowSuccess(true);
  };

  const handleClose = () => {
    setSelectedPlan(null);
    setShowCheckout(false);
    setShowSuccess(false);
    onClose();
  };

  const handleBack = () => {
    setShowCheckout(false);
  };

  if (!isOpen) return null;

  const elementsOptions = {
    appearance: stripeAppearance,
    mode: 'setup' as const,
    currency: 'usd',
    payment_method_types: ['card'],
    paymentMethodCreation: 'manual' as const,
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 overflow-y-auto modal-scroll">
      <div className="bg-slate-900/95 backdrop-blur-sm border border-slate-600/50 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[calc(100vh-2rem)] overflow-y-auto my-auto modal-scroll">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-600/50">
          <div className="flex items-center space-x-3">
            <Crown className="w-8 h-8 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">
              {showSuccess ? 'Welcome to WLED Studio Pro!' : 'Upgrade to Pro'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-700/50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {showSuccess ? (
            <SuccessScreen selectedPlan={selectedPlan} onClose={handleClose} />
          ) : showCheckout ? (
            selectedPlan && selectedPlan.price > 0 ? (
              <Elements stripe={stripePromise} options={elementsOptions}>
                <CheckoutForm 
                  selectedPlan={selectedPlan}
                  onSuccess={handlePaymentSuccess}
                  onCancel={handleBack}
                />
              </Elements>
            ) : (
              <CheckoutForm 
                selectedPlan={selectedPlan}
                onSuccess={handlePaymentSuccess}
                onCancel={handleBack}
              />
            )
          ) : (
            <div className="space-y-6">
              <PlanSelector 
                onSelectPlan={handleSelectPlan}
                selectedPlan={selectedPlan}
                plans={plans}
                loading={loading}
              />
              
              <div className="flex justify-center">
                <button
                  onClick={handleContinueToCheckout}
                  disabled={!selectedPlan || selectedPlan.price === 0}
                  className={`font-semibold py-3 px-8 rounded-lg transition-all duration-200 ${
                    selectedPlan && selectedPlan.price > 0
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white' 
                      : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {selectedPlan && selectedPlan.price > 0
                    ? 'Continue to Checkout'
                    : selectedPlan && selectedPlan.price === 0
                    ? 'You are already on the Free Plan'
                    : 'Select a Pro Plan to Continue'
                  }
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StripeCheckout; 