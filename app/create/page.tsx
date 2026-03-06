'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  PenSquare,
  Sparkles,
  BookOpen,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';

// Import the story creation form components
const TextStoryForm = React.lazy(() => import('./components/text-story-form'));
const AIStoryForm = React.lazy(() => import('./components/ai-story-form'));
const ComicStoryForm = React.lazy(() => import('./components/comic-story-form'));

export default function UnifiedCreateStoryPage() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'text' | 'ai' | 'comic'>('text');

  // Initialize from query parameter
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'ai' || tab === 'comic' || tab === 'text') {
      setActiveTab(tab);
    }
  }, [searchParams]);

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
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="container mx-auto px-4 py-8 relative z-10"
      >
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-black text-white uppercase tracking-tight mb-2">
                Create Your Story
              </h1>
              <p className="text-white/60">Choose your creative path</p>
            </div>
            <Link href="/">
              <Button
                variant="ghost"
                className="group flex items-center hover:bg-white/5 text-white/70 hover:text-white rounded-full px-4 py-2 transition-all"
              >
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back
              </Button>
            </Link>
          </div>

          {/* Tabs Section */}
          <div className="bg-white/5 border border-white/10 rounded-lg backdrop-blur-md overflow-hidden">
            <Tabs
              defaultValue="text"
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as 'text' | 'ai' | 'comic')}
              className="w-full"
            >
              <TabsList className="w-full bg-black/40 border-b border-white/10 rounded-none px-6 py-4 flex gap-2">
                <TabsTrigger
                  value="text"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/70 hover:text-white transition-all"
                >
                  <PenSquare className="w-4 h-4" />
                  <span className="hidden sm:inline">Text Story</span>
                </TabsTrigger>

                <TabsTrigger
                  value="ai"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/70 hover:text-white transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span className="hidden sm:inline">AI Story</span>
                </TabsTrigger>

                <TabsTrigger
                  value="comic"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/70 hover:text-white transition-all"
                >
                  <BookOpen className="w-4 h-4" />
                  <span className="hidden sm:inline">Comic</span>
                </TabsTrigger>
              </TabsList>

              {/* Tab Contents */}
              <div className="p-6 sm:p-8">
                <TabsContent value="text" className="mt-0">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <React.Suspense
                      fallback={
                        <div className="flex items-center justify-center py-12">
                          <div className="text-white/60">Loading Text Story Editor...</div>
                        </div>
                      }
                    >
                      <TextStoryForm />
                    </React.Suspense>
                  </motion.div>
                </TabsContent>

                <TabsContent value="ai" className="mt-0">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <React.Suspense
                      fallback={
                        <div className="flex items-center justify-center py-12">
                          <div className="text-white/60">Loading AI Story Generator...</div>
                        </div>
                      }
                    >
                      <AIStoryForm />
                    </React.Suspense>
                  </motion.div>
                </TabsContent>

                <TabsContent value="comic" className="mt-0">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <React.Suspense
                      fallback={
                        <div className="flex items-center justify-center py-12">
                          <div className="text-white/60">Loading Comic Creator...</div>
                        </div>
                      }
                    >
                      <ComicStoryForm />
                    </React.Suspense>
                  </motion.div>
                </TabsContent>
              </div>
            </Tabs>
          </div>

          {/* Footer Info */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 backdrop-blur-md">
              <h3 className="font-bold text-emerald-400 mb-2">Text Story</h3>
              <p className="text-sm text-white/60">
                Write your narrative with full creative control and draft management
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-4 backdrop-blur-md">
              <h3 className="font-bold text-blue-400 mb-2">AI Story</h3>
              <p className="text-sm text-white/60">
                Generate stories with advanced AI orchestration (Gemini + Groq)
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-4 backdrop-blur-md">
              <h3 className="font-bold text-purple-400 mb-2">Comic</h3>
              <p className="text-sm text-white/60">
                Create visual narratives with panel-based storytelling
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
