'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { SignInForm } from './sign-in-form';
import { SignUpForm } from './sign-up-form';

interface AnimatedAuthContainerProps {
  initialMode: 'login' | 'register';
}

export function AnimatedAuthContainer({ initialMode }: AnimatedAuthContainerProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const router = useRouter();

  const toggleMode = () => {
    // If we're login, switch to register, and vice versa.
    const newMode = mode === 'login' ? 'register' : 'login';
    setMode(newMode);
    
    // Efficiently update the browser URL history without reloading the page.
    // This allows the back button to work and keeps the page URL accurate.
    const newPath = newMode === 'login' ? '/sign-in' : '/sign-up';
    router.replace(newPath, { scroll: false });
  };

  const variants = {
    hidden: (isLogin: boolean) => ({
      opacity: 0,
      x: isLogin ? -40 : 40,
      scale: 0.98,
    }),
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      },
    },
    exit: (isLogin: boolean) => ({
      opacity: 0,
      x: isLogin ? 40 : -40,
      scale: 0.98,
      transition: {
        duration: 0.2,
      },
    }),
  };

  return (
    <div className="min-h-[calc(100vh-80px)] w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] -mt-6 -mb-6 flex items-center justify-center bg-[#0a0a0c] text-neutral-200 overflow-hidden py-12">
      
      {/* Abstract Corporate/CRM style background that shifts slightly based on mode */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div 
          className="absolute top-0 right-0 w-[40vw] h-[40vw] rounded-full bg-blue-900/10 blur-[120px] transition-transform duration-1000 ease-in-out" 
          style={{ transform: mode === 'register' ? 'translate(-10vw, 10vh)' : 'translate(0, 0)' }} 
        />
        <div 
          className="absolute bottom-0 left-0 w-[50vw] h-[50vw] rounded-full bg-indigo-900/10 blur-[120px] transition-transform duration-1000 ease-in-out"
          style={{ transform: mode === 'register' ? 'translate(10vw, -10vh)' : 'translate(0, 0)' }} 
        />
      </div>

      <div className="relative z-10 w-full max-w-lg flex items-center justify-center">
        <AnimatePresence mode="wait" custom={mode === 'login'}>
          {mode === 'login' ? (
            <motion.div
              key="login"
              custom={true}
              variants={variants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="w-full flex justify-center"
            >
              <SignInForm onToggleMode={toggleMode} />
            </motion.div>
          ) : (
            <motion.div
              key="register"
              custom={false}
              variants={variants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="w-full flex justify-center"
            >
              <SignUpForm onToggleMode={toggleMode} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
