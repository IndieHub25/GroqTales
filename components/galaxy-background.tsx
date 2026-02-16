'use client';

import { motion, useReducedMotion } from 'framer-motion';
import React, { useEffect, useState, useMemo } from 'react';

export const GalaxyBackground = () => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isMounted, setIsMounted] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const w = window.innerWidth;
    const h = window.innerHeight;
    setDimensions({ width: w, height: h });
    setIsMobile(w < 768);

    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Reduce star count on mobile for performance
  const stars = useMemo(() => {
    const count = isMobile ? 50 : 200;
    const colors = ['#ffffff', '#ffd700', '#ff8f00', '#ff69b4', '#4169e1'] as const;
    return Array.from({ length: count }, () => {
      const colorIndex = Math.floor(Math.random() * colors.length);
      return {
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 1,
        delay: Math.random() * 8,
        color: colors[colorIndex] ?? '#ffffff',
      };
    });
  }, [isMobile]);

  if (!isMounted) return null;

  // For users who prefer reduced motion, show a static background
  if (prefersReducedMotion) {
    return (
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-blue-950/90 to-purple-950/90" />
        {stars.slice(0, 50).map((star, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: star.size,
              height: star.size,
              backgroundColor: star.color,
              opacity: 0.6,
            }}
          />
        ))}
      </div>
    );
  }

  // Fewer meteors on mobile
  const meteorCount = isMobile ? 3 : 12;
  const largeMeteorCount = isMobile ? 1 : 3;

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Deep space gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-blue-950/90 to-purple-950/90">
        <div className="absolute inset-0 opacity-50 mix-blend-overlay bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc1IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMC4xIi8+PC9zdmc+')]" />
      </div>

      {/* Planets - use CSS animations on mobile instead of framer-motion */}
      {!isMobile && (
        <>
          {/* The Sun */}
          <motion.div
            className="absolute w-64 h-64 rounded-full bg-gradient-radial from-yellow-500 via-orange-500 to-transparent blur-md"
            style={{ top: '10%', left: '-5%' }}
            animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          >
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-radial from-yellow-400/50 via-orange-500/30 to-transparent"
              animate={{ scale: [1, 1.4, 1], rotate: [0, 360] }}
              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            />
          </motion.div>

          {/* The Moon */}
          <motion.div
            className="absolute w-24 h-24 rounded-full bg-gradient-radial from-gray-200 via-gray-300 to-transparent blur-sm"
            style={{ top: '30%', right: '15%' }}
            animate={{ y: [0, -20, 0], opacity: [0.7, 0.9, 0.7] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Mars-like planet */}
          <motion.div
            className="absolute w-36 h-36 rounded-full bg-gradient-radial from-red-600 via-red-800 to-transparent blur-md"
            style={{ bottom: '20%', right: '25%' }}
            animate={{ scale: [1, 1.15, 1], rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          />

          {/* Saturn-like planet with rings */}
          <div className="absolute w-48 h-48" style={{ top: '40%', left: '20%' }}>
            <motion.div
              className="absolute w-32 h-32 rounded-full bg-gradient-radial from-yellow-200 via-yellow-600 to-transparent blur-sm"
              animate={{ scale: [1, 1.1, 1], opacity: [0.7, 0.9, 0.7] }}
              transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute w-48 h-12 bg-gradient-radial from-orange-300/50 via-yellow-500/30 to-transparent rounded-full -rotate-12 top-10 -left-8 blur-sm"
              animate={{ rotate: [-12, 6, -12], opacity: [0.5, 0.7, 0.5] }}
              transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            />
          </div>

          {/* Ice Giant */}
          <motion.div
            className="absolute w-28 h-28 rounded-full bg-gradient-radial from-cyan-400 via-blue-600 to-transparent blur-md"
            style={{ top: '60%', left: '60%' }}
            animate={{ scale: [1, 1.2, 1], y: [0, -15, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          />
        </>
      )}

      {/* Static planets for mobile (CSS only, no JS animation overhead) */}
      {isMobile && (
        <>
          <div
            className="absolute w-32 h-32 rounded-full bg-gradient-radial from-yellow-500 via-orange-500 to-transparent blur-md opacity-80 animate-pulse"
            style={{ top: '10%', left: '-5%', animationDuration: '15s' }}
          />
          <div
            className="absolute w-16 h-16 rounded-full bg-gradient-radial from-gray-200 via-gray-300 to-transparent blur-sm opacity-70"
            style={{ top: '30%', right: '15%' }}
          />
        </>
      )}

      {/* Animated stars - use CSS animation instead of framer-motion for each star */}
      {stars.map((star, i) => (
        <div
          key={i}
          className="absolute rounded-full animate-twinkle"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            backgroundColor: star.color,
            boxShadow: `0 0 ${star.size * 2}px ${star.color}`,
            animationDelay: `${star.delay}s`,
            animationDuration: `${3 + (i % 4)}s`,
          }}
        />
      ))}

      {/* Meteors - reduced count on mobile */}
      {Array.from({ length: meteorCount }).map((_, i) => {
        const isFromCorner = Math.random() > 0.5;
        const startX = -50;
        const startY = isFromCorner ? -50 : Math.random() * 70;

        return (
          <motion.div
            key={`meteor-${i}`}
            className="absolute"
            style={{
              top: `${startY}%`,
              left: `${startX}px`,
              zIndex: 2,
              transform: `rotate(${isFromCorner ? 45 : 35}deg)`,
            }}
          >
            <motion.div
              className="absolute rounded-full bg-white"
              style={{
                width: `${10 + Math.random() * 6}px`,
                height: `${10 + Math.random() * 6}px`,
                boxShadow: '0 0 15px #fff, 0 0 25px #fff, 0 0 35px #f59e0b, 0 0 45px #f59e0b',
                zIndex: 3,
              }}
              animate={{
                x: [0, dimensions.width * 1.2],
                y: [0, isFromCorner ? dimensions.height * 0.8 : dimensions.height * 0.5],
                opacity: [0, 1, 1, 0],
              }}
              transition={{
                duration: 2.5 + Math.random() * 1.5,
                repeat: Infinity,
                repeatDelay: Math.random() * 3,
                ease: [0.1, 0.01, 0.9, 0.99],
              }}
            />
            <motion.div
              className="absolute"
              style={{
                width: '200px',
                height: '4px',
                background: 'linear-gradient(90deg, transparent, #fff)',
                boxShadow: '0 0 30px rgba(255, 255, 255, 0.7)',
                borderRadius: '2px',
                transformOrigin: 'left center',
                zIndex: 2,
              }}
              animate={{
                x: [0, dimensions.width * 1.2],
                y: [0, isFromCorner ? dimensions.height * 0.8 : dimensions.height * 0.5],
                opacity: [0, 0.9, 0.9, 0],
              }}
              transition={{
                duration: 2.5 + Math.random() * 1.5,
                repeat: Infinity,
                repeatDelay: Math.random() * 3,
                ease: [0.1, 0.01, 0.9, 0.99],
              }}
            />
          </motion.div>
        );
      })}

      {/* Large meteors - reduced on mobile */}
      {Array.from({ length: largeMeteorCount }).map((_, i) => {
        const isFromCorner = i === 0;
        const startX = -100;
        const startY = isFromCorner ? -100 : Math.random() * 50;

        return (
          <motion.div
            key={`large-meteor-${i}`}
            className="absolute"
            style={{ top: `${startY}px`, left: `${startX}px`, zIndex: 3, transform: `rotate(${isFromCorner ? 45 : 35}deg)` }}
          >
            <motion.div
              className="absolute rounded-full bg-gradient-to-br from-orange-200 to-red-500"
              style={{ width: '28px', height: '28px', boxShadow: '0 0 30px #fff, 0 0 50px #f59e0b, 0 0 70px #dc2626' }}
              animate={{
                x: [0, dimensions.width * 1.5],
                y: [0, isFromCorner ? dimensions.height : dimensions.height * 0.6],
                opacity: [0, 1, 1, 0],
                rotate: [0, 360],
              }}
              transition={{ duration: 5 + Math.random() * 2, repeat: Infinity, repeatDelay: Math.random() * 5, ease: [0.1, 0.01, 0.9, 0.99] }}
            />
            <motion.div
              className="absolute"
              style={{ width: '350px', height: '12px', background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.95), transparent)', boxShadow: '0 0 60px rgba(255, 255, 255, 0.5)', borderRadius: '6px', filter: 'blur(3px)' }}
              animate={{
                x: [0, dimensions.width * 1.5],
                y: [0, isFromCorner ? dimensions.height : dimensions.height * 0.6],
                opacity: [0, 0.95, 0.95, 0],
              }}
              transition={{ duration: 5 + Math.random() * 2, repeat: Infinity, repeatDelay: Math.random() * 5, ease: [0.1, 0.01, 0.9, 0.99] }}
            />
          </motion.div>
        );
      })}
    </div>
  );
};
