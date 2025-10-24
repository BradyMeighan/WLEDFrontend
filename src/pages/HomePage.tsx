import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, ExternalLink, Crown, Share2, CheckCircle2, LockKeyhole, Globe2, Server, Cloud } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.tsx';
import UserProfile from '../components/UserProfile.tsx';
import StripeCheckout from '../components/StripeCheckout.tsx';
import DownloadModal from '../components/DownloadModal.tsx';
import LEDParticleBackground from '../components/LEDParticleBackground.tsx';
import ReferralRewardModal from '../components/ReferralRewardModal.tsx';
import { useSubscriptionStatus } from '../hooks/useSubscriptionStatus.ts';
import '../App.css';

interface HomePageProps {
  handlePageChange: (page: string) => void;
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

// CSS-only LED animation
const useGridAnimation = (gridRef: React.RefObject<HTMLSpanElement | null>, currentPage: string) => {
  useEffect(() => {
    if (!gridRef.current || currentPage !== 'home') return;

    const textElement = gridRef.current;
    textElement.classList.add('led-animation');
    
    return () => {
      if (textElement) {
        textElement.classList.remove('led-animation');
      }
    };
  }, [gridRef, currentPage]);
};

// --- New Sections ---
function ComparisonSection({ onUpgrade, isLoading, isPro, isAuthenticated }: { onUpgrade: () => void; isLoading: boolean; isPro: boolean; isAuthenticated: boolean }) {
  const rows = [
    { feature: 'Local device control', free: true, pro: true },
    { feature: 'Cloud access (anywhere)', free: false, pro: true },
    { feature: 'Real‑time streaming', free: true, pro: true },
    { feature: 'Remote diagnostics', free: false, pro: true },
    { feature: 'Priority updates & support', free: false, pro: true },
  ];

  return (
    <section className="py-16 sm:py-20 bg-slate-950/40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }}>
          <motion.h2 className="text-3xl sm:text-4xl font-semibold mb-4" variants={itemVariants}>
            WLED Studio vs WLED Studio <span className="text-yellow-300">Pro</span>
          </motion.h2>
          <motion.p className="text-slate-300 mb-8 max-w-2xl" variants={itemVariants}>
            Know exactly what you unlock when you upgrade.
          </motion.p>

          <motion.div className="grid grid-cols-1 lg:grid-cols-3 gap-6" variants={itemVariants}>
            {/* Column headers */}
            <div className="hidden lg:block" />
            <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700 text-center">
              <p className="text-lg font-medium">WLED Studio</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-700/40 to-yellow-600/30 rounded-2xl p-4 border border-yellow-600 text-center">
              <p className="text-lg font-medium">WLED Studio Pro</p>
            </div>

            {/* Rows */}
            {rows.map((r, idx) => (
              <React.Fragment key={r.feature}>
                <motion.div className="flex items-center gap-3 py-4 px-2 border-b border-slate-800" variants={itemVariants}>
                  <CheckCircle2 className="w-5 h-5 text-sky-300" />
                  <p className="text-slate-200">{r.feature}</p>
                </motion.div>
                <motion.div className="py-4 px-2 text-center border-b border-slate-800" variants={itemVariants}>
                  {r.free ? <span className="text-green-400">Included</span> : <span className="text-slate-500">—</span>}
                </motion.div>
                <motion.div className="py-4 px-2 text-center border-b border-slate-800" variants={itemVariants}>
                  {r.pro ? <span className="text-yellow-300">Included</span> : <span className="text-slate-500">—</span>}
                </motion.div>
              </React.Fragment>
            ))}
          </motion.div>

          <motion.div className="mt-8" variants={itemVariants}>
            {isAuthenticated && isPro ? (
              <button 
                disabled
                className="btn btn-secondary opacity-75 cursor-not-allowed bg-gradient-to-r from-yellow-600 to-yellow-700 border-yellow-500"
              >
                <Crown className="w-5 h-5 mr-2 text-yellow-300" />
                Pro Status Active
              </button>
            ) : (
              <button onClick={onUpgrade} disabled={isLoading} className="btn btn-secondary disabled:opacity-50">
                {isLoading ? 'Loading…' : 'Upgrade to Pro'}
                {!isLoading && <ExternalLink className="w-5 h-5 ml-2" />}
              </button>
            )}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function CloudSection() {
  const cards = [
    { icon: <Globe2 className="w-6 h-6" />, title: 'Anywhere control', desc: 'Send scenes and start streams from outside your LAN.' },
    { icon: <Server className="w-6 h-6" />, title: 'Local anchor', desc: 'One computer running WLED Studio on your network acts as the always‑on bridge.' },
    { icon: <Cloud className="w-6 h-6" />, title: 'WebSockets + daemon', desc: 'Persistent connection keeps devices in sync with low latency.' },
    { icon: <LockKeyhole className="w-6 h-6" />, title: 'Secure by design', desc: 'Auth‑gated access with user‑scoped permissions.' },
  ];

  return (
    <section className="py-16 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }}>
          <motion.h2 className="text-3xl sm:text-4xl font-semibold mb-4" variants={itemVariants}>
            Cloud Connect for Pro
          </motion.h2>
          <motion.p className="text-slate-300 mb-10 max-w-2xl" variants={itemVariants}>
            Pro users unlock remote control for their WLED walls. Keep a single machine running WLED Studio on your home or venue network and manage everything from anywhere.
          </motion.p>

          <motion.div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6" variants={itemVariants}>
            {cards.map((c) => (
              <div key={c.title} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                <div className="mb-3 text-slate-200">{c.icon}</div>
                <h3 className="font-medium mb-1">{c.title}</h3>
                <p className="text-slate-400 text-sm">{c.desc}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function ReferralSection({ handlePageChange }: { handlePageChange: (page: string) => void }) {
  const [copied, setCopied] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();
  
  useEffect(() => {
    // Fetch user's referral code from backend
    const fetchReferralCode = async () => {
      if (isAuthenticated) {
        try {
          const token = await window.Clerk?.session?.getToken();
          if (token) {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://wledwebsite-production.up.railway.app'}/api/referral/check`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            if (response.ok) {
              const data = await response.json();
              setReferralCode(data.referralCode);
            }
          }
        } catch (error) {
          console.error('Failed to fetch referral code:', error);
        }
      }
    };
    
    fetchReferralCode();
  }, [isAuthenticated]);

  const referral = referralCode
    ? `https://wledstudio.com/?ref=${referralCode}`
    : 'https://wledstudio.com/?ref=YOURCODE';

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(referral);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <section className="py-16 sm:py-20 bg-slate-950/40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }}>
          <motion.h2 className="text-3xl sm:text-4xl font-semibold mb-4" variants={itemVariants}>
            Referral Rewards
          </motion.h2>
          <motion.p className="text-slate-300 mb-8 max-w-2xl" variants={itemVariants}>
            Invite a friend. You both get a reward. Share your unique link and both receive a&nbsp;14-day&nbsp;Pro&nbsp;trial!
          </motion.p>

          {isAuthenticated ? (
            <motion.div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3" variants={itemVariants}>
              <code className="flex-1 rounded-xl bg-slate-900/60 border border-slate-800 p-3 text-slate-300 text-sm overflow-x-auto">{referral}</code>
              <button onClick={copy} className="btn btn-secondary">
                <Share2 className="w-4 h-4 mr-2" />
                {copied ? 'Copied' : 'Copy link'}
              </button>
            </motion.div>
          ) : (
            <motion.div className="bg-slate-900/60 border border-slate-700 rounded-xl p-6 text-center" variants={itemVariants}>
              <p className="text-slate-300 mb-4">Sign in to get your custom referral code and start earning rewards!</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button onClick={() => handlePageChange('login')} className="btn btn-secondary">
                  Sign In
                </button>
                <button onClick={() => handlePageChange('signup')} className="btn btn-primary">
                  Sign Up
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}

function FinalCTA({ onDownload, onUpgrade, proActive, isLoading }: { onDownload: () => void; onUpgrade: () => void; proActive: boolean; isLoading: boolean }) {
  return (
    <section className="py-16 sm:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-slate-800/70 to-slate-900/70 border border-slate-700 p-8 sm:p-12 text-center">
          <h2 className="text-3xl sm:text-4xl font-semibold mb-4">Take complete control of your WLED experience</h2>
          <p className="text-slate-300 mb-8">Download free for local control. Upgrade to Pro for cloud streaming, remote access, and advanced features beyond standard WLED.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button onClick={onDownload} className="btn btn-primary">
              <Download className="w-5 h-5 mr-2" /> Download
            </button>
            {proActive ? (
              <button disabled className="btn btn-secondary opacity-75 cursor-not-allowed bg-gradient-to-r from-yellow-600 to-yellow-700 border-yellow-500">
                <Crown className="w-5 h-5 mr-2 text-yellow-300" /> Pro Status Active
              </button>
            ) : (
              <button onClick={onUpgrade} disabled={isLoading} className="btn btn-secondary disabled:opacity-50">
                {isLoading ? 'Loading…' : 'Upgrade to Pro'}
                {!isLoading && <ExternalLink className="w-5 h-5 ml-2" />}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

const HomePage: React.FC<HomePageProps> = ({ handlePageChange }) => {
  const { isAuthenticated } = useAuth();
  const rings = Array.from({ length: 36 }, (_, i) => i + 1);
  const gridRef = useRef<HTMLSpanElement | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isReferralRewardModalOpen, setIsReferralRewardModalOpen] = useState(false);
  const [hasReferralReward, setHasReferralReward] = useState(false);
  const { refreshStatus, isPro, isLoading: isLoadingSubscription } = useSubscriptionStatus();
  
  useGridAnimation(gridRef, 'home');

  // Check for referral rewards
  useEffect(() => {
    const checkReferralReward = async () => {
      if (isAuthenticated) {
        try {
          const token = await window.Clerk?.session?.getToken();
          if (token) {
            console.log('🔍 Checking for referral rewards...');
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://wledwebsite-production.up.railway.app'}/api/referral/check`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            if (response.ok) {
              const data = await response.json();
              console.log('🎁 Referral check result:', data);
              setHasReferralReward(data.hasReward);
              if (data.hasReward) {
                console.log('✅ REFERRAL REWARD AVAILABLE - Button should appear!');
              }
            } else {
              console.error('Failed to check referral reward:', response.status);
            }
          }
        } catch (error) {
          console.error('Failed to check referral reward:', error);
        }
      }
    };
    
    checkReferralReward();
  }, [isAuthenticated]);

  const handleUpgradeClick = () => {
    if (isAuthenticated) {
      // If user has referral reward, redirect them to use it instead
      if (hasReferralReward) {
        alert('You have a referral reward available! Please use the "Referral Reward 🎁" button to activate your 14-day free trial instead.');
        console.log('⚠️ User tried to upgrade but has referral reward - redirecting to reward modal');
        setIsReferralRewardModalOpen(true);
        return;
      }
      setIsCheckoutOpen(true);
    } else {
      handlePageChange('signup');
    }
  };

  const handleCheckoutClose = async () => {
    setIsCheckoutOpen(false);
    if (isAuthenticated) {
      await refreshStatus();
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white overflow-hidden relative flex flex-col">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900/20 to-blue-900/30 -z-10" />
      
      {/* Header + Hero Container with Particle Background */}
      <div className="relative">
        {/* LED Particle Background - only for header + hero */}
        <LEDParticleBackground />
        
        {/* Header Navigation */}
        <motion.header 
          className="relative z-20 w-full flex-none"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-end">
            <div className="flex items-center gap-3 sm:gap-4">
              {isAuthenticated ? (
                <>
                  {hasReferralReward && (
                    <motion.button
                      onClick={() => {
                        console.log('🎁 Referral Reward button clicked!');
                        setIsReferralRewardModalOpen(true);
                      }}
                      className="btn bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 border-yellow-500 text-white font-bold shadow-lg shadow-yellow-500/50 animate-pulse px-4 py-2 text-sm sm:text-base"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      style={{ animationDuration: '2s' }}
                    >
                      <span className="mr-2 text-xl">🎁</span>
                      <span>Referral Reward!</span>
                    </motion.button>
                  )}
                  {/* DEBUG: Show reward status */}
                  {process.env.NODE_ENV === 'development' && (
                    <span className="text-xs text-red-500">
                      Reward: {hasReferralReward ? 'YES' : 'NO'}
                    </span>
                  )}
                  <UserProfile 
                    onOpenStripeCheckout={() => setIsCheckoutOpen(true)}
                    handlePageChange={handlePageChange}
                    hasReferralReward={hasReferralReward}
                    onOpenReferralReward={() => setIsReferralRewardModalOpen(true)}
                  />
                </>
              ) : (
                <>
                  <motion.button 
                    onClick={() => handlePageChange('login')}
                    className="btn btn-secondary btn-sm touch-target"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Login
                  </motion.button>
                  <motion.button 
                    onClick={() => handlePageChange('signup')}
                    className="btn btn-primary btn-sm touch-target"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Sign Up
                  </motion.button>
                </>
              )}
            </div>
          </nav>
        </motion.header>
        
        {/* Hero */}
        <div className="relative z-10 flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-8 lg:pt-0 pb-16 lg:pb-24 min-h-[88vh] lg:min-h-[90vh] overflow-visible">
        
        <motion.div 
          className="container mx-auto flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Left */}
          <motion.div 
            className="flex-1 max-w-2xl w-full text-center lg:text-left"
            variants={itemVariants}
          >
            {/* Animated Text with Grid Background */}
            <div className="mb-8 lg:mb-12">
              <div className="title-container">
                {/* WLED with LED effect */}
                <div className="wled-container">
                  <h1 className="wled-base-text">WLED</h1>
                  <span ref={gridRef} className="wled-grid-overlay">WLED</span>
                </div>
                {/* Studio */}
                <h1 className="studio-text">Studio</h1>
              </div>
            </div>
            
            <motion.p 
              className="text-lg sm:text-xl text-slate-300 mb-8 lg:mb-12 leading-relaxed max-w-xl mx-auto lg:mx-0"
              variants={itemVariants}
            >
              Control and manage your WLED devices from anywhere. Stream content, create effects, and monitor your LED displays remotely with our cloud-ready platform.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-stretch sm:items-center justify-center lg:justify-start"
              variants={itemVariants}
            >
              <motion.button 
                onClick={() => setIsDownloadModalOpen(true)}
                className="btn btn-primary group w-full sm:w-auto touch-target"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Download className="w-5 h-5 mr-3 group-hover:animate-bounce" />
                <span>Download</span>
              </motion.button>
              {isAuthenticated && isPro ? (
                <motion.button 
                  disabled
                  className="btn btn-secondary group opacity-75 cursor-not-allowed bg-gradient-to-r from-yellow-600 to-yellow-700 border-yellow-500 w-full sm:w-auto"
                  whileHover={{ scale: 1 }}
                >
                  <Crown className="w-5 h-5 mr-3 text-yellow-300" />
                  <span>Pro Status Active</span>
                </motion.button>
              ) : (
                <motion.button 
                  onClick={handleUpgradeClick}
                  disabled={isLoadingSubscription}
                  className="btn btn-secondary group disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto touch-target"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>{isLoadingSubscription ? 'Loading…' : 'Upgrade to Pro'}</span>
                  {!isLoadingSubscription && (
                    <ExternalLink className="w-5 h-5 ml-3 transition-transform group-hover:rotate-12" />
                  )}
                </motion.button>
              )}
            </motion.div>
          </motion.div>
          
          {/* Right sphere */}
          <motion.div 
            className="sphere-container h-[420px] w-[420px] sm:h-[540px] sm:w-[540px] lg:h-[720px] lg:w-[720px]"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="sphere">
              {rings.map((i) => (
                <div key={i} className={`ring ring${i}`} />
              ))}
            </div>
          </motion.div>
        </motion.div>
        {/* Scroll indicator */}
        <div 
          className="cursor-pointer absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 group"
          onClick={() => {
            const nextSection = document.querySelector('section');
            if (nextSection) {
              nextSection.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        >
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.9 }}
            transition={{ delay: 0.6 }}
            className="text-xs uppercase tracking-widest text-slate-400 group-hover:text-slate-200 transition-colors"
          >
            Scroll
          </motion.span>
          <div className="h-10 w-6 rounded-full border border-slate-600/70 group-hover:border-slate-400/70 transition-colors flex items-start justify-center p-1">
            <motion.div
              className="h-2 w-2 rounded-full bg-slate-300 group-hover:bg-white transition-colors"
              animate={{ y: [0, 22, 0], opacity: [1, 0.2, 1] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </div>
        </div>
      </div>

      {/* New Sections */}
      <ComparisonSection onUpgrade={handleUpgradeClick} isLoading={isLoadingSubscription} isPro={isPro} isAuthenticated={isAuthenticated} />
      <CloudSection />
      <ReferralSection handlePageChange={handlePageChange} />
      <FinalCTA 
        onDownload={() => setIsDownloadModalOpen(true)}
        onUpgrade={handleUpgradeClick}
        proActive={Boolean(isAuthenticated && isPro)}
        isLoading={isLoadingSubscription}
      />

      {/* Footer Links */}
      <motion.footer 
        className="relative z-20 w-full flex-none py-6 sm:py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap justify-center gap-4 sm:gap-8">
          <motion.a 
            href="#" 
            onClick={() => handlePageChange('privacy')} 
            className="text-slate-400 hover:text-slate-200 transition-colors text-sm sm:text-base touch-target"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Privacy Policy
          </motion.a>
          <motion.a 
            href="#" 
            onClick={() => handlePageChange('contact')} 
            className="text-slate-400 hover:text-slate-200 transition-colors text-sm sm:text-base touch-target"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Contact Us
          </motion.a>
          <motion.a 
            href="#" 
            onClick={() => handlePageChange('bug-report')} 
            className="text-slate-400 hover:text-slate-200 transition-colors text-sm sm:text-base touch-target"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Bug Report
          </motion.a>
        </div>
      </motion.footer>

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

      {/* Referral Reward Modal */}
      <ReferralRewardModal 
        isOpen={isReferralRewardModalOpen}
        onClose={async () => {
          setIsReferralRewardModalOpen(false);
          // Refresh reward status after closing
          console.log('🔄 Refreshing reward status after modal close...');
          setHasReferralReward(false);
          await refreshStatus();
          
          // Re-check referral reward status
          try {
            const token = await window.Clerk?.session?.getToken();
            if (token) {
              const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://wledwebsite-production.up.railway.app'}/api/referral/check`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              });
              if (response.ok) {
                const data = await response.json();
                setHasReferralReward(data.hasReward);
              }
            }
          } catch (error) {
            console.error('Failed to refresh referral reward:', error);
          }
        }}
      />
    </div>
  );
};

export default HomePage;
