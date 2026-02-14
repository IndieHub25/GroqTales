'use client';

import Link from 'next/link';

export function Header() {
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

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-12">
          <Link
            href="/genres"
            className="font-subheading text-base font-black text-white uppercase tracking-wide hover:text-primary transition-colors"
          >
            GENRES
          </Link>
          <Link
            href="/community"
            className="font-subheading text-base font-black text-white uppercase tracking-wide hover:text-primary transition-colors"
          >
            COMMUNITY
          </Link>
          <Link
            href="/nft-gallery"
            className="font-subheading text-base font-black text-white uppercase tracking-wide hover:text-primary transition-colors"
          >
            NFT GALLERY
          </Link>
          <Link
            href="/nft-marketplace"
            className="font-subheading text-base font-black text-white uppercase tracking-wide hover:text-primary transition-colors"
          >
            MARKETPLACE
          </Link>
        </nav>

        {/* Connect Wallet Button */}
        <button
          className="font-display text-lg font-bold text-white uppercase px-8 py-3 transition-all hover:opacity-80 tracking-wide"
          style={{
            backgroundColor: '#8B0000',
            border: 'none',
          }}
        >
          CONNECT WALLET
        </button>
      </div>
    </header>
  );
}
