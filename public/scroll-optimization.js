// Performance optimization script for smooth scrolling and rendering
(function () {
    'use strict';

    // Passive event listeners for better scroll performance
    if ('addEventListener' in window) {
        window.addEventListener('touchstart', function () { }, { passive: true });
        window.addEventListener('touchmove', function () { }, { passive: true });
        window.addEventListener('wheel', function () { }, { passive: true });
    }

    // Optimize images loading
    if ('loading' in HTMLImageElement.prototype) {
        const images = document.querySelectorAll('img[loading="lazy"]');
        images.forEach(img => {
            img.loading = 'lazy';
        });
    }

    // Reduce motion for users who prefer it
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (prefersReducedMotion.matches) {
        document.documentElement.style.scrollBehavior = 'auto';
    }

    // Smooth scroll polyfill for older browsers
    if (!('scrollBehavior' in document.documentElement.style)) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/smoothscroll-polyfill@0.4.4/dist/smoothscroll.min.js';
        script.onload = function () {
            window.__forceSmoothScrollPolyfill__ = true;
            if (window.smoothscroll) {
                window.smoothscroll.polyfill();
            }
        };
        document.head.appendChild(script);
    }

    // Optimize animations
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!reducedMotionQuery.matches) {
        // Enable smooth animations
        document.documentElement.classList.add('smooth-animations');
    }

    // Debounce scroll events for better performance
    let scrollTimeout;
    window.addEventListener('scroll', function () {
        if (scrollTimeout) {
            window.cancelAnimationFrame(scrollTimeout);
        }
        scrollTimeout = window.requestAnimationFrame(function () {
            // Custom scroll handling here if needed
        });
    }, { passive: true });

})();
