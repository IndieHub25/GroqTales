'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  PenSquare,
  Sparkles,
  BookOpen,
  Layers,
  ArrowLeft,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const engines = [
  {
    id: 'vedascript',
    title: 'VedaScript Engine',
    subtitle: 'Deep narrative control for AI-native stories.',
    description:
      'The flagship long-form text engine with 70+ tunable parameters. Build multi-chapter stories with precise control over tone, pacing, characters, and worldbuilding.',
    icon: PenSquare,
    cta: 'Write with VedaScript Engine',
    href: '/create/ai-story',
    color: 'emerald',
    gradient: 'from-emerald-500/20 to-emerald-600/5',
    borderGlow: 'hover:border-emerald-500/40',
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-400',
    btnGradient: 'from-emerald-600 to-emerald-700',
    btnHover: 'hover:from-emerald-500 hover:to-emerald-600',
    available: true,
  },
  {
    id: 'panelra',
    title: 'Panelra Engine',
    subtitle: 'Panel-based visual storytelling and comic layouts.',
    description:
      'Create comics with intelligent panel composition, camera directions, art style presets, and visual tone controls for stunning sequential art.',
    icon: BookOpen,
    cta: 'Create comics with Panelra Engine',
    href: '/create/comic',
    color: 'blue',
    gradient: 'from-blue-500/20 to-blue-600/5',
    borderGlow: 'hover:border-blue-500/40',
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-400',
    btnGradient: 'from-blue-600 to-blue-700',
    btnHover: 'hover:from-blue-500 hover:to-blue-600',
    available: true,
  },
  {
    id: 'mythloom',
    title: 'Mythloom Engine',
    subtitle: 'Blend prose and panels into serialized experiences.',
    description:
      'Interweave long-form narrative with visual panels for hybrid storytelling — the best of both VedaScript and Panelra in a unified experience.',
    icon: Layers,
    cta: 'Blend story + panels with Mythloom Engine',
    href: '#',
    color: 'purple',
    gradient: 'from-purple-500/20 to-purple-600/5',
    borderGlow: 'hover:border-purple-500/40',
    iconBg: 'bg-purple-500/10',
    iconColor: 'text-purple-400',
    btnGradient: 'from-purple-600 to-purple-700',
    btnHover: 'hover:from-purple-500 hover:to-purple-600',
    available: false,
  },
  {
    id: 'shakti',
    title: 'Shakti Spark',
    subtitle: 'Instant ideas and short story sparks.',
    description:
      'Generate story seeds, concept prompts, and short fiction in seconds. Perfect for brainstorming or kickstarting a larger project in VedaScript.',
    icon: Sparkles,
    cta: 'Spark an idea',
    href: '/create/spark',
    color: 'amber',
    gradient: 'from-amber-500/20 to-amber-600/5',
    borderGlow: 'hover:border-amber-500/40',
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-400',
    btnGradient: 'from-amber-600 to-amber-700',
    btnHover: 'hover:from-amber-500 hover:to-amber-600',
    available: true,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 200, damping: 25 },
  },
};

export default function ForgeCreatePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen relative bg-black text-white font-sans overflow-hidden">
      {/* Cinematic Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(16,185,129,0.08),_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(59,130,246,0.08),_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(168,85,247,0.04),_transparent_60%)]" />
        <div className="absolute w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] mix-blend-overlay" />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-4 py-10 relative z-10"
      >
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-start mb-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight mb-2">
                Welcome to Comicraft Forge
              </h1>
              <p className="text-white/50 text-lg">
                Choose your creative engine.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Link
                href="/"
                className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm text-white/70 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                Back
              </Link>
            </motion.div>
          </div>

          {/* 2×2 Engine Card Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 gap-5"
          >
            {engines.map((engine) => {
              const Icon = engine.icon;
              return (
                <motion.div
                  key={engine.id}
                  variants={cardVariants}
                  whileHover={{ scale: engine.available ? 1.02 : 1, y: engine.available ? -4 : 0 }}
                  whileTap={{ scale: engine.available ? 0.98 : 1 }}
                  className={`
                    relative group rounded-2xl overflow-hidden
                    bg-gradient-to-br ${engine.gradient}
                    border border-white/[0.08] ${engine.available ? engine.borderGlow : ''}
                    backdrop-blur-xl
                    transition-all duration-500
                    ${engine.available ? 'cursor-pointer' : 'cursor-default opacity-60'}
                  `}
                  onClick={() => engine.available && router.push(engine.href)}
                >
                  {/* Glow effect on hover */}
                  {engine.available && (
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${engine.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  )}

                  <div className="relative p-7">
                    {/* Icon + Title */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`w-12 h-12 rounded-xl ${engine.iconBg} flex items-center justify-center flex-shrink-0 border border-white/5`}>
                        <Icon className={`w-6 h-6 ${engine.iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="text-xl font-bold text-white mb-1 tracking-tight">
                          {engine.title}
                        </h2>
                        <p className={`text-sm ${engine.iconColor}/80 font-medium`}>
                          {engine.subtitle}
                        </p>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-white/45 leading-relaxed mb-6 line-clamp-2">
                      {engine.description}
                    </p>

                    {/* CTA Button */}
                    {engine.available ? (
                      <button
                        className={`
                          w-full py-3 px-5 rounded-xl font-semibold text-sm
                          bg-gradient-to-r ${engine.btnGradient} ${engine.btnHover}
                          text-white shadow-lg shadow-black/20
                          border border-white/10
                          flex items-center justify-center gap-2
                          transition-all duration-300
                          active:scale-[0.97] active:shadow-inner
                          group-hover:shadow-xl
                        `}
                      >
                        {engine.cta}
                        <ChevronRight className="w-4 h-4 opacity-60 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    ) : (
                      <div className="w-full py-3 px-5 rounded-xl font-medium text-sm bg-white/5 border border-white/10 text-white/30 text-center">
                        Coming Soon — Core routing via Nexus Core
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
