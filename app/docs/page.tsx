'use client';

import {
  BookOpen,
  Wallet,
  HelpCircle,
  ChevronRight,
  ChevronDown,
  Github,
  ExternalLink,
  Zap,
  PenSquare,
  Layers,
  Shield,
  Sparkles,
  Rocket,
  Globe,
  CheckCircle2,
  Copy,
  ArrowRight,
  Star,
  Users,
  MessageCircle,
} from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';

// Floating GitHub button component
import { FloatingGithub } from '../terms/page';

// Step card for the process sections
function StepCard({
  number,
  title,
  description,
  action,
  actionHref,
  icon: Icon,
  color,
}: {
  number: string;
  title: string;
  description: string;
  action: string;
  actionHref: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div
      className="relative border-4 border-foreground bg-card p-6 transition-all hover:-translate-y-1 group"
      style={{ boxShadow: '6px 6px 0px 0px var(--shadow-color)' }}
    >
      {/* Step number badge */}
      <div
        className="absolute -top-4 -left-2 w-10 h-10 flex items-center justify-center text-white font-black text-sm border-3 border-foreground z-10"
        style={{ backgroundColor: color, boxShadow: '2px 2px 0px 0px var(--shadow-color)' }}
      >
        {number}
      </div>

      <div className="flex items-start gap-4 mt-2">
        <div
          className="w-12 h-12 flex-shrink-0 flex items-center justify-center border-2 border-foreground/20 text-white"
          style={{ backgroundColor: color }}
        >
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className="font-black text-base uppercase text-foreground mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground font-bold leading-relaxed mb-4">{description}</p>
          <Button
            asChild
            size="sm"
            className="border-2 border-foreground font-black uppercase rounded-none text-xs bg-[var(--comic-red)] text-white hover:bg-[var(--comic-red)]/90"
            style={{ boxShadow: '3px 3px 0px 0px var(--shadow-color)' }}
          >
            <Link href={actionHref}>
              {action} <ChevronRight className="ml-1 w-3 h-3" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

// FAQ accordion item
function FaqItem({
  question,
  answer,
  emoji,
  index,
}: {
  question: string;
  answer: string;
  emoji: string;
  index: number;
}) {
  const [open, setOpen] = useState(false);
  const panelId = `faq-panel-${index}`;
  return (
    <div
      className="border-4 border-foreground bg-card overflow-hidden transition-all"
      style={{ boxShadow: open ? '4px 4px 0px 0px var(--comic-purple)' : '4px 4px 0px 0px var(--shadow-color)' }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-5 text-left hover:bg-muted/30 transition-colors"
        aria-expanded={open}
        aria-controls={panelId}
      >
        <span className="text-2xl">{emoji}</span>
        <span className="flex-1 font-black text-sm uppercase text-foreground">{question}</span>
        <ChevronDown
          className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div id={panelId} className="px-5 pb-5 border-t-2 border-foreground/10 pt-4">
          <p className="text-sm text-muted-foreground font-bold leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}

// Quick link card
function QuickLink({
  icon: Icon,
  title,
  desc,
  href,
  color,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
  href: string;
  color: string;
}) {
  return (
    <Link href={href}>
      <div
        className="border-4 border-foreground bg-card p-5 h-full transition-all hover:-translate-y-1 group cursor-pointer"
        style={{ boxShadow: '6px 6px 0px 0px var(--shadow-color)' }}
      >
        <div
          className="w-10 h-10 flex items-center justify-center text-white border-2 border-foreground/20 mb-3"
          style={{ backgroundColor: color }}
        >
          <Icon className="w-5 h-5" />
        </div>
        <h3 className="font-black text-sm uppercase text-foreground mb-1">{title}</h3>
        <p className="text-xs text-muted-foreground font-bold">{desc}</p>
        <span className="inline-flex items-center gap-1 mt-3 text-xs font-black uppercase text-[var(--comic-purple)] group-hover:underline">
          Learn more <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </Link>
  );
}

export default function DocsPage() {
  return (
    <div className="min-h-screen">
      <FloatingGithub />

      <div className="container mx-auto px-4 py-16 max-w-5xl">
        {/* ═══════════ HERO SECTION ═══════════ */}
        <div className="text-center mb-16">
          <div
            className="inline-block px-4 py-1.5 mb-6 text-xs font-black uppercase tracking-[0.3em] text-[var(--comic-cyan)] border-2 border-[var(--comic-cyan)] bg-[var(--comic-cyan)]/10"
            style={{ boxShadow: '3px 3px 0px 0px var(--shadow-color)' }}
          >
            <BookOpen className="w-3 h-3 inline mr-2" />
            Documentation
          </div>
          <h1 className="comic-display text-5xl md:text-7xl text-foreground mb-4">
            Docs & Resources
          </h1>
          <p className="text-base text-muted-foreground font-bold max-w-xl mx-auto leading-relaxed">
            Everything you need to create, mint, and share AI-generated story NFTs
          </p>
        </div>

        {/* ═══════════ QUICK LINKS GRID ═══════════ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          <QuickLink icon={PenSquare} title="Create Stories" desc="AI-powered story creation" href="/create/ai-story" color="var(--comic-red)" />
          <QuickLink icon={Wallet} title="Wallet Setup" desc="Connect your Monad wallet" href="#wallet-setup" color="var(--comic-cyan)" />
          <QuickLink icon={Layers} title="Mint NFTs" desc="Turn stories into NFTs" href="#minting" color="var(--comic-purple)" />
          <QuickLink icon={Users} title="Community" desc="Join fellow creators" href="/community/creators" color="var(--comic-green)" />
        </div>

        {/* ═══════════ GETTING STARTED ═══════════ */}
        <section className="mb-20">
          <div className="flex items-center gap-3 mb-8">
            <div
              className="w-10 h-10 flex items-center justify-center text-white border-2 border-foreground"
              style={{ backgroundColor: 'var(--comic-cyan)', boxShadow: '3px 3px 0px 0px var(--shadow-color)' }}
            >
              <Rocket className="w-5 h-5" />
            </div>
            <h2 className="comic-display text-3xl text-foreground">Getting Started</h2>
          </div>

          <div className="space-y-8">
            <StepCard
              number="01"
              title="Create Your Account"
              description="Sign up using your email or connect directly with your Web3 wallet. Complete your profile to start creating and collecting stories on GroqTales."
              action="Create Account"
              actionHref="/auth/signup"
              icon={PenSquare}
              color="var(--comic-red)"
            />
            <StepCard
              number="02"
              title="Set Up Your Wallet"
              description="Connect your Monad wallet to mint and collect story NFTs. New to Web3? Don't worry — follow our step-by-step guide below."
              action="Wallet Guide"
              actionHref="#wallet-setup"
              icon={Wallet}
              color="var(--comic-cyan)"
            />
            <StepCard
              number="03"
              title="Create Your First Story"
              description="Use our Groq-powered AI to generate unique stories. Choose from 12 genres, customize with 70+ options, then mint as an NFT or share with the community."
              action="Start Creating"
              actionHref="/create/ai-story"
              icon={Sparkles}
              color="var(--comic-purple)"
            />
          </div>
        </section>

        {/* ═══════════ WALLET SETUP ═══════════ */}
        <section id="wallet-setup" className="mb-20 scroll-mt-20">
          <div className="flex items-center gap-3 mb-8">
            <div
              className="w-10 h-10 flex items-center justify-center text-white border-2 border-foreground"
              style={{ backgroundColor: 'var(--comic-cyan)', boxShadow: '3px 3px 0px 0px var(--shadow-color)' }}
            >
              <Wallet className="w-5 h-5" />
            </div>
            <h2 className="comic-display text-3xl text-foreground">Wallet Setup</h2>
          </div>

          <div
            className="border-4 border-foreground bg-card overflow-hidden"
            style={{ boxShadow: '6px 6px 0px 0px var(--shadow-color)' }}
          >
            {/* Installing */}
            <div className="p-6 border-b-4 border-foreground/10">
              <h3 className="font-black text-base uppercase text-foreground mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-[var(--comic-cyan)]" />
                Installing Monad Wallet
              </h3>
              <div className="space-y-3">
                {[
                  { step: '1', text: 'Visit the official Monad wallet website', link: 'https://monad.xyz', linkText: 'monad.xyz' },
                  { step: '2', text: 'Download and install the wallet extension for your browser' },
                  { step: '3', text: 'Create a new wallet and securely store your recovery phrase' },
                  { step: '4', text: 'Add MONAD tokens to your wallet for transactions' },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-3">
                    <div className="w-7 h-7 flex-shrink-0 flex items-center justify-center bg-[var(--comic-cyan)] text-white font-black text-xs border border-foreground/20">
                      {item.step}
                    </div>
                    <div className="text-sm text-muted-foreground font-bold pt-1">
                      {item.text}
                      {item.link && (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 ml-1 text-[var(--comic-purple)] hover:underline font-black"
                        >
                          {item.linkText} <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Connecting */}
            <div className="p-6">
              <h3 className="font-black text-base uppercase text-foreground mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-[var(--comic-green)]" />
                Connecting to GroqTales
              </h3>
              <div className="space-y-3">
                {[
                  'Click the "Connect Wallet" button in the navigation bar',
                  'Select Monad from the available wallet options',
                  'Approve the connection request in your wallet',
                  'Your wallet address will appear in the top right corner',
                ].map((text, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-[var(--comic-green)] mt-0.5" />
                    <p className="text-sm text-muted-foreground font-bold">{text}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <Button
                  asChild
                  className="border-2 border-foreground font-black uppercase rounded-none text-xs bg-[var(--comic-cyan)] text-white"
                  style={{ boxShadow: '3px 3px 0px 0px var(--shadow-color)' }}
                >
                  <Link href="/profile/settings">
                    Manage Wallet Settings <ChevronRight className="ml-1 w-3 h-3" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════ HOW MINTING WORKS ═══════════ */}
        <section id="minting" className="mb-20 scroll-mt-20">
          <div className="flex items-center gap-3 mb-8">
            <div
              className="w-10 h-10 flex items-center justify-center text-white border-2 border-foreground"
              style={{ backgroundColor: 'var(--comic-purple)', boxShadow: '3px 3px 0px 0px var(--shadow-color)' }}
            >
              <Layers className="w-5 h-5" />
            </div>
            <h2 className="comic-display text-3xl text-foreground">How Minting Works</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                emoji: '✍️',
                title: 'Write',
                desc: 'Generate a story using Groq AI. Customize genre, length, tone, and 70+ other options.',
                color: 'var(--comic-red)',
              },
              {
                emoji: '🎨',
                title: 'Preview & Edit',
                desc: 'Review your story, make edits, and add cover art. Perfect it before it goes on-chain.',
                color: 'var(--comic-yellow)',
              },
              {
                emoji: '🔗',
                title: 'Mint',
                desc: 'Hit the Mint button. Your story becomes an NFT on the Monad blockchain — forever yours.',
                color: 'var(--comic-purple)',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="border-4 border-foreground bg-card p-6 text-center transition-all hover:-translate-y-1"
                style={{ boxShadow: '6px 6px 0px 0px var(--shadow-color)' }}
              >
                <span className="text-4xl block mb-3">{item.emoji}</span>
                <h3 className="font-black text-base uppercase text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground font-bold leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════ FAQ SECTION ═══════════ */}
        <section className="mb-20">
          <div className="flex items-center gap-3 mb-8">
            <div
              className="w-10 h-10 flex items-center justify-center text-white border-2 border-foreground"
              style={{ backgroundColor: 'var(--comic-orange)', boxShadow: '3px 3px 0px 0px var(--shadow-color)' }}
            >
              <HelpCircle className="w-5 h-5" />
            </div>
            <h2 className="comic-display text-3xl text-foreground">FAQ</h2>
          </div>

          <div className="space-y-4">
            <FaqItem
              index={0}
              emoji="🤖"
              question="What is GroqTales?"
              answer="GroqTales is a platform that combines AI-powered storytelling with blockchain technology. Create unique stories using Groq's lightning-fast AI, mint them as NFTs on the Monad blockchain, and share them with a global community of readers and collectors."
            />
            <FaqItem
              index={1}
              emoji="⚡"
              question="How does story generation work?"
              answer="Our platform uses Groq's advanced AI models to generate unique stories based on your prompts and preferences. Choose from 12 genres, customize over 70 parameters (tone, length, characters, setting, etc.), and get your story in seconds. You can edit and refine the output before publishing or minting."
            />
            <FaqItem
              index={2}
              emoji="💰"
              question="What are the fees?"
              answer="Story generation is completely free — no limits! When minting NFTs, you pay only the Monad network gas fees, which are typically very low (fractions of a cent). We take a 5% commission only on secondary NFT sales."
            />
            <FaqItem
              index={3}
              emoji="🏪"
              question="How do I sell my story NFTs?"
              answer="After minting, your NFT appears in your profile. You can list it for sale on our marketplace by setting a price in MONAD tokens. Buyers purchase directly through the platform, and you receive payment instantly. You also earn royalties on future resales."
            />
            <FaqItem
              index={4}
              emoji="🔒"
              question="Is my content safe?"
              answer="Absolutely. Once minted as an NFT, your story is permanently recorded on the Monad blockchain. You retain full copyright and ownership. The blockchain provides tamper-proof provenance — nobody can claim your work as their own."
            />
            <FaqItem
              index={5}
              emoji="🌐"
              question="Do I need crypto experience?"
              answer="Not at all! You can start creating stories without any crypto. When you're ready to mint, our wallet setup guide walks you through everything step-by-step. The Monad blockchain makes the process fast and affordable."
            />
          </div>
        </section>

        {/* ═══════════ COMMUNITY & RESOURCES ═══════════ */}
        <section className="mb-16">
          <div
            className="border-4 border-foreground bg-gradient-to-r from-[var(--comic-purple)] to-[var(--comic-cyan)] p-8 text-white relative overflow-hidden"
            style={{ boxShadow: '6px 6px 0px 0px var(--shadow-color)' }}
          >
            {/* Decorative elements */}
            <div className="absolute top-4 right-8 w-20 h-20 border-4 border-white/10 rounded-full" />
            <div className="absolute bottom-4 right-32 w-12 h-12 border-3 border-white/10 rounded-full" />

            <div className="relative z-10 text-center">
              <h2 className="comic-display text-3xl md:text-4xl mb-3" style={{ textShadow: '3px 3px 0px rgba(0,0,0,0.3)' }}>
                Join the Community
              </h2>
              <p className="text-white/80 font-bold max-w-lg mx-auto mb-6 text-sm">
                Have more questions? Connect with fellow creators and the GroqTales team
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button
                  asChild
                  className="bg-white text-foreground border-2 border-foreground font-black uppercase rounded-none text-xs"
                  style={{ boxShadow: '3px 3px 0px 0px rgba(0,0,0,0.3)' }}
                >
                  <Link href="https://github.com/IndieHub25/GroqTales" target="_blank" rel="noopener noreferrer">
                    <Github className="mr-2 w-4 h-4" /> GitHub
                  </Link>
                </Button>
                <Button
                  asChild
                  className="bg-white/20 backdrop-blur-sm text-white border-2 border-white/40 font-black uppercase rounded-none text-xs"
                  style={{ boxShadow: '3px 3px 0px 0px rgba(0,0,0,0.2)' }}
                >
                  <Link href="/contact">
                    <MessageCircle className="mr-2 w-4 h-4" /> Contact Us
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
