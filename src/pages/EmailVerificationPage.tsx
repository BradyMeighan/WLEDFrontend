import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import Alert from '../components/Alert.tsx';
import { ArrowLeft } from 'lucide-react';
import '../App.css';

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
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
      <div className="absolute top-6 left-6">
        <button 
          onClick={() => handlePageChange('home')}
          className="btn btn-icon bg-slate-800 hover:bg-slate-700 text-white"
        >
          <ArrowLeft size={24} />
        </button>
      </div>
      <div className="bg-slate-800 p-8 md:p-12 rounded-xl shadow-2xl w-full max-w-lg text-center">
        <h2 className="text-3xl font-bold text-purple-400 mb-6">
          Email Verification
        </h2>
        {status === 'verifying' && (
          <div className="flex justify-center items-center my-6">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            <p className="ml-4 text-lg text-slate-300">{message}</p>
          </div>
        )}
        {status === 'success' && (
          <Alert message={message} type="success" />
        )}
        {status === 'error' && (
          <Alert message={message} type="error" />
        )}
        <div className="mt-8">
          {status === 'success' && (
            <button 
              onClick={() => handlePageChange('login')}
              className="btn btn-primary w-full md:w-auto"
            >
              Proceed to Login
            </button>
          )}
          {status === 'error' && (
            <button 
              onClick={() => handlePageChange('home')} // Or to a page to request new token
              className="btn btn-secondary w-full md:w-auto"
            >
              Back to Home
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage; 