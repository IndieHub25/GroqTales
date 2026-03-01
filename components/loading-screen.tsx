'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import React from 'react';

import { ClientOnly } from '@/components/client-only';

interface LoadingScreenProps {
  message?: string;
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Loading...',
  fullScreen = false,
  size = 'md',
}) => {
  const sizeClasses = {
    sm: {
      container: 'w-32 h-32',
      icon: 'w-6 h-6',
      text: 'text-sm',
      dot: 'w-2 h-2',
    },
    md: {
      container: 'w-48 h-48',
      icon: 'w-8 h-8',
      text: 'text-base',
      dot: 'w-3 h-3',
    },
    lg: {
      container: 'w-64 h-64',
      icon: 'w-12 h-12',
      text: 'text-lg',
      dot: 'w-4 h-4',
    },
  };

  const currentSize = sizeClasses[size];

  const containerClasses = fullScreen
    ? 'fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center'
    : 'flex items-center justify-center p-8';

  return (
    <ClientOnly>
      <div className={containerClasses}>
        <div className={`relative ${currentSize.container}`}>
          {/* Central loading icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            
            {/* Outer spinning aura */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-[-20%] rounded-full border-[2px] border-dashed border-emerald-500/30 opacity-70 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-[-10%] rounded-full border-[2px] border-dotted border-blue-500/30 opacity-70 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]"
            />

            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                filter: [
                  'drop-shadow(0 0 15px rgba(16,185,129,0.4))',
                  'drop-shadow(0 0 40px rgba(16,185,129,0.9))',
                  'drop-shadow(0 0 15px rgba(16,185,129,0.4))',
                ]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="relative rounded-full p-6 flex items-center justify-center bg-black/60 backdrop-blur-xl border border-white/20 shadow-[0_0_30px_rgba(0,0,0,0.8)]"
            >
              <div className="relative w-20 h-20 md:w-32 md:h-32">
                <Image 
                  src="/logo.png" 
                  alt="Loading" 
                  fill 
                  className="object-contain drop-shadow-[0_0_12px_rgba(255,255,255,1)]" 
                  priority 
                />
              </div>
            </motion.div>
          </div>

          {/* Loading message */}
          <motion.div
            className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-center"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <p
              className={`${currentSize.text} font-medium text-muted-foreground whitespace-nowrap`}
            >
              {message}
            </p>
          </motion.div>
        </div>
      </div>
    </ClientOnly>
  );
};

export default LoadingScreen;
