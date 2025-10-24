import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext.tsx';
import Alert from '../components/Alert.tsx';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';

interface LoginPageProps {
  handlePageChange: (page: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ handlePageChange }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const { login, user } = useAuth();

  useEffect(() => {
    if (user) {
      handlePageChange('home'); 
    }
  }, [user, handlePageChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    if (name === 'email') setEmail(value);
    if (name === 'password') setPassword(value);
    if (name === 'rememberMe' && type === 'checkbox') setRememberMe(checked);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!email || !password) {
      setError('Email and password are required');
      setLoading(false);
      return;
    }

    try {
      const result = await login(email, password, rememberMe);
      if (result.success) {
        setSuccess('Login successful! Redirecting...');
      } else {
        if (result.code === 429) {
          setError('Too many login attempts. Please try again later.');
        } else {
          setError(result.error || 'Failed to login. Please check your credentials.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to login. Please check your credentials.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white relative">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900/20 to-blue-900/30 -z-10" />
      
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <motion.div 
          className="bg-slate-800/90 backdrop-blur-lg p-6 sm:p-8 md:p-10 rounded-2xl shadow-2xl w-full max-w-md border border-slate-700/50"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Back button */}
          <motion.div 
            className="flex items-center mb-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <motion.button 
              onClick={() => handlePageChange('home')}
              className="flex items-center text-slate-400 hover:text-white transition-colors group touch-target"
              whileHover={{ x: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </motion.button>
          </motion.div>
          
          <motion.h2 
            className="text-3xl sm:text-4xl font-bold text-center text-purple-400 mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Welcome Back
          </motion.h2>
          
          {error && (
            <motion.div 
              className="mb-6"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Alert message={error} type="error" onClose={() => setError('')} />
            </motion.div>
          )}
          {success && (
            <motion.div 
              className="mb-6"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Alert message={success} type="success" onClose={() => setSuccess('')} />
            </motion.div>
          )}
          
          <motion.form 
            onSubmit={handleSubmit} 
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div>
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <input 
                type="email" 
                name="email" 
                id="email" 
                value={email} 
                onChange={handleChange} 
                className="w-full px-4 py-3 bg-white border border-slate-600 rounded-lg text-gray-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-base"
                placeholder="you@example.com"
                required 
                disabled={loading}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  name="password" 
                  id="password" 
                  value={password} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 pr-12 bg-white border border-slate-600 rounded-lg text-gray-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-base"
                  placeholder="••••••••"
                  required 
                  disabled={loading}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center justify-center w-12 text-slate-400 hover:text-slate-200 transition-colors touch-target"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  name="rememberMe"
                  checked={rememberMe}
                  onChange={handleChange}
                  className="w-4 h-4 text-purple-500 bg-slate-700 border-slate-600 rounded focus:ring-purple-500 focus:ring-offset-slate-800"
                  disabled={loading}
                />
                <span className="ml-2 text-sm text-slate-300">Remember me</span>
              </label>
              <button 
                type="button"
                onClick={() => handlePageChange('forgot-password')} 
                className="text-sm text-purple-400 hover:text-purple-300 hover:underline transition-colors text-left touch-target"
                disabled={loading}
              >
                Forgot password?
              </button>
            </div>
            
            <motion.button 
              type="submit" 
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all transform focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-lg touch-target"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Logging in...
                </div>
              ) : (
                'Sign In'
              )}
            </motion.button>
          </motion.form>
          
          <motion.div 
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <p className="text-slate-400">
              Don't have an account?{' '}
              <button 
                onClick={() => handlePageChange('signup')} 
                className="text-purple-400 hover:text-purple-300 font-semibold hover:underline transition-colors touch-target"
                disabled={loading}
              >
                Sign up here
              </button>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
