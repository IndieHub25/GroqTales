'use client';

import { motion } from 'framer-motion';
import { Sparkles, BookText, Cpu } from 'lucide-react';
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
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                rotate: [0, 5, 0, -5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="bg-primary/20 dark:bg-primary/10 rounded-full p-3"
            >
              <BookText className={`text-primary ${currentSize.icon}`} />
            </motion.div>
          </div>

          {/* Orbiting elements */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="absolute inset-0"
          >
            {/* Top dot */}
            <motion.div
              className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2"
              animate={{
                scale: [1, 1.2, 1],
                boxShadow: [
                  '0 0 0 0 rgba(147, 51, 234, 0.2)',
                  '0 0 0 4px rgba(147, 51, 234, 0.2)',
                  '0 0 0 0 rgba(147, 51, 234, 0.2)',
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: 0,
              }}
            >
              <div className={`${currentSize.dot} bg-primary rounded-full`} />
            </motion.div>

            {/* Right dot */}
            <motion.div
              className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2"
              animate={{
                scale: [1, 1.2, 1],
                boxShadow: [
                  '0 0 0 0 rgba(147, 51, 234, 0.2)',
                  '0 0 0 4px rgba(147, 51, 234, 0.2)',
                  '0 0 0 0 rgba(147, 51, 234, 0.2)',
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: 0.5,
              }}
            >
              <div className={`${currentSize.dot} bg-primary rounded-full`} />
            </motion.div>

            {/* Bottom dot */}
            <motion.div
              className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2"
              animate={{
                scale: [1, 1.2, 1],
                boxShadow: [
                  '0 0 0 0 rgba(147, 51, 234, 0.2)',
                  '0 0 0 4px rgba(147, 51, 234, 0.2)',
                  '0 0 0 0 rgba(147, 51, 234, 0.2)',
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: 1,
              }}
            >
              <div className={`${currentSize.dot} bg-primary rounded-full`} />
            </motion.div>

            {/* Left dot */}
            <motion.div
              className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2"
              animate={{
                scale: [1, 1.2, 1],
                boxShadow: [
                  '0 0 0 0 rgba(147, 51, 234, 0.2)',
                  '0 0 0 4px rgba(147, 51, 234, 0.2)',
                  '0 0 0 0 rgba(147, 51, 234, 0.2)',
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: 1.5,
              }}
            >
              <div className={`${currentSize.dot} bg-primary rounded-full`} />
            </motion.div>
          </motion.div>

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
