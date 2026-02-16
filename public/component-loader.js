// Component Loader - Optimizes component loading and UI performance
(function() {
  // Track component loading state
  window.__COMPONENT_LOAD_STATE = {
    visible: {},
    pending: {},
    loaded: {}
  };

  // Helper to determine if element is in viewport
  function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top <= (window.innerHeight || document.documentElement.clientHeight) + 200 &&
      rect.left <= (window.innerWidth || document.documentElement.clientWidth) + 200 &&
      rect.bottom >= -200 &&
      rect.right >= -200
    );
  }

  // Register component for lazy loading
  window.registerLazyComponent = function(id, loadFn) {
    window.__COMPONENT_LOAD_STATE.pending[id] = loadFn;

    // Setup observer for element
    const element = document.getElementById(id);
    if (element) {
      if (isInViewport(element)) {
        loadComponent(id);
      } else {
        setupObserver(id, element);
      }
    }
  };

  // Setup intersection observer for lazy loading
  function setupObserver(id, element) {
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            loadComponent(id);
            observer.unobserve(element);
          }
        });
      }, {
        rootMargin: '200px',
        threshold: 0.01
      });

      observer.observe(element);
    } else {
      // Fallback for browsers without IntersectionObserver
      window.addEventListener('scroll', throttle(() => {
        if (isInViewport(element)) {
          loadComponent(id);
        }
      }, 200), { passive: true });
    }
  }

  // Load component when needed
  function loadComponent(id) {
    if (window.__COMPONENT_LOAD_STATE.pending[id] && !window.__COMPONENT_LOAD_STATE.loaded[id]) {
      window.__COMPONENT_LOAD_STATE.loaded[id] = true;
      window.__COMPONENT_LOAD_STATE.pending[id]();
      delete window.__COMPONENT_LOAD_STATE.pending[id];
    }
  }

  // Utility function to throttle scroll events
  function throttle(fn, delay) {
    let lastCall = 0;
    return function(...args) {
      const now = new Date().getTime();
      if (now - lastCall < delay) {
        return;
      }
      lastCall = now;
      return fn(...args);
    };
  }

  // Setup global preloading for critical components
  window.preloadCriticalComponents = function() {
    for (const id in window.__COMPONENT_LOAD_STATE.pending) {
      if (document.getElementById(id) && isInViewport(document.getElementById(id))) {
        loadComponent(id);
      }
    }
  };

  // Run preload on load
  if (document.readyState !== 'loading') {
    setTimeout(window.preloadCriticalComponents, 300);
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(window.preloadCriticalComponents, 300);
    }, { once: true });
  }
})();
