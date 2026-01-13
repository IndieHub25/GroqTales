// Quick boot script - runs before any other JavaScript
(function() {
  // Prevent layout shifts by setting a class based on stored theme
  try {
    // Apply theme class immediately to prevent flash of wrong theme
    const storedTheme = localStorage.getItem('groqtales-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (
      storedTheme === 'dark' ||
      (storedTheme === 'system' && prefersDark) ||
      (!storedTheme && prefersDark)
    ) {
      document.documentElement.classList.add('dark');
    }

    // Set classes to improve performance
    document.documentElement.classList.add('js-enabled');

    // Disable transitions until page is fully loaded
    document.documentElement.classList.add('no-transitions');

    // Set flag to show we've pre-loaded the page
    window.__QUICK_BOOT_COMPLETE = true;
  } catch (e) {
    // Fail silently - this is a performance optimization, not critical functionality
    console.warn('Quick boot error:', e);
  }
})();
