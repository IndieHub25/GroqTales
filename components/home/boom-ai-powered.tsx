'use client';

export function BoomAIPowered() {
  return (
    <section
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden border-b-[12px] border-pulp-black bg-pulp-dark"
      aria-label="Boom AI Powered Section"
    >
      {/* Background Image with Overlays */}
      <div className="absolute inset-0 z-0">
        <img
          alt="Gritty Urban Landscape"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBzHu79NVYgya5Cj8BACNCEvQU1WzneTRWADEYopkZtri6Df2onMzvLLhPRwhswLUGSfwLJocrlpjEgN0K_4fYns1eFJT1du1QBr7pJuM3N3CmaY6w-q-ACgCqIwV5xZrgPgoIBkhvldOntQdwEF6_ycFRWfor09_XNcxh2ZZiK7PX8_z2e1PI0E4TvDz4AiJU1YbcUjHyT4WTcYR8vtjm85TjaRt-2T6sdM71unJAvSKNXabOATDjHsz0W6rwF7pqT0uWF67u2US4"
          className="w-full h-full object-cover grayscale brightness-[0.35] contrast-[1.8]"
        />
        <div className="absolute inset-0 bg-black/70" />
        <div className="absolute inset-0 bg-[radial-gradient(#000_0.5px,transparent_0.5px)] [background-size:4px_4px] opacity-10 pointer-events-none" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-24">
        <div className="flex flex-col md:flex-row items-center gap-12">
          {/* Left Column: BOOM! AI POWERED Content */}
          <div className="md:w-1/2">
            {/* BOOM! Heading */}
            <h2 className="text-[10rem] text-primary leading-none filter drop-shadow-[5px_5px_0px_#fff]" style={{ transform: 'rotate(-12deg)' }}>
              BOOM!
            </h2>

            {/* AI POWERED Subheading */}
            <h3 className="text-5xl text-white font-impact mt-2 tracking-widest uppercase">
              AI POWERED
            </h3>

            {/* Tagline */}
            <p className="text-3xl font-subheading uppercase mt-6 bg-primary text-white p-3 inline-block font-black shadow-lg">
              Generate stories in seconds!
            </p>
          </div>

          {/* Right Column: Feature Cards Placeholder */}
          <div className="md:w-1/2 grid grid-cols-1 gap-6">
            {/* Feature cards will be rendered here */}
          </div>
        </div>
      </div>
    </section>
  );
}
