'use client';

import { Loader2, BookOpen, Sparkles, Copy, Check } from 'lucide-react';
import React, { useState } from 'react';

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
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();
  const { address } = useWallet();

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
    setIsMinting(true);
    try {
      // Upload to IPFS
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

      // Mint NFT
      const mintResponse = await fetch('/api/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metadataUri,
          creator: address,
        }),
      });

      if (!mintResponse.ok) {
        throw new Error('Failed to mint NFT');
      }
      toast({
        title: 'NFT Minted',
        description: 'Your story has been successfully minted as an NFT!',
      });
    } catch (error) {
      console.error('Failed to mint NFT:', error);
      toast({
        title: 'Minting Failed',
        description: 'Failed to mint NFT. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsMinting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text)
        .then(() => { setIsCopied(true); setTimeout(() => setIsCopied(false), 2000); })
        .catch(() => fallbackCopy(text));
    } else {
      fallbackCopy(text);
    }
  };

  const fallbackCopy = (text: string) => {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      try {
        textarea.focus();
        textarea.select();
        const success = document.execCommand('copy');
        if (!success) throw new Error('execCommand failed');
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } finally {
        document.body.removeChild(textarea);
      }
    } catch {
      toast({
        title: 'Copy Failed',
        description: 'Could not copy automatically. Please select the text and copy manually.',
        variant: 'destructive',
      });
    }
  };

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
            <Button
              variant="outline"
              onClick={handleMint}
              disabled={isMinting || !address}
              className="w-full"
            >
              {isMinting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Minting...
                </>
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
