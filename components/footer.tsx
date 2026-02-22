'use client';

import {
  Github,
  Linkedin,
  ExternalLink,
  PenSquare,
  Frame,
  FileText,
  HelpCircle,
  Wallet,
  FileCheck,
  Shield,
  Cookie,
  Mail,
  Users,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';

import { AdminLoginModal } from './admin-login-modal';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [healthStatus, setHealthStatus] = useState<'loading' | 'ok' | 'degraded' | 'down'>('loading');

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch('/api/health/db', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setHealthStatus(data.status === 'ok' ? 'ok' : data.status === 'degraded' ? 'degraded' : 'down');
        } else {
          setHealthStatus('down');
        }
      } catch {
        setHealthStatus('down');
      }
    };
    checkHealth();
  }, []);

  const socialLinks = [
    {
      icon: <Github className="h-5 w-5" />,
      url: 'https://github.com/Drago-03/GroqTales.git',
      label: 'GitHub',
    },
    {
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      url: 'https://twitter.com/groqtales',
      label: 'X (Twitter)',
    },
    {
      icon: <Linkedin className="h-5 w-5" />,
      url: 'https://www.linkedin.com/company/indie-hub-exe/?viewAsMember=true',
      label: 'LinkedIn',
    },
  ];

  return (
    <footer role="contentinfo" className="relative mt-20 border-t-8 border-foreground dark:border-slate-700 bg-card dark:bg-slate-950">
      {/* Premium Background Glows for Dark Mode */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-0 dark:opacity-100">
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/5 blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/5 blur-[120px]" />
      </div>

      <div className="relative">
        <div className="container mx-auto px-6 py-16">
          {/* Main Footer Content Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
            {/* Brand Section */}
            <div className="space-y-6 flex flex-col items-center sm:items-start">
              <Link href="/" className="group inline-block">
                <h2
                  className="comic-display text-4xl sm:text-5xl italic"
                  style={{
                    fontWeight: 900,
                    fontStyle: 'italic',
                    color: 'var(--foreground)',
                    textShadow: '3px 3px 0px var(--shadow-color)',
                    letterSpacing: '2px',
                  }}
                >
                  GroqTales
                </h2>
              </Link>
              <div className="text-center sm:text-left">
                <p className="text-sm font-bold text-foreground/70 dark:text-slate-400 leading-relaxed max-w-xs">
                  Empowering creators with AI-driven storytelling and Web3 ownership.
                </p>
              </div>
              <div className="flex gap-3 pt-2" role="group" aria-label="Social media links">
                {socialLinks.map((link) => (
                  <Link
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 border-4 border-foreground dark:border-slate-700 bg-card dark:bg-slate-900 hover:bg-primary hover:border-primary transition-all duration-300 shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_var(--shadow-color)] group"
                    aria-label={link.label}
                  >
                    <span className="block group-hover:scale-110 transition-transform duration-300">
                      {link.icon}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Explore Section */}
            <nav aria-label="Explore links" className="text-left">
              <h3 className="font-black text-lg mb-5 text-foreground dark:text-white border-b-4 border-primary dark:border-accent inline-block pb-1 uppercase">
                Explore
              </h3>
              <ul className="space-y-3 pl-0 list-none">
                {[
                  { href: '/genres', label: 'Genres' },
                  { href: '/community', label: 'Community' },
                  { href: '/create', label: 'Create Story' },
                  { href: '/nft-gallery', label: 'NFT Gallery' },
                  { href: '/nft-marketplace', label: 'Marketplace' },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group relative inline-flex items-center text-sm font-bold text-foreground/70 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors duration-300 uppercase"
                    >
                      <span className="w-2 h-2 bg-primary opacity-0 group-hover:opacity-100 transition-opacity absolute -left-4" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Legal Section */}
            <nav aria-label="Legal links" className="text-left">
              <h3 className="font-black text-lg mb-5 text-foreground dark:text-white border-b-4 border-primary dark:border-accent inline-block pb-1 uppercase">
                Legal
              </h3>
              <ul className="space-y-3 pl-0 list-none">
                {[
                  { href: '/terms', label: 'Terms' },
                  { href: '/privacy', label: 'Privacy' },
                  { href: '/cookies', label: 'Cookies' },
                  { href: '/contact', label: 'Contact' },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group relative inline-flex items-center text-sm font-bold text-foreground/70 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors duration-300 uppercase"
                    >
                      <span className="w-2 h-2 bg-primary opacity-0 group-hover:opacity-100 transition-opacity absolute -left-4" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Resources Section */}
            <nav aria-label="Resources links" className="text-left">
              <h3 className="font-black text-lg mb-5 text-foreground dark:text-white border-b-4 border-primary dark:border-accent inline-block pb-1 uppercase">
                Resources
              </h3>
              <ul className="space-y-3 pl-0 list-none">
                {[
                  { href: '/docs', label: 'Documentation' },
                  { href: '/faq', label: 'FAQ' },
                  { href: '/feedback', label: 'Feedback' },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group relative inline-flex items-center text-sm font-bold text-foreground/70 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors duration-300 uppercase"
                    >
                      <span className="w-2 h-2 bg-primary opacity-0 group-hover:opacity-100 transition-opacity absolute -left-4" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Built by Section */}
            <div className="text-left">
              <h3 className="font-black text-lg mb-5 text-foreground dark:text-white border-b-4 border-primary dark:border-accent inline-block pb-1 uppercase">
                Built by
              </h3>
              <div className="space-y-4">
                <Link
                  href="https://www.indiehub.co.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 text-base font-black text-primary dark:text-accent hover:text-accent dark:hover:text-primary transition-all duration-300 uppercase"
                >
                  <ExternalLink className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                  INDIE HUB
                </Link>
                <p className="text-xs font-bold text-foreground/60 dark:text-slate-500 leading-relaxed">
                  Digital experiences with precision and soul
                </p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t-4 border-foreground dark:border-slate-700 my-8" />
        </div>

      </div>

      {/* ═══════════════════════════════════════
          NEON "GROQTALES" BRANDING — Full-width
          Spans the entire screen on all devices
          ═══════════════════════════════════════ */}
      <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] py-8 md:py-10 text-center select-none overflow-hidden bg-foreground/[0.03] dark:bg-white/[0.02]">
        <h2
          className="neon-sign comic-display text-5xl xs:text-6xl sm:text-7xl md:text-[6rem] lg:text-[7rem] xl:text-[8rem] leading-none tracking-[0.1em] sm:tracking-[0.15em] md:tracking-[0.2em] whitespace-nowrap"
          aria-hidden="true"
        >
          GROQTALES
        </h2>

        {/* Copyright, Powered by, Online — below neon sign */}
        <div className="mt-6 md:mt-8 flex flex-col items-center gap-3 text-xs font-bold uppercase">
          <p className="flex items-center gap-2 text-foreground/70 dark:text-slate-400">
            <span>&copy; {currentYear} GroqTales</span>
          </p>
          <p className="flex items-center gap-2 text-foreground/70 dark:text-slate-400">
            <span>Powered by</span>
            <span className="text-primary dark:text-accent font-black">Monad</span>
            <span>×</span>
            <span className="text-primary dark:text-accent font-black">Groq AI</span>
          </p>
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                healthStatus === 'ok'
                  ? 'bg-green-500 animate-pulse'
                  : healthStatus === 'degraded'
                    ? 'bg-yellow-500 animate-pulse'
                    : healthStatus === 'down'
                      ? 'bg-red-500'
                      : 'bg-gray-400 animate-pulse'
              }`}
            />
            <span
              className={`font-black ${
                healthStatus === 'ok'
                  ? 'text-green-600 dark:text-green-400'
                  : healthStatus === 'degraded'
                    ? 'text-yellow-600 dark:text-yellow-400'
                    : healthStatus === 'down'
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {healthStatus === 'ok'
                ? 'Online'
                : healthStatus === 'degraded'
                  ? 'Degraded'
                  : healthStatus === 'down'
                    ? 'Offline'
                    : 'Checking…'}
            </span>
          </div>
        </div>
      </div>

      <AdminLoginModal open={showAdminModal} onOpenChange={setShowAdminModal} />
    </footer>
  );
}
