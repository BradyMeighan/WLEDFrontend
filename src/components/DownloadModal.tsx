import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const { isAuthenticated } = useAuth();
  const { isPro } = useSubscriptionStatus();

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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            className="absolute inset-0 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div 
            className="relative bg-slate-800 border border-slate-700 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">Download WLED Studio</h2>
                <p className="text-sm sm:text-base text-slate-400">Choose your operating system</p>
              </div>
              <motion.button
                onClick={onClose}
                className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-700 rounded-lg touch-target"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-6 h-6" />
              </motion.button>
            </div>
            
            {/* Content */}
            <div className="p-4 sm:p-6">
              <div className="grid gap-4">
                {downloadOptions.map((option, index) => (
                  <motion.button
                    key={option.id}
                    onClick={() => handleDownload(option)}
                    className={`flex items-center p-4 border rounded-lg transition-all text-left group touch-target ${
                      option.requiresPro && !isAuthenticated
                        ? 'bg-slate-700/30 border-slate-600 hover:border-blue-500'
                        : option.requiresPro && !isPro
                        ? 'bg-slate-700/30 border-slate-600 hover:border-yellow-500'
                        : 'bg-slate-700/50 hover:bg-slate-700 border-slate-600 hover:border-purple-500'
                    }`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
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
                      <div className="flex items-center flex-wrap gap-2">
                        <h3 className="text-white font-semibold text-base sm:text-lg">{option.name}</h3>
                        {option.requiresPro && (
                          <Crown className="w-4 h-4 text-yellow-400" />
                        )}
                      </div>
                      <p className="text-slate-300 text-xs sm:text-sm">{option.description}</p>
                      {option.requiresPro && !isAuthenticated && (
                        <p className="text-blue-400 text-xs mt-1">Sign in required</p>
                      )}
                      {option.requiresPro && isAuthenticated && !isPro && (
                        <p className="text-yellow-400 text-xs mt-1">Pro subscription required</p>
                      )}
                    </div>
                    <Download className={`w-5 h-5 transition-colors flex-shrink-0 ${
                      option.requiresPro && !isAuthenticated
                        ? 'text-slate-400 group-hover:text-blue-400'
                        : option.requiresPro && !isPro
                        ? 'text-slate-400 group-hover:text-yellow-400'
                        : 'text-slate-400 group-hover:text-purple-400'
                    }`} />
                  </motion.button>
                ))}
              </div>
              
              {/* Additional Info */}
              <motion.div 
                className="mt-6 p-4 bg-slate-900/50 border border-slate-600 rounded-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <h4 className="text-white font-medium mb-2 text-sm sm:text-base">System Requirements</h4>
                <ul className="text-slate-300 text-xs sm:text-sm space-y-1">
                  <li>• Minimum 4GB RAM recommended</li>
                  <li>• OpenGL 3.3+ support for optimal performance</li>
                  <li>• Network connection for WLED device communication</li>
                </ul>
              </motion.div>
            </div>
            
            {/* Footer */}
            <div className="px-4 sm:px-6 py-4 bg-slate-900/50 border-t border-slate-700">
              <p className="text-slate-400 text-xs sm:text-sm text-center">
                Having trouble? <span 
                  onClick={handleSupportClick}
                  className="text-purple-400 hover:text-purple-300 cursor-pointer underline touch-target"
                >Contact our support team</span>
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DownloadModal; 