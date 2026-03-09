'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

import { ComiCraftLogo } from '@/components/comicraft-logo';

interface SplashScreenProps {
  onComplete?: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) {
        setTimeout(onComplete, 500);
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="splash-overlay"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#030712]"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-transparent opacity-50" />

          <motion.div
            className="relative z-10 flex items-center justify-center"
            animate={{
              scale: [1, 1.05, 1],
              opacity: [1, 0.8, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <ComiCraftLogo variant="icon" colorScheme="color" size={96} animate={false} />
          </motion.div>


          <p className="mt-8 text-sm font-bold tracking-[0.3em] uppercase text-white/80 animate-pulse font-comic z-10">
            Where AI Meets Imagination
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default SplashScreen;