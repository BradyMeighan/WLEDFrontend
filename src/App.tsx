import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './contexts/AuthContext.tsx';
import './App.css';
import HomePage from './pages/HomePage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import SignupPage from './pages/SignupPage.tsx';
import EmailVerificationPage from './pages/EmailVerificationPage.tsx';
import PrivacyPage from './pages/PrivacyPage.tsx';
import ContactPage from './pages/ContactPage.tsx';
import BugReportPage from './pages/BugReportPage.tsx';

type PageType = 'home' | 'login' | 'signup' | 'verify-email' | 'privacy' | 'contact' | 'bug-report';

// Page transition variants
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

function AppContent() {
  const [currentPage, setCurrentPage] = useState('home' as PageType);
  const { user, isAuthenticated, logout } = useAuth();

  const handlePageChange = useCallback((page: string) => {
    if (page === currentPage) return;
    
    if (currentPage === 'verify-email') {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    setCurrentPage(page as PageType);
  }, [currentPage]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const action = urlParams.get('action');
    const verifyToken = urlParams.get('verify');
    
    if (token && action === 'verify-email') {
      setCurrentPage('verify-email');
    } else if (verifyToken) {
      setCurrentPage('verify-email');
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('token', verifyToken);
      newUrl.searchParams.delete('verify');
      window.history.replaceState({}, document.title, newUrl.toString());
    } else if (isAuthenticated && (currentPage === 'login' || currentPage === 'signup')) {
        handlePageChange('home');
    }
  }, [isAuthenticated, currentPage, handlePageChange]);

  const handleLogout = async () => {
    await logout();
    handlePageChange('home');
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage key="home" handlePageChange={handlePageChange} />;
      case 'login':
        return <LoginPage key="login" handlePageChange={handlePageChange} />;
      case 'signup':
        return <SignupPage key="signup" handlePageChange={handlePageChange} />;
      case 'verify-email':
        return <EmailVerificationPage key="verify-email" handlePageChange={handlePageChange} />;
      case 'privacy':
        return <PrivacyPage key="privacy" handlePageChange={handlePageChange} />;
      case 'contact':
        return <ContactPage key="contact" handlePageChange={handlePageChange} />;
      case 'bug-report':
        return <BugReportPage key="bug-report" handlePageChange={handlePageChange} />;
      default:
        return <HomePage key="home" handlePageChange={handlePageChange} />;
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentPage}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
      >
        {renderCurrentPage()}
      </motion.div>
    </AnimatePresence>
  );
}

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
