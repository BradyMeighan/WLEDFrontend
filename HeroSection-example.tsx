import React, { useState, useRef, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial, Float } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronRight, Play, MessageSquareText } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for cleaner tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- 3D Background Components ---

function ParticleField(props: any) {
  const ref = useRef<THREE.Points>(null!);
  const { viewport, pointer } = useThree();

  // Generate random particle positions
  const [sphere] = useState(() => {
    const count = 3000;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Evenly distributed points inside a sphere-like volume, stretched horizontally
      const r = Math.cbrt(Math.random()) * 5;
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta) * 1.5 * (viewport.width / 5);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi) * 2;
    }
    return positions;
  });

  useFrame((state, delta) => {
    if (!ref.current) return;

    // Continuous slow rotation
    ref.current.rotation.x -= delta / 20;
    ref.current.rotation.y -= delta / 30;

    // Mouse interaction: subtle shift based on pointer position
    // We lerp for smoothness
    ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, pointer.x * 0.5, 0.05);
    ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, pointer.y * 0.5, 0.05);
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
        <PointMaterial
          transparent
          color="#8b5cf6" // Violet base color
          size={0.03}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.6}
        />
      </Points>
    </group>
  );
}

function Scene() {
  return (
    <Canvas 
      camera={{ position: [0, 0, 6], fov: 50 }} 
      dpr={[1, 2]}
      style={{ pointerEvents: 'auto' }}
    >
        <color attach="background" args={['#09090b']} /> {/* Match bg-zinc-950 */}
        <fog attach="fog" args={['#09090b', 5, 15]} />
        <ambientLight intensity={0.5} />
        <Suspense fallback={null}>
            <Float speed={1.5} rotationIntensity={0.2} floatIntensity={2}>
                <ParticleField />
            </Float>
        </Suspense>
    </Canvas>
  );
}

// --- UI Components ---

const HERO_PHRASES = ['We build.', 'We automate.', 'We modernize.'] as const;

type TypewriterSequenceProps = {
  phrases: readonly string[];
  startDelay?: number;
  className?: string;
  textClassName?: string;
  cursorClassName?: string;
};

const TypewriterSequence = ({
  phrases,
  startDelay = 0,
  className,
  textClassName,
  cursorClassName,
}: TypewriterSequenceProps) => {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const [started, setStarted] = useState(startDelay === 0);

  React.useEffect(() => {
    if (startDelay === 0) return;
    const timer = setTimeout(() => setStarted(true), startDelay);
    return () => clearTimeout(timer);
  }, [startDelay]);

  React.useEffect(() => {
    if (!started) return;
    const blink = setInterval(() => setShowCursor((value) => !value), 450);
    return () => clearInterval(blink);
  }, [started]);

  React.useEffect(() => {
    if (!started) return;

    const currentPhrase = phrases[phraseIndex] ?? '';
    if (charIndex < currentPhrase.length) {
      const typing = setTimeout(() => setCharIndex((value) => value + 1), 70);
      return () => clearTimeout(typing);
    }

    const pause = setTimeout(() => {
      setCharIndex(0);
      setPhraseIndex((value) => (value + 1) % phrases.length);
    }, 1100);

    return () => clearTimeout(pause);
  }, [charIndex, phraseIndex, phrases, started]);

  const currentPhrase = phrases[phraseIndex] ?? '';
  const displayedText = started ? currentPhrase.slice(0, charIndex) : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, filter: 'blur(8px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.6, delay: startDelay / 1000, ease: [0.22, 1, 0.36, 1] }}
      className={cn('inline-flex items-baseline', className)}
    >
      <span className={cn('inline-block whitespace-nowrap leading-tight', textClassName)}>{displayedText}</span>
      <span
        className={cn(
          'ml-1 text-sky-300 transition-opacity duration-200',
          showCursor ? 'opacity-100' : 'opacity-0',
          cursorClassName,
        )}
      >
        |
      </span>
    </motion.div>
  );
};

const PRELOADER_PHRASES = [
  'Calibrating agents',
  'Syncing model weights',
  'Routing automations',
];

