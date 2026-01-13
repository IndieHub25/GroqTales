'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes/dist/types';
import { useTheme } from 'next-themes';
import * as React from 'react';

function SystemThemeClassSync() {
  const { theme } = useTheme();

  React.useEffect(() => {
    if (theme !== 'system') return;

    const root = document.documentElement;

    const getIsDark = () =>
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;

    const apply = () => {
      const isDark = getIsDark();
      root.classList.toggle('dark', isDark);
      root.classList.toggle('light', !isDark);
    };

    apply();

    const mediaQuery =
      typeof window !== 'undefined' && typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-color-scheme: dark)')
        : null;

    const onMediaChange = () => apply();
    if (mediaQuery) {
      // Support both modern and legacy MediaQueryList APIs
      if (typeof mediaQuery.addEventListener === 'function') {
        mediaQuery.addEventListener('change', onMediaChange);
      } else if (typeof (mediaQuery as unknown as MediaQueryList).addListener === 'function') {
        (mediaQuery as unknown as MediaQueryList).addListener(onMediaChange);
      }
    }

    const observer = new MutationObserver(() => {
      // If any script/library flips the class while in system mode, correct it.
      apply();
    });
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });

    return () => {
      observer.disconnect();
      if (mediaQuery) {
        if (typeof mediaQuery.removeEventListener === 'function') {
          mediaQuery.removeEventListener('change', onMediaChange);
        } else if (
          typeof (mediaQuery as unknown as MediaQueryList).removeListener === 'function'
        ) {
          (mediaQuery as unknown as MediaQueryList).removeListener(onMediaChange);
        }
      }
    };
  }, [theme]);

  return null;
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // We'll rely on the script in public/theme-fix.js instead of React effects
  // This removes unnecessary React overhead and improves performance
  return (
    <NextThemesProvider {...props}>
      <SystemThemeClassSync />
      {children}
    </NextThemesProvider>
  );
}
