'use client';

import { useState, useEffect, memo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { useWeb3 } from '@/components/providers/web3-provider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Heart, Eye, ShoppingCart, Search, Star, Palette, BookOpen, Users, Activity, Hexagon, Zap } from 'lucide-react';

interface NFTStory {
  id: string; title: string; author: string; authorAvatar: string;
  coverImage: string; price: string; likes: number; views: number;
  genre: string; isTop10?: boolean; sales?: number; description: string;
  rarity?: 'Common' | 'Rare' | 'Epic' | 'Legendary';
}

const featuredNFTs: NFTStory[] = [
  { id: '1', title: "The Last Dragon's Tale", author: 'Elena Stormweaver', authorAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Elena&backgroundColor=f3e8ff', coverImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=1200&fit=crop&q=80', price: '2.5 ETH', likes: 1247, views: 15420, genre: 'Epic Fantasy', isTop10: true, sales: 156, description: 'An epic tale of the last dragon and the young mage destined to either save or destroy the realm.', rarity: 'Legendary' },
  { id: '2', title: 'Neon Shadows', author: 'Marcus Cyberpunk', authorAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Marcus&backgroundColor=e0f2fe', coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=1200&fit=crop&q=80', price: '1.8 ETH', likes: 892, views: 12300, genre: 'Cyberpunk', isTop10: true, sales: 89, description: 'A gritty cyberpunk noir set in Neo-Tokyo where memories are currency and identity is fluid.', rarity: 'Epic' },
  { id: '3', title: 'The Quantum Paradox', author: 'Dr. Sarah Chen', authorAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Sarah&backgroundColor=fef3c7', coverImage: 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=800&h=1200&fit=crop&q=80', price: '3.2 ETH', likes: 1456, views: 18750, genre: 'Hard Sci-Fi', isTop10: true, sales: 203, description: 'A mind-bending exploration of quantum mechanics and parallel universes through the eyes of a brilliant physicist.', rarity: 'Legendary' },
  { id: 'nft-4', title: 'The Crystal Prophecy', author: 'Marcus Brightwater', authorAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Marcus&backgroundColor=e0f2fe', coverImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=1200&fit=crop&q=80', price: '1.8 ETH', likes: 456, views: 2340, genre: 'Fantasy', sales: 23, description: 'A mystical tale of ancient prophecies and crystal magic that spans across realms.', rarity: 'Epic' },
  { id: 'nft-5', title: 'Digital Dreams', author: 'Neo Matrix', authorAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Neo&backgroundColor=eff6ff', coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=1200&fit=crop&q=80', price: '2.4 ETH', likes: 712, views: 5432, genre: 'Sci-Fi', sales: 42, description: 'A futuristic tale of consciousness uploaded to the digital realm.', rarity: 'Rare' },
];

const ActivityTicker = memo(function ActivityTicker() {
  const activities = [
    "0x4a...2f purchased 'Neon Shadows' for 1.8 ETH",
    "Elena Stormweaver minted a new Legendary asset",
    "0x9c...1a bid 4.2 ETH on 'The Quantum Paradox'",
    "Genre 'Cyberpunk' trending up 15% this hour",
    "Dr. Sarah Chen reached level 45 Creator status"
  ];
  return (
    <div className="w-full bg-emerald-500/10 border-b border-emerald-500/20 text-emerald-400 text-xs font-mono py-1.5 overflow-hidden flex items-center">
      <div className="flex items-center px-4 border-r border-emerald-500/20 shrink-0 uppercase tracking-widest gap-2 bg-black z-10">
        <Activity className="w-3 h-3 animate-pulse" /> Live
      </div>
      <div className="flex whitespace-nowrap animate-[marquee_20s_linear_infinite] opacity-80 pl-4 gap-12">
        {activities.map((a, i) => <span key={i}>{a}</span>)}
        {activities.map((a, i) => <span key={`dup-${i}`}>{a}</span>)}
      </div>
    </div>
  );
});

const NFTCard = memo(function NFTCard({ nft, onLike, onClick }: { nft: NFTStory; onLike: (id: string) => void; onClick: (nft: NFTStory) => void; }) {
  const isLegendary = nft.rarity === 'Legendary';
  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.3 }}
      className="group relative cursor-pointer" onClick={() => onClick(nft)}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl blur-xl -z-10" />
      <div className={`relative bg-white/5 border border-white/10 backdrop-blur-md rounded-3xl overflow-hidden transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] ${isLegendary ? 'group-hover:border-amber-500/50' : 'group-hover:border-white/30'}`}>
        <div className="relative h-[320px] w-full overflow-hidden">
          <Image src={nft.coverImage} alt={nft.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 33vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90" />
          
          <div className="absolute top-4 left-4 flex gap-2">
            {nft.isTop10 && <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/50 backdrop-blur-sm shadow-none"><Star className="w-3 h-3 mr-1" /> Top 10</Badge>}
          </div>
          <Badge variant="outline" className={`absolute top-4 right-4 backdrop-blur-sm border border-white/20 ${isLegendary ? 'text-amber-400 bg-amber-400/10' : 'text-white/80 bg-white/10'}`}>
            {nft.rarity || 'Common'}
          </Badge>

          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-xl font-bold text-white mb-1 line-clamp-1">{nft.title}</h3>
            <div className="flex items-center gap-2">
              <img src={nft.authorAvatar} alt="" className="w-5 h-5 rounded-full border border-white/20" />
              <span className="text-xs text-white/70">{nft.author}</span>
            </div>
          </div>
        </div>

        <div className="p-5">
          <div className="flex justify-between items-center mb-4">
            <Badge className="bg-white/5 text-white/50 border-white/10 hover:bg-white/10">{nft.genre}</Badge>
            <div className="font-bold text-lg text-emerald-400 flex items-center gap-1.5"><Hexagon className="w-4 h-4" /> {nft.price}</div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); onLike(nft.id); }} className="flex-1 rounded-xl bg-white/5 border-white/10 hover:bg-white/10 hover:text-white text-white/70">
              <Heart className="w-4 h-4 mr-2" /> {nft.likes}
            </Button>
            <Button size="sm" className="flex-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              Purchase
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

