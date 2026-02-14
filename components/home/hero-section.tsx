'use client';

import { FeaturePillars } from './feature-pillars';

interface HeroSectionProps {
  connectWallet?: () => Promise<void>;
  isConnected?: boolean;
}

export function HeroSection({
  connectWallet,
  isConnected = false,
}: HeroSectionProps) {
  return (
    <>
      {/* HERO SECTION - Panel 1 */}
      <section
        className="relative min-h-screen w-full flex items-center justify-center overflow-hidden border-b-[12px]"
        style={{
          backgroundColor: '#050505',
          borderColor: '#050505',
          clipPath: 'polygon(0 0, 100% 1%, 100% 99%, 0 100%)',
        }}
      >
        {/* Background Image with Filters */}
        <div className="absolute inset-0 z-0">
          <img
            alt="Noir Action Hero"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBzHu79NVYgya5Cj8BACNCEvQU1WzneTRWADEYopkZtri6Df2onMzvLLhPRwhswLUGSfwLJocrlpjEgN0K_4fYns1eFJT1du1QBr7pJuM3N3CmaY6w-q-ACgCqIwV5xZrgPgoIBkhvldOntQdwEF6_ycFRWfor09_XNcxh2ZZiK7PX8_z2e1PI0E4TvDz4AiJU1YbcUjHyT4WTcYR8vtjm85TjaRt-2T6sdM71unJAvSKNXabOATDjHsz0W6rwF7pqT0uWF67u2US4"
            className="w-full h-full object-cover"
            style={{
              filter: 'grayscale(1) brightness(0.3) contrast(1.5) sepia(0.2)',
            }}
          />
          {/* Noir Overlay Gradient - Right side red gradient */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(90deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 50%, rgba(139,0,0,0.3) 100%)',
            }}
          />
          {/* Halftone Pattern Overlay */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'radial-gradient(circle, #000 0.5px, transparent 0.5px)',
              backgroundSize: '4px 4px',
              opacity: 0.25,
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 w-full px-6 py-32 text-center flex flex-col items-center justify-center">
          {/* Subtitle */}
          <p className="font-subheading text-primary text-xl mb-6 font-black tracking-widest uppercase">
            The Future of Storytelling
          </p>

          {/* Main Headline - Explicit sizes for code.html exact match */}
          <h1
            className="text-[4rem] md:text-[7rem] lg:text-[10rem] leading-[0.9] mb-8 font-display text-white uppercase"
            style={{
              filter: 'drop-shadow(10px 10px 0px #050505)',
              WebkitTextStroke: '1px rgba(255,255,255,0.1)',
              transform: 'rotate(-2deg)',
              lineHeight: '0.9',
            }}
          >
            <span style={{ color: '#8B0000' }}>CREATE</span>
            <br />
            MINT &amp; SHARE
          </h1>

          {/* Supporting Copy */}
          <div className="mb-16">
            <p className="text-lg md:text-xl font-subheading leading-relaxed text-white uppercase font-bold border-l-4 border-primary pl-6 py-4 relative z-10"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                borderColor: '#8B0000',
              }}
            >
              Unleash your imagination with AI. Turn your stories into valuable
              NFTs on the Monad blockchain.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col md:flex-row gap-6 mt-12 justify-center items-center">
            <a
              href="/create/ai-story"
              className="font-display text-lg md:text-xl px-12 py-4 uppercase font-bold cursor-pointer transition-all"
              style={{
                backgroundColor: '#8B0000',
                color: '#E5E5E5',
                border: 'none',
                boxShadow: '6px 6px 0px #000',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#660000';
                e.currentTarget.style.boxShadow = '8px 8px 0px #000';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#8B0000';
                e.currentTarget.style.boxShadow = '6px 6px 0px #000';
              }}
            >
              START CREATING
            </a>
            <button
              onClick={connectWallet}
              disabled={!connectWallet}
              className="font-display text-lg md:text-xl px-12 py-4 uppercase font-bold cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: '#E5E5E5',
                color: '#050505',
                border: 'none',
                boxShadow: '6px 6px 0px #000',
              }}
              onMouseEnter={(e) => {
                if (!connectWallet) return;
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#cccccc';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '8px 8px 0px #000';
              }}
              onMouseLeave={(e) => {
                if (!connectWallet) return;
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#E5E5E5';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '6px 6px 0px #000';
              }}
            >
              CONNECT WALLET
            </button>
          </div>
        </div>
      </section>

      {/* BOOM SECTION - Panel 2 */}
      <section
        className="relative min-h-screen w-full flex items-center justify-center overflow-hidden border-b-[12px]"
        style={{
          backgroundColor: '#0a0a0a',
          borderColor: '#050505',
          clipPath: 'polygon(0 1%, 100% 0, 100% 100%, 0 99%)',
          marginTop: '-3vh',
        }}
      >
        {/* Background Image with Filters */}
        <div className="absolute inset-0 z-0">
          <img
            alt="Gritty Urban Landscape"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBzHu79NVYgya5Cj8BACNCEvQU1WzneTRWADEYopkZtri6Df2onMzvLLhPRwhswLUGSfwLJocrlpjEgN0K_4fYns1eFJT1du1QBr7pJuM3N3CmaY6w-q-ACgCqIwV5xZrgPgoIBkhvldOntQdwEF6_ycFRWfor09_XNcxh2ZZiK7PX8_z2e1PI0E4TvDz4AiJU1YbcUjHyT4WTcYR8vtjm85TjaRt-2T6sdM71unJAvSKNXabOATDjHsz0W6rwF7pqT0uWF67u2US4"
            className="w-full h-full object-cover"
            style={{
              filter: 'grayscale(1) brightness(0.3) contrast(1.5) sepia(0.2)',
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(139,0,0,0.3) 100%)',
            }}
          />
          {/* Halftone Pattern */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'radial-gradient(circle, #000 0.5px, transparent 0.5px)',
              backgroundSize: '4px 4px',
              opacity: 0.2,
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 w-full px-6 py-32">
          <div className="flex flex-col md:flex-row items-center gap-12">
            {/* LEFT - BOOM Block */}
            <div className="md:w-1/2">
              <h2
                className="text-[8rem] md:text-[9rem] lg:text-[10rem] leading-none font-display text-primary uppercase"
                style={{
                  color: '#8B0000',
                  filter: 'drop-shadow(5px 5px 0px #E5E5E5)',
                  transform: 'rotate(-3deg)',
                }}
              >
                BOOM!
              </h2>
              <h3 className="text-4xl md:text-5xl text-white font-impact mt-4 tracking-widest uppercase">
                AI POWERED
              </h3>
              <p className="text-2xl md:text-3xl font-subheading uppercase mt-8 text-white p-4 inline-block font-black"
                style={{
                  backgroundColor: '#8B0000',
                  boxShadow: '4px 4px 0px #000',
                }}
              >
                Generate stories in seconds!
              </p>
            </div>

            {/* RIGHT - Feature Cards */}
            <div className="md:w-1/2 grid grid-cols-1 gap-6">
              <FeaturePillars />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
