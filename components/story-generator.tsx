'use client';

import { Loader2, BookOpen, Sparkles } from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useWallet } from '@/hooks/use-wallet';
import { generateContentHash } from '@/lib/story-hash';

const genres = [
  'Fantasy',
  'Science Fiction',
  'Mystery',
  'Romance',
  'Horror',
  'Adventure',
];

export function StoryGenerator() {
  const [prompt, setPrompt] = useState('');
  const [genre, setGenre] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [generatedStory, setGeneratedStory] = useState('');
  const [mintStatus, setMintStatus] = useState<'idle' | 'checking' | 'minted' | 'pending' | 'failed'>('idle');
  const [currentStoryHash, setCurrentStoryHash] = useState('');
  const { toast } = useToast();
  const { address } = useWallet();

  // Check if story was already minted when story is generated
  useEffect(() => {
    if (generatedStory) {
      checkMintStatus();
    }
  }, [generatedStory]);

  const checkMintStatus = async () => {
    if (!generatedStory || !address) return;
    
    const contentHash = generateContentHash(generatedStory);
    setCurrentStoryHash(contentHash);
    
    try {
      const checkResponse = await fetch('/api/mint/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          storyHash: contentHash,
          authorAddress: address
        }),
      });
      
      if (checkResponse.ok) {
        const checkData = await checkResponse.json();
        if (checkData.status === 'MINTED') {
          setMintStatus('minted');
        } else if (checkData.status === 'PENDING') {
          setMintStatus('pending');
        } else {
          setMintStatus('idle');
        }
      }
    } catch (error) {
      console.error('Failed to check mint status:', error);
      // Allow minting if check fails
    }
  };

  const handleGenerate = async () => {
    if (!address) {
      toast({
        title: 'Wallet Required',
        description: 'Please connect your wallet to generate stories',
        variant: 'destructive',
      });
      return;
    }
    setIsGenerating(true);
    setMintStatus('idle');
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, genre, creator: address }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate story');
      }
      const data = await response.json();
      setGeneratedStory(data.story);
      toast({
        title: 'Story Generated',
        description: 'Your story has been created successfully!',
      });
    } catch (error) {
      console.error('Failed to generate story:', error);
      toast({
        title: 'Generation Failed',
        description: 'Failed to generate story. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleMint = async () => {
    if (!address) {
      toast({
        title: 'Wallet Required',
        description: 'Please connect your wallet to mint NFTs',
        variant: 'destructive',
      });
      return;
    }

    // Prevent double-minting
    if (mintStatus === 'minted') {
      toast({
        title: 'Already Minted',
        description: 'This story has already been minted as an NFT.',
        variant: 'destructive',
      });
      return;
    }

    if (mintStatus === 'pending') {
      toast({
        title: 'Minting In Progress',
        description: 'A minting request for this story is already in progress.',
        variant: 'destructive',
      });
      return;
    }

    setIsMinting(true);
    setMintStatus('checking');
    try {
      // Generate content hash for idempotent minting
      const storyHash = currentStoryHash || generateContentHash(generatedStory);
      
      // Upload to IPFS first
      const ipfsResponse = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          story: generatedStory,
          genre,
          creator: address,
        }),
      });

      if (!ipfsResponse.ok) {
        throw new Error('Failed to upload to IPFS');
      }
      const { metadataUri } = await ipfsResponse.json();

      // Mint NFT with story hash for idempotency
      const mintResponse = await fetch('/api/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metadataUri,
          creator: address,
          storyHash: storyHash, // Include story hash for idempotency
        }),
      });

      if (!mintResponse.ok) {
        // Handle idempotency response
        const mintData = await mintResponse.json().catch(() => ({}));
        if (mintResponse.status === 409) {
          if (mintData.status === 'MINTED') {
            setMintStatus('minted');
            toast({
              title: 'Already Minted',
              description: mintData.message || 'This story has already been minted.',
            });
            return;
          } else if (mintData.status === 'PENDING') {
            setMintStatus('pending');
            toast({
              title: 'Minting In Progress',
              description: mintData.message || 'A minting request is already in progress.',
            });
            return;
          }
        }
        throw new Error(mintData.error || 'Failed to mint NFT');
      }

      setMintStatus('minted');
      toast({
        title: 'NFT Minted',
        description: 'Your story has been successfully minted as an NFT!',
      });
    } catch (error) {
      console.error('Failed to mint NFT:', error);
      setMintStatus('failed');
      toast({
        title: 'Minting Failed',
        description: 'Failed to mint NFT. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsMinting(false);
    }
  };

  const isMinted = mintStatus === 'minted';
  const isPending = mintStatus === 'pending';

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Story Prompt</label>
          <Textarea
            placeholder="Enter your story idea..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="h-32"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Genre</label>
          <Select value={genre} onValueChange={setGenre}>
            <SelectTrigger>
              <SelectValue placeholder="Select a genre" />
            </SelectTrigger>
            <SelectContent>
              {genres.map((g) => (
                <SelectItem key={g} value={g.toLowerCase()}>
                  <div className="flex items-center">
                    <BookOpen className="w-4 h-4 mr-2" />
                    {g}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={!prompt || !genre || isGenerating || !address}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Story
            </>
          )}
        </Button>

        {generatedStory && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Generated Story</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(generatedStory)}
              >
                {isCopied ? (
                  <><Check className="mr-1 h-4 w-4" />Copied!</>
                ) : (
                  <><Copy className="mr-1 h-4 w-4" />Copy Story</>
                )}
              </Button>
            </div>
            <div className="prose max-w-none bg-secondary/50 p-4 rounded-lg">
              <p>{generatedStory}</p>
            </div>
            
            {/* Show mint status message */}
            {isMinted && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                <p className="text-green-700 font-medium">✓ This story has been minted as NFT</p>
              </div>
            )}
            
            {isPending && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
                <p className="text-yellow-700 font-medium">⏳ Minting in progress...</p>
              </div>
            )}
            
            {mintStatus === 'failed' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                <p className="text-red-700 font-medium">✗ Previous minting attempt failed</p>
              </div>
            )}
            
            <Button
              variant="outline"
              onClick={handleMint}
              disabled={isMinting || isMinted || isPending || !address}
              className="w-full"
            >
              {isMinting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Minting...
                </>
              ) : isMinted ? (
                'Already Minted'
              ) : isPending ? (
                'Minting In Progress'
              ) : (
                'Mint as NFT'
              )}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
