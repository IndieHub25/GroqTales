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
        <div className="font-bangers text-4xl text-center p-10 animate-bounce">
          LOADING AWESOMENESS...
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

  // Get parameters from URL
  const source = searchParams.get('source');
  const genre = searchParams.get('genre') || 'fantasy';
  const format = searchParams.get('format') || 'free';

  // Create story creation data from URL parameters
  useEffect(() => {
    try {
      const storyData = {
        type: 'ai',
        format,
        genre,
        redirectToCreate: !!source,
        timestamp: new Date().getTime(),
      };
      localStorage.setItem('storyCreationData', JSON.stringify(storyData));
    } catch (error) {
      console.error('Error setting up story creation data:', error);
    }
  }, [source, genre, format]);

  // Enhanced navigation detection
  useEffect(() => {
    const detectNavigationSource = () => {
      if (source) {
        if (source === 'story') {
          setNavigatedFrom('story');
          toast({
            title: 'BAM! INSPIRATION STRIKES!',
            description: 'Time to make your own epic tale!',
            className:
              'font-bangers border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-yellow-400 text-black',
          });
        } else {
          setNavigatedFrom('homepage');
          toast({
            title: 'POW! WELCOME CREATOR!',
            description: "Let's make some magic happen!",
            className:
              'font-bangers border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-cyan-400 text-black',
          });
        }
      } else {
        setNavigatedFrom('direct');
      }
    };
    detectNavigationSource();
  }, [toast, source]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-950 dark:to-black font-sans selection:bg-yellow-400 selection:text-black">
      {/* Halftone Pattern Overlay */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-12 relative z-10"
      >
        <div className="max-w-6xl mx-auto">
          {/* Navigation Bar */}
          <div className="flex justify-between items-center mb-8">
            <Button
              variant="ghost"
              className="group flex items-center hover:bg-transparent p-0"
              onClick={() => {
                if (navigatedFrom === 'story') {
                  router.back();
                } else if (source?.includes('stories')) {
                  router.push('/stories');
                } else {
                  router.push('/');
                }
              }}
            >
              <div className="bg-white dark:bg-gray-900 dark:text-white border-4 border-black dark:border-white px-4 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)] group-hover:translate-x-[2px] group-hover:translate-y-[2px] group-hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:group-hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.3)] transition-all flex items-center gap-2 rounded-lg">
                <ArrowLeft className="h-6 w-6 stroke-[3]" />
                <span className="font-bangers text-xl tracking-wide">
                  BACK TO {navigatedFrom === 'story' ? 'STORY' : 'BASE'}
                </span>
              </div>
            </Button>

            <div className="hidden md:flex items-center gap-2 bg-yellow-400 border-4 border-black px-4 py-2 rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-2">
              <Zap className="w-5 h-5 fill-black" />
              <span className="font-bangers text-lg">CREATIVE MODE: ON</span>
            </div>
          </div>

          {/* Header Section */}
          <div className="text-center mb-16 relative">
            {/* Decorative Elements */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-yellow-400/20 via-red-500/20 to-blue-500/20 rounded-full blur-3xl -z-10"
            />

            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', bounce: 0.5 }}
              className="inline-block relative"
            >
              <h1 className="text-6xl md:text-8xl font-bangers text-transparent bg-clip-text bg-gradient-to-b from-yellow-400 to-orange-500 drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] stroke-black mb-4 transform -rotate-2">
                AI STORY CREATOR
              </h1>
              <div className="absolute -top-6 -right-8">
                <Star className="w-12 h-12 text-yellow-400 fill-yellow-400 stroke-black stroke-[3] animate-pulse" />
              </div>
            </motion.div>

            <p className="text-xl md:text-2xl font-bangers text-muted-foreground mb-10 max-w-2xl mx-auto tracking-wide">
              CRAFT EPIC TALES • MINT LEGENDARY NFTS • UNLEASH IMAGINATION
            </p>

            {/* Feature Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12">
              {[
                {
                  icon: Sparkles,
                  title: 'GENERATE',
                  desc: 'AI POWERED!',
                  color: 'bg-blue-400',
                },
                {
                  icon: BookText,
                  title: 'CUSTOMIZE',
                  desc: 'YOUR RULES!',
                  color: 'bg-red-400',
                },
                {
                  icon: Wallet,
                  title: 'MINT NFT',
                  desc: 'OWN IT!',
                  color: 'bg-green-400',
                },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  whileHover={{ scale: 1.05, rotate: i % 2 === 0 ? 2 : -2 }}
                  className="bg-white dark:bg-gray-800 border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-xl relative overflow-hidden group"
                >
                  <div
                    className={`absolute top-0 right-0 w-16 h-16 ${item.color} transform translate-x-8 -translate-y-8 rotate-45 border-b-4 border-l-4 border-black`}
                  />
                  <div className="w-16 h-16 bg-gray-100 border-4 border-black rounded-full flex items-center justify-center mb-4 mx-auto group-hover:bg-yellow-400 transition-colors">
                    <item.icon className="h-8 w-8 text-black stroke-[2.5]" />
                  </div>
                  <h3 className="font-bangers text-2xl mb-1">{item.title}</h3>
                  <p className="font-bold text-sm text-muted-foreground">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col md:flex-row justify-center gap-6 mb-16">
              <Button
                size="lg"
                className="bg-yellow-400 text-black hover:bg-yellow-500 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all rounded-xl h-16 px-8"
                onClick={() =>
                  (window.location.href = `/create/ai-story?source=homepage&format=free`)
                }
              >
                <PenSquare className="mr-3 h-6 w-6 stroke-[3]" />
                <span className="font-bangers text-2xl tracking-wide">
                  START NEW ADVENTURE
                </span>
              </Button>
              <Button
                size="lg"
                className="bg-white text-black hover:bg-gray-100 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all rounded-xl h-16 px-8"
                asChild
              >
                <Link href="/stories">
                  <BookOpen className="mr-3 h-6 w-6 stroke-[3]" />
                  <span className="font-bangers text-2xl tracking-wide">
                    VIEW ARCHIVES
                  </span>
                </Link>
              </Button>
            </div>
          </div>

          {/* Main Generator Component */}
          <div className="relative z-20">
            <AIStoryGenerator className="relative" />
          </div>

          {/* Info Section */}
          <div className="mt-20 bg-white dark:bg-gray-800 border-4 border-black p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] rounded-2xl relative">
            <div className="absolute -top-6 left-8 bg-red-500 text-white font-bangers text-xl px-6 py-2 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -rotate-2">
              TOP SECRET INTEL
            </div>

            <div className="grid md:grid-cols-2 gap-8 mt-4">
              <div className="space-y-4">
                <h3 className="font-bangers text-2xl text-blue-500 flex items-center gap-2">
                  <Zap className="fill-blue-500 stroke-black" />
                  THE TECHNOLOGY
                </h3>
                <p className="font-medium leading-relaxed border-l-4 border-gray-200 pl-4">
                  Powered by Groq's hyper-speed neural networks, this device
                  synthesizes narrative structures faster than a speeding
                  bullet!
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="font-bangers text-2xl text-green-500 flex items-center gap-2">
                  <Wallet className="fill-green-500 stroke-black" />
                  THE MISSION
                </h3>
                <p className="font-medium leading-relaxed border-l-4 border-gray-200 pl-4">
                  1. Enter your prompt.
                  <br />
                  2. Generate your story.
                  <br />
                  3. Mint to Monad blockchain for eternal glory!
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
