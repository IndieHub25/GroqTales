'use client';

import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  PenSquare,
  Wallet,
  Zap,
  Users,
  Shield,
  TrendingUp,
  Share2,
  Sparkles,
  BookOpen,
  Compass,
  Filter
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect, useRef } from 'react';

import { useWeb3 } from '@/components/providers/web3-provider';
import { TrendingStories } from '@/components/trending-stories';
import { Button } from '@/components/ui/button';
import { UploadStoryTrigger } from '@/components/upload-story-trigger';
import { ComiCraftLogo } from '@/components/comicraft-logo';
import { cn } from '@/lib/utils';

// --- Typewriter Hook ---
// Uses refs for all mutable values so the interval callback never
// captures stale closure state — the classic bug in the previous version.
function useTypewriter(
  texts: string[],
  typingSpeed = 55,
  deletingSpeed = 28,
  pauseAfterType = 1800,
  pauseAfterDelete = 400,
) {
  const [displayText, setDisplayText] = useState('');

  // All mutable state lives in refs so the interval never goes stale
  const indexRef = useRef(0);   // which phrase we're on
  const charRef = useRef(0);   // current character position
  const isDeletingRef = useRef(false);
  const pausingRef = useRef(false);

  useEffect(() => {
    if (!texts.length) return;

    const tick = () => {
      const phrase = texts[indexRef.current % texts.length];
      if (!phrase) return; // guard: phrase is undefined when texts is empty

      if (pausingRef.current) return;

      if (!isDeletingRef.current) {
        // — Typing forward —
        charRef.current = Math.min(charRef.current + 1, phrase.length);
        setDisplayText(phrase.slice(0, charRef.current));

        if (charRef.current === phrase.length) {
          // Finished typing — pause before deleting
          pausingRef.current = true;
          setTimeout(() => { isDeletingRef.current = true; pausingRef.current = false; }, pauseAfterType);
        }
      } else {
        // — Deleting —
        charRef.current = Math.max(charRef.current - 1, 0);
        setDisplayText(phrase.slice(0, charRef.current));

        if (charRef.current === 0) {
          // Finished deleting — move to next phrase, pause before typing
          isDeletingRef.current = false;
          indexRef.current += 1;
          pausingRef.current = true;
          setTimeout(() => { pausingRef.current = false; }, pauseAfterDelete);
        }
      }
    };

    // Single interval — speed adapts to typing vs deleting phase via delete ref
    let timeoutId: NodeJS.Timeout;

    const runTick = () => {
      tick();
      timeoutId = setTimeout(runTick, isDeletingRef.current ? deletingSpeed : typingSpeed);
    };

    timeoutId = setTimeout(runTick, isDeletingRef.current ? deletingSpeed : typingSpeed);

    // Re-create the interval whenever the speed should change
    // (framer-motion / React will clean up via the return)
    return () => clearTimeout(timeoutId);
    // Re-run only when props change — internal state changes use refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [texts, typingSpeed, deletingSpeed, pauseAfterType, pauseAfterDelete]);

  return displayText;
}

// Hero Typewriter texts
const heroStories = [
  "Draft with VedaScript Engine...",
  "Visualize with Panelra Engine...",
  "Blend with Mythloom Engine...",
  "Spark ideas with Shakti Spark...",
];

export default function Home() {
  const { account, connectWallet, connecting } = useWeb3();
  const { scrollYProgress } = useScroll();
  const heroRef = useRef<HTMLElement>(null);

  // Parallax values
  const yBg = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacityHero = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  const [activeFilter, setActiveFilter] = useState('All');

  const typedString = useTypewriter(heroStories, 40, 20, 3000);

  // Animation variants
  const stagger = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  };

  const [activeStep, setActiveStep] = useState(0);

  // Mouse parallax for Hero
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 40,
        y: (e.clientY / window.innerHeight - 0.5) * 40,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const pathToCreation = [
    {
      id: "spark",
      step: '01',
      title: 'The Spark',
      desc: 'Start with a simple prompt or a fully formed character. You hold the creative reins while intelligent tools help bring your vision into focus.',
      icon: <PenSquare className="w-6 h-6 shrink-0" />,
      color: 'from-blue-500 to-indigo-500',
      activeBg: 'bg-indigo-500/10',
      activeBorder: 'border-indigo-500/50',
      iconColor: 'text-indigo-400'
    },
    {
      id: "craft",
      step: '02',
      title: 'The Craft',
      desc: 'Refine your narrative. Shape the world, dictate the outcomes, and watch your story evolve organically.',
      icon: <BookOpen className="w-6 h-6 shrink-0" />,
      color: 'from-indigo-500 to-purple-500',
      activeBg: 'bg-purple-500/10',
      activeBorder: 'border-purple-500/50',
      iconColor: 'text-purple-400'
    },
    {
      id: "legacy",
      step: '03',
      title: 'The Legacy',
      desc: 'Publish to a global audience. Retain true ownership of your chapters, securing your legacy as a creator.',
      icon: <Shield className="w-6 h-6 shrink-0" />,
      color: 'from-purple-500 to-emerald-500',
      activeBg: 'bg-emerald-500/10',
      activeBorder: 'border-emerald-500/50',
      iconColor: 'text-emerald-400'
    },
  ];

  // Top 12 Genres for Marquee
  const marqueeGenres = [
    { name: 'Science Fiction', image: 'https://ik.imagekit.io/panmac/tr:f-auto,w-740,pr-true//bcd02f72-b50c-0179-8b4b-5e44f5340bd4/175e79ee-ed99-45d5-846f-5af0be2ab75b/sub%20genre%20guide.webp', color: 'from-cyan-500 to-blue-600' },
    { name: 'Fantasy', image: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhv_45322WkBmu9o8IvYfcxEXDTbGzORCAgwdP0OF1Zq4izhDr6PT-bkqYj0BJJ_HP02Op2Y0vrNOQlN6tuf0cnu4GwWqprIJrcn89pYY6uiu89gXLr5UXIZ3h6-2HWvO-SjaqzeMRoiXk/s1600/latest.jpg', color: 'from-purple-500 to-indigo-600' },
    { name: 'Mystery', image: 'https://celadonbooks.com/wp-content/uploads/2020/03/what-is-a-mystery.jpg', color: 'from-slate-700 to-slate-900' },
    { name: 'Romance', image: 'https://images.unsplash.com/photo-1474552226712-ac0f0961a954?w=600&q=80', color: 'from-pink-500 to-rose-600' },
    { name: 'Horror', image: 'https://www.nyfa.edu/wp-content/uploads/2022/11/nosferatu.jpg', color: 'from-red-700 to-red-950' },
    { name: 'Adventure', image: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=600&q=80', color: 'from-amber-500 to-orange-600' },
    { name: 'Historical Fiction', image: 'https://celadonbooks.com/wp-content/uploads/2020/03/Historical-Fiction-scaled.jpg', color: 'from-yellow-700 to-yellow-900' },
    { name: 'Young Adult', image: 'https://advicewonders.wordpress.com/wp-content/uploads/2014/09/ya.jpg', color: 'from-pink-400 to-pink-600' },
    { name: 'Comedy', image: 'https://motivatevalmorgan.com/wp-content/uploads/2021/01/Why-Comedy-is-a-Genre-for-All.png', color: 'from-yellow-400 to-yellow-600' },
    { name: 'Dystopian', image: 'https://storage.googleapis.com/lr-assets/shared/1655140535-shutterstock_1936124599.jpg', color: 'from-purple-800 to-black' },
    { name: 'Historical Fantasy', image: 'https://upload.wikimedia.org/wikipedia/commons/1/16/The_violet_fairy_book_%281906%29_%2814566722029%29.jpg', color: 'from-amber-600 to-amber-800' },
    { name: 'Paranormal', image: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=600&h=400&fit=crop', color: 'from-violet-600 to-violet-900' },
  ];

  return (
    <main className="flex min-h-[calc(100vh-80px)] w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] -mt-6 -mb-6 flex-col overflow-hidden bg-black text-white">
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes scrollMarquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: scrollMarquee 40s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}} />
      {/* ═══════════════════════════════════════
          HERO SECTION (Cinematic Animated Canvas)
          ═══════════════════════════════════════ */}
      <section ref={heroRef} className="relative min-h-[100vh] flex flex-col items-center justify-center overflow-hidden">
        {/* Parallax Starfield Background */}
        <motion.div style={{ y: yBg, opacity: opacityHero }} className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1920')] bg-cover bg-center opacity-40 mix-blend-screen" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black z-10" />
          <motion.div
            animate={{
              x: mousePos.x,
              y: mousePos.y
            }}
            transition={{ type: "spring", damping: 50, stiffness: 200 }}
            className="absolute inset-0 z-0"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="absolute top-[-20%] right-[-10%] w-[70vw] h-[70vw] rounded-full bg-[radial-gradient(circle,_rgba(59,130,246,0.15)_0%,_transparent_60%)] filter blur-[120px]"
            />
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [0, -5, 0] }}
              transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
              className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[radial-gradient(circle,_rgba(168,85,247,0.1)_0%,_transparent_60%)] filter blur-[100px]"
            />
          </motion.div>
        </motion.div>

        <div className="container mx-auto px-6 relative z-10 flex flex-col items-center max-w-5xl">

          {/* Centered Text & CTA */}
          <motion.div variants={stagger} initial="hidden" animate="visible" className="text-center mt-20 md:mt-0 flex flex-col items-center">
            <motion.div variants={fadeUp} className="mb-10 drop-shadow-[0_0_30px_rgba(34,211,238,0.2)]">
              <ComiCraftLogo variant="full" colorScheme="color" size={68} animate={false} />
            </motion.div>
            
            <motion.div variants={fadeUp} className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-8 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold tracking-widest uppercase text-emerald-400">AI × Stories × NFTs</span>
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-[1.2] pb-4 mb-6">
              AI-native comics, stories, and collectibles on <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 py-2 inline-block">Blockchain.</span>
            </motion.h1>

            <motion.div variants={fadeUp} className="min-h-[4rem] mb-10 max-w-2xl mx-auto flex flex-col items-center justify-center">
              <p className="text-xl md:text-2xl text-white/60 font-medium leading-relaxed text-center mb-4">
                The cinematic platform where creators, collectors, and communities build immersive universes together.
              </p>
              <p className="text-emerald-400/80 font-mono text-sm tracking-wide">
                {'>'} {typedString}
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ repeat: Infinity, duration: 0.8 }}
                  className="inline-block w-2 bg-emerald-400/80 ml-1 h-4 align-middle"
                />
              </p>
            </motion.div>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-6 items-center justify-center pt-4">
              <Button asChild className="group relative overflow-hidden bg-white text-black hover:text-black h-16 px-10 rounded-full font-bold text-lg transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.2)]">
                <Link href="/create">
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-black/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                  <span className="relative z-10 flex items-center">
                    Enter Comicraft Forge <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-16 px-10 rounded-full font-bold text-lg border-white/20 hover:bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)]">
                <Link href="/genres">Discover Worlds</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          PATH TO CREATION (Bento Box Layout)
          ═══════════════════════════════════════ */}
      <section className="relative py-32 bg-black border-t border-white/5">
        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="mb-20"
          >
            <div className="flex flex-col md:flex-row items-end justify-between gap-8">
              <div className="max-w-2xl">
                <motion.div variants={fadeUp} className="flex items-center gap-4 mb-4">
                  <span className="text-emerald-400 font-mono text-xs tracking-widest uppercase">The Engines</span>
                  <div className="h-px bg-white/10 flex-1 max-w-[100px]" />
                </motion.div>
                <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-serif font-bold tracking-tight text-white mb-4">
                  Comicraft Forge
                </motion.h2>
                <motion.p variants={fadeUp} className="text-white/60 text-lg">
                  Choose your engine and bring your stories to life. From intelligent prose to rich comic panels, Comicraft Forge gives you the exact tools you need.
                </motion.p>
              </div>
              <motion.div variants={fadeUp} className="flex-shrink-0">
                <Button asChild className="rounded-full px-8 bg-white text-black hover:bg-white/90 font-medium">
                  <Link href="/upload">Begin Formatting</Link>
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* Bento Box Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[minmax(300px,_auto)]">

            {/* Bento Card 1: Large Feature */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="md:col-span-12 lg:col-span-7 bg-zinc-950 border border-white/10 rounded-3xl p-8 md:p-12 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 group-hover:bg-indigo-500/20 transition-colors duration-700 pointer-events-none" />

              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-12">
                  <PenSquare className="w-8 h-8 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-3xl font-serif font-bold text-white mb-4">Draft with VedaScript Engine</h3>
                  <p className="text-lg text-white/50 max-w-lg leading-relaxed">
                    Our flagship AI story studio. Command deep narrative control, long-form storytelling, and advanced parameters to craft your next great saga.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Bento Card 2: Medium Feature */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="md:col-span-6 lg:col-span-5 bg-white border border-white/10 rounded-3xl p-8 relative overflow-hidden group"
            >
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="w-16 h-16 rounded-2xl bg-black/5 flex items-center justify-center mb-12">
                  <BookOpen className="w-8 h-8 text-black" />
                </div>
                <div>
                  <h3 className="text-2xl font-serif font-bold text-black mb-4">Visualize with Panelra Engine</h3>
                  <p className="text-base text-black/70 leading-relaxed">
                    Focus on panel-based visual storytelling, cinematic image generation, and dynamic comic layouts to turn your words into stunning graphic novels.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Bento Card 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="md:col-span-6 lg:col-span-4 bg-zinc-900 border border-white/10 rounded-3xl p-8 relative overflow-hidden group"
            >
              <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-emerald-500/10 to-transparent pointer-events-none" />
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center mb-8">
                  <Shield className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">Blend with Mythloom Engine</h3>
                  <p className="text-sm text-white/50 leading-relaxed">
                    The ultimate hybrid format. Seamlessly blend serialized prose and comic panels into cohesive, multimedia experiences that keep readers hooked.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Bento Card 4 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="md:col-span-12 lg:col-span-8 bg-zinc-950 border border-white/10 rounded-3xl p-8 relative overflow-hidden flex flex-col md:flex-row items-center gap-8"
            >
              <div className="flex-1 relative z-10">
                <h3 className="text-2xl font-serif font-bold text-white mb-4">Spark with Shakti Spark</h3>
                <p className="text-base text-white/50 leading-relaxed mb-6">
                  Need a jumping-off point? Use our lightweight, lightning-fast idea generator to spark concepts, design characters, and plant the seeds of your universe.
                </p>
                <Button variant="link" asChild className="text-emerald-400 p-0 h-auto hover:text-emerald-300 font-medium group">
                  <Link href="/create" className="flex items-center">
                    Go to Forge <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>

              <div className="w-full md:w-1/2 h-full min-h-[200px] rounded-2xl border border-white/10 bg-[url('https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center brightness-75 mix-blend-luminosity filter transition-all duration-700 hover:mix-blend-normal hover:brightness-100" />
            </motion.div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          OWNERSHIP & PROVENANCE
          ═══════════════════════════════════════ */}
      <section className="relative py-24 bg-zinc-900 border-t border-white/5">
        <div className="container mx-auto px-6 max-w-5xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
            <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-white">
              Ownership & <span className="text-emerald-400">Provenance</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-white/50 max-w-2xl mx-auto">
              Built on Blockchain, Comicraft transforms your creative output into verifiable digital assets. Invisible infrastructure, undeniable ownership.
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div variants={fadeUp} className="p-8 rounded-2xl bg-black/50 border border-white/10 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6">
                <Compass className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Storymint Gateway</h3>
              <p className="text-white/50 text-sm">Turn your stories and comics into immortal collectibles. We handle the blockchain complexity so you can focus on creation.</p>
            </motion.div>
            
            <motion.div variants={fadeUp} className="p-8 rounded-2xl bg-black/50 border border-white/10 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
                <Wallet className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Comicraft Bazaar</h3>
              <p className="text-white/50 text-sm">Trade, collect, and monetize your digital assets. A vibrant marketplace empowering creators and rewarding true fans.</p>
            </motion.div>
            
            <motion.div variants={fadeUp} className="p-8 rounded-2xl bg-black/50 border border-white/10 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Reputation & Quests</h3>
              <p className="text-white/50 text-sm">Build long-term reputation via Creator Rank and level up through Craft Quests, unlocking new perks and visibility.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          TRENDING STORIES (Horizontal Overflow Grid)
          ═══════════════════════════════════════ */}
      <section className="relative py-24 bg-zinc-950 border-t border-white/5">
        <div className="container mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12"
          >
            <div>
              <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-bold tracking-tight mb-2 flex items-center gap-3">
                <TrendingUp className="text-red-500 w-8 h-8" /> Comicraft Bazaar
              </motion.h2>
              <motion.p variants={fadeUp} className="text-white/50 text-lg">Collect the most viral lore and trade top assets.</motion.p>
            </div>
            <motion.div variants={fadeUp}>
              <Button asChild variant="outline" className="rounded-full border-white/10 hover:bg-white/10 text-white">
                <Link href="/marketplace">Visit Bazaar <ArrowRight className="ml-2 w-4 h-4" /></Link>
              </Button>
            </motion.div>
          </motion.div>

          <TrendingStories />
        </div>
      </section>

      {/* ═══════════════════════════════════════
          GENRES (Animated Marquee)
          ═══════════════════════════════════════ */}
      <section className="relative py-32 bg-black border-t border-white/5 overflow-hidden">
        <div className="container mx-auto px-6 mb-16 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-2">Comicraft <span className="text-purple-400">Worlds</span></h2>
              <p className="text-white/50 text-lg max-w-xl">Step through the portal to experiences and genres unknown. Journey through the Commons to discuss theories.</p>
            </div>
            <Button asChild variant="outline" className="rounded-full border-white/10 hover:bg-white/10 text-white w-fit">
              <Link href="/genres">Explore Worlds <ArrowRight className="ml-2 w-4 h-4" /></Link>
            </Button>
          </div>
        </div>

        {/* Marquee Wrapper with fading edges */}
        <div className="relative w-full max-w-[100vw] overflow-hidden" style={{ maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)', WebkitMaskImage: '-webkit-linear-gradient(left, transparent, black 10%, black 90%, transparent)' }}>
          <div className="flex w-max animate-marquee gap-6 px-6">
            {/* Double the list for infinite scrolling */}
            {[...marqueeGenres, ...marqueeGenres].map((genre, i) => (
              <Link key={i} href={`/genres?genre=${genre.name.toLowerCase()}`} className="block group flex-shrink-0 w-[280px] md:w-[320px]">
                <div className="relative h-64 md:h-72 rounded-3xl overflow-hidden border border-white/10">
                  <Image src={genre.image} alt={genre.name} fill sizes="(max-width: 768px) 280px, 320px" className="object-cover transform group-hover:scale-110 transition-transform duration-700" />
                  <div className={`absolute inset-0 bg-gradient-to-t ${genre.color} mix-blend-multiply opacity-60 group-hover:opacity-80 transition-opacity`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80" />

                  <div className="absolute inset-0 p-6 flex flex-col justify-end">
                    <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-md group-hover:translate-x-1 transition-transform">{genre.name}</h3>
                    <div className="h-0.5 w-12 bg-white/50 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FINAL CTA
          ═══════════════════════════════════════ */}
      <section className="relative py-32 bg-zinc-950 border-t border-white/5 overflow-hidden">
        <div className="absolute inset-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_rgba(59,130,246,0.15),_transparent_70%)]" />
        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-6 leading-tight">
              Begin your <span className="text-emerald-400">journey.</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-white/50 text-lg md:text-xl font-medium max-w-2xl mx-auto mb-10">
              Join visionary creators crafting on the world's fastest decentralized network.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-4">
              <Button asChild className="h-16 px-10 rounded-full font-bold text-lg bg-emerald-500 hover:bg-emerald-400 text-black border border-emerald-400/50 shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all hover:scale-105 active:scale-95">
                <Link href="/create">
                  Enter Forge <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-16 px-10 rounded-full font-bold text-lg border-white/20 hover:bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)]">
                <Link href="/community">Join Commons</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
