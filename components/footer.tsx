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

export function Footer({ version }: { version?: string }) {
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
    <footer role="contentinfo" className="relative mt-20 border-t border-white/10 dark:border-white/10 bg-black dark:bg-black text-white selection:bg-white/20">
      {/* Premium Background Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute bottom-0 left-[-10%] w-[40vw] h-[40vw] bg-emerald-500/10 blur-[120px] rounded-full" />
        <div className="absolute top-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-purple-500/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10">
        <div className="container mx-auto px-6 py-16">
          {/* Main Footer Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
            {/* Brand Section */}
            <div className="space-y-6 flex flex-col items-start lg:col-span-2">
              <Link href="/" className="group inline-block">
                <h2 className="text-4xl font-semibold tracking-tighter text-white">
                  GroqTales
                </h2>
              </Link>
              <div className="text-left">
                <p className="text-sm font-medium text-white/50 leading-relaxed max-w-sm">
                  Empowering creators with AI-driven storytelling and Web3 ownership. The cinematic platform for your imagination.
                </p>
              </div>
              <div className="flex gap-3 pt-2" role="group" aria-label="Social media links">
                {socialLinks.map((link) => (
                  <Link
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 group text-white/70 hover:text-white"
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
              <h3 className="font-semibold text-sm tracking-wider uppercase mb-5 text-white/30">
                Explore
              </h3>
              <ul className="space-y-4 pl-0 list-none">
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
                      className="group relative inline-flex items-center text-sm font-medium text-white/60 hover:text-white transition-colors duration-300"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity absolute -left-3" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Legal Section */}
            <nav aria-label="Legal links" className="text-left">
              <h3 className="font-semibold text-sm tracking-wider uppercase mb-5 text-white/30">
                Legal
              </h3>
              <ul className="space-y-4 pl-0 list-none">
                {[
                  { href: '/terms', label: 'Terms' },
                  { href: '/privacy', label: 'Privacy' },
                  { href: '/cookies', label: 'Cookies' },
                  { href: '/contact', label: 'Contact' },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group relative inline-flex items-center text-sm font-medium text-white/60 hover:text-white transition-colors duration-300"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 opacity-0 group-hover:opacity-100 transition-opacity absolute -left-3" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Resources Section */}
            <nav aria-label="Resources links" className="text-left">
              <h3 className="font-semibold text-sm tracking-wider uppercase mb-5 text-white/30">
                Resources
              </h3>
              <ul className="space-y-4 pl-0 list-none">
                {[
                  { href: '/docs', label: 'Documentation' },
                  { href: '/faq', label: 'FAQ' },
                  { href: '/feedback', label: 'Feedback' },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group relative inline-flex items-center text-sm font-medium text-white/60 hover:text-white transition-colors duration-300"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 opacity-0 group-hover:opacity-100 transition-opacity absolute -left-3" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent my-10" />

          {/* Glitch & Copyright Section */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-sm font-medium">
            <div className="flex items-center gap-3">
              <p className="text-white/40">
                &copy; {currentYear} GroqTales. All rights reserved.
              </p>
              {version && (
                <>
                  <span className="w-1 h-1 rounded-full bg-white/20" />
                  <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-xs font-mono text-white/50 tracking-wider">
                    v{version}
                  </span>
                </>
              )}
            </div>

            {/* Data-streaming/glitch effect for "Powered by" */}
            <div className="group relative flex items-center justify-center p-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all cursor-default">
              <span className="text-white/40 mr-2">Powered by</span>
              <div className="relative inline-block overflow-hidden">
                <span className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-emerald-600 relative z-10 group-hover:animate-glitch-1">Monad</span>
                <span className="font-bold text-emerald-500 absolute top-0 left-0 -translate-x-[2px] opacity-0 group-hover:opacity-100 group-hover:animate-glitch-2">Monad</span>
                <span className="font-bold text-blue-500 absolute top-0 left-0 translate-x-[2px] opacity-0 group-hover:opacity-100 group-hover:animate-glitch-3">Monad</span>
              </div>
              <span className="text-white/30 mx-2">×</span>
              <div className="relative inline-block overflow-hidden">
                <span className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600 relative z-10 group-hover:animate-glitch-1">Groq AI</span>
                <span className="font-bold text-cyan-400 absolute top-0 left-0 -translate-x-[2px] opacity-0 group-hover:opacity-100 group-hover:animate-glitch-2">Groq AI</span>
                <span className="font-bold text-red-500 absolute top-0 left-0 translate-x-[2px] opacity-0 group-hover:opacity-100 group-hover:animate-glitch-3">Groq AI</span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 border border-white/10 rounded-full">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  healthStatus === 'ok'
                    ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse'
                    : healthStatus === 'degraded'
                      ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)] animate-pulse'
                      : healthStatus === 'down'
                        ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]'
                        : 'bg-white/30'
                }`}
              />
              <span className="text-xs font-medium text-white/50 tracking-wider uppercase">
                {healthStatus === 'ok' ? 'System Operational' : healthStatus === 'degraded' ? 'Degraded Performance' : healthStatus === 'down' ? 'System Offline' : 'Checking Status...'}
              </span>
            </div>
            
            <div className="text-right">
              <Link
                href="https://www.indiehub.co.in"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-1.5 text-white/40 hover:text-white transition-colors"
              >
                <span className="text-xs uppercase tracking-widest">Built by</span>
                <span className="font-bold">INDIE HUB</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes glitch-1 {
          0% { clip-path: inset(20% 0 80% 0); transform: translate(-2px, 1px); }
          20% { clip-path: inset(60% 0 10% 0); transform: translate(2px, -1px); }
          40% { clip-path: inset(40% 0 50% 0); transform: translate(-2px, 2px); }
          60% { clip-path: inset(80% 0 5% 0); transform: translate(2px, -2px); }
          80% { clip-path: inset(10% 0 70% 0); transform: translate(-1px, 1px); }
          100% { clip-path: inset(30% 0 50% 0); transform: translate(1px, -1px); }
        }
        @keyframes glitch-2 {
          0% { clip-path: inset(10% 0 60% 0); transform: translate(2px, -1px); }
          20% { clip-path: inset(30% 0 20% 0); transform: translate(-2px, 2px); }
          40% { clip-path: inset(70% 0 10% 0); transform: translate(2px, -2px); }
          60% { clip-path: inset(20% 0 50% 0); transform: translate(-1px, 1px); }
          80% { clip-path: inset(50% 0 30% 0); transform: translate(1px, -1px); }
          100% { clip-path: inset(5% 0 80% 0); transform: translate(-2px, 1px); }
        }
        @keyframes glitch-3 {
          0% { clip-path: inset(50% 0 30% 0); transform: translate(-1px, 2px); }
          20% { clip-path: inset(10% 0 50% 0); transform: translate(1px, -2px); }
          40% { clip-path: inset(80% 0 10% 0); transform: translate(-2px, 1px); }
          60% { clip-path: inset(30% 0 40% 0); transform: translate(2px, -1px); }
          80% { clip-path: inset(5% 0 70% 0); transform: translate(-1px, -2px); }
          100% { clip-path: inset(60% 0 20% 0); transform: translate(1px, 2px); }
        }
        .animate-glitch-1 { animation: glitch-1 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) both infinite; }
        .animate-glitch-2 { animation: glitch-2 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both infinite; }
        .animate-glitch-3 { animation: glitch-3 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) both infinite; }
      `}} />
      <AdminLoginModal open={showAdminModal} onOpenChange={setShowAdminModal} />
    </footer>
  );
}
