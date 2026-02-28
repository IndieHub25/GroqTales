'use client';

import {
  Heart,
  MessageSquare,
  Sparkles,
  PenSquare,
  ArrowUpRight,
  Eye,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState, memo } from 'react';


import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface StoryAuthor {
  name: string;
  avatar?: string;
  username?: string;
}
interface Story {
  id: string;
  title: string;
  content?: string;
  author: string | StoryAuthor;
  authorAvatar?: string;
  authorUsername?: string;
  likes?: number;
  views?: number;
  comments?: number;
  coverImage?: string;
  image?: string;
  description?: string;
  price?: string;
  isTop10?: boolean;
  genre?: string;
}
interface StoryCardProps {
  story: Story;
  viewMode?: 'grid' | 'list';
  hideLink?: boolean;
  showCreateButton?: boolean;
  isWalletConnected?: boolean;
  isAdmin?: boolean;
}

export const StoryCard = memo(function StoryCard({
  story,
  viewMode = 'grid',
  hideLink = false,
  showCreateButton = false,
  isWalletConnected = false,
  isAdmin = false,
}: StoryCardProps) {
  const router = useRouter();
  const [isFlipped, setIsFlipped] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const authorName = typeof story.author === 'string' ? story.author : story.author?.name || 'Anonymous';
  const authorAvatar = typeof story.author === 'string' ? story.authorAvatar : story.author?.avatar || story.authorAvatar;
  const storyContent = story.content || story.description || 'No teaser available. Step inside to discover the full narrative and unearth the secrets within.';
  const isGrid = viewMode === 'grid';

  const handleViewNFT = () => {
    router.push(`/story/${story.id}`);
  };

  const handleCreateSimilar = () => {
    router.push(`/create?similar=${story.id}`);
  };

  const imageNode = (
    <div className="absolute inset-0 w-full h-full">
      {story.coverImage || story.image ? (
        <Image
          src={story.coverImage || story.image || ''}
          alt={story.title}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-indigo-950 via-slate-900 to-black flex items-center justify-center">
          <Sparkles className="h-12 w-12 text-white/20" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80" />
    </div>
  );

  return (
    <>
      <div 
        className={cn(
          "relative w-full",
          isGrid ? "h-[420px]" : "h-[200px]"
        )}
        style={{ perspective: '1000px' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => { setIsHovered(false); setIsFlipped(false); }}
      >
        <motion.div
          className="w-full h-full relative cursor-pointer"
          animate={{ rotateY: isFlipped ? 180 : 0, scale: isHovered ? 1.02 : 1 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
          style={{ transformStyle: 'preserve-3d' }}
          onClick={() => isGrid ? setIsFlipped(!isFlipped) : handleViewNFT()}
        >
          {/* Front of Card */}
          <div 
            className="absolute inset-0 w-full h-full backface-hidden rounded-2xl overflow-hidden border border-white/10 bg-black shadow-2xl"
            style={{ backfaceVisibility: 'hidden' }}
          >
            {imageNode}
            
            {/* Shimmer Effect */}
            <AnimatePresence>
              {isHovered && (
                <motion.div 
                  initial={{ x: '-100%', opacity: 0 }}
                  animate={{ x: '200%', opacity: 0.3 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                  className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-white to-transparent skew-x-12 z-10 pointer-events-none"
                />
              )}
            </AnimatePresence>

            {/* Front Content */}
            <div className="absolute inset-0 flex flex-col justify-end p-5 z-20">
              <div className="flex justify-between items-start mb-auto">
                <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md rounded-full pr-3 pl-1 py-1 border border-white/10">
                  <Avatar className="h-6 w-6 border border-white/20">
                    <AvatarImage src={authorAvatar} alt={authorName} />
                    <AvatarFallback className="bg-white/10 text-white text-[10px]">{authorName?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-medium text-white/90">{authorName}</span>
                </div>
                {story.genre && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-white/10 backdrop-blur-md border border-white/10 px-2 py-1.5 rounded-lg shadow-sm">
                    {story.genre}
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-2xl font-semibold text-white mb-2 leading-tight drop-shadow-md">
                  {story.title}
                </h3>
                
                <div className="flex items-center gap-4 text-white/60 text-xs font-medium border-t border-white/10 pt-3 mt-1">
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    <span>{story.likes || 0}</span>
                  </div>
                  {story.views !== undefined && (
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{story.views}</span>
                    </div>
                  )}
                  {story.price && (
                    <div className="ml-auto text-emerald-400 font-bold bg-emerald-400/10 px-2 py-1 rounded">
                      {story.price} ETH
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Back of Card */}
          <div 
            className="absolute inset-0 w-full h-full backface-hidden rounded-2xl overflow-hidden border border-white/20 bg-slate-900 shadow-2xl flex flex-col"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            {/* Dimmed background for the back */}
            <div className="absolute inset-0 w-full h-full opacity-20 filter blur-sm">
              {story.coverImage || story.image ? (
                <Image src={story.coverImage || story.image || ''} alt="" fill className="object-cover" />
              ) : null}
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 to-black z-0" />

            <div className="relative z-10 flex flex-col h-full p-6 text-center">
              <h3 className="text-lg font-semibold text-white mb-4 line-clamp-1">{story.title}</h3>
              
              <div className="flex-1 flex flex-col items-center justify-center">
                <QuoteIcon className="w-6 h-6 text-white/20 mb-3" />
                <p className="text-sm text-white/70 italic line-clamp-4 leading-relaxed px-2">
                  "{storyContent}"
                </p>
              </div>

              <div className="mt-auto pt-6 flex flex-col gap-2">
                <Button 
                  onClick={(e) => { e.stopPropagation(); handleViewNFT(); }}
                  className="w-full bg-white text-black hover:bg-white/90 rounded-xl font-semibold transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                >
                  <BookOpenIcon className="w-4 h-4 mr-2" /> Read Full Story
                </Button>
                
                {showCreateButton && (
                  <Button 
                    variant="outline"
                    onClick={(e) => { e.stopPropagation(); handleCreateSimilar(); }}
                    className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl transition-all"
                  >
                    <PenSquare className="w-4 h-4 mr-2" /> Remix / Mint Similar
                  </Button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

    </>
  );
});

export default StoryCard;

function QuoteIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.192 15.757c0-.88-.23-1.618-.69-2.217-.326-.412-.768-.683-1.327-.812-.55-.128-1.07-.137-1.54-.028-.16-.95.153-1.996.94-3.142.365-.53.774-1.01 1.226-1.44l-1.4-1.332C7.306 7.915 6.366 9.53 6 11.63c-.112.637-.123 1.21-.034 1.72.088.51.275.987.56 1.43.286.443.682.805 1.188 1.087.506.28 1.103.422 1.79.422.56 0 1.054-.108 1.482-.324.428-.216.76-.513.996-.89.236-.378.354-.78.354-1.206l-1.144-.112zm8.808 0c0-.88-.23-1.618-.69-2.217-.326-.412-.768-.683-1.327-.812-.55-.128-1.07-.137-1.54-.028-.16-.95.153-1.996.94-3.142.365-.53.774-1.01 1.226-1.44l-1.4-1.332c-1.096 1.13-2.036 2.744-2.402 4.845-.112.637-.123 1.21-.034 1.72.088.51.275.987.56 1.43.286.443.682.805 1.188 1.087.506.28 1.103.422 1.79.422.56 0 1.054-.108 1.482-.324.428-.216.76-.513.996-.89.236-.378.354-.78.354-1.206l-1.144-.112z" />
    </svg>
  );
}

function BookOpenIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
    </svg>
  );
}
