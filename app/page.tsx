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
  const indexRef      = useRef(0);   // which phrase we're on
  const charRef       = useRef(0);   // current character position
  const isDeletingRef = useRef(false);
  const pausingRef    = useRef(false);

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
  "In the neon-lit depths of Neo-Tokyo, the last human...",
  "The dragon soared above the crystalline peaks, its scales...",
  "A strange signal emanated from the abyss of sector 7G...",
  "Her sword glowed with the ancient power of the sun...",
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

  const howItWorks = [
    {
      step: '01',
      title: 'Idea Flow',
      desc: 'Use AI to generate narratives. Pick your genre, tone, and character arcs.',
      icon: <Sparkles className="w-8 h-8 text-blue-400" />,
      color: 'from-blue-500/20 to-cyan-500/20',
      border: 'border-blue-500/30',
    },
    {
      step: '02',
      title: 'Mint Legacy',
      desc: 'Immutable ownership on Monad. Turn your chapters into collectible NFTs.',
      icon: <Shield className="w-8 h-8 text-purple-400" />,
      color: 'from-purple-500/20 to-fuchsia-500/20',
      border: 'border-purple-500/30',
    },
    {
      step: '03',
      title: 'Global Scale',
      desc: 'Share instantly, earn royalties on derivative works, build a fandom.',
      icon: <Users className="w-8 h-8 text-emerald-400" />,
      color: 'from-emerald-500/20 to-teal-500/20',
      border: 'border-emerald-500/30',
    },
  ];

  // Top 12 Genres for Marquee
  const marqueeGenres = [
    { name: 'Science Fiction', image: 'https://ik.imagekit.io/panmac/tr:f-auto,w-740,pr-true//bcd02f72-b50c-0179-8b4b-5e44f5340bd4/175e79ee-ed99-45d5-846f-5af0be2ab75b/sub%20genre%20guide.webp', color: 'from-cyan-500 to-blue-600' },
    { name: 'Fantasy', image: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhv_45322WkBmu9o8IvYfcxEXDTbGzORCAgwdP0OF1Zq4izhDr6PT-bkqYj0BJJ_HP02Op2Y0vrNOQlN6tuf0cnu4GwWqprIJrcn89pYY6uiu89gXLr5UXIZ3h6-2HWvO-SjaqzeMRoiXk/s1600/latest.jpg', color: 'from-purple-500 to-indigo-600' },
    { name: 'Mystery', image: 'https://celadonbooks.com/wp-content/uploads/2020/03/what-is-a-mystery.jpg', color: 'from-slate-700 to-slate-900' },
    { name: 'Romance', image: 'https://escapetoromance.com/wp-content/uploads/sites/172/2017/05/iStock-503130452.jpg', color: 'from-pink-500 to-rose-600' },
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
      <style dangerouslySetInnerHTML={{__html: `
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

        <div className="container mx-auto px-6 relative z-10 flex flex-col items-center max-w-5xl">
          
          {/* Centered Text & CTA */}
          <motion.div variants={stagger} initial="hidden" animate="visible" className="text-center mt-20 md:mt-0 flex flex-col items-center">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-8 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold tracking-widest uppercase text-emerald-400">AI × Stories × NFTs</span>
            </motion.div>
            
            <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-[1.2] pb-4 mb-6">
              Write your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 py-2 inline-block">legacy.</span><br />
              Own your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 py-2 inline-block">universe.</span>
            </motion.h1>

            {/* Story Typewriter Effect */}
            <motion.div variants={fadeUp} className="min-h-[6rem] mb-10 max-w-2xl mx-auto flex items-center justify-center">
              <p className="text-xl md:text-2xl text-white/60 font-medium font-mono leading-relaxed">
                <span className="text-emerald-400 opacity-60 mr-2">{'>'}</span>
                {typedString}
                <motion.span 
                  animate={{ opacity: [1, 0] }} 
                  transition={{ repeat: Infinity, duration: 0.8 }} 
                  className="inline-block w-2 bg-white/80 ml-1 h-5 align-middle"
                />
              </p>
            </motion.div>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-6 items-center justify-center pt-4">
              <Button asChild className="group relative overflow-hidden bg-white text-black hover:text-black h-16 px-10 rounded-full font-bold text-lg transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.2)]">
                <Link href="/create/ai-story">
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-black/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                  <span className="relative z-10 flex items-center">
                    Start Creating <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          HOW IT WORKS (Technical Blueprint)
          ═══════════════════════════════════════ */}
      <section className="relative py-32 border-t border-white/5 bg-zinc-950">
        <div className="container mx-auto px-6 max-w-5xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="mb-16"
          >
            <motion.div variants={fadeUp} className="flex items-center gap-4 mb-4">
              <div className="h-px bg-emerald-500/50 flex-1" />
              <span className="text-emerald-400 font-mono text-sm tracking-widest uppercase">System Protocol</span>
              <div className="h-px bg-emerald-500/50 flex-1" />
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-bold tracking-tight text-center">
              The Path to <span className="text-emerald-400 font-light">Creation</span>
            </motion.h2>
          </motion.div>

          <motion.div
            className="space-y-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
          >
            {howItWorks.map((item, index) => (
              <motion.div
                key={item.step}
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
                }}
                className="group relative flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-10 p-6 md:p-8 rounded-2xl bg-white/[0.01] border border-white/5 hover:border-emerald-500/30 hover:bg-emerald-500/[0.02] transition-colors"
              >
                <div className="flex-shrink-0 flex items-center justify-center w-16 h-16 rounded-xl bg-black border border-white/10 group-hover:border-emerald-500/50 transition-colors shadow-2xl">
                  <span className="font-mono text-xl text-white/40 group-hover:text-emerald-400 transition-colors">{item.step}</span>
                </div>
                
                <div className="flex-grow">
                  <h3 className="text-2xl font-bold text-white/90 tracking-tight mb-2 group-hover:text-white transition-colors">{item.title}</h3>
                  <p className="text-white/50 text-base leading-relaxed max-w-2xl">{item.desc}</p>
                </div>

                <div className="hidden md:flex flex-shrink-0 items-center justify-center w-12 h-12 rounded-full bg-white/5 text-white/30 group-hover:text-emerald-400 group-hover:bg-emerald-500/10 transition-all">
                  <ArrowRight className="w-5 h-5 -rotate-45 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </div>
              </motion.div>
            ))}
          </motion.div>
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
                <TrendingUp className="text-red-500 w-8 h-8" /> Trending Now
              </motion.h2>
              <motion.p variants={fadeUp} className="text-white/50 text-lg">Collect the most viral lore.</motion.p>
            </div>
            <motion.div variants={fadeUp}>
              <Button asChild variant="outline" className="rounded-full border-white/10 hover:bg-white/10 text-white">
                <Link href="/nft-gallery">View Gallery <ArrowRight className="ml-2 w-4 h-4" /></Link>
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
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-2">Discover <span className="text-purple-400">Worlds</span></h2>
              <p className="text-white/50 text-lg max-w-xl">Step through the portal to experiences unknown.</p>
            </div>
            <Button asChild variant="outline" className="rounded-full border-white/10 hover:bg-white/10 text-white w-fit">
              <Link href="/genres">View All Genres <ArrowRight className="ml-2 w-4 h-4" /></Link>
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
            <motion.div variants={fadeUp}>
              <Button asChild className="h-16 px-10 rounded-full font-bold text-lg bg-emerald-500 hover:bg-emerald-400 text-black border border-emerald-400/50 shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all hover:scale-105 active:scale-95">
                <Link href="/create/ai-story">
                  Start Your Story <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