export default function NFTGalleryPage() {
  const [nfts, setNfts] = useState<NFTStory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'price' | 'likes' | 'recent'>('likes');
  const [loading, setLoading] = useState(true);
  const [selectedNFT, setSelectedNFT] = useState<NFTStory | null>(null);

  const { toast } = useToast();
  const { connected } = useWeb3();

  useEffect(() => {
    const timer = setTimeout(() => { setNfts(featuredNFTs); setLoading(false); }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleLike = (id: string) => {
    if (!connected) { toast({ title: 'Auth Required', description: 'Connect wallet to verify action.' }); return; }
    setNfts(prev => prev.map(nft => nft.id === id ? { ...nft, likes: nft.likes + 1 } : nft));
    toast({ title: 'Signal Boosted', className: 'bg-black border-white/10 text-emerald-400' });
  };

  const filteredNFTs = nfts.filter(nft => {
    const search = nft.title.toLowerCase().includes(searchTerm.toLowerCase()) || nft.author.toLowerCase().includes(searchTerm.toLowerCase());
    const genre = selectedGenre === 'all' || nft.genre === selectedGenre;
    return search && genre;
  }).sort((a, b) => {
    if (sortBy === 'price') return parseFloat(b.price) - parseFloat(a.price);
    if (sortBy === 'likes') return b.likes - a.likes;
    return 0;
  });

  const genres = ['all', ...Array.from(new Set(nfts.map(n => n.genre)))];

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2 }}>
        <Hexagon className="w-16 h-16 text-emerald-500" />
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white selection:bg-emerald-500/30 font-sans pb-24">
      <ActivityTicker />
      
      {/* Background gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-emerald-500/5 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[50vw] h-[50vw] bg-purple-500/5 blur-[120px] rounded-full -translate-x-1/2 translate-y-1/2" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02]" />
      </div>

      <div className="container mx-auto px-6 py-12 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-semibold tracking-wider text-white/70 mb-4">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> MONAD NETWORK
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tighter mb-4">Exchange</h1>
            <p className="text-lg text-white/50 max-w-xl">Acquire legendary artifacts and narrative blueprints forged by the neural engine.</p>
          </div>
          <div className="text-right hidden md:block">
            <div className="text-3xl font-bold font-mono text-emerald-400">24.5k</div>
            <div className="text-sm text-white/40 uppercase tracking-widest">24h Volume (ETH)</div>
          </div>
        </div>

        {/* Filters Panel */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-4 md:p-6 backdrop-blur-md mb-12 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
            <Input 
              placeholder="Search artifacts or creators..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="pl-12 h-14 bg-black/50 border-white/10 rounded-2xl text-white placeholder:text-white/30 focus-visible:ring-emerald-500"
            />
          </div>
          <div className="flex gap-4">
            <Select value={selectedGenre} onValueChange={setSelectedGenre}>
              <SelectTrigger className="w-[160px] h-14 bg-black/50 border-white/10 rounded-2xl text-white font-medium">
                <SelectValue placeholder="Genre" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10 text-white rounded-xl">
                {genres.map(g => <SelectItem key={g} value={g} className="focus:bg-white/10 focus:text-white">{g === 'all' ? 'All Genres' : g}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
              <SelectTrigger className="w-[160px] h-14 bg-black/50 border-white/10 rounded-2xl text-white font-medium">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10 text-white rounded-xl">
                <SelectItem value="likes" className="focus:bg-white/10 focus:text-white">Most Loved</SelectItem>
                <SelectItem value="price" className="focus:bg-white/10 focus:text-white">Highest Price</SelectItem>
                <SelectItem value="recent" className="focus:bg-white/10 focus:text-white">Recently Minted</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Grid */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredNFTs.map(nft => (
              <NFTCard key={nft.id} nft={nft} onLike={handleLike} onClick={setSelectedNFT} />
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredNFTs.length === 0 && (
          <div className="text-center py-24 bg-white/5 border border-white/10 rounded-3xl mt-6">
            <BookOpen className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Void Emptiness</h3>
            <p className="text-white/40">Adjust your sensory filters to locate artifacts.</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Dialog open={!!selectedNFT} onOpenChange={(open) => !open && setSelectedNFT(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black border border-white/10 rounded-3xl text-white outline-none">
          {selectedNFT && (
            <div className="grid md:grid-cols-2 h-[600px]">
              <div className="relative h-full bg-zinc-900">
                <Image src={selectedNFT.coverImage} alt="" fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
              </div>
              <div className="p-8 md:p-10 flex flex-col h-full overflow-y-auto">
                <div className="flex items-center gap-2 mb-4">
                  <Badge className="bg-white/10 text-white border-white/20">{selectedNFT.genre}</Badge>
                  <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">{selectedNFT.rarity || 'Common'}</Badge>
                </div>
                <h2 className="text-3xl font-bold mb-2 tracking-tight">{selectedNFT.title}</h2>
                <div className="flex items-center gap-2 mb-8 text-white/60">
                  <img src={selectedNFT.authorAvatar} alt="" className="w-6 h-6 rounded-full" />
                  By <span className="text-white">{selectedNFT.author}</span>
                </div>
                
                <p className="text-white/70 leading-relaxed mb-8 flex-1">{selectedNFT.description}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <div className="text-white/40 text-xs uppercase tracking-widest mb-1">Current Value</div>
                    <div className="text-2xl font-bold text-emerald-400 flex items-center gap-1"><Hexagon className="w-5 h-5"/> {selectedNFT.price}</div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <div className="text-white/40 text-xs uppercase tracking-widest mb-1">Resonance</div>
                    <div className="text-2xl font-bold text-white flex items-center gap-1.5"><Heart className="w-5 h-5 text-rose-500"/> {selectedNFT.likes}</div>
                  </div>
                </div>

                <div className="flex gap-4 mt-auto">
                  <Button onClick={() => handleLike(selectedNFT.id)} variant="outline" className="flex-1 h-14 rounded-full border-white/20 bg-white/5 hover:bg-white/10">
                    <Heart className="w-5 h-5 mr-2" /> Endorse
                  </Button>
                  <Button className="flex-1 h-14 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-lg">
                    Acquire
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}