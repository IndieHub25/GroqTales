'use client';

import { motion } from 'framer-motion';
import { Sparkles, Stars, BookOpen, Zap } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AnimatedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  gradientColors?: string;
  glowColor?: string;
  icon?: React.ReactNode;
  animationType?: 'x' | 'y' | 'xy' | 'scale' | 'pulse' | 'none';
  className?: string;
  children: React.ReactNode;
}
export const AnimatedButton = React.forwardRef<
  HTMLButtonElement,
  AnimatedButtonProps
>(
  (
    {
      children,
      gradientColors = 'from-blue-500 via-indigo-500 to-purple-500',
      glowColor = 'rgba(99, 102, 241, 0.4)',
      icon,
      animationType = 'scale',
      className,
      ...props
    },
    ref
  ) => {
    const getAnimation = () => {
      switch (animationType) {
        case 'x':
          return {
            initial: { x: 0 },
            whileHover: { x: 5 },
          };
        case 'y':
          return {
            initial: { y: 0 },
            whileHover: { y: -5 },
          };
        case 'xy':
          return {
            initial: { x: 0, y: 0 },
            whileHover: { x: 3, y: -3 },
          };
        case 'pulse':
          return {
            initial: { scale: 1 },
            whileHover: {
              scale: [1, 1.05, 1],
              transition: {
                repeat: Infinity,
                repeatType: 'mirror' as const,
                duration: 0.8,
              },
            },
          };
        case 'none':
          return {};
        case 'scale':
        default:
          return {
            initial: { scale: 1 },
            whileHover: { scale: 1.05 },
          };
      }
    };

    const animation = getAnimation();

    return (
      <motion.div
        className="relative"
        initial={{ opacity: 1 }}
        whileHover={{ opacity: 1 }}
        {...animation}
      >
        <div
          className={`absolute inset-0 rounded-lg blur opacity-50 transition-all duration-300 group-hover:opacity-70`}
          style={{
            background: `linear-gradient(90deg, ${glowColor}, transparent, ${glowColor})`,
          }}
        />
        <Button
          ref={ref}
          className={cn(
            `relative overflow-hidden rounded-lg border bg-gradient-to-r ${gradientColors} px-6 py-2.5 font-semibold text-white shadow-md transition-all duration-300 hover:shadow-lg`,
            className
          )}
          {...props}
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {icon}
            {children}
          </span>
        </Button>
      </motion.div>
    );
  }
);
AnimatedButton.displayName = 'AnimatedButton';

export const NFTButton = React.forwardRef<
  HTMLButtonElement,
  AnimatedButtonProps
>(({ children, className, animationType = 'scale', ...props }, ref) => {
  return (
    <AnimatedButton
      ref={ref}
      className={cn(
        'bg-gradient-to-r from-purple-600 via-pink-500 to-rose-500',
        className
      )}
      gradientColors="from-purple-600 via-pink-500 to-rose-500"
      glowColor="rgba(219, 39, 119, 0.4)"
      icon={<Stars className="h-4 w-4" />}
      animationType={animationType}
      {...props}
    >
      {children}
    </AnimatedButton>
  );
});
NFTButton.displayName = 'NFTButton';

export const StoryButton = React.forwardRef<
  HTMLButtonElement,
  AnimatedButtonProps
>(({ children, className, animationType = 'scale', ...props }, ref) => {
  return (
    <AnimatedButton
      ref={ref}
      className={cn(
        'bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500',
        className
      )}
      gradientColors="from-cyan-500 via-teal-500 to-emerald-500"
      glowColor="rgba(20, 184, 166, 0.4)"
      icon={<BookOpen className="h-4 w-4" />}
      animationType={animationType}
      {...props}
    >
      {children}
    </AnimatedButton>
  );
});
StoryButton.displayName = 'StoryButton';

export const PrimaryAnimatedButton = React.forwardRef<
  HTMLButtonElement,
  AnimatedButtonProps
>(({ children, className, animationType = 'pulse', ...props }, ref) => {
  return (
    <AnimatedButton
      ref={ref}
      className={cn(
        'bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600',
        className
      )}
      gradientColors="from-blue-600 via-indigo-600 to-violet-600"
      glowColor="rgba(79, 70, 229, 0.4)"
      icon={<Sparkles className="h-4 w-4" />}
      animationType={animationType}
      {...props}
    >
      {children}
    </AnimatedButton>
  );
});
PrimaryAnimatedButton.displayName = 'PrimaryAnimatedButton';

// Export a special animation button for Groq-specific actions
export const GroqButton = React.forwardRef<
  HTMLButtonElement,
  AnimatedButtonProps
>(({ children, className, animationType = 'xy', ...props }, ref) => {
  return (
    <AnimatedButton
      ref={ref}
      className={cn(
        'bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500',
        className
      )}
      gradientColors="from-orange-500 via-amber-500 to-yellow-500"
      glowColor="rgba(245, 158, 11, 0.4)"
      icon={<Zap className="h-4 w-4" />}
      animationType={animationType}
      {...props}
    >
      {children}
    </AnimatedButton>
  );
});
GroqButton.displayName = 'GroqButton';
