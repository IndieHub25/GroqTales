'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { ArrowLeft, Share2, Twitter, Github, Heart } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function BlogPage() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div className="min-h-screen bg-background dark:dark-premium-bg relative overflow-x-hidden selection:bg-primary/30">
      {/* Reading Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#ff4d6d] to-[#a78bfa] origin-left z-50 rounded-r-full shadow-[0_0_10px_rgba(255,77,109,0.5)]"
        style={{ scaleX }}
      />

      <div className="container max-w-4xl mx-auto px-4 py-12 md:py-20">
        {/* Back Navigation */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-12 group button-hover-optimized"
        >
          <div className="p-2 border-2 border-transparent group-hover:border-primary/20 rounded-full transition-all">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </div>
          <span className="font-medium tracking-wide">Back to Home</span>
        </Link>

        {/* Article Header */}
        <header className="mb-16 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold tracking-wide uppercase">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            Engineering & Vision
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1] text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/60 drop-shadow-sm font-display" style={{ fontFamily: 'var(--font-comic)' }}>
            GroqTales: Building an AI‑Native Storytelling Engine on Monad
          </h1>
          
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-muted-foreground border-y border-white/10 py-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#ff4d6d] to-[#a78bfa] p-[2px] shadow-lg">
                <div className="w-full h-full rounded-full bg-black flex items-center justify-center font-bold text-white tracking-widest text-sm">
                  MS
                </div>
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground/90 leading-tight">Mantej Singh</p>
                <p className="text-sm">Founder & CEO @ Indie Hub</p>
              </div>
            </div>
            
            <div className="hidden sm:block w-px h-8 bg-white/10"></div>
            
            <div className="flex items-center gap-2 text-sm">
              <span className="opacity-80">Published:</span>
              <span className="font-medium text-foreground/80">March 2, 2026</span>
            </div>

            <div className="hidden sm:block w-px h-8 bg-white/10"></div>
            
            <div className="flex items-center gap-2 text-sm">
              <span className="opacity-80">Read time:</span>
              <span className="font-medium text-foreground/80">6 min</span>
            </div>
          </div>
        </header>

        {/* Hero Image / Banner */}
        <div className="relative w-full aspect-video md:aspect-[21/9] rounded-2xl md:rounded-[32px] overflow-hidden mb-16 border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.5)] group transform-3d">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#0a0e1a] to-transparent opacity-60 z-10 mix-blend-multiply"></div>
          
          <Image 
            src="/blogs/blog-data/Blog 1/blog-logo.png" 
            alt="GroqTales Blog Header" 
            fill 
            className="object-cover z-0 group-hover:scale-105 transition-transform duration-1000" 
            priority
          />
          
          <div className="absolute bottom-6 left-6 z-20 flex gap-2">
            <span className="px-3 py-1 rounded bg-black/60 backdrop-blur-md border border-white/10 text-xs font-semibold text-white/80 uppercase tracking-wider">#AI</span>
            <span className="px-3 py-1 rounded bg-black/60 backdrop-blur-md border border-white/10 text-xs font-semibold text-white/80 uppercase tracking-wider">#Web3</span>
            <span className="px-3 py-1 rounded bg-black/60 backdrop-blur-md border border-white/10 text-xs font-semibold text-white/80 uppercase tracking-wider">#OpenSource</span>
          </div>
        </div>

        {/* Article Body */}
        <article className="text-lg md:text-xl max-w-none 
          [&_h2]:font-display [&_h2]:tracking-tight [&_h2]:text-3xl md:[&_h2]:text-4xl [&_h2]:mt-16 [&_h2]:mb-6 [&_h2]:border-b [&_h2]:border-white/10 [&_h2]:pb-4 [&_h2]:text-transparent [&_h2]:bg-clip-text [&_h2]:bg-gradient-to-r [&_h2]:from-white [&_h2]:to-white/60
          [&_h3]:font-display [&_h3]:text-2xl [&_h3]:text-primary/90 [&_h3]:mt-10 [&_h3]:mb-4
          [&_p]:leading-[1.8] [&_p]:text-foreground/80 [&_p]:mb-8
          [&_a]:text-primary hover:[&_a]:text-primary/80 [&_a]:underline [&_a]:underline-offset-4 [&_a]:transition-colors
          [&_strong]:text-white [&_strong]:font-bold
          [&_code]:text-[#a78bfa] [&_code]:bg-[#a78bfa]/10 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-md
          [&_pre]:bg-[#0f172a] [&_pre]:border [&_pre]:border-white/10 [&_pre]:shadow-2xl [&_pre]:my-10 [&_pre]:p-4 [&_pre]:rounded-xl [&_pre]:overflow-x-auto [&_pre_code]:bg-transparent [&_pre_code]:p-0
          [&_ul]:my-8 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:my-2 [&_li]:text-foreground/80
          [&_ol]:my-8 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-2 [&_li]:text-foreground/80
          [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:bg-primary/5 [&_blockquote]:px-6 [&_blockquote]:py-4 [&_blockquote]:rounded-r-lg [&_blockquote]:font-medium [&_blockquote]:italic [&_blockquote]:my-10">
          
          <p className="lead text-xl md:text-2xl text-foreground/90 font-medium mb-12" style={{ fontFamily: 'var(--font-comic)' }}>
            You think "Write a noir heist set in a neon Delhi, mint it on-chain, split royalties with my co-writer, and don't make me touch a smart contract." That's the experience we're trying to build with GroqTales.
          </p>

          <p>
            Most NFT projects treated lore as marketing copy. The PFPs got all the liquidity; the writers got a Notion doc and a "thanks fam".
          </p>
          <p>
            So we asked: what if the <strong>story</strong> was the first-class asset? And what if AI + on-chain rails made it fast to create, fair to share, and transparent to curate?
          </p>
          <p>
            This post is the story of how we're building that — and where you can plug in as a contributor.
          </p>

          <h2>TL;DR – What is GroqTales?</h2>
          <p>GroqTales is an AI-powered, on-chain storytelling platform:</p>
          <ul>
            <li>You describe a story (or go full control-freak with an advanced "Pro Panel" of ~70 knobs).</li>
            <li>Groq models generate a structured screenplay-like narrative in seconds.</li>
            <li>We pair it with AI-generated visuals to feel like a comic / graphic novel.</li>
            <li>You mint it as an NFT on Monad, with collaborators and royalty splits encoded in the CollabStory Protocol.</li>
          </ul>

          <div className="flex flex-col sm:flex-row gap-4 my-10 p-6 rounded-2xl bg-white/5 border border-white/10 shadow-lg backdrop-blur-sm">
            <div className="flex-1 flex flex-col justify-center">
              <h3 className="text-xl font-bold mb-2 !mt-0">Try the current build here:</h3>
              <div className="flex flex-wrap gap-4 mt-2">
                <a href="https://www.groqtales.xyz/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-bold text-sm hover:scale-105 transition-transform shadow-[0_4px_14px_rgba(255,77,109,0.4)] no-underline">
                  Live site
                </a>
                <a href="https://github.com/IndieHub25/GroqTales" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-[#24292e] text-white rounded-lg font-bold text-sm hover:scale-105 transition-transform shadow-lg no-underline border border-white/10">
                  <Github className="w-4 h-4" /> GitHub Repo
                </a>
              </div>
            </div>
          </div>

          <h2>The Pro Panel: an AI "Story Engine", not just a text box</h2>
          <p>
            The obvious implementation would be a single prompt field and a "Generate" button. We didn't do that.
          </p>
          <p>
            Instead, we built a Pro Panel UI that turns story generation into a structured system:
          </p>
          <ul>
            <li><strong>9 logical categories</strong> (Story Structure, Characters, World, Tone & Style, Theme, Model Settings, Visual, Length, Advanced).</li>
            <li><strong>~70 parameters</strong> persisted in a Zustand store with localStorage.</li>
            <li><strong>A grid of genre cards</strong> (Fantasy, Noir, Cyberpunk, Romance, etc.) that act more like story presets than mere labels.</li>
            <li><strong>A dossier-style layout</strong> with animated "page turns" so power-users don't drown in sliders.</li>
          </ul>

          <p>Rough shape of the state:</p>
          <pre><code>{`// src/store/proPanelStore.ts
type ProParameters = {
  storyStructure: { /* plot arcs, pacing, act structure, resolution... */ };
  characters: { /* archetypes, POV, ensemble vs solo... */ };
  world: { /* era, tech level, magic system toggles... */ };
  toneStyle: { /* humor vs grim, sentence cadence... */ };
  theme: { /* core moral questions, genre blends... */ };
  modelSettings: {
    modelSelection: string;
    temperature: number;
    maxTokens: number;
    // ...
  };
  visual: { /* prompts for panels, camera angles... */ };
  length: { /* reading time, beats per act... */ };
  advanced: { /* safety rails, output schema... */ };
};`}</code></pre>

          <p>On top of this we built:</p>
          <ul>
            <li>Presets (built-in and user-defined) that snapshot the entire parameter tree.</li>
            <li>Import / export flows using JSON (so you can share a "Cyberpunk Heist" config in Discord).</li>
            <li>Validation using Zod schemas to keep the Groq API calls sane.</li>
            <li>Accessible controls (labels, keyboard nav, aria semantics) so this isn't just "pretty sliders".</li>
          </ul>
          <p>The Pro Panel isn't "UX sugar" — it's our contract for generating consistent, remixable stories.</p>

          <h2>The AI Stack: talking to Groq like an engine, not a toy</h2>
          <p>Under the hood, the Pro Panel drives a backend service that:</p>
          <ol>
            <li>Receives <code>{`{ prompt, title, proConfig }`}</code> at <code>/api/groq</code>.</li>
            <li>Validates <code>proConfig</code> against strict Zod schemas.</li>
            <li>Compiles a system prompt that encodes:
              <ul>
                <li>The genre & tone.</li>
                <li>Scene structure and beats.</li>
                <li>Character arcs and constraints.</li>
                <li>Safety requirements (no jailbreaking your way into garbage).</li>
              </ul>
            </li>
            <li>Calls the Groq chat completions endpoint with hardened settings.</li>
            <li>Runs output checks before we accept the story.</li>
          </ol>

          <h2>On‑chain: Monad + CollabStory Protocol</h2>
          <p>
            The second pillar: a story is an NFT, not a random JSON blob on some server. We're integrating Monad as the base chain for story minting. Design goals:
          </p>
          <ul>
            <li><strong>1 story = 1 NFT.</strong></li>
            <li>Each NFT references:
              <ul>
                <li>A story content hash (text + metadata).</li>
                <li>A visual bundle hash (art panels).</li>
                <li>A list of contributors with weights (writer, editor, artist, prompt engineer...).</li>
              </ul>
            </li>
            <li>Royalties are split automatically based on those weights.</li>
          </ul>

          <pre><code>{`// Pseudocode-ish
struct ContributorShare {
  address contributor;
  uint96 bps; // basis points, sum must = 10_000
}

struct StoryMetadata {
  bytes32 storyHash; // keccak256 of canonical story JSON
  bytes32 artHash; // keccak256 of panel assets bundle
  string genre;
  string title;
}

function mintStory(
  StoryMetadata metadata,
  ContributorShare[] memory shares
) external returns (uint256 tokenId);`}</code></pre>

          <p>
            On the AI side, we're responsible for producing a canonical JSON representation of the story, verifying contributors, and exposing a UX where non-crypto-native writers don't have to think about any of this.
          </p>

          <h2>Curation: AIgent Curators instead of black‑box feeds</h2>
          <p>Ranking content is where most creator platforms quietly betray their users.</p>
          <p>We want to experiment with AI-powered curators whose decisions are:</p>
          <ul>
            <li><strong>Transparent</strong> (inputs + scoring dimensions are inspectable).</li>
            <li><strong>Logged on-chain</strong> (or at least hash-committed).</li>
            <li><strong>Tunable</strong> per community (e.g., "give me weird experimental horror" vs "keep it PG-13 fantasy").</li>
          </ul>
          
          <p>Early idea for a curator agent:</p>
          <ul>
            <li>Ingest story metadata + text + engagement stats.</li>
            <li>Compute scores along dimensions:
              <ul>
                <li>Originality (novelty vs training-corpus-like).</li>
                <li>Genre fit (does this actually feel like "Noir Heist" or just generic copypasta?).</li>
                <li>Structural coherence (beats, arcs, resolution).</li>
                <li>Community signals (likes, completions, forks/remixes).</li>
              </ul>
            </li>
            <li>Emit a ranking + explanation.</li>
          </ul>

          <h2>Developer Experience: how it all fits together</h2>
          <p>High-level architecture as it stands:</p>
          
          <h3>Frontend</h3>
          <ul>
            <li>Next.js App Router.</li>
            <li>Shadcn UI + a custom noir/comic theme.</li>
            <li>Pro Panel + Story Input as client components backed by Zustand.</li>
            <li>Accessibility passes (labels, aria, focus states) guided by automated review.</li>
          </ul>

          <h3>Backend</h3>
          <ul>
            <li>Route handlers under <code>/app/api/*</code>:
              <ul>
                <li><code>/api/groq</code> for story generation with Pro Panel config.</li>
                <li>(Planned) <code>/api/story</code> endpoints for persistence, remixing, and publishing.</li>
              </ul>
            </li>
            <li><code>lib/groq-service.ts</code> acting as the AI "engine" layer.</li>
            <li>Supabase client for user/session-adjacent data.</li>
          </ul>

          <h3>Infra / Tooling</h3>
          <ul>
            <li>Type-safe schemas with Zod.</li>
            <li>Tailwind config extended for noir/comic visuals.</li>
            <li>CodeRabbit driving automated review suggestions.</li>
            <li>Open-source friendly defaults.</li>
          </ul>

          <hr className="my-16 border-white/10" />

          <h2>Where I need help (a.k.a. why I'm posting this on DEV)</h2>
          <p>This is open source by design. I don't want this to become "yet another closed AI content farm". If any of these sound like your thing, you can make a real dent:</p>
          
          <div className="grid md:grid-cols-2 gap-6 my-10 not-prose">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/50 transition-colors shadow-lg">
              <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <span className="text-primary text-xl">1.</span> AI / Prompt Engineering
              </h3>
              <ul className="space-y-2 text-sm text-foreground/80 list-disc list-inside">
                <li>Help evolve the Pro Panel schemas.</li>
                <li>Design better system prompts for genre-specific outputs.</li>
                <li>Build evaluators to detect low-quality or derivative stories.</li>
              </ul>
            </div>
            
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/50 transition-colors shadow-lg">
              <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <span className="text-primary text-xl">2.</span> Smart Contracts / Monad
              </h3>
              <ul className="space-y-2 text-sm text-foreground/80 list-disc list-inside">
                <li>Formalize and implement the CollabStory Protocol.</li>
                <li>Explore meta-transactions / gasless flows.</li>
                <li>Help design NFT metadata for richly linked stories.</li>
              </ul>
            </div>
            
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/50 transition-colors shadow-lg">
              <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <span className="text-primary text-xl">3.</span> Frontend / UX
              </h3>
              <ul className="space-y-2 text-sm text-foreground/80 list-disc list-inside">
                <li>Polish the Pro Panel (performance, keyboard, mobile).</li>
                <li>Build a reader experience that feels like turning comic pages.</li>
                <li>Improve accessibility beyond "bare minimum passes".</li>
              </ul>
            </div>
            
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/50 transition-colors shadow-lg">
              <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <span className="text-primary text-xl">4.</span> DevEx / Tooling
              </h3>
              <ul className="space-y-2 text-sm text-foreground/80 list-disc list-inside">
                <li>CI pipelines, linting, and automated tests.</li>
                <li>Better presets import/export flows.</li>
                <li>Docs and examples.</li>
              </ul>
            </div>
          </div>

          <h2>How to get involved</h2>
          <ol className="space-y-4">
            <li><strong>Explore the platform:</strong> Open <a href="https://www.groqtales.xyz">groqtales.xyz</a> and poke around the Pro Panel. Break it. See where it feels clunky or magical.</li>
            <li><strong>Star & watch the repo:</strong> Stars genuinely help surface the project to other builders. Give it a star <a href="https://github.com/IndieHub25/GroqTales">on GitHub</a>.</li>
            <li><strong>Pick an issue and ship a PR:</strong> Check the issues board in the repo. Comment that you're taking something so we don't collide. Open a focused PR.</li>
            <li><strong>Propose experiments:</strong> Want to try a new model, a different chain, or a wild curator idea? Open a discussion or issue. This is meant to be a playground.</li>
          </ol>

          <blockquote className="text-xl">
            If you've ever looked at an NFT drop and thought, "the art is cool but the story deserved better" — GroqTales is my attempt to fix that.
          </blockquote>

          <p>
            Writers, prompt-engineers, and devs shouldn't be NPCs in the creator economy. They should be main characters with on-chain receipts.
          </p>
          <p className="text-xl font-bold text-white">
            If that resonates, come build with us. 🔧📚
          </p>
          
        </article>

        {/* Article Footer & Actions */}
        <footer className="mt-20 pt-10 border-t border-white/10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex gap-4">
              <button className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:text-primary transition-all button-hover-optimized font-medium">
                <Heart className="w-5 h-5" />
                <span>Like</span>
              </button>
              <button className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:text-primary transition-all button-hover-optimized font-medium">
                <Share2 className="w-5 h-5" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
