import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext.tsx';
import { ArrowLeft } from 'lucide-react';
import { SignIn } from '@clerk/clerk-react';

interface LoginPageProps {
  handlePageChange: (page: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ handlePageChange }) => {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      handlePageChange('home'); 
    }
  }, [user, handlePageChange]);

  return (
    <div className="min-h-screen bg-slate-900 text-white relative">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900/20 to-blue-900/30 -z-10" />
      
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <motion.div 
          className="w-full max-w-md"
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
          
          {/* Clerk Sign In Component */}
          <motion.div 
            className="flex justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <SignIn 
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "bg-slate-800/90 backdrop-blur-lg shadow-2xl border border-slate-700/50",
                  headerTitle: "text-purple-400",
                  headerSubtitle: "text-slate-300",
                  socialButtonsBlockButton: "bg-slate-700 hover:bg-slate-600 border-slate-600",
                  formButtonPrimary: "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700",
                  formFieldInput: "bg-slate-700 border-slate-600 text-white",
                  footerActionLink: "text-purple-400 hover:text-purple-300",
                  identityPreviewText: "text-white",
                  identityPreviewEditButton: "text-purple-400",
                }
              }}
              redirectUrl="/"
              signUpUrl="/signup"
            />
          </motion.div>
          
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