export default function HeroSection() {
  // Load experience timeline: 0-2.3s branded preloader, then hero elements cascade in.
  const [showPreloader, setShowPreloader] = useState(true);
  const [contentReady, setContentReady] = useState(false);
  const [preloaderPhraseIndex, setPreloaderPhraseIndex] = useState(0);

  React.useEffect(() => {
    if (!showPreloader) return;

    const cycle = setInterval(() => {
      setPreloaderPhraseIndex((current) => (current + 1) % PRELOADER_PHRASES.length);
    }, 600);

    return () => clearInterval(cycle);
  }, [showPreloader]);

  React.useEffect(() => {
    const hideTimer = setTimeout(() => setShowPreloader(false), 2200);
    const contentTimer = setTimeout(() => setContentReady(true), 2500);

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(contentTimer);
    };
  }, []);

  return (
    <div className="relative w-full min-h-screen bg-zinc-950 text-white overflow-hidden font-sans selection:bg-violet-500/30">
      <AnimatePresence>
        {showPreloader && (
          <motion.div
            key="preloader"
            className="fixed inset-0 z-30 flex flex-col items-center justify-center bg-zinc-950/95 backdrop-blur-sm"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              className="relative flex flex-col items-center gap-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.05, opacity: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="relative flex items-center justify-center">
                <motion.span
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500/40 via-violet-500/40 to-fuchsia-500/40 blur-2xl"
                  initial={{ opacity: 0.4 }}
                  animate={{ opacity: [0.4, 0.8, 0.4], rotate: 360 }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                />
                <img
                  src="/aiguys-logo.png"
                  alt="AiGuys logo"
                  className="relative h-24 w-auto md:h-32 drop-shadow-[0_0_55px_rgba(34,211,238,0.35)]"
                />
              </div>
              <motion.span
                className="text-xs uppercase tracking-[0.4em] text-zinc-400"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.6, ease: [0.45, 0, 0.55, 1] }}
              >
                Elevating experiences
              </motion.span>
            </motion.div>

            <div className="absolute bottom-24 flex flex-col items-center gap-4">
              <div className="h-1 w-48 overflow-hidden rounded-full bg-zinc-800">
                <motion.div
                  className="h-full w-full origin-left bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 1.8, ease: [0.33, 1, 0.68, 1] }}
                />
              </div>
              <AnimatePresence mode="wait">
                <motion.span
                  key={PRELOADER_PHRASES[preloaderPhraseIndex]}
                  className="text-sm font-medium text-zinc-300"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.4 }}
                >
                  {PRELOADER_PHRASES[preloaderPhraseIndex]}
                </motion.span>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Layer - R3F Canvas */}
      <div className="absolute inset-0 z-0">
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="w-full h-full"
        >
            <Scene />
        </motion.div>
        {/* Gradient overlays for better text readability and matte look */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-zinc-950/50 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/80 via-transparent to-zinc-950/80 pointer-events-none" />
      </div>

      {/* Main Content Layer */}
      <div className="relative z-10 flex flex-col min-h-screen px-6 md:px-12 max-w-7xl mx-auto pointer-events-none">
        {contentReady && (
          <>
            {/* Navigation / Logo Area */}
            <motion.header
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="flex justify-between items-center py-8"
            >
              <div className="flex items-center gap-4 pointer-events-auto">
                <motion.img
                  src="/aiguys-logo.png"
                  alt="AiGuys logo"
                  className="h-16 w-auto md:h-20 lg:h-24 drop-shadow-[0_0_45px_rgba(124,58,237,0.35)]"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                />
                <span className="sr-only">AiGuys</span>
              </div>
              <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400 pointer-events-auto">
                <a href="#" className="hover:text-white transition-colors">Services</a>
                <a href="#" className="hover:text-white transition-colors">Case Studies</a>
                <a href="#" className="hover:text-white transition-colors">About</a>
                <button className="px-4 py-2 text-xs font-semibold text-white bg-zinc-900/80 hover:bg-zinc-800 rounded-full transition-colors">
                  Contact
                </button>
              </nav>
            </motion.header>

            {/* Hero Content Centered */}
            <main className="flex-grow flex flex-col justify-center pt-12 pb-32 md:pt-0">
              <div className="max-w-4xl space-y-8">
                {/* 1. Sequenced Hook Phrases */}
                <div className="min-h-[56px] text-2xl md:text-4xl font-medium tracking-tighter pointer-events-none">
                  <TypewriterSequence
                    phrases={HERO_PHRASES}
                    startDelay={400}
                    textClassName="text-transparent bg-clip-text bg-[linear-gradient(120deg,#38bdf8_0%,#34d399_50%,#a855f7_100%)]"
                    cursorClassName="text-emerald-300"
                  />
                </div>

                {/* 2. Main Headline */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2, duration: 0.8, ease: 'easeOut' }}
                  className="space-y-6"
                >
                  <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-[1.1] text-white">
                    Technical consulting <br className="hidden md:block" />
                    for the{' '}
                    <span
                      className="relative inline-flex items-center text-transparent bg-clip-text bg-[linear-gradient(120deg,#38bdf8_0%,#a855f7_100%)] after:absolute after:inset-x-0 after:-bottom-1 after:h-px after:bg-gradient-to-r after:from-sky-400 after:via-emerald-200 after:to-fuchsia-400 after:opacity-80 after:content-['']"
                      style={{ textShadow: '0 0 28px rgba(56,189,248,0.35)' }}
                    >
                      future
                    </span>
                    .
                  </h1>

                  <p className="text-lg md:text-2xl text-zinc-400 max-w-2xl leading-relaxed">
                    AiGuys is a technical team that designs, develops, and automates your business for the modern world.
                  </p>
                </motion.div>

                {/* 3. CTAs */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.8, duration: 0.8 }}
                  className="flex flex-col sm:flex-row gap-4 pt-4 pointer-events-auto"
                >
                  <button className="group relative px-8 py-4 bg-white text-zinc-950 text-lg font-bold rounded-full overflow-hidden transition-transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-zinc-950">
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-cyan-300 via-violet-300 to-fuchsia-300 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <span className="relative flex items-center gap-2">
                      Get a Free Consultation
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </button>

                  <button className="group px-8 py-4 text-lg font-medium text-white border-2 border-zinc-800 hover:border-zinc-600 bg-zinc-900/50 hover:bg-zinc-900 rounded-full transition-all flex items-center justify-center gap-2">
                    <span>See Our Work</span>
                    <Play className="w-4 h-4 fill-current opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                  </button>
                </motion.div>

                {/* 4. Proof Hook */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2.2, duration: 1 }}
                  className="pt-8 flex items-center gap-4 text-sm text-zinc-500 pointer-events-auto"
                >
                  <div className="flex -space-x-2">
                    {/* Placeholder avatars for social proof */}
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          'w-8 h-8 rounded-full border-2 border-zinc-950 flex items-center justify-center text-[10px] font-bold',
                          i === 0
                            ? 'bg-cyan-200 text-cyan-900'
                            : i === 1
                            ? 'bg-violet-200 text-violet-900'
                            : 'bg-fuchsia-200 text-fuchsia-900',
                        )}
                      >
                        {String.fromCharCode(65 + i)}
                      </div>
                    ))}
                  </div>
                  <p>
                    Trusted by local businesses and creators.
                    <a href="#" className="ml-2 text-zinc-300 hover:text-white inline-flex items-center gap-1 transition-colors">
                      Explore what we've built <ChevronRight className="w-3 h-3" />
                    </a>
                  </p>
                </motion.div>
              </div>
            </main>

            {/* Floating Chat Interaction Hint */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2.6, duration: 0.5 }}
              className="absolute bottom-8 right-8 hidden md:flex items-center gap-3 p-4 bg-zinc-900/80 backdrop-blur-md border border-zinc-800/50 rounded-2xl shadow-2xl max-w-xs pointer-events-auto"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center flex-shrink-0">
                <MessageSquareText className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-zinc-400 mb-1">AiGuys Assistant</p>
                <p className="text-sm text-white leading-tight">Hover around! The background reacts to your movement.</p>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
