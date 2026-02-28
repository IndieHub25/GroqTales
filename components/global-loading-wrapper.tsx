'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import LoadingScreen from '@/components/loading-screen';

export function GlobalLoadingWrapper({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  const isInitialMount = React.useRef(true);

  // Initial load effect
  useEffect(() => {
    let mounted = true;
    const timer = setTimeout(() => {
      if (mounted) setLoading(false);
    }, 1800); // Aesthetic loader duration
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, []);

  // Route change effect
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    let mounted = true;
    setLoading(true);
    const timer = setTimeout(() => {
      if (mounted) setLoading(false);
    }, 1000);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [pathname]);

  return (
    <>
      <AnimatePresence>
        {loading && (
          <motion.div
            key="global-loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-2xl"
          >
            <LoadingScreen fullScreen={false} size="lg" message="Loading GroqTales..." />
          </motion.div>
        )}
      </AnimatePresence>
      <div 
        style={{ 
          opacity: loading ? 0 : 1, 
          filter: loading ? 'blur(10px) brightness(0.5)' : 'blur(0px) brightness(1)',
          transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)' 
        }}
        className="w-full min-h-screen relative z-0"
      >
        {children}
      </div>
    </>
  );
}
