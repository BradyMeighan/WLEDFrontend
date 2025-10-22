import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import Alert from '../components/Alert.tsx';
import PasswordStrength from '../components/PasswordStrength.tsx';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import '../App.css';

interface SignupPageProps {
  handlePageChange: (page: string) => void;
}

const SignupPage: React.FC<SignupPageProps> = ({ handlePageChange }) => {
  const [email, setEmail] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [passwordFocused, setPasswordFocused] = useState<boolean>(false);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(true);
  const { register, user } = useAuth();

  useEffect(() => {
    // Fade in animation
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (user) {
      handlePageChange('home');
    }
  }, [user, handlePageChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'email') setEmail(value);
    if (name === 'fullName') setFullName(value);
    if (name === 'password') setPassword(value);
    if (name === 'confirmPassword') setConfirmPassword(value);
  };

  const validateForm = (): boolean => {
    if (!email || !fullName || !password || !confirmPassword) {
      setError('All fields are required');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const result = await register({ email, fullName, password });
      if (result.success) {
        setSuccess('Signup successful! Please check your email to verify your account.');
      } else {
        if (result.code === 429) {
          setError('Too many registration attempts. Please try again later.');
        } else if (result.details && result.details.length > 0) {
          // Show specific validation errors
          const errorMessages = result.details.map((detail: any) => detail.msg).join(', ');
          setError(errorMessages);
        } else {
          setError(result.error || 'Failed to sign up. Please try again.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign up. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white relative">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900/20 to-blue-900/30"></div>
      
      <div className={`relative z-10 flex items-center justify-center min-h-screen p-4 transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        <div className="bg-slate-800/90 backdrop-blur-lg p-8 md:p-10 rounded-2xl shadow-2xl w-full max-w-md border border-slate-700/50">
          {/* Back button inside the form box */}
          <div className="flex items-center mb-6">
            <button 
              onClick={() => handlePageChange('home')}
              className="flex items-center text-slate-400 hover:text-white transition-colors duration-300 group"
            >
              <ArrowLeft className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform duration-300" />
              Back to Home
            </button>
          </div>
          
          <h2 className="text-4xl font-bold text-center text-purple-400 mb-8">Create Account</h2>
          
          {error && (
            <div className="mb-6">
              <Alert message={error} type="error" onClose={() => setError('')} />
            </div>
          )}
          {success && (
            <div className="text-center space-y-8 max-w-2xl mx-auto">
              {/* Success Animation */}
              <div className="relative">
                <div className="w-20 h-20 mx-auto bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center animate-pulse">
                  <svg className="w-10 h-10 text-white animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                {/* Ripple effect */}
                <div className="absolute inset-0 w-20 h-20 mx-auto bg-green-400/20 rounded-full animate-ping"></div>
                <div className="absolute inset-0 w-20 h-20 mx-auto bg-green-400/10 rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
              </div>

              {/* Success Message */}
              <div className="space-y-6">
                <h3 className="text-4xl font-bold text-white">Account Created Successfully!</h3>
                <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-8 backdrop-blur-sm">
                  <p className="text-green-200 text-xl leading-relaxed">
                    Welcome to WLED Studio! We've sent a verification email to{' '}
                    <span className="font-semibold text-green-100">{email}</span>
                  </p>
                  <p className="text-green-300 mt-4 text-lg">
                    Please check your inbox and click the verification link to activate your account.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button 
                  onClick={() => handlePageChange('login')} 
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-800 text-lg"
                >
                  Go to Sign In
                </button>
                <button 
                  onClick={() => handlePageChange('home')} 
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-800 text-lg"
                >
                  Back to Home
                </button>
              </div>

              {/* Didn't receive email? */}
              <div className="pt-6 border-t border-slate-600/50">
                <p className="text-slate-400 text-lg">
                  Didn't receive the email?{' '}
                  <button 
                    onClick={() => {
                      // Here you could implement resend functionality
                      alert('Resend functionality would be implemented here');
                    }}
                    className="text-purple-400 hover:text-purple-300 underline transition-colors duration-300 font-semibold"
                  >
                    Resend verification email
                  </button>
                </p>
              </div>
            </div>
          )}
          
          {!success && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="fullName" className="block text-sm font-semibold text-slate-300 mb-2">
                  Full Name
                </label>
                <input 
                  type="text" 
                  name="fullName" 
                  id="fullName" 
                  value={fullName} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 bg-white border border-slate-600 rounded-lg text-gray-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-base"
                  placeholder="Your full name"
                  required 
                  disabled={loading}
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-300 mb-2">
                  Email Address
                </label>
                <input 
                  type="email" 
                  name="email" 
                  id="email" 
                  value={email} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 bg-white border border-slate-600 rounded-lg text-gray-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-base"
                  placeholder="you@example.com"
                  required 
                  disabled={loading}
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-slate-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    name="password" 
                    id="password" 
                    value={password} 
                    onChange={handleChange} 
                    className={`w-full px-4 py-3 pr-12 bg-white border border-slate-600 rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-base text-gray-900`}
                    placeholder="••••••••"
                    required 
                    disabled={loading}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center justify-center w-12 text-slate-400 hover:text-slate-200 transition-colors duration-300"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {password && (
                  <div className="mt-2">
                    <PasswordStrength password={password} />
                  </div>
                )}
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input 
                    type={showConfirmPassword ? 'text' : 'password'} 
                    name="confirmPassword" 
                    id="confirmPassword" 
                    value={confirmPassword} 
                    onChange={handleChange} 
                    className={`w-full px-4 py-3 pr-12 bg-white border border-slate-600 rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-base text-gray-900`}
                    placeholder="••••••••"
                    required 
                    disabled={loading}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center justify-center w-12 text-slate-400 hover:text-slate-200 transition-colors duration-300"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    disabled={loading}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              
              <div className="flex items-start">
                <input 
                  type="checkbox" 
                  id="terms"
                  className="w-4 h-4 text-purple-500 bg-slate-700 border-slate-600 rounded focus:ring-purple-500 focus:ring-offset-slate-800 mt-1"
                  required
                  disabled={loading}
                />
                <label htmlFor="terms" className="ml-3 text-sm text-slate-300 leading-relaxed">
                  I agree to the{' '}
                  <button 
                    type="button"
                    onClick={() => handlePageChange('privacy')}
                    className="text-purple-400 hover:text-purple-300 underline transition-colors duration-300"
                    disabled={loading}
                  >
                    Privacy Policy
                  </button>{' '}
                  and Terms of Service
                </label>
              </div>
              
              <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-lg"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating Account...
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>
          )}
          
          <div className="mt-8 text-center">
            <p className="text-slate-400">
              Already have an account?{' '}
              <button 
                onClick={() => handlePageChange('login')} 
                className="text-purple-400 hover:text-purple-300 font-semibold hover:underline transition-colors duration-300"
                disabled={loading}
              >
                Sign in here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage; 