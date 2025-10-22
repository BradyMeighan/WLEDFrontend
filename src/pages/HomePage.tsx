import React, { useEffect, useRef, useState } from 'react';
import { Download, ExternalLink, Crown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.tsx';
import UserProfile from '../components/UserProfile.tsx';
import StripeCheckout from '../components/StripeCheckout.tsx';
import DownloadModal from '../components/DownloadModal.tsx';
import { useSubscriptionStatus } from '../hooks/useSubscriptionStatus.ts';
import '../App.css';

interface HomePageProps {
  handlePageChange: (page: string) => void;
  isTransitioning: boolean;
}

// CSS-only LED animation - no more data URLs!
const useGridAnimation = (gridRef: React.RefObject<HTMLSpanElement | null>, currentPage: string) => {
  useEffect(() => {
    if (!gridRef.current || currentPage !== 'home') return;

    const textElement = gridRef.current;
    
    // Apply CSS-only LED animation
    textElement.classList.add('led-animation');
    
    return () => {
      if (textElement) {
        textElement.classList.remove('led-animation');
      }
    };
  }, [gridRef, currentPage]);
};

const HomePage: React.FC<HomePageProps> = ({ handlePageChange, isTransitioning }) => {
  const { isAuthenticated, user } = useAuth();
  const rings = Array.from({ length: 36 }, (_, i) => i + 1);
  const gridRef = useRef<HTMLSpanElement | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  
  // Check subscription status on page load
  const { refreshStatus, isPro, isLoading: isLoadingSubscription } = useSubscriptionStatus();
  
  // Using the custom hook for grid animation
  // Passing 'home' directly as currentPage because this component IS the home page.
  useGridAnimation(gridRef, 'home');

  const handleUpgradeClick = () => {
    if (isAuthenticated) {
      setIsCheckoutOpen(true);
    } else {
      // Redirect to signup if not authenticated
      handlePageChange('signup');
    }
  };

  const handleCheckoutClose = async () => {
    setIsCheckoutOpen(false);
    // Refresh subscription status when checkout closes (in case payment was successful)
    if (isAuthenticated) {
      await refreshStatus();
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white overflow-hidden relative flex flex-col">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/20 to-blue-900/30"></div>
      
      {/* Header Navigation */}
      <header className="relative z-20 w-full flex-none">
        <nav className="container mx-auto py-6 flex items-center justify-end">
          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <UserProfile 
                onOpenStripeCheckout={() => setIsCheckoutOpen(true)}
                handlePageChange={handlePageChange}
              />
            ) : (
              <>
                <button 
                  onClick={() => handlePageChange('login')}
                  className="btn btn-secondary btn-sm"
                >
                  Login
                </button>
                <button 
                  onClick={() => handlePageChange('signup')}
                  className="btn btn-primary btn-sm"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </nav>
      </header>
      
      {/* Main content container - centered */}
      <div className="relative z-10 flex-1 flex items-center justify-center">
        <div className={`container mx-auto flex items-center justify-between transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
          
          {/* Left side - Content */}
          <div className="flex-1 max-w-2xl">
            {/* Animated Text with Grid Background */}
            <div className="relative mb-8">
              <div className="title-container">
                {/* WLED with LED effect */}
                <div className="wled-container">
                  <h1 className="wled-base-text">
                    WLED
                  </h1>
                  <span 
                    ref={gridRef}
                    className="wled-grid-overlay"
                  >
                    WLED
                  </span>
                </div>
                
                {/* Studio as white text with border */}
                <h1 className="studio-text">
                  Studio
                </h1>
              </div>
            </div>
            
            <p className="text-xl text-slate-300 mb-12 leading-relaxed max-w-xl sm:text-center md:text-left">
              Stream videos, images, and more to WLED-based LED displays with professional-grade tools and real-time effects.
            </p>
            
            {/* Buttons */}
            <div className="flex space-x-6 max-sm:space-x-0 max-sm:flex-col max-sm:space-y-4 max-sm:items-center">
              {/* Download Button */}
              <button 
                onClick={() => setIsDownloadModalOpen(true)}
                className="btn btn-primary group max-sm:w-full"
              >
                <Download className="w-5 h-5 mr-3 group-hover:animate-bounce" />
                <span>Download</span>
              </button>
              
              {/* Upgrade to Pro Button / Pro Status */}
              {isAuthenticated && isPro ? (
                <button 
                  disabled
                  className="btn btn-secondary group opacity-75 cursor-not-allowed bg-gradient-to-r from-yellow-600 to-yellow-700 border-yellow-500 max-sm:w-full"
                >
                  <Crown className="w-5 h-5 mr-3 text-yellow-300" />
                  <span>Pro Status Active</span>
                </button>
              ) : (
                <button 
                  onClick={handleUpgradeClick}
                  disabled={isLoadingSubscription}
                  className="btn btn-secondary group disabled:opacity-50 disabled:cursor-not-allowed max-sm:w-full"
                >
                  <span>{isLoadingSubscription ? 'Loading...' : 'Upgrade to Pro'}</span>
                  {!isLoadingSubscription && (
                    <ExternalLink className="w-5 h-5 ml-3 group-hover:rotate-12 transition-transform duration-300" />
                  )}
                </button>
              )}
            </div>
          </div>
          
          {/* Right side - Sphere - Hidden on mobile */}
          <div className="sphere-container">
            <div className="sphere">
              {rings.map((i) => (
                <div key={i} className={`ring ring${i}`}></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Links - restored */}
      <footer className="relative z-20 w-full flex-none py-8">
        <div className="container mx-auto flex justify-center space-x-8">
          <a href="#" onClick={() => handlePageChange('privacy')} className="text-slate-400 hover:text-slate-200 transition-colors">Privacy Policy</a>
          <a href="#" onClick={() => handlePageChange('contact')} className="text-slate-400 hover:text-slate-200 transition-colors">Contact Us</a>
          <a href="#" onClick={() => handlePageChange('bug-report')} className="text-slate-400 hover:text-slate-200 transition-colors">Bug Report</a>
        </div>
      </footer>

      {/* Stripe Checkout Modal */}
      <StripeCheckout 
        isOpen={isCheckoutOpen}
        onClose={handleCheckoutClose}
      />

      {/* Download Modal */}
      <DownloadModal 
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        handlePageChange={handlePageChange}
      />
    </div>
  );
};

export default HomePage; 