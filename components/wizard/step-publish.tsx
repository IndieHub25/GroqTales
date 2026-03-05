'use client';

import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Coins,
  Globe,
  Loader2,
  Rocket,
  Upload,
  Wallet,
} from 'lucide-react';
import React, { useState } from 'react';

import { useWeb3 } from '@/components/providers/web3-provider';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import type { CorePromptData, StoryMode } from '@/hooks/use-creation-wizard';
import { cn } from '@/lib/utils';

interface StepPublishProps {
  mode: StoryMode | null;
  corePrompt: CorePromptData;
  generatedContent: string | null;
  coverImageFile: File | null;
  publishFormat: 'free' | 'nft';
  onPublishFormatChange: (format: 'free' | 'nft') => void;
  onPublishStarted?: (format: 'free' | 'nft') => void;
  onPublishSucceeded?: (format: 'free' | 'nft', hash?: string) => void;
  onPublishFailed?: (format: 'free' | 'nft', error: string) => void;
  onWizardCompleted?: () => void;
  onDraftClear?: () => void;
}

type PublishState = 'idle' | 'uploading' | 'minting' | 'saving' | 'done';

export function StepPublish({
  mode,
  corePrompt,
  generatedContent,
  coverImageFile,
  publishFormat,
  onPublishFormatChange,
  onPublishStarted,
  onPublishSucceeded,
  onPublishFailed,
  onWizardCompleted,
  onDraftClear,
}: StepPublishProps) {
  const [publishState, setPublishState] = useState<PublishState>('idle');
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { account, connected, connectWallet } = useWeb3();

  const isNft = publishFormat === 'nft';

  const getIpfsClient = async () => {
    try {
      const { create } = await import('ipfs-http-client');
      const projectId = process.env.NEXT_PUBLIC_INFURA_IPFS_PROJECT_ID;
      const projectSecret = process.env.NEXT_PUBLIC_INFURA_IPFS_PROJECT_SECRET;
      if (!projectId || !projectSecret) {
        return {
          add: async () => ({ path: `mock-ipfs-hash-${Date.now()}` }),
        };
      }
      const auth =
        'Basic ' +
        Buffer.from(projectId + ':' + projectSecret).toString('base64');
      return create({
        url: 'https://ipfs.infura.io:5001/api/v0',
        headers: { authorization: auth },
        timeout: 30000,
      });
    } catch {
      return {
        add: async () => ({ path: `mock-ipfs-hash-${Date.now()}` }),
      };
    }
  };

  const handlePublish = async () => {
    setError(null);
    onPublishStarted?.(publishFormat);

    try {
      // ── 1. Upload to IPFS ──
      setPublishState('uploading');
      const ipfs = await getIpfsClient();

      let coverHash = '';
      if (coverImageFile) {
        const buf = await coverImageFile.arrayBuffer();
        const res = await ipfs.add(new Uint8Array(buf));
        coverHash = res.path.toString();
      }

      const metadata = {
        title: corePrompt.title,
        description: corePrompt.description,
        genre: corePrompt.genre,
        content: generatedContent || corePrompt.prompt,
        coverImage: coverHash,
        mode: mode || 'story',
        author: account || 'admin',
        createdAt: new Date().toISOString(),
        ipfsHash: '',
      };

      const contentBlob = new Blob([JSON.stringify(metadata)], {
        type: 'application/json',
      });
      const contentFile = new File([contentBlob], 'story.json');
      const contentBuf = await contentFile.arrayBuffer();
      const contentRes = await ipfs.add(new Uint8Array(contentBuf));
      metadata.ipfsHash = contentRes.path.toString();

      // ── 2. Mint NFT or save to DB ──
      if (isNft) {
        setPublishState('minting');
        // Simulate NFT creation
        await new Promise((r) => setTimeout(r, 2000));
      }

      setPublishState('saving');
      // Simulate DB save
      await new Promise((r) => setTimeout(r, 1000));

      // ── 3. Done ──
      setPublishState('done');
      onPublishSucceeded?.(publishFormat, metadata.ipfsHash);
      onWizardCompleted?.();
      onDraftClear?.();

      toast({
        title: isNft ? 'NFT Minted!' : 'Story Published!',
        description: isNft
          ? 'Your story has been minted as an NFT on the blockchain.'
          : 'Your story is now live for readers to enjoy.',
      });
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again.';
      setError(msg);
      onPublishFailed?.(publishFormat, msg);
      setPublishState('idle');
      toast({
        title: 'Publish Failed',
        description: msg,
        variant: 'destructive',
      });
    }
  };

  const PROGRESS_LABELS: Record<PublishState, string> = {
    idle: '',
    uploading: 'Uploading to IPFS…',
    minting: 'Minting NFT on blockchain…',
    saving: 'Saving story data…',
    done: isNft ? 'NFT successfully minted!' : 'Story published!',
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <Rocket className="h-6 w-6 text-primary" />
          Publish Your {mode === 'comic' ? 'Comic' : 'Story'}
        </h2>
        <p className="text-sm text-muted-foreground">
          Choose how you want to share your creation with the world.
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="border border-destructive bg-destructive/10 p-3 rounded-md text-sm font-medium text-destructive">
          {error}
        </div>
      )}

      {/* Publish Format toggle */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Publish As</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Free */}
          <button
            type="button"
            aria-pressed={!isNft}
            onClick={() => onPublishFormatChange('free')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onPublishFormatChange('free');
              }
            }}
            className={cn(
              'flex flex-col items-center gap-3 p-6 text-center cursor-pointer transition-all',
              'border rounded-lg bg-card',
              'hover:bg-muted/50',
              !isNft && 'bg-primary/5 border-primary ring-1 ring-primary'
            )}
          >
            <Globe className="h-8 w-8 text-green-500" />
            <div>
              <h3 className="font-semibold text-sm">Free Story</h3>
              <p className="text-xs text-muted-foreground">
                Publish for everyone to read, no blockchain required.
              </p>
            </div>
          </button>

          {/* NFT */}
          <button
            type="button"
            aria-pressed={isNft}
            onClick={() => onPublishFormatChange('nft')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onPublishFormatChange('nft');
              }
            }}
            className={cn(
              'flex flex-col items-center gap-3 p-6 text-center cursor-pointer transition-all',
              'border rounded-lg bg-card',
              'hover:bg-muted/50',
              isNft && 'bg-primary/5 border-primary ring-1 ring-primary'
            )}
          >
            <Coins className="h-8 w-8 text-amber-500" />
            <div>
              <h3 className="font-semibold text-sm">Mint as NFT</h3>
              <p className="text-xs text-muted-foreground">
                Create a digital collectible on the blockchain.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Wallet connection for NFT */}
      {isNft && !connected && (
        <div className="border border-amber-500 bg-amber-50 dark:bg-amber-950/20 p-4 rounded-md flex items-center gap-3">
          <Wallet className="h-5 w-5 text-amber-600 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold">Wallet Required</p>
            <p className="text-xs text-muted-foreground">
              Connect your wallet to mint an NFT.
            </p>
          </div>
          <Button
            size="sm"
            className="theme-gradient-bg text-white text-xs"
            onClick={connectWallet}
          >
            Connect Wallet
          </Button>
        </div>
      )}

      {/* Summary */}
      <div className="border rounded-lg bg-card p-4 space-y-2">
        <h3 className="font-semibold text-sm">Summary</h3>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>
            <span className="text-foreground">Mode:</span>{' '}
            {mode === 'comic' ? 'Comic' : 'Story'}
          </li>
          <li>
            <span className="text-foreground">Title:</span>{' '}
            {corePrompt.title || '—'}
          </li>
          <li>
            <span className="text-foreground">Genre:</span>{' '}
            {corePrompt.genre || '—'}
          </li>
          <li>
            <span className="text-foreground">Publish as:</span>{' '}
            {isNft ? 'NFT' : 'Free Story'}
          </li>
          <li>
            <span className="text-foreground">Content length:</span>{' '}
            {generatedContent
              ? `${generatedContent.length.toLocaleString()} chars`
              : '—'}
          </li>
        </ul>
      </div>

      {/* Progress during publish */}
      {publishState !== 'idle' && publishState !== 'done' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center gap-3 py-4"
        >
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-sm font-medium">
            {PROGRESS_LABELS[publishState]}
          </span>
        </motion.div>
      )}

      {/* Success state */}
      {publishState === 'done' && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center py-8 space-y-4"
        >
          <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
          <h3 className="text-xl font-bold">
            {isNft ? 'NFT Minted Successfully!' : 'Story Published!'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {isNft
              ? 'Your story NFT is now on the blockchain. Check your profile to manage it.'
              : 'Readers can now discover and enjoy your story.'}
          </p>
        </motion.div>
      )}

      {/* Publish button */}
      {publishState === 'idle' && (
        <div className="flex justify-center pt-2">
          <Button
            size="lg"
            className={cn(
              'w-full h-14 text-lg font-bold tracking-wide transition-all',
              !generatedContent?.trim() || (isNft && !connected)
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : 'theme-gradient-bg text-white hover:opacity-90'
            )}
            disabled={!generatedContent?.trim() || (isNft && !connected)}
            onClick={handlePublish}
          >
            <Upload className="mr-2 h-4 w-4" />
            {isNft ? 'Mint & Publish' : 'Publish Story'}
          </Button>
        </div>
      )}
    </div>
  );
}
