'use client';

import { motion } from 'framer-motion';
import {
  ArrowRight,
  PenSquare,
  Wallet,
  Zap,
  Users,
  Shield,
  TrendingUp,
  Layers,
  Share2,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import { useWeb3 } from '@/components/providers/web3-provider';
import { TrendingStories } from '@/components/trending-stories';
import { Button } from '@/components/ui/button';

export default function Home() {
  const { account, connectWallet } = useWeb3();

  // Animation variants
  const stagger = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.05 },
    },
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const howItWorks = [
    {
      step: '01',
      title: 'Create',
      desc: 'Use our AI-powered tools to craft unique stories in any genre with 70+ customization options.',
      icon: <PenSquare className="w-8 h-8" />,
      color: 'var(--comic-yellow)',
    },
    {
      step: '02',
      title: 'Mint',
      desc: 'Turn your story into a unique NFT on the Monad blockchain. Own your creative work forever.',
      icon: <Layers className="w-8 h-8" />,
      color: 'var(--comic-cyan)',
    },
    {
      step: '03',
      title: 'Share',
      desc: 'Share with the community, earn royalties, and connect with readers worldwide.',
      icon: <Share2 className="w-8 h-8" />,
      color: 'var(--comic-green)',
    },
  ];

  const features = [
    {
      title: 'Lightning Fast AI',
      desc: 'Powered by Groq for instant story generation. Create entire narratives in seconds.',
      icon: <Zap className="w-8 h-8" />,
      accent: 'var(--comic-yellow)',
    },
    {
      title: 'True Ownership',
      desc: 'Mint stories as NFTs on the Monad blockchain. Trade, collect, and earn royalties.',
      icon: <Shield className="w-8 h-8" />,
      accent: 'var(--comic-cyan)',
    },
    {
      title: 'Vibrant Community',
      desc: 'Join thousands of creators. Read, share, and build connections worldwide.',
      icon: <Users className="w-8 h-8" />,
      accent: 'var(--comic-green)',
    },
  ];

  const genres = [
    { name: 'Sci-Fi', color: 'var(--comic-cyan)', image: 'https://ik.imagekit.io/panmac/tr:f-auto,w-740,pr-true//bcd02f72-b50c-0179-8b4b-5e44f5340bd4/175e79ee-ed99-45d5-846f-5af0be2ab75b/sub%20genre%20guide.webp' },
    { name: 'Fantasy', color: 'var(--comic-purple)', image: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhv_45322WkBmu9o8IvYfcxEXDTbGzORCAgwdP0OF1Zq4izhDr6PT-bkqYj0BJJ_HP02Op2Y0vrNOQlN6tuf0cnu4GwWqprIJrcn89pYY6uiu89gXLr5UXIZ3h6-2HWvO-SjaqzeMRoiXk/s1600/latest.jpg' },
    { name: 'Mystery', color: 'var(--comic-blue)', image: 'https://celadonbooks.com/wp-content/uploads/2020/03/what-is-a-mystery.jpg' },
    { name: 'Romance', color: 'var(--comic-pink)', image: 'https://escapetoromance.com/wp-content/uploads/sites/172/2017/05/iStock-503130452.jpg' },
    { name: 'Horror', color: 'var(--comic-red)', image: 'https://www.nyfa.edu/wp-content/uploads/2022/11/nosferatu.jpg' },
    { name: 'Adventure', color: 'var(--comic-orange)', image: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=600&q=80' },
    { name: 'Historical Fiction', color: '#8B6914', image: 'https://celadonbooks.com/wp-content/uploads/2020/03/Historical-Fiction-scaled.jpg' },
    { name: 'Young Adult', color: '#FF69B4', image: 'https://advicewonders.wordpress.com/wp-content/uploads/2014/09/ya.jpg' },
    { name: 'Comedy', color: 'var(--comic-yellow)', image: 'https://motivatevalmorgan.com/wp-content/uploads/2021/01/Why-Comedy-is-a-Genre-for-All.png' },
    { name: 'Dystopian', color: '#4A0E4E', image: 'https://storage.googleapis.com/lr-assets/shared/1655140535-shutterstock_1936124599.jpg' },
    { name: 'Historical Fantasy', color: '#DAA520', image: 'https://upload.wikimedia.org/wikipedia/commons/1/16/The_violet_fairy_book_%281906%29_%2814566722029%29.jpg' },
    { name: 'Paranormal', color: '#6B3FA0', image: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=600&h=400&fit=crop' },
  ];

  return (
    <main className="flex min-h-screen flex-col relative overflow-hidden">
      {/* ═══════════════════════════════════════
          HERO SECTION with background.jpeg
          ═══════════════════════════════════════ */}
      <section className="relative min-h-[95vh] flex flex-col items-center justify-center overflow-hidden">
        {/* Hero background image */}
        <Image
          src="/background.jpeg"
          alt=""
          fill
          priority
          className="object-cover"
          aria-hidden="true"
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/50 dark:bg-black/60 z-[1]" />

        {/* Hero text content */}
        <motion.div
          className="relative z-10 container mx-auto px-6 text-center pointer-events-none"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          {/* Main heading */}
          <motion.h1
            variants={fadeUp}
            className="comic-display text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[10rem] text-white leading-[0.9] mb-8"
            style={{ textShadow: '3px 3px 6px rgba(0,0,0,0.5)' }}
          >
            <span className="block">Create</span>
            <span className="block scribble-underline" style={{ color: 'var(--comic-red)' }}>
              Mint
            </span>
            <span className="block">&amp; Share</span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            variants={fadeUp}
            className="text-base md:text-lg text-white/80 font-bold max-w-xl mx-auto mb-10 leading-relaxed"
            style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.2)' }}
          >
            Unleash your imagination with AI. Turn your stories into
            valuable NFTs on the Monad blockchain.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            variants={fadeUp}
            className="flex flex-wrap gap-4 justify-center pointer-events-auto"
          >
            <Button
              asChild
              size="lg"
              className="bg-[var(--comic-red)] hover:bg-[var(--comic-red)]/90 text-white border-4 border-foreground shadow-[6px_6px_0px_0px_var(--shadow-color)] hover:shadow-[3px_3px_0px_0px_var(--shadow-color)] hover:-translate-y-0.5 transition-all duration-200 text-base font-black uppercase px-8 py-5 h-auto rounded-none"
            >
              <Link href="/create/ai-story">
                <PenSquare className="mr-2 h-5 w-5" />
                Start Creating
              </Link>
            </Button>

            {!account && (
              <Button
                onClick={connectWallet}
                size="lg"
                className="bg-white/20 backdrop-blur-sm text-white border-4 border-white/60 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 transition-all duration-200 text-base font-black uppercase px-8 py-5 h-auto rounded-none"
              >
                <Wallet className="mr-2 h-5 w-5" />
                Connect Wallet
              </Button>
            )}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          aria-hidden="true"
        >
          <div className="w-5 h-8 border-2 border-white/30 rounded-full flex justify-center pt-1.5">
            <div className="w-1 h-2.5 bg-white/40 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════
          HOW IT WORKS
          ═══════════════════════════════════════ */}
      <section className="relative z-[1] py-24 bg-background/90 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.span variants={fadeUp} className="inline-block text-xs font-black uppercase tracking-[0.3em] text-[var(--comic-red)] mb-4">
              The Process
            </motion.span>
            <motion.h2 variants={fadeUp} className="comic-display text-4xl md:text-6xl text-foreground mb-4">
              How It Works
            </motion.h2>
            <motion.p variants={fadeUp} className="text-base text-muted-foreground font-bold max-w-lg mx-auto">
              From idea to NFT in three simple steps
            </motion.p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10 max-w-5xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
          >
            {howItWorks.map((item) => (
              <motion.div
                key={item.step}
                variants={scaleIn}
                whileHover={{ y: -6, transition: { duration: 0.25 } }}
                className="relative bg-card border-4 border-foreground p-8 text-center group"
                style={{ boxShadow: '8px 8px 0px 0px var(--shadow-color)' }}
              >
                <div
                  className="absolute -top-5 -left-3 comic-display text-5xl font-black opacity-80 group-hover:opacity-100 transition-opacity"
                  style={{ color: item.color, WebkitTextStroke: '2px var(--foreground)' }}
                >
                  {item.step}
                </div>
                <div
                  className="w-16 h-16 mx-auto mb-5 flex items-center justify-center border-4 border-foreground group-hover:scale-110 transition-transform duration-200"
                  style={{ backgroundColor: item.color, boxShadow: '4px 4px 0px 0px var(--shadow-color)' }}
                >
                  <div className="text-white">{item.icon}</div>
                </div>
                <h3 className="comic-display text-2xl mb-3 text-foreground">{item.title}</h3>
                <p className="text-muted-foreground font-bold text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Connecting line (desktop) */}
          <div className="hidden md:flex justify-center mt-8 gap-0 max-w-5xl mx-auto">
            <motion.div
              className="flex-1 h-1 mx-8 rounded-full"
              style={{ background: 'linear-gradient(90deg, var(--comic-yellow), var(--comic-cyan))' }}
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
            />
            <motion.div
              className="flex-1 h-1 mx-8 rounded-full"
              style={{ background: 'linear-gradient(90deg, var(--comic-cyan), var(--comic-green))' }}
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.6 }}
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          WHY GROQTALES
          ═══════════════════════════════════════ */}
      <section className="relative z-[1] py-24 bg-background/90 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.span variants={fadeUp} className="inline-block text-xs font-black uppercase tracking-[0.3em] text-[var(--comic-cyan)] mb-4">
              Why Choose Us
            </motion.span>
            <motion.h2 variants={fadeUp} className="comic-display text-4xl md:text-6xl text-foreground mb-4">
              Why GroqTales?
            </motion.h2>
            <motion.p variants={fadeUp} className="text-base text-muted-foreground font-bold max-w-lg mx-auto">
              The most powerful AI storytelling platform on Web3
            </motion.p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={scaleIn}
                whileHover={{ y: -6, transition: { duration: 0.25 } }}
                className="bg-card border-4 border-foreground p-8 group"
                style={{ boxShadow: '8px 8px 0px 0px var(--shadow-color)' }}
              >
                <div
                  className="w-14 h-14 flex items-center justify-center border-4 border-foreground mb-5 group-hover:scale-110 transition-transform duration-200"
                  style={{ backgroundColor: feature.accent, boxShadow: '4px 4px 0px 0px var(--shadow-color)' }}
                >
                  <div className="text-white">{feature.icon}</div>
                </div>
                <h3 className="comic-display text-2xl mb-3 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground font-bold text-sm leading-relaxed border-l-4 pl-4" style={{ borderColor: feature.accent }}>
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          TRENDING STORIES
          ═══════════════════════════════════════ */}
      <section className="relative z-[1] py-24 bg-background/90 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
            className="flex flex-col gap-4 items-start mb-12 md:flex-row md:items-end md:justify-between"
          >
            <div>
              <motion.span variants={fadeUp} className="inline-block text-xs font-black uppercase tracking-[0.3em] text-[var(--comic-red)] mb-4">
                Popular
              </motion.span>
              <motion.h2 variants={fadeUp} className="comic-display text-3xl md:text-5xl text-foreground flex items-center gap-3">
                <TrendingUp className="w-8 h-8" style={{ color: 'var(--comic-red)' }} />
                Trending Now
              </motion.h2>
              <motion.p variants={fadeUp} className="text-muted-foreground font-bold mt-2">
                Discover the hottest stories on the platform
              </motion.p>
            </div>
            <motion.div variants={fadeUp}>
              <Button asChild className="bg-foreground text-background border-4 border-foreground hover:bg-foreground/90 font-black uppercase rounded-none shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:-translate-y-0.5 transition-all duration-200">
                <Link href="/nft-gallery">
                  View All <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>
          <TrendingStories />
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FEATURED GENRES — Animated Marquee
          ═══════════════════════════════════════ */}
      <section className="relative z-[1] py-24 bg-background/90 backdrop-blur-sm overflow-hidden">
        <div className="container mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
            className="text-center mb-12"
          >
            <motion.span variants={fadeUp} className="inline-block text-xs font-black uppercase tracking-[0.3em] text-[var(--comic-purple)] mb-4">
              Browse
            </motion.span>
            <motion.h2 variants={fadeUp} className="comic-display text-4xl md:text-6xl text-foreground mb-4">
              Explore Genres
            </motion.h2>
            <motion.p variants={fadeUp} className="text-base text-muted-foreground font-bold max-w-lg mx-auto">
              Dive into worlds of your choosing
            </motion.p>
          </motion.div>
        </div>

        {/* Marquee container — full-width overflow */}
        <div className="genre-marquee-wrapper">
          <div className="genre-marquee">
            {/* Render genres twice for seamless infinite loop */}
            {[...genres, ...genres].map((genre, i) => (
              <Link
                key={`${genre.name}-${i}`}
                href={`/genres?genre=${encodeURIComponent(genre.name.toLowerCase())}`}
                className="genre-marquee-card group"
              >
                <div className="relative w-56 h-72 flex-shrink-0 border-4 border-foreground overflow-hidden transition-transform duration-300 group-hover:scale-105"
                  style={{ boxShadow: '6px 6px 0px 0px var(--shadow-color)' }}
                >
                  {/* Genre image */}
                  <img
                    src={genre.image}
                    alt={genre.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  {/* Genre name */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div
                      className="inline-block px-3 py-1 mb-2 text-[10px] font-black uppercase tracking-wider text-white rounded-sm"
                      style={{ backgroundColor: genre.color }}
                    >
                      Genre
                    </div>
                    <h3 className="font-black text-lg uppercase text-white leading-tight"
                      style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}
                    >
                      {genre.name}
                    </h3>
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
      <section className="relative z-[1] py-28 overflow-hidden bg-background/90 backdrop-blur-sm">
        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.h2
              variants={fadeUp}
              className="comic-display text-4xl md:text-6xl lg:text-8xl text-foreground mb-6"
              style={{ textShadow: '4px 4px 0px var(--shadow-color)' }}
            >
              Ready to Create?
            </motion.h2>
            <motion.p variants={fadeUp} className="text-foreground/80 font-bold text-lg md:text-xl mb-10 max-w-2xl mx-auto">
              Join thousands of creators minting their stories as NFTs on GroqTales.
            </motion.p>
            <motion.div variants={fadeUp}>
              <Button asChild className="comic-display bg-[var(--comic-yellow)] text-[#1a1a2e] border-4 border-foreground text-lg md:text-2xl font-black uppercase px-8 md:px-12 py-5 md:py-7 h-auto shadow-[8px_8px_0px_0px_var(--shadow-color)] hover:shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:-translate-y-1 active:shadow-none active:translate-y-0.5 transition-all duration-200 rounded-none tracking-wider">
                <Link href="/create/ai-story">
                  Start Your Story
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
