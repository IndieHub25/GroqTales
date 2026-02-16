// Performance optimization script
(function() {
  // Disable unnecessary animations when page is not visible
  document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
      document.body.classList.add('reduce-motion');
    } else {
      document.body.classList.remove('reduce-motion');
    }
  }, { passive: true });

  // Mark content as loaded to enable delayed transitions
  window.addEventListener('load', function() {
    document.documentElement.classList.add('content-loaded');
  }, { passive: true });

  // Reduce animation work during scrolling (debounced scroll handling)
  let scrollTimeout;
  window.addEventListener('scroll', function() {
    if (!document.body.classList.contains('is-scrolling')) {
      document.body.classList.add('is-scrolling');
    }

    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(function() {
      document.body.classList.remove('is-scrolling');
    }, 150);
  }, { passive: true });

  // Disable heavy animations during window resize
  let resizeTimeout;
  window.addEventListener('resize', function() {
    document.body.classList.add('is-resizing');

    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function() {
      document.body.classList.remove('is-resizing');
    }, 150);
  }, { passive: true });

  // Set priority for critical resources
  function optimizeResourceLoading() {
    // Find non-critical images and defer them
    const images = document.querySelectorAll('img:not([loading])');
    images.forEach(img => {
      if (!img.hasAttribute('priority')) {
        img.loading = 'lazy';
      }
    });
  }

  if (document.readyState !== 'loading') {
    optimizeResourceLoading();
  } else {
    document.addEventListener('DOMContentLoaded', optimizeResourceLoading, { once: true });
  }
})();
