'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Eye, DollarSign, Fingerprint, Users, Sparkles,
  X, ChevronRight, Loader2, CheckCircle2, ImageIcon, ArrowLeft,
} from 'lucide-react';
import React, { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

// ── Configurable benefits copy ────────────────────────────────────
const MINT_BENEFITS = [
  {
    icon: <Fingerprint className="w-5 h-5 text-cyan-400" />,
    title: 'Ownership & Credibility',
    desc: 'Minting establishes you as the provable on-chain owner and original creator.',
  },
  {
    icon: <Eye className="w-5 h-5 text-indigo-400" />,
    title: 'Discoverability & Status',
    desc: 'Approved NFTs are curated and featured in the marketplace, improving your visibility.',
  },
  {
    icon: <DollarSign className="w-5 h-5 text-emerald-400" />,
    title: 'Monetization',
    desc: 'Set a minting fee and earn from your audience and collectors.',
  },
  {
    icon: <Shield className="w-5 h-5 text-amber-400" />,
    title: 'Protection',
    desc: 'On-chain records act as timestamped proof-of-creation, guarding against plagiarism.',
  },
  {
    icon: <Users className="w-5 h-5 text-purple-400" />,
    title: 'Community Trust',
    desc: 'Admin review adds quality control, boosting collector confidence in your work.',
  },
];

// ── Types ──────────────────────────────────────────────────────────
interface NftMintModalProps {
  isOpen: boolean;
  onClose: () => void;
  storyId: string;
  storyTitle: string;
  storyDescription?: string;
  coverImageUrl?: string | null;
  tags?: string[];
  genres?: string[];
}

// ── Component ──────────────────────────────────────────────────────
export function NftMintModal({
  isOpen,
  onClose,
  storyId,
  storyTitle,
  storyDescription,
  coverImageUrl,
  tags = [],
  genres = [],
}: NftMintModalProps) {
  const { toast } = useToast();

  const [step, setStep] = useState<'benefits' | 'form' | 'success'>('benefits');

  // Form state
  const [nftName, setNftName] = useState(storyTitle);
  const [nftDescription, setNftDescription] = useState(
    storyDescription ? storyDescription.slice(0, 200) : ''
  );
  const [feeAmount, setFeeAmount] = useState(0);
  const [feeCurrency, setFeeCurrency] = useState('CRAFTS');
  const [supply, setSupply] = useState(1);
  const [royaltyPercentage, setRoyaltyPercentage] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state when modal opens or story changes
  React.useEffect(() => {
    if (isOpen) {
      setStep('benefits');
      setNftName(storyTitle);
      setNftDescription(storyDescription ? storyDescription.slice(0, 200) : '');
      setFeeAmount(0);
      setFeeCurrency('CRAFTS');
      setSupply(1);
      setRoyaltyPercentage(5);
      setIsSubmitting(false);
    }
  }, [isOpen, storyId, storyTitle, storyDescription]);

  // Escape key handler
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = async () => {
    if (!nftName.trim()) {
      toast({ title: 'Name required', description: 'NFT name cannot be empty.', variant: 'destructive' });
      return;
    }
    if (feeAmount < 0) {
      toast({ title: 'Invalid fee', description: 'Fee must be non-negative.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://groqtales-backend-api.onrender.com';

    try {
      const res = await fetch(`${baseUrl}/api/v1/nft/mint-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          storyId,
          nftName: nftName.trim(),
          nftDescription: nftDescription.trim(),
          coverImageUrl,
          feeAmount,
          feeCurrency,
          supply,
          royaltyPercentage,
          metadata: { tags, genres },
        }),
      });

      if (res.ok) {
        setStep('success');
        toast({ title: '🎉 Mint request submitted!', description: 'Your request is now under admin review.' });
      } else {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to submit mint request');
      }
    } catch (error) {
      toast({ title: 'Error', description: (error as Error).message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="mint-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={onClose}
        >
        <motion.div
          key="mint-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mint-modal-title"
          aria-describedby="mint-modal-desc"
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.96 }}
          transition={{ type: 'spring', damping: 26, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-zinc-950 border border-white/10 shadow-2xl shadow-black/50 focus:outline-none"
          tabIndex={-1}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/5 text-white/50 hover:text-white hover:bg-white/10 transition-all z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
          >
            <X className="w-4 h-4" />
          </button>

          {/* ═══ STEP 1: Benefits ═══ */}
          {step === 'benefits' && (
            <div className="p-6 space-y-6">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 border border-cyan-500/20 flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-cyan-400" />
                </div>
                <h2 id="mint-modal-title" className="text-xl font-bold text-white tracking-tight">Mint your story as an NFT?</h2>
                <p id="mint-modal-desc" className="text-sm text-white/50 max-w-sm mx-auto">
                  Your story is now live in the Gallery! You can optionally mint it as a verifiable digital collectible.
                </p>
              </div>

              <div className="space-y-3">
                {MINT_BENEFITS.map((b, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]"
                  >
                    <div className="mt-0.5 flex-shrink-0">{b.icon}</div>
                    <div>
                      <p className="text-sm font-semibold text-white/90">{b.title}</p>
                      <p className="text-xs text-white/40 leading-relaxed">{b.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('form')}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20"
                >
                  Mint as NFT <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 font-medium text-sm transition-all"
                >
                  Maybe later
                </button>
              </div>
            </div>
          )}

          {/* ═══ STEP 2: Configuration Form ═══ */}
          {step === 'form' && (
            <div className="p-6 space-y-5">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setStep('benefits')}
                  aria-label="Back to benefits"
                  className="p-1.5 rounded-lg bg-white/5 text-white/50 hover:text-white transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h2 id="mint-modal-title" className="text-lg font-bold text-white">Configure your NFT</h2>
              </div>

              {/* Cover Preview */}
              {coverImageUrl && (
                <div className="rounded-xl overflow-hidden border border-white/10">
                  <img src={coverImageUrl} alt="NFT Cover" className="w-full h-32 object-cover" />
                </div>
              )}
              <div id="mint-modal-desc" className="sr-only">Set your NFT details, pricing, and supply.</div>

              {/* NFT Name */}
              <div className="space-y-1.5">
                <label htmlFor="nftName" className="text-xs font-semibold text-white/50 uppercase tracking-wider">NFT Name</label>
                <input
                  id="nftName"
                  value={nftName}
                  onChange={(e) => setNftName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-cyan-500/40 transition-all"
                  placeholder="Story title..."
                />
              </div>

              {/* NFT Description */}
              <div className="space-y-1.5">
                <label htmlFor="nftDescription" className="text-xs font-semibold text-white/50 uppercase tracking-wider">Short Description</label>
                <textarea
                  id="nftDescription"
                  value={nftDescription}
                  onChange={(e) => setNftDescription(e.target.value)}
                  rows={3}
                  maxLength={300}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-cyan-500/40 resize-none transition-all"
                  placeholder="A brief description for collectors..."
                />
                <p className="text-[10px] text-white/25 text-right">{nftDescription.length}/300</p>
              </div>

              {/* Price & Currency */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label htmlFor="feeAmount" className="text-xs font-semibold text-white/50 uppercase tracking-wider">Minting Fee</label>
                  <input
                    id="feeAmount"
                    type="number"
                    min={0}
                    step={0.01}
                    value={feeAmount}
                    onChange={(e) => setFeeAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/40 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="feeCurrency" className="text-xs font-semibold text-white/50 uppercase tracking-wider">Currency</label>
                  <select
                    id="feeCurrency"
                    value={feeCurrency}
                    onChange={(e) => setFeeCurrency(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/40 transition-all appearance-none"
                  >
                    <option value="CRAFTS">CRAFTS</option>
                    <option value="ETH">ETH</option>
                  </select>
                </div>
              </div>

              {/* Supply & Royalty */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label htmlFor="supply" className="text-xs font-semibold text-white/50 uppercase tracking-wider">Supply</label>
                  <input
                    id="supply"
                    type="number"
                    min={1}
                    max={10000}
                    value={supply}
                    onChange={(e) => setSupply(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/40 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="royaltyPercentage" className="text-xs font-semibold text-white/50 uppercase tracking-wider">Royalty %</label>
                  <input
                    id="royaltyPercentage"
                    type="number"
                    min={0}
                    max={50}
                    step={0.5}
                    value={royaltyPercentage}
                    onChange={(e) => setRoyaltyPercentage(Math.min(50, Math.max(0, parseFloat(e.target.value) || 0)))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/40 transition-all"
                  />
                </div>
              </div>

              <p className="text-[10px] text-white/25">
                Your request will be reviewed by the Comicraft admin team before listing on the marketplace.
              </p>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !nftName.trim()}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Submitting…
                  </>
                ) : (
                  'Submit for Review'
                )}
              </button>
            </div>
          )}

          {/* ═══ STEP 3: Success ═══ */}
          {step === 'success' && (
            <div className="p-8 text-center space-y-5">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
                className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center"
              >
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              </motion.div>
              <div>
                <h2 id="mint-modal-title" className="text-xl font-bold text-white mb-1">Request Submitted!</h2>
                <p id="mint-modal-desc" className="text-sm text-white/50">
                  Your NFT mint request is now under admin review. You'll be notified once it's approved.
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-8 py-3 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 font-medium text-sm transition-all"
              >
                Close
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
      )}
    </AnimatePresence>
  );
}
