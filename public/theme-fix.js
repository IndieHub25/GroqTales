// Lightweight script to prevent theme glitching
(function() {
  // Simplified theme change handler - minimal operations
  function handleThemeChange() {
    document.documentElement.classList.add('no-transitions');

    // Use requestAnimationFrame for better performance
    requestAnimationFrame(function() {
      requestAnimationFrame(function() {
        document.documentElement.classList.remove('no-transitions');
      });
    });
  }

  // Optimized observer setup
  function setupThemeChangeObserver() {
    // Use a simple flag to prevent multiple rapid executions
    let isProcessingChange = false;

    // More efficient mutation observer
    const observer = new MutationObserver(function() {
      if (!isProcessingChange) {
        isProcessingChange = true;
        handleThemeChange();
        // Reset flag after a minimal delay
        setTimeout(function() { isProcessingChange = false; }, 20);
      }
    });

    // Start observing with minimal configuration
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
      attributeOldValue: false,
      characterData: false,
      childList: false,
      subtree: false
    });
  }

  // Execute at the earliest opportunity
  if (document.readyState !== 'loading') {
    setupThemeChangeObserver();
  } else {
    document.addEventListener('DOMContentLoaded', setupThemeChangeObserver, { once: true });
  }

  // Simplified system theme change handling
  if (window.matchMedia) {
    const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    try {
      if (typeof colorSchemeQuery.addEventListener === 'function') {
        colorSchemeQuery.addEventListener('change', handleThemeChange);
      } else if (typeof colorSchemeQuery.addListener === 'function') {
        // Legacy Safari
        colorSchemeQuery.addListener(handleThemeChange);
      }
    } catch (e) {
      // Fail silently - this is a performance optimization, not critical functionality
    }
  }
})();
