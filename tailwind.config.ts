import type { Config } from 'tailwindcss';
import { fontFamily } from 'tailwindcss/defaultTheme';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    '!**/node_modules/**',
    '!**/.next/**',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        // Noir Dossier palette
        'noir-primary': '#8a0000',
        'background-light': '#f8f5f5',
        'background-dark': '#050505',
        'noir-paper': '#E5E5E5',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'var(--radius)',
        sm: 'var(--radius)',
      },
      fontFamily: {
        comic: ['var(--font-comic)', 'cursive'],
        display: ['var(--font-display)', 'sans-serif'],
        marker: ['var(--font-marker)', 'cursive'],
        condensed: ['var(--font-condensed)', 'sans-serif'],
        'noir-title': ['var(--font-noir-title)', 'serif'],
      },
      boxShadow: {
        comic: '4px 4px 0px 0px #000000',
        'comic-hover': '2px 2px 0px 0px #000000',
        'comic-lg': '8px 8px 0px 0px #000000',
        'comic-red': '8px 8px 0px 0px #8a0000',
        'comic-xl': '12px 12px 0px 0px #000000',
      },
      borderWidth: {
        '3': '3px',
        '4': '4px',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;

export default config;
