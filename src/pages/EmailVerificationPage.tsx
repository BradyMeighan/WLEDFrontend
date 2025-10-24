import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext.tsx';
import Alert from '../components/Alert.tsx';
import { ArrowLeft } from 'lucide-react';

interface EmailVerificationPageProps {
  handlePageChange: (page: string) => void;
}

type VerificationStatus = 'verifying' | 'success' | 'error';

const EmailVerificationPage: React.FC<EmailVerificationPageProps> = ({ handlePageChange }) => {
  const [status, setStatus] = useState<VerificationStatus>('verifying');
  const [message, setMessage] = useState<string>('Verifying your email address...');
  const { verifyEmail } = useAuth();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
      const verifyEmailToken = async () => {
        try {
          await verifyEmail(token);
          setStatus('success');
          setMessage('Email verified successfully! You can now login.');
          // Clean the token from URL
          window.history.replaceState({}, document.title, window.location.pathname);
          // Optional: Redirect to login after a delay
          setTimeout(() => handlePageChange('login'), 3000);
        } catch (err: any) {
          setStatus('error');
          setMessage(err.message || 'Failed to verify email. The link may be invalid or expired.');
          // Clean the token from URL even on error
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      };
      verifyEmailToken();
    } else {
      setStatus('error');
      setMessage('No verification token found. Please check the link or request a new one.');
    }
  }, [verifyEmail, handlePageChange]);

  return (
    <div className="min-h-screen bg-slate-900 text-white relative flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900/20 to-blue-900/30 -z-10" />
      
      <motion.div 
        className="absolute top-4 sm:top-6 left-4 sm:left-6"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <motion.button 
          onClick={() => handlePageChange('home')}
          className="flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-white p-3 rounded-lg transition-colors touch-target"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft size={24} />
        </motion.button>
      </motion.div>
      
      <motion.div 
        className="bg-slate-800/90 backdrop-blur-lg p-6 sm:p-8 md:p-12 rounded-xl shadow-2xl w-full max-w-lg text-center border border-slate-700/50"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.h2 
          className="text-2xl sm:text-3xl font-bold text-purple-400 mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          Email Verification
        </motion.h2>
        
        {status === 'verifying' && (
          <motion.div 
            className="flex flex-col sm:flex-row justify-center items-center gap-4 my-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            <p className="text-base sm:text-lg text-slate-300">{message}</p>
          </motion.div>
        )}
        
        {status === 'success' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Alert message={message} type="success" />
          </motion.div>
        )}
        
        {status === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Alert message={message} type="error" />
          </motion.div>
        )}
        
        <motion.div 
          className="mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {status === 'success' && (
            <motion.button 
              onClick={() => handlePageChange('login')}
              className="btn btn-primary w-full sm:w-auto touch-target"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Proceed to Login
            </motion.button>
          )}
          {status === 'error' && (
            <motion.button 
              onClick={() => handlePageChange('home')}
              className="btn btn-secondary w-full sm:w-auto touch-target"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Back to Home
            </motion.button>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default EmailVerificationPage; 