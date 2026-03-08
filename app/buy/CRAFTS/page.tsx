'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import { Coins, Wallet, Sparkles, AlertCircle, ArrowRight, ShieldCheck, Gem } from 'lucide-react';
import { useWeb3 } from '@/components/providers/web3-provider';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// 1 Dollar = 30 coins + 5 coins free. Indian Rupee equivalent is ~₹85 for UX purposes.
const PACKS = [
  {
    id: 'starter',
    name: 'Starter Pack',
    coins: 30,
    bonus: 5,
    priceUSD: 1,
    priceINR: 91.94,
    popular: false,
    gradient: 'from-blue-600/20 to-cyan-600/20',
    border: 'border-blue-500/30',
    button: 'bg-blue-600 hover:bg-blue-500',
  },
  {
    id: 'popular',
    name: 'Pro Creator',
    coins: 150,
    bonus: 30,
    priceUSD: 5,
    priceINR: 459.70,
    popular: true,
    gradient: 'from-emerald-600/20 to-teal-600/20',
    border: 'border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]',
    button: 'bg-emerald-600 hover:bg-emerald-500',
  },
  {
    id: 'elite',
    name: 'Elite Stack',
    coins: 300,
    bonus: 75,
    priceUSD: 10,
    priceINR: 919.40,
    popular: false,
    gradient: 'from-purple-600/20 to-pink-600/20',
    border: 'border-purple-500/30',
    button: 'bg-purple-600 hover:bg-purple-500',
  },
  {
    id: 'ultimate',
    name: 'Studio Master',
    coins: 1500,
    bonus: 500,
    priceUSD: 50,
    priceINR: 4597.00,
    popular: false,
    gradient: 'from-amber-600/20 to-orange-600/20',
    border: 'border-amber-500/30',
    button: 'bg-amber-600 hover:bg-amber-500 text-amber-950 font-bold',
  },
];

export default function BuyCRAFTSPage() {
  const [session, setSession] = useState<any>(null);
  const supabase = React.useMemo(() => createClient(), []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const { connected, connecting, account, connectWallet } = useWeb3();
  const { toast } = useToast();
  
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const handlePurchase = async (packId: string, coins: number, bonus: number) => {
    if (!session) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to purchase CRAFTS tokens.',
        variant: 'destructive',
      });
      return;
    }

    if (!connected) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your Ethereum wallet to proceed with the transaction.',
        variant: 'destructive',
      });
      connectWallet();
      return;
    }

    setIsProcessing(packId);

    try {
      // Simulate Web3 transaction delay
      await new Promise((resolve) => setTimeout(resolve, 2500));
      
      toast({
        title: 'Purchase Successful!',
        description: `Successfully credited ${coins + bonus} CRAFTS tokens to your account synced at ${account?.slice(0,6)}...${account?.slice(-4)}.`,
      });
      
      // Here you would optimally call a backend API to finalize the transaction verification 
      // and database update or interact with the smart contract directly.
    } catch (error) {
      toast({
        title: 'Transaction Failed',
        description: 'There was an error processing your Web3 payment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 md:px-6 lg:px-8 bg-black">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[150px]" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-16 space-y-4 perspective-1000">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, rotateY: [0, 15, -15, 0] }}
            transition={{ rotateY: { duration: 6, repeat: Infinity, ease: "easeInOut" }, opacity: { duration: 0.5 }, scale: { duration: 0.5 } }}
            className="w-24 h-24 mx-auto bg-gradient-to-br from-yellow-500/20 to-amber-500/20 rounded-full flex items-center justify-center border border-yellow-500/30 mb-8 shadow-[0_0_50px_rgba(234,179,8,0.2)] relative preserve-3d"
          >
            <div className="absolute inset-0 bg-yellow-400/20 blur-xl rounded-full" />
            <Coins className="w-12 h-12 text-yellow-400 drop-shadow-[0_0_15px_rgba(234,179,8,0.8)] relative z-10" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
            Get <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">CRAFTS</span> Tokens
          </h1>
          <p className="text-lg text-white/50 max-w-2xl mx-auto">
            The native currency of Comicraft. Use CRAFTS to generate stories, mint comics, trade NFTs, and participate in the studio economy.
          </p>
        </div>

        {/* State Alerts */}
        {(!session || !connected) && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="max-w-2xl mx-auto mb-10"
          >
            <Alert className="bg-white/[0.02] border-amber-500/30 text-amber-200 backdrop-blur-md">
              <AlertCircle className="h-4 w-4 text-amber-400" />
              <AlertTitle>Action Required</AlertTitle>
              <AlertDescription className="text-amber-200/70 mt-1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <span>You need to be logged in and have your wallet connected to buy CRAFTS.</span>
                {!connected && (
                  <Button 
                    onClick={connectWallet} 
                    disabled={connecting}
                    size="sm" 
                    className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30"
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    {connecting ? 'Connecting...' : 'Connect Wallet'}
                  </Button>
                )}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PACKS.map((pack, index) => (
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              key={pack.id}
              className={`relative bg-black/40 backdrop-blur-xl rounded-3xl border p-1 ${pack.border} transition-all duration-300 hover:scale-[1.02]`}
            >
              {pack.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full text-[10px] font-bold tracking-wider uppercase text-white shadow-lg">
                  Most Popular
                </div>
              )}
              
              <div className={`h-full rounded-[20px] bg-gradient-to-b ${pack.gradient} p-6 flex flex-col relative overflow-hidden`}>
                {/* Decorative background flair */}
                <div className="absolute -top-12 -right-12 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
                
                <h3 className="text-xl font-bold text-white mb-2">{pack.name}</h3>
                
                <div className="flex items-end gap-2 mb-6 relative">
                  <motion.div 
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 3 + index * 0.5, repeat: Infinity, ease: "easeInOut" }}
                    className="flex items-center gap-3 relative z-10"
                  >
                    <div className="relative">
                      <div className="absolute inset-0 bg-yellow-400/30 blur-md rounded-full" />
                      <Coins className="w-8 h-8 text-yellow-400 relative z-10 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
                    </div>
                    <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-yellow-100 to-yellow-500 drop-shadow-sm">{pack.coins}</span>
                  </motion.div>
                </div>

                {pack.bonus > 0 && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold w-max mb-6">
                    <Sparkles className="w-3.5 h-3.5" />
                    +{pack.bonus} FREE
                  </div>
                )}

                <div className="mt-auto space-y-4">
                  <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                    <div>
                      <p className="text-xs text-white/40 mb-1">Total</p>
                      <p className="text-lg font-bold text-white">₹{pack.priceINR}</p>
                    </div>
                    <p className="text-sm font-medium text-white/30">
                      ${pack.priceUSD}
                    </p>
                  </div>

                  <Button
                    onClick={() => handlePurchase(pack.id, pack.coins, pack.bonus)}
                    disabled={isProcessing === pack.id || !session || !connected}
                    className={`w-full ${pack.button} text-white border-0 py-6 text-base font-semibold transition-all`}
                  >
                    {isProcessing === pack.id ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Buy Now <ArrowRight className="w-4 h-4 ml-1" />
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Info Footer */}
        <div className="mt-16 flex flex-col md:flex-row items-center justify-center gap-8 text-center md:text-left text-sm text-white/40 bg-white/[0.02] border border-white/5 rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-white/20" />
            <div>
              <p className="font-semibold text-white/60">Secure Web3 Transactions</p>
              <p>Powered by Ethereum smart contracts</p>
            </div>
          </div>
          <div className="hidden md:block w-px h-10 bg-white/10" />
          <div className="flex items-center gap-3">
            <Wallet className="w-8 h-8 text-white/20" />
            <div>
              <p className="font-semibold text-white/60">Direct Wallet Sync</p>
              <p>Tokens reflect instantly in your connected wallet</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
