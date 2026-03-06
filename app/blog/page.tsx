'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, BookOpen } from 'lucide-react';

const blogs = [
  {
    slug: 'blog-1',
    title: 'GroqTales: Building an AI‑Native Storytelling Engine on Monad',
    excerpt: 'Most NFT projects treated lore as marketing copy. What if the story was the first-class asset? And what if AI + on-chain rails made it fast to create, fair to share, and transparent to curate?',
    author: 'Mantej Singh',
    date: 'March 2, 2026',
    readTime: '6 min',
    tags: ['AI', 'Web3', 'OpenSource'],
    coverImage: '/blogs/blog-data/Blog 1/blog-logo.png',
  }
];

export default function BlogListingPage() {
  return (
    <div className="min-h-screen bg-background dark:dark-premium-bg selection:bg-primary/30 pb-24">
      <div className="container max-w-6xl mx-auto px-4 py-16 md:py-24">
        
        <header className="mb-16 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/60 font-display" style={{ fontFamily: 'var(--font-comic)' }}>
            The Developer Blog
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Deep dives into the engineering, vision, and ecosystem behind GroqTales.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((blog, index) => (
            <motion.div
              key={blog.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Link href={`/blog/${blog.slug}`} className="block h-full group">
                <div className="flex flex-col h-full bg-[#0a0e1a]/80 border border-white/10 rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300 shadow-lg hover:shadow-[0_8px_30px_rgba(255,77,109,0.15)] transform-gpu hover:-translate-y-1">
                  
                  {/* Card Image Area */}
                  <div className="relative h-48 w-full bg-[#0f172a] overflow-hidden flex items-center justify-center">
                    {blog.coverImage ? (
                      <Image 
                        src={blog.coverImage} 
                        alt={blog.title} 
                        fill 
                        className="object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" 
                      />
                    ) : (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#0a0e1a] to-transparent opacity-80 z-10"></div>
                        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '20px 20px' }}></div>
                        <BookOpen className="w-16 h-16 text-primary/30 z-0 group-hover:scale-110 transition-transform duration-500" />
                      </>
                    )}
                    
                    <div className="absolute bottom-4 left-4 z-20 flex gap-2">
                      {blog.tags.map(tag => (
                        <span key={tag} className="px-2.5 py-1 rounded bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold text-white/90 uppercase tracking-widest">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Card Content Area */}
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium mb-3">
                      <span>{blog.date}</span>
                      <span className="w-1 h-1 rounded-full bg-white/20"></span>
                      <span>{blog.readTime} read</span>
                    </div>
                    
                    <h2 className="text-xl md:text-2xl font-bold text-white group-hover:text-primary transition-colors mb-3 line-clamp-2 leading-tight font-display" style={{ fontFamily: 'var(--font-comic)' }}>
                      {blog.title}
                    </h2>
                    
                    <p className="text-foreground/70 text-sm leading-relaxed mb-6 flex-grow line-clamp-3">
                      {blog.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                      <div className="text-sm font-semibold text-white/90">
                        {blog.author}
                      </div>
                      <div className="flex items-center gap-1 text-primary text-sm font-bold group-hover:translate-x-1 transition-transform">
                        Read <ArrowRight className="w-4 h-4 ml-1" />
                      </div>
                    </div>
                  </div>

                </div>
              </Link>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
}
