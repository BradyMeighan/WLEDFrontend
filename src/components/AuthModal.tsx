import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { SignIn, SignUp } from '@clerk/clerk-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'signin' | 'signup';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, mode }) => {
  const backdropVariants = {
    hidden: { 
      opacity: 0,
      backdropFilter: 'blur(0px)'
    },
    visible: { 
      opacity: 1,
      backdropFilter: 'blur(12px)',
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1]
      }
    },
    exit: { 
      opacity: 0,
      backdropFilter: 'blur(0px)',
      transition: {
        duration: 0.2,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  const modalVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8, 
      y: 60,
      rotateX: -15
    },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      rotateX: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300,
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1]
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8, 
      y: -60,
      rotateX: 15,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto overflow-x-hidden modal-scroll"
          onClick={onClose}
        >
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative max-w-md w-full perspective-1000 max-h-[calc(100vh-2rem)] overflow-y-auto overflow-x-hidden my-auto modal-scroll"
            onClick={(e) => e.stopPropagation()}
            style={{ perspective: '1000px' }}
          >
            {/* Clerk component with dark theme */}
            <div className="relative">
              <style>{`
                .cl-socialButtonsIconButton {
                  background-color: #ffffff !important;
                  border: 1px solid #e2e8f0 !important;
                  color: #1f2937 !important;
                }
                .cl-socialButtonsIconButton:hover {
                  background-color: #f8fafc !important;
                  border: 1px solid #cbd5e1 !important;
                }
                .cl-socialButtonsProviderIcon,
                .cl-providerIcon {
                  filter: none !important;
                  opacity: 1 !important;
                }
                .cl-socialButtonsIconButton__github .cl-socialButtonsProviderIcon,
                .cl-socialButtonsIconButton__github .cl-providerIcon {
                  filter: brightness(0) !important;
                }
                .cl-socialButtonsIconButton__microsoft .cl-socialButtonsProviderIcon,
                .cl-socialButtonsIconButton__microsoft .cl-providerIcon {
                  filter: none !important;
                }
              `}</style>
              
{mode === 'signin' ? (
                <SignIn 
                  afterSignInUrl="/"
                  afterSignUpUrl="/"
                  redirectUrl="/"
                  routing="hash"
                  appearance={{
                    baseTheme: "dark",
                    variables: {
                      colorPrimary: "#a855f7",
                      colorBackground: "#0f172a",
                      colorInputBackground: "#1e293b",
                      colorInputText: "#ffffff",
                      colorText: "#ffffff",
                      colorTextSecondary: "#cbd5e1",
                      borderRadius: "0.75rem"
                    },
                    elements: {
                      socialButtonsBlockButton: {
                        backgroundColor: "#ffffff",
                        border: "1px solid #e2e8f0",
                        color: "#1f2937",
                        "&:hover": {
                          backgroundColor: "#f8fafc",
                          border: "1px solid #cbd5e1"
                        }
                      },
                      socialButtonsBlockButtonText: {
                        color: "#1f2937"
                      },
                      socialButtonsProviderIcon: {
                        filter: "none"
                      }
                    }
                  }}
                />
              ) : (
                <SignUp 
                  afterSignInUrl="/"
                  afterSignUpUrl="/"
                  redirectUrl="/"
                  routing="hash"
                  appearance={{
                    baseTheme: "dark",
                    variables: {
                      colorPrimary: "#a855f7",
                      colorBackground: "#0f172a",
                      colorInputBackground: "#1e293b",
                      colorInputText: "#ffffff",
                      colorText: "#ffffff",
                      colorTextSecondary: "#cbd5e1",
                      borderRadius: "0.75rem"
                    },
                    elements: {
                      socialButtonsBlockButton: {
                        backgroundColor: "#ffffff",
                        border: "1px solid #e2e8f0",
                        color: "#1f2937",
                        "&:hover": {
                          backgroundColor: "#f8fafc",
                          border: "1px solid #cbd5e1"
                        }
                      },
                      socialButtonsBlockButtonText: {
                        color: "#1f2937"
                      },
                      socialButtonsProviderIcon: {
                        filter: "none"
                      }
                    }
                  }}
                />
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;