// Component: TrendingSection
// Purpose: Trending stories section with grid of story cards
// Based on: code.html TRENDING STORIES panel section

'use client';

import Link from 'next/link';

export function TrendingSection() {
  const stories = [
    {
      id: 1,
      title: 'The Last Memory Collector',
      genre: 'SCIENCE FICTION',
      author: 'Emily Johnson',
      views: 180,
      favorites: 1687,
      tokens: 55,
    },
    {
      id: 2,
      title: 'Whispers of the Ancient Forest',
      genre: 'SCIENCE FICTION',
      author: 'Michael Chen',
      views: 420,
      favorites: 5261,
      tokens: 26,
    },
    {
      id: 3,
      title: 'Neon Dreams in the Digital Age',
      genre: 'HORROR',
      author: 'Sarah Williams',
      views: 510,
      favorites: 4298,
      tokens: 21,
    },
  ];

  return (
    <section
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden border-b-[12px] border-pulp-black"
      style={{
        backgroundColor: '#050505',
        clipPath: 'polygon(0 0, 100% 1%, 100% 99%, 0 100%)',
      }}
    >
      {/* Background Image with Overlays */}
      <div className="absolute inset-0 z-0">
        <img
          alt="Shadowy Character Portrait"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBzHu79NVYgya5Cj8BACNCEvQU1WzneTRWADEYopkZtri6Df2onMzvLLhPRwhswLUGSfwLJocrlpjEgN0K_4fYns1eFJT1du1QBr7pJuM3N3CmaY6w-q-ACgCqIwV5xZrgPgoIBkhvldOntQdwEF6_ycFRWfor09_XNcxh2ZZiK7PX8_z2e1PI0E4TvDz4AiJU1YbcUjHyT4WTcYR8vtjm85TjaRt-2T6sdM71unJAvSKNXabOATDjHsz0W6rwF7pqT0uWF67u2US4"
          className="w-full h-full object-cover"
          style={{
            filter: 'grayscale(1) brightness(0.3) contrast(1.5) sepia(0.2)',
          }}
        />
        {/* Noir Overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(139,0,0,0.2) 100%)',
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

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-24">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 border-b-4 border-primary pb-6">
          <div>
            <h2 className="text-4xl md:text-6xl lg:text-7xl text-white font-display uppercase mb-2">
              TRENDING STORIES
            </h2>
            <p className="font-subheading font-bold text-xl text-primary uppercase tracking-wider">
              Discover the most popular stories on GroqTales
            </p>
          </div>
          <Link href="/nft-gallery" className="font-display text-3xl text-primary hover:text-white uppercase">
            VIEW ALL
          </Link>
        </div>

        {/* Story Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {stories.map((story) => (
            <div
              key={story.id}
              className="overflow-hidden border-r-8 border-b-8 border-pulp-black"
              style={{
                backgroundColor: '#050505',
                boxShadow: '4px 4px 0px #8B0000',
              }}
            >
              {/* Image Container */}
              <div className="h-80 bg-pulp-black relative group">
                <img
                  alt={story.title}
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBzHu79NVYgya5Cj8BACNCEvQU1WzneTRWADEYopkZtri6Df2onMzvLLhPRwhswLUGSfwLJocrlpjEgN0K_4fYns1eFJT1du1QBr7pJuM3N3CmaY6w-q-ACgCqIwV5xZrgPgoIBkhvldOntQdwEF6_ycFRWfor09_XNcxh2ZZiK7PX8_z2e1PI0E4TvDz4AiJU1YbcUjHyT4WTcYR8vtjm85TjaRt-2T6sdM71unJAvSKNXabOATDjHsz0W6rwF7pqT0uWF67u2US4"
                  className="w-full h-full object-cover"
                  style={{
                    filter: 'grayscale(1) brightness(0.6) contrast(1.3)',
                  }}
                />
                {/* Genre Tag */}
                <div
                  className="absolute top-0 left-0 text-white px-4 py-1 font-subheading font-black text-sm uppercase"
                  style={{
                    backgroundColor: '#8B0000',
                  }}
                >
                  {story.genre}
                </div>
                {/* Title Overlay */}
                <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black to-transparent">
                  <h3 className="text-3xl text-white font-display leading-tight uppercase">
                    {story.title}
                  </h3>
                </div>
              </div>

              {/* Card Content */}
              <div
                className="p-6"
                style={{
                  backgroundColor: '#E5E5E5',
                }}
              >
                {/* Author Info */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 border-2"
                    style={{
                      borderColor: '#8B0000',
                      backgroundColor: '#050505',
                    }}
                  >
                    <div className="w-full h-full" style={{ backgroundColor: '#8B0000', opacity: 0.5 }} />
                  </div>
                  <span className="font-subheading font-black text-lg uppercase text-pulp-black">
                    {story.author}
                  </span>
                </div>

                {/* Stats */}
                <div
                  className="flex justify-between font-subheading font-bold text-sm border-y-2 py-3 mb-4 text-pulp-black"
                  style={{
                    borderColor: 'rgba(0,0,0,0.1)',
                  }}
                >
                  <span>Views: {story.views}</span>
                  <span>Likes: {story.favorites}</span>
                  <span>NFTs: {story.tokens}</span>
                </div>

                {/* View NFT Button */}
                <Link
                  href="/nft-gallery"
                  className="block text-center py-3 font-display text-2xl uppercase cursor-pointer transition-all hover:opacity-80"
                  style={{
                    backgroundColor: '#050505',
                    color: '#ffffff',
                  }}
                >
                  VIEW NFT
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
