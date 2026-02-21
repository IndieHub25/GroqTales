// Component: CTASection
// Purpose: "Ready to Start?" CTA section with JOIN THE REVOLUTION button
// Based on: code.html CTA panel section

'use client';

export function CTASection() {
  return (
    <section
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden border-b-[12px] border-pulp-black"
      style={{
        backgroundColor: '#8B0000',
        clipPath: 'polygon(0 0, 100% 1%, 100% 99%, 0 100%)',
      }}
    >
      {/* Background Image with Overlays */}
      <div className="absolute inset-0 z-0">
        <img
          alt="Intense Shadowy Action"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBzHu79NVYgya5Cj8BACNCEvQU1WzneTRWADEYopkZtri6Df2onMzvLLhPRwhswLUGSfwLJocrlpjEgN0K_4fYns1eFJT1du1QBr7pJuM3N3CmaY6w-q-ACgCqIwV5xZrgPgoIBkhvldOntQdwEF6_ycFRWfor09_XNcxh2ZZiK7PX8_z2e1PI0E4TvDz4AiJU1YbcUjHyT4WTcYR8vtjm85TjaRt-2T6sdM71unJAvSKNXabOATDjHsz0W6rwF7pqT0uWF67u2US4"
          className="w-full h-full object-cover"
          style={{
            filter: 'grayscale(1) brightness(0.35) contrast(1.8)',
          }}
        />
        {/* Noir Overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, rgba(0,0,0,0.90) 0%, rgba(139,0,0,0.3) 100%)',
          }}
        />
        {/* Halftone Pattern */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle, #000 0.5px, transparent 0.5px)',
            backgroundSize: '4px 4px',
            opacity: 0.3,
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-24 text-center">
        {/* Ready to Start Badge */}
        <div
          className="inline-block px-10 py-4 mb-8"
          style={{
            backgroundColor: '#050505',
            transform: 'rotate(1deg)',
          }}
        >
          <h2 className="text-6xl font-display text-white uppercase">Ready to Start?</h2>
        </div>

        {/* Main Headline - EXACT text-9xl from code.html */}
        <div className="max-w-4xl mx-auto mb-16">
          <h3
            className="text-9xl text-white tracking-tighter font-display uppercase leading-none"
            style={{
              filter: 'drop-shadow(6px 6px 0px #000)',
              WebkitTextStroke: '1px rgba(255,255,255,0.1)',
            }}
          >
            CREATE YOUR STORY
          </h3>
        </div>

        {/* CTA Actions */}
        <div className="flex flex-col md:flex-row gap-8 justify-center items-center">
          {/* Primary Button */}
          <a
            href="/create/ai-story"
            className="font-display text-5xl px-16 py-8 border-4 border-pulp-black uppercase cursor-pointer inline-block transition-all hover:scale-105"
            style={{
              backgroundColor: '#E5E5E5',
              color: '#050505',
              boxShadow: '12px 12px 0px #000',
              transform: 'rotate(-1deg)',
            }}
          >
            CREATE STORY
          </a>

          {/* Secondary Info Box */}
          <div
            className="p-4 border-l-8"
            style={{
              backgroundColor: '#050505',
              borderColor: '#8B0000',
            }}
          >
            <p className="font-subheading text-xl font-black uppercase tracking-[0.4em]" style={{ color: '#8B0000' }}>
              TRANSMISSION_INITIATED
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
