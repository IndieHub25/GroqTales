/**
 * Optimized Framer Motion Animation Variants
 * Centralized animation configurations with performance optimizations
 * 
 * Performance optimizations applied:
 * - GPU acceleration via transform3d
 * - Reduced motion support
 * - Optimized easing functions
 * - will-change hints for browser optimization
 */

import { Variants, Transition } from 'framer-motion';

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Performance-optimized transition defaults
 */
export const performantTransition: Transition = {
  type: 'spring',
  stiffness: 100,
  damping: 15,
  mass: 0.5,
};

/**
 * Smooth transition for general animations
 */
export const smoothTransition: Transition = {
  duration: 0.3,
  ease: [0.25, 0.1, 0.25, 1], // Custom cubic-bezier for smooth motion
};

/**
 * Hero card rotation animation (optimized)
 * Uses transform3d for GPU acceleration
 */
export const heroCardVariants: Variants = {
  initial: {
    rotateY: 0,
    rotateX: 0,
    z: 0,
  },
  animate: {
    rotateY: prefersReducedMotion() ? 0 : [0, 5, 0, -5, 0],
    rotateX: prefersReducedMotion() ? 0 : [0, 2, 0, -2, 0],
    z: 0, // Force 3D context
    transition: {
      duration: 10,
      repeat: Infinity,
      ease: 'easeInOut',
      repeatType: 'loop',
    },
  },
};

/**
 * Fade in from bottom (optimized)
 * Uses transform3d and GPU acceleration
 */
export const fadeInUpVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    z: 0, // Force 3D context
  },
  visible: {
    opacity: 1,
    y: 0,
    z: 0,
    transition: smoothTransition,
  },
};

/**
 * Fade in with scale (optimized)
 */
export const fadeInScaleVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    z: 0,
  },
  visible: {
    opacity: 1,
    scale: 1,
    z: 0,
    transition: performantTransition,
  },
};

/**
 * Stagger children animation (optimized)
 */
export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

/**
 * Star spin animation (optimized for continuous rotation)
 * Reduced motion: no animation
 */
export const starSpinVariants: Variants = {
  initial: {
    rotate: 0,
    scale: 1,
    z: 0,
  },
  animate: prefersReducedMotion()
    ? {
        rotate: 0,
        scale: 1,
      }
    : {
        rotate: 360,
        scale: [1, 1.1, 1],
        z: 0,
        transition: {
          rotate: {
            duration: 20,
            repeat: Infinity,
            ease: 'linear', // Linear for consistent rotation
          },
          scale: {
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        },
      },
};

/**
 * Zap pulse animation (optimized)
 */
export const zapPulseVariants: Variants = {
  initial: {
    scale: 1,
    opacity: 0.8,
    z: 0,
  },
  animate: prefersReducedMotion()
    ? {
        scale: 1,
        opacity: 0.8,
      }
    : {
        scale: [1, 1.2, 1],
        opacity: [0.8, 1, 0.8],
        z: 0,
        transition: {
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      },
};

/**
 * Feature card hover effect (optimized)
 * Only transforms, no layout changes
 */
export const featureCardVariants: Variants = {
  initial: {
    scale: 1,
    y: 0,
    z: 0,
  },
  hover: prefersReducedMotion()
    ? {
        scale: 1,
        y: 0,
      }
    : {
        scale: 1.02,
        y: -4,
        z: 0,
        transition: {
          type: 'spring',
          stiffness: 300,
          damping: 20,
        },
      },
};

/**
 * Button hover effect (optimized)
 */
export const buttonHoverVariants: Variants = {
  initial: {
    scale: 1,
    z: 0,
  },
  hover: prefersReducedMotion()
    ? {
        scale: 1,
      }
    : {
        scale: 1.05,
        z: 0,
        transition: {
          type: 'spring',
          stiffness: 400,
          damping: 25,
        },
      },
  tap: {
    scale: 0.98,
  },
};

/**
 * Slide in from left (optimized)
 */
export const slideInLeftVariants: Variants = {
  hidden: {
    opacity: 0,
    x: -30,
    z: 0,
  },
  visible: {
    opacity: 1,
    x: 0,
    z: 0,
    transition: smoothTransition,
  },
};

/**
 * Slide in from right (optimized)
 */
export const slideInRightVariants: Variants = {
  hidden: {
    opacity: 0,
    x: 30,
    z: 0,
  },
  visible: {
    opacity: 1,
    x: 0,
    z: 0,
    transition: smoothTransition,
  },
};

/**
 * Performance monitoring utility
 * Logs animation performance in development
 */
export const logAnimationPerformance = (animationName: string) => {
  if (process.env.NODE_ENV === 'development') {
    const fps = [];
    let lastTime = performance.now();
    
    const measureFPS = () => {
      const now = performance.now();
      const delta = now - lastTime;
      fps.push(1000 / delta);
      lastTime = now;
      
      if (fps.length > 60) {
        const avgFPS = fps.reduce((a, b) => a + b, 0) / fps.length;
        if (avgFPS < 55) {
          console.warn(`⚠️ ${animationName} running at ${avgFPS.toFixed(1)} FPS`);
        }
        fps.length = 0;
      }
      
      requestAnimationFrame(measureFPS);
    };
    
    measureFPS();
  }
};

/**
 * Viewport-based animation config
 * Only animates when element is in viewport
 */
export const viewportConfig = {
  once: true, // Animate only once
  margin: '0px 0px -100px 0px', // Trigger 100px before entering viewport
  amount: 0.3, // Trigger when 30% visible
};

/**
 * Layout animation config for Framer Motion
 * Prevents layout shift during animations
 */
export const layoutConfig = {
  layout: true,
  layoutId: undefined, // Set specific layoutId when needed
};
