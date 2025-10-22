import React, { useEffect, useState } from 'react';
import { X, Download, Monitor, Apple, Smartphone, Crown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useSubscriptionStatus } from '../hooks/useSubscriptionStatus.ts';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  handlePageChange?: (page: string) => void;
}

interface DownloadOption {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  downloadUrl: string;
  requiresPro?: boolean;
}

const DownloadModal: React.FC<DownloadModalProps> = ({ isOpen, onClose, handlePageChange }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const { isAuthenticated } = useAuth();
  const { isPro } = useSubscriptionStatus();

  // Handle fade in/out animations
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Use requestAnimationFrame for smoother animation
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Close modal on escape key
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  const downloadOptions: DownloadOption[] = [
    {
      id: 'windows',
      name: 'Windows',
      icon: <Monitor className="w-8 h-8" />,
      description: 'Windows 10/11 (64-bit)',
      downloadUrl: '#', // TODO: Replace with actual download URL
    },
    {
      id: 'macos',
      name: 'macOS',
      icon: <Apple className="w-8 h-8" />,
      description: 'macOS 10.15+ (Intel & Apple Silicon)',
      downloadUrl: '#', // TODO: Replace with actual download URL
    },
    {
      id: 'linux',
      name: 'Linux',
      icon: <Monitor className="w-8 h-8" />,
      description: 'Ubuntu 18.04+ / AppImage',
      downloadUrl: '#', // TODO: Replace with actual download URL
    },
    {
      id: 'mobile',
      name: 'Mobile App',
      icon: <Smartphone className="w-8 h-8" />,
      description: 'iOS & Android (Pro Required)',
      downloadUrl: '#', // TODO: Replace with actual download URL
      requiresPro: true
    }
  ];

  const handleDownload = (option: DownloadOption) => {
    if (option.requiresPro) {
      if (!isAuthenticated) {
        // Redirect to login if not authenticated
        onClose();
        if (handlePageChange) {
          handlePageChange('login');
        }
        return;
      } else if (!isPro) {
        // Could show upgrade modal or redirect to upgrade
        // For now, just close and let them upgrade
        onClose();
        return;
      }
    }

    // TODO: Implement actual download logic
    console.log(`Starting download for ${option.name}`);
    
    // For now, just close the modal
    onClose();
    
    // In a real implementation, you might:
    // window.open(option.downloadUrl, '_blank');
    // or trigger a file download
  };

  const handleSupportClick = () => {
    onClose();
    if (handlePageChange) {
      handlePageChange('contact');
    }
  };

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        isAnimating ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isAnimating ? 'opacity-60' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className={`relative bg-slate-800 border border-slate-700 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden transform transition-all duration-300 ${
          isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Download WLED Studio</h2>
            <p className="text-slate-400">Choose your operating system</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-700 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <div className="grid gap-4">
            {downloadOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleDownload(option)}
                className={`flex items-center p-4 border rounded-lg transition-all duration-200 text-left group ${
                  option.requiresPro && !isAuthenticated
                    ? 'bg-slate-700/30 border-slate-600 hover:border-blue-500'
                    : option.requiresPro && !isPro
                    ? 'bg-slate-700/30 border-slate-600 hover:border-yellow-500'
                    : 'bg-slate-700/50 hover:bg-slate-700 border-slate-600 hover:border-purple-500'
                }`}
              >
                <div className={`mr-4 ${
                  option.requiresPro && !isAuthenticated
                    ? 'text-blue-400 group-hover:text-blue-300'
                    : option.requiresPro && !isPro
                    ? 'text-yellow-400 group-hover:text-yellow-300'
                    : 'text-purple-400 group-hover:text-purple-300'
                }`}>
                  {option.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center">
                    <h3 className="text-white font-semibold text-lg">{option.name}</h3>
                    {option.requiresPro && (
                      <Crown className="w-4 h-4 text-yellow-400 ml-2" />
                    )}
                  </div>
                  <p className="text-slate-300 text-sm">{option.description}</p>
                  {option.requiresPro && !isAuthenticated && (
                    <p className="text-blue-400 text-xs mt-1">Sign in required</p>
                  )}
                  {option.requiresPro && isAuthenticated && !isPro && (
                    <p className="text-yellow-400 text-xs mt-1">Pro subscription required</p>
                  )}
                </div>
                <Download className={`w-5 h-5 transition-colors ${
                  option.requiresPro && !isAuthenticated
                    ? 'text-slate-400 group-hover:text-blue-400'
                    : option.requiresPro && !isPro
                    ? 'text-slate-400 group-hover:text-yellow-400'
                    : 'text-slate-400 group-hover:text-purple-400'
                }`} />
              </button>
            ))}
          </div>
          
          {/* Additional Info */}
          <div className="mt-6 p-4 bg-slate-900/50 border border-slate-600 rounded-lg">
            <h4 className="text-white font-medium mb-2">System Requirements</h4>
            <ul className="text-slate-300 text-sm space-y-1">
              <li>• Minimum 4GB RAM recommended</li>
              <li>• OpenGL 3.3+ support for optimal performance</li>
              <li>• Network connection for WLED device communication</li>
            </ul>
          </div>
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 bg-slate-900/50 border-t border-slate-700">
          <p className="text-slate-400 text-sm text-center">
            Having trouble? <span 
              onClick={handleSupportClick}
              className="text-purple-400 hover:text-purple-300 cursor-pointer underline"
            >Contact our support team</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DownloadModal; 