'use client';

import { motion } from 'framer-motion';
import {
  Sparkles,
  BookText,
  Wallet,
  ArrowLeft,
  PenSquare,
  BookOpen,
  Zap,
  Star,
  Activity
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState, useEffect, Suspense } from 'react';

import AIStoryGenerator from '@/components/ai-story-generator';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

export default function AIStoryGeneratorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center bg-black">
          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
            <Sparkles className="w-12 h-12 text-emerald-500" />
          </motion.div>
        </div>
      }
    >
      <AIStoryContent />
    </Suspense>
  );
}

function AIStoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [navigatedFrom, setNavigatedFrom] = useState<string | null>(null);

  const source = searchParams.get('source');
  const genre = searchParams.get('genre') || 'fantasy';
  const format = searchParams.get('format') || 'free';

  useEffect(() => {
    try {
      const storyData = { type: 'ai', format, genre, redirectToCreate: !!source, timestamp: Date.now() };
      localStorage.setItem('storyCreationData', JSON.stringify(storyData));
    } catch (error) {
      console.error('Error setting up story creation data:', error);
    }
  }, [source, genre, format]);

  useEffect(() => {
    if (source) {
      if (source === 'story') {
        setNavigatedFrom('story');
        toast({
          title: 'Spark Ignited',
          description: 'Ready to forge a new path?',
          className: 'bg-black/80 border border-white/10 text-white backdrop-blur-md',
        });
      } else {
        setNavigatedFrom('homepage');
        toast({
          title: 'Welcome, Creator',
          description: "Initialize your narrative sequence.",
          className: 'bg-black/80 border border-white/10 text-white backdrop-blur-md',
        });
      }
    } else {
      setNavigatedFrom('direct');
    }
  }, [toast, source]);

  return (
    <div className="min-h-screen relative bg-black text-white font-sans overflow-hidden">
      {/* Cinematic Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.1),_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(59,130,246,0.1),_transparent_50%)]" />
        <div className="absolute w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="container mx-auto px-4 py-8 relative z-10"
      >
        <div className="max-w-7xl mx-auto">
          {/* Navigation Bar */}
          <header className="flex justify-between items-center mb-12">
            <Button
              variant="ghost"
              className="group flex items-center hover:bg-white/5 text-white/70 hover:text-white rounded-full px-4 py-2 transition-all"
              onClick={() => {
                if (navigatedFrom === 'story') router.back();
                else if (source?.includes('stories')) router.push('/stories');
                else router.push('/');
              }}
            >
              <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium tracking-wide">
                Return to {navigatedFrom === 'story' ? 'Story' : 'Base'}
              </span>
            </Button>

            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full">
              <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-400 tracking-widest uppercase">Engine Online</span>
            </div>
          </header>

          {/* Header Section */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-md"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-medium tracking-wider uppercase text-white/80">Groq AI Studio</span>
              </motion.div>
              
              <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-white/50">
                Architect Your <br className="hidden md:block"/> Universe
              </h1>
              <p className="text-lg text-white/50 max-w-xl leading-relaxed">
                Configure your narrative parameters below. Our neural engine will synthesize your specifications into a cohesive, mintable legacy.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Zap, title: 'Speed', val: '< 2.5s', color: 'text-blue-400' },
                { icon: BookText, title: 'Tokens', val: '8K Context', color: 'text-purple-400' },
                { icon: Wallet, title: 'Network', val: 'Monad Testnet', color: 'text-emerald-400' },
                { icon: Star, title: 'Quality', val: 'Ultra-HD', color: 'text-amber-400' },
              ].map((stat, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm hover:bg-white/10 transition-colors">
                  <stat.icon className={`w-6 h-6 mb-3 ${stat.color} opacity-80`} />
                  <p className="text-xs text-white/40 uppercase tracking-widest mb-1">{stat.title}</p>
                  <p className="text-lg font-semibold text-white/90">{stat.val}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Main Generator Component Wrapper */}
          <div className="relative">
            {/* Subtle glow behind the generator */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-purple-500/5 blur-3xl -z-10 rounded-[3rem]" />
            <AIStoryGenerator className="relative z-10" />
          </div>

        </div>
      </motion.div>
    </div>
  );
}
