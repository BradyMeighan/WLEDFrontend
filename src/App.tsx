import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './contexts/AuthContext.tsx';
import './App.css';
import HomePage from './pages/HomePage.tsx';
import EmailVerificationPage from './pages/EmailVerificationPage.tsx';
import PrivacyPage from './pages/PrivacyPage.tsx';
import ContactPage from './pages/ContactPage.tsx';
import BugReportPage from './pages/BugReportPage.tsx';
import AuthModal from './components/AuthModal.tsx';

type PageType = 'home' | 'verify-email' | 'privacy' | 'contact' | 'bug-report';

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
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const { user, isAuthenticated, logout } = useAuth();

  const handlePageChange = useCallback((page: string) => {
    if (page === 'login') {
      setAuthMode('signin');
      setAuthModalOpen(true);
      return;
    }
    
    if (page === 'signup') {
      setAuthMode('signup');
      setAuthModalOpen(true);
      return;
    }
    
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
    } else if (isAuthenticated && authModalOpen) {
      setAuthModalOpen(false);
    }
  }, [isAuthenticated, authModalOpen]);

  const handleLogout = async () => {
    await logout();
    handlePageChange('home');
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage key="home" handlePageChange={handlePageChange} />;
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
    <>
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
      
      <AuthModal 
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        mode={authMode}
      />
    </>
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
