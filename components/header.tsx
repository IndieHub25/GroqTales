'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { ConnectWalletButton } from '@/components/connect-wallet-button';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: '/create/ai-story', label: 'CREATE' },
    { href: '/genres', label: 'GENRES' },
    { href: '/community', label: 'COMMUNITY' },
    { href: '/nft-gallery', label: 'NFT GALLERY' },
    { href: '/nft-marketplace', label: 'MARKETPLACE' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b-4 border-black" style={{ backgroundColor: '#000000' }}>
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1">
          <span className="font-display text-4xl font-bold text-white uppercase tracking-tight">
            GROQ
            <span style={{ color: '#8B0000' }}>TALES</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-12">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-subheading text-base font-black text-white uppercase tracking-wide hover:text-primary transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Connect Wallet Button */}
        <ConnectWalletButton />

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white p-2 hover:opacity-80"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle mobile menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X size={32} /> : <Menu size={32} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div
          className="md:hidden absolute top-20 left-0 right-0 border-t-4 border-black z-50"
          style={{ backgroundColor: '#000000' }}
        >
          <nav className="flex flex-col p-6 gap-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="font-subheading text-base font-black text-white uppercase tracking-wide hover:text-primary transition-colors py-2 border-b-2 border-gray-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-4">
              <ConnectWalletButton />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
