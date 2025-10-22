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

// Grid animation utility - consider moving to a utils.js later
const useGridAnimation = (gridRef: React.RefObject<HTMLSpanElement | null>, currentPage: string) => {
  const animationRef = useRef<number | null>(null);
  const lastFrameTime = useRef<number>(0);

  useEffect(() => {
    if (!gridRef.current || currentPage !== 'home') return;

    const textElement = gridRef.current;
    const isMobile = window.innerWidth < 768;
    const isLowPerformance = isMobile && (navigator.hardwareConcurrency <= 4 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent));

    // Use simple CSS gradient on low-performance devices
    if (isLowPerformance) {
      textElement.style.background = 'linear-gradient(45deg, #a855f7 0%, #3b82f6 50%, #a855f7 100%)';
      textElement.style.backgroundSize = '200% 200%';
      textElement.style.backgroundClip = 'text';
      textElement.style.webkitBackgroundClip = 'text';
      textElement.style.animation = 'gradientShift 3s ease-in-out infinite alternate';
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });

    if (!ctx) {
      // Fallback to CSS gradient
      textElement.style.background = 'linear-gradient(45deg, #a855f7, #3b82f6)';
      textElement.style.backgroundClip = 'text';
      textElement.style.webkitBackgroundClip = 'text';
      return;
    }

    // Further optimize canvas size for mobile
    canvas.width = isMobile ? 150 : 400;
    canvas.height = isMobile ? 75 : 200;

    const s = isMobile ? 10 : 12;
    const blockSize = isMobile ? 6 : 8;
    const cols = Math.floor(canvas.width / s);
    const rows = Math.floor(canvas.height / s);
    const blocks: Array<{
      x: number;
      y: number;
      distance: number;
      angle: number;
    }> = [];
    let time = 0;
    const centerX = cols / 2;
    const centerY = rows / 2;

    // Reduce number of blocks on mobile
    const maxBlocks = isMobile ? 100 : cols * rows;
    let blockCount = 0;

    for (let i = 0; i < rows && blockCount < maxBlocks; i++) {
      for (let j = 0; j < cols && blockCount < maxBlocks; j++) {
        const distanceFromCenter = Math.sqrt((j - centerX) * (j - centerX) + (i - centerY) * (i - centerY));
        const angle = Math.atan2(i - centerY, j - centerX);

        blocks.push({
          x: j * s,
          y: i * s,
          distance: distanceFromCenter,
          angle: angle
        });
        blockCount++;
      }
    }

    function animate(currentTime: number) {
      if (!ctx || !textElement) return;

      // Throttle animation on mobile (30fps instead of 60fps)
      const targetFPS = isMobile ? 30 : 60;
      const frameInterval = 1000 / targetFPS;
      
      if (currentTime - lastFrameTime.current < frameInterval) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
      lastFrameTime.current = currentTime;
      
      time += isMobile ? 0.03 : 0.04;

      ctx.fillStyle = '#4c1d95';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Simplified animation for mobile
      blocks.forEach(block => {
        if (isMobile) {
          // Simpler calculation for mobile
          const wave = Math.sin(time - block.distance * 0.2);
          const intensity = (wave + 1) / 2;
          const brightness = Math.floor(168 + intensity * 60);
          ctx.fillStyle = `rgba(${brightness}, 85, 247, ${0.7 + intensity * 0.3})`;
        } else {
          // Full animation for desktop
          const radialWave = Math.sin(time - block.distance * 0.3);
          const angularWave = Math.sin(time * 0.8 + block.angle * 2);
          const pulseWave = Math.sin(time * 1.5 - block.distance * 0.5);

          const intensity = (radialWave + angularWave * 0.5 + pulseWave * 0.3);
          const normalizedIntensity = (intensity + 1) / 2;

          const r = Math.max(100, Math.min(255, 168 + (normalizedIntensity * 60 - 30)));
          const g = Math.max(50, Math.min(200, 85 + (normalizedIntensity * 80 - 40)));
          const b = Math.max(200, Math.min(255, 247 + (normalizedIntensity * 20 - 10)));
          const alpha = 0.7 + (normalizedIntensity * 0.3);

          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }
        
        ctx.fillRect(block.x, block.y, blockSize, blockSize);
      });

      try {
        const dataURL = canvas.toDataURL('image/png', 0.8); // Reduce quality slightly
        if (textElement && textElement.style) {
          textElement.style.background = `url(${dataURL})`;
          textElement.style.backgroundSize = 'cover';
          textElement.style.backgroundPosition = 'center';
          textElement.style.backgroundClip = 'text';
          textElement.style.webkitBackgroundClip = 'text';
        }
      } catch (error) {
        console.warn('Canvas animation error:', error);
        // Fallback to CSS gradient
        if (textElement && textElement.style) {
          textElement.style.background = 'linear-gradient(45deg, #a855f7, #3b82f6)';
          textElement.style.backgroundClip = 'text';
          textElement.style.webkitBackgroundClip = 'text';
        }
        return;
      }

      animationRef.current = requestAnimationFrame(animate);
    }

    // Start animation
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
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