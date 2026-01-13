'use client';

import { motion } from 'framer-motion';
import {
  BookOpen,
  Sparkles,
  ArrowRight,
  PenSquare,
  Wallet,
  Zap,
  Star,
  Rocket,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';

import { FeaturedCreators } from '@/components/featured-creators';
import { useWeb3 } from '@/components/providers/web3-provider';
import { TrendingStories } from '@/components/trending-stories';
import { Button } from '@/components/ui/button';

export default function Home() {
  const { account, connectWallet } = useWeb3();
  const router = useRouter();

  return (
    <main className="flex min-h-screen flex-col relative bg-yellow-50 dark:dark-premium-bg overflow-hidden transition-colors duration-500">
      {/* Premium Background Glows for Dark Mode */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-0 dark:opacity-100 transition-opacity duration-1000">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] right-[-10%] w-[35%] h-[35%] bg-purple-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />
      </div>

      {/* Comic Halftone Background Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#000_1px,transparent_1px)] dark:bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.03] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative py-24 border-b-8 border-foreground bg-yellow-400 dark:bg-slate-900/80 dark:backdrop-blur-sm overflow-hidden transition-colors duration-500">
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 space-y-8">
              <motion.div
                initial={false}
                animate={{ opacity: 1, y: 0 }}
                className="inline-block bg-card border-4 border-foreground px-6 py-3 shadow-[8px_8px_0px_0px_var(--shadow-color)] transform -rotate-2"
              >
                <span className="font-black text-xl md:text-2xl text-foreground uppercase tracking-widest">
                  The Future of Storytelling
                </span>
              </motion.div>

              <motion.h1
                initial={false}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-6xl md:text-8xl font-black text-foreground uppercase leading-none [text-shadow:4px_4px_0px_#fff,8px_8px_0px_#000] dark:[text-shadow:0_0_15px_rgba(59,130,246,0.4),0_0_30px_rgba(139,92,246,0.2)]"
              >
                Create <br />
                <span className="text-white dark:bg-gradient-to-r dark:from-cyan-400 dark:to-blue-500 dark:bg-clip-text dark:text-transparent [text-shadow:4px_4px_0px_#000] dark:[text-shadow:none] dark:drop-shadow-[0_0_12px_rgba(34,211,238,0.6)]">
                  Mint
                </span>{' '}
                <br />& Share
              </motion.h1>

              <motion.p
                initial={false}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-2xl font-bold text-foreground border-l-8 border-foreground pl-6 py-4 bg-card/80 shadow-[4px_4px_0px_0px_var(--shadow-color)]"
              >
                Unleash your imagination with AI. Turn your stories into
                valuable NFTs on the Monad blockchain.
              </motion.p>

              <motion.div
                initial={false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-wrap gap-6 pt-4"
              >
                <Link href="/create/ai-story">
                  <Button
                    size="lg"
                    className="bg-red-500 text-white border-4 border-foreground shadow-[8px_8px_0px_0px_var(--shadow-color)] hover:shadow-[12px_12px_0px_0px_var(--shadow-color)] hover:-translate-y-1 transition-all text-xl font-black uppercase px-8 py-6 h-auto rounded-none"
                  >
                    <PenSquare className="mr-3 h-6 w-6" />
                    Start Creating
                  </Button>
                </Link>

                {!account && (
                  <Button
                    onClick={connectWallet}
                    size="lg"
                    className="bg-card text-foreground border-4 border-foreground shadow-[8px_8px_0px_0px_var(--shadow-color)] hover:shadow-[12px_12px_0px_0px_var(--shadow-color)] hover:-translate-y-1 transition-all text-xl font-black uppercase px-8 py-6 h-auto rounded-none"
                  >
                    <Wallet className="mr-3 h-6 w-6" />
                    Connect Wallet
                  </Button>
                )}
              </motion.div>
            </div>

            <div className="lg:w-1/2 relative">
              <motion.div
                animate={{ rotate: [2, -2, 2] }}
                transition={{
                  repeat: Infinity,
                  duration: 5,
                  ease: 'easeInOut',
                }}
                className="relative z-10"
              >
                <div className="bg-card border-8 border-foreground p-4 shadow-[20px_20px_0px_0px_var(--shadow-color)]">
                  <div className="aspect-square relative overflow-hidden border-4 border-foreground bg-blue-400 dark:bg-blue-600">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Rocket className="w-32 h-32 text-white animate-bounce" />
                    </div>
                    {/* Comic Speech Bubble */}
                    <div className="absolute -top-6 -right-6 bg-card border-4 border-foreground px-6 py-4 rounded-[50%] shadow-[8px_8px_0px_0px_var(--shadow-color)] z-20">
                      <span className="font-black text-2xl text-foreground">
                        BOOM!
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 border-t-4 border-foreground pt-4">
                    <h3 className="text-3xl font-black uppercase">
                      AI Powered
                    </h3>
                    <p className="font-bold text-lg">
                      Generate stories in seconds!
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Decorative Elements */}
              <Star className="absolute top-0 right-0 w-12 h-12 text-yellow-400 fill-current stroke-foreground stroke-2 animate-spin-slow" />
              <Zap className="absolute bottom-0 left-0 w-16 h-16 text-blue-500 fill-current stroke-foreground stroke-2 animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-card dark:bg-slate-900/40 dark:backdrop-blur-md border-b-8 border-foreground transition-colors duration-500">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-7xl font-black uppercase mb-4 bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-slate-300 dark:to-white bg-clip-text text-transparent [text-shadow:4px_4px_0px_rgba(0,0,0,0.05)] dark:[text-shadow:4px_4px_0px_rgba(255,255,255,0.05)]">
              Why GroqTales?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'AI Generation',
                desc: 'Powered by Groq for lightning-fast story creation.',
                icon: <Zap className="w-12 h-12" />,
                color: 'bg-cyan-300 dark:bg-cyan-900/30',
              },
              {
                title: 'NFT Ownership',
                desc: 'Your stories are truly yours on the blockchain.',
                icon: <Wallet className="w-12 h-12" />,
                color: 'bg-pink-300 dark:bg-pink-900/30',
              },
              {
                title: 'Community',
                desc: 'Read, share, and trade with other creators.',
                icon: <Sparkles className="w-12 h-12" />,
                color: 'bg-green-300 dark:bg-green-900/30',
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05, rotate: 1 }}
                className={`${feature.color} border-4 border-foreground p-8 shadow-[12px_12px_0px_0px_var(--shadow-color)]`}
              >
                <div className="bg-card border-4 border-foreground w-20 h-20 flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_var(--shadow-color)]">
                  {feature.icon}
                </div>
                <h3 className="text-3xl font-black uppercase mb-4">
                  {feature.title}
                </h3>
                <p className="text-xl font-bold border-l-4 border-foreground pl-4 bg-card/50 py-2">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Section */}
      <section className="py-20 bg-pink-100 dark:bg-slate-900/60 dark:backdrop-blur-sm border-b-8 border-foreground transition-colors duration-500">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-4xl font-black uppercase bg-card border-4 border-foreground px-6 py-2 shadow-[6px_6px_0px_0px_var(--shadow-color)]">
              Trending Now
            </h2>
            <Link href="/nft-gallery">
              <Button className="bg-black dark:bg-white dark:text-black text-white border-4 border-transparent hover:bg-gray-800 font-bold uppercase">
                View All <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
          <TrendingStories />
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-blue-600 dark:bg-indigo-950/80 dark:backdrop-blur-md border-b-8 border-foreground text-center transition-colors duration-500">
        <div className="container mx-auto px-4">
          <h2 className="text-6xl md:text-8xl font-black text-white uppercase mb-8 [text-shadow:6px_6px_0px_#000]">
            Ready to Start?
          </h2>
          <Link href="/create/ai-story">
            <Button className="bg-yellow-400 dark:bg-yellow-600 text-foreground border-4 border-foreground text-2xl font-black uppercase px-12 py-8 h-auto shadow-[12px_12px_0px_0px_#000] hover:shadow-[16px_16px_0px_0px_#000] hover:-translate-y-1 transition-all rounded-none">
              Create Your Story
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
