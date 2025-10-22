import React, { useEffect, useState, useCallback } from 'react';
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

function AppContent() {
  const [currentPage, setCurrentPage] = useState('home' as PageType);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const handlePageChange = useCallback((page: string) => {
    if (page === currentPage) return;
    
    setIsTransitioning(true);
    
    if (currentPage === 'verify-email') {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    setTimeout(() => {
      setCurrentPage(page as PageType);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    }, 300);
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
        return <HomePage handlePageChange={handlePageChange} isTransitioning={isTransitioning} />;
      case 'login':
        return <LoginPage handlePageChange={handlePageChange} />;
      case 'signup':
        return <SignupPage handlePageChange={handlePageChange} />;
      case 'verify-email':
        return <EmailVerificationPage handlePageChange={handlePageChange} />;
      case 'privacy':
        return <PrivacyPage handlePageChange={handlePageChange} isTransitioning={isTransitioning} />;
      case 'contact':
        return <ContactPage handlePageChange={handlePageChange} isTransitioning={isTransitioning} />;
      case 'bug-report':
        return <BugReportPage handlePageChange={handlePageChange} isTransitioning={isTransitioning} />;
      default:
        return <HomePage handlePageChange={handlePageChange} isTransitioning={isTransitioning} />;
    }
  };

  return (
    <div className={`page-transition ${isTransitioning ? 'fade-out' : 'fade-in'}`}>
      {renderCurrentPage()}
    </div>
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
