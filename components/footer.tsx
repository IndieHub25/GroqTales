'use client';

import {
  Twitter,
  Github,
  Linkedin,
  MessageCircle,
  Heart,
  Users,
  ExternalLink,
  Sparkles,
  PenSquare,
  Frame,
  FileText,
  HelpCircle,
  GraduationCap,
  Wallet,
  FileCheck,
  Shield,
  Cookie,
  Mail,
  BookOpen,
} from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';

import { AdminLoginModal } from './admin-login-modal';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [showAdminModal, setShowAdminModal] = useState(false);

  const socialLinks = [
    {
      icon: <Github className="h-5 w-5" />,
      url: 'https://github.com/Drago-03/GroqTales.git',
      label: 'GitHub',
    },
    {
      icon: <Linkedin className="h-5 w-5" />,
      url: 'https://www.linkedin.com/company/indie-hub-exe/?viewAsMember=true',
      label: 'LinkedIn',
    },
  ];

  return (
    <footer className="relative mt-20">
      {/* Comic Container */}
      <div className="bg-card dark:bg-slate-950 border-t-4 border-foreground dark:border-slate-800 transition-colors duration-500">
        <div className="container mx-auto px-6 pt-16 pb-8">
          {/* Product of Indie Hub Section */}
          <div className="flex flex-col items-center justify-center mb-12 text-center">
            <div className="inline-block p-4 border-4 border-foreground bg-secondary mb-4 shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_var(--shadow-color)] transition-all">
              <p className="font-bold text-sm text-foreground tracking-widest uppercase mb-2">
                Architected by
              </p>
              <Link
                href="https://www.indiehub.co.in"
                target="_blank"
                className="group flex items-center space-x-2"
              >
                <span className="text-2xl font-black tracking-tighter group-hover:text-primary transition-colors">
                  INDIE HUB
                </span>
                <ExternalLink className="w-4 h-4 text-foreground" />
              </Link>
            </div>
            <p className="text-xs font-bold text-foreground max-w-md uppercase">
              Forging digital experiences with pixel-perfect precision and comic
              soul.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12 border-b-4 border-foreground pb-12">
            {/* Brand Section - Logo Only */}
            <div className="space-y-6">
              <div className="flex items-center justify-center md:justify-start">
                <div className="relative group">
                  <div className="absolute -inset-2 bg-gradient-to-r from-primary to-blue-500 rounded-lg blur opacity-25 group-hover:opacity-40 transition duration-300" />
                  <img
                    src="/logo.png"
                    alt="Logo"
                    className="relative w-48 h-48 object-contain border-4 border-foreground bg-neutral-900 p-2 shadow-[6px_6px_0px_0px_var(--shadow-color)] hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_var(--shadow-color)] transition-all duration-300"
                  />
                </div>
              </div>
              <p className="text-sm font-bold text-foreground leading-relaxed border-l-4 border-foreground pl-4 text-center md:text-left">
                Empowering creators with AI-driven storytelling and Web3
                ownership.
                <span className="block mt-2 text-xs text-muted-foreground">
                  Create • Mint • Own • Trade
                </span>
              </p>

              <div className="flex space-x-3 pt-2 justify-center md:justify-start">
                {socialLinks.map((link) => (
                  <Link
                    key={link.url}
                    href={link.url}
                    className="p-2 border-4 border-foreground rounded-none hover:bg-primary hover:text-white transition-all duration-300 shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_var(--shadow-color)]"
                  >
                    {link.icon}
                    <span className="sr-only">{link.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Links Sections */}
            {[
              {
                title: 'EXPLORE',
                links: [
                  { href: '/genres', label: 'Genres', icon: Sparkles },
                  { href: '/community', label: 'Community', icon: Users },
                  { href: '/create', label: 'Create Story', icon: PenSquare },
                  { href: '/nft-gallery', label: 'NFT Gallery', icon: Frame },
                  {
                    href: '/nft-marketplace',
                    label: 'NFT Marketplace',
                    icon: Wallet,
                  },
                ],
              },
              {
                title: 'RESOURCES',
                links: [
                  { href: '/docs', label: 'Documentation', icon: FileText },
                  { href: '/faq', label: 'FAQ', icon: HelpCircle },
                ],
              },
              {
                title: 'LEGAL',
                links: [
                  {
                    href: '/terms',
                    label: 'Terms of Service',
                    icon: FileCheck,
                  },
                  { href: '/privacy', label: 'Privacy Policy', icon: Shield },
                  { href: '/cookies', label: 'Cookie Policy', icon: Cookie },
                  { href: '/contact', label: 'Contact Us', icon: Mail },
                ],
              },
            ].map((section) => (
              <div key={section.title}>
                <h3 className="font-black text-lg mb-6 text-foreground border-b-4 border-foreground inline-block pb-1 uppercase">
                  {section.title}
                </h3>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="group flex items-center text-sm font-bold text-foreground hover:text-primary transition-colors uppercase"
                      >
                        <span className="w-2 h-2 bg-foreground mr-2 opacity-0 group-hover:opacity-100 transition-opacity border border-foreground" />
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Footer Bottom */}
          <div className="flex flex-col md:flex-row justify-between items-center font-bold text-xs text-foreground uppercase space-y-4 md:space-y-0">
            <p className="flex items-center space-x-2">
              <span>&copy; {currentYear} All Rights Reserved</span>
              <span className="hidden md:inline mx-2">•</span>
              <span className="flex items-center space-x-1">
                <span>Powered by</span>
                <span className="text-primary">Monad</span>
                <span>×</span>
                <span className="text-primary">Groq AI</span>
              </span>
            </p>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <span className="w-3 h-3 bg-green-500 border-2 border-foreground mr-2 animate-pulse" />
                <span className="text-green-700">Platform Online</span>
              </div>
              <span className="hidden md:inline">•</span>
              <Link
                href="https://www.indiehub.co.in"
                target="_blank"
                className="hover:text-primary transition-colors flex items-center space-x-1"
              >
                <span>Built by</span>
                <span className="font-black">INDIE HUB</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <AdminLoginModal open={showAdminModal} onOpenChange={setShowAdminModal} />
    </footer>
  );
}
