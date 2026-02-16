'use client';

import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import {
  useRoyaltyConfig,
  useConfigureRoyalty,
  type RoyaltyConfig,
} from '@/hooks/use-royalties';

interface RoyaltyConfigFormProps {
  walletAddress: string;
  storyId?: string;
  nftId?: string;
}

export function RoyaltyConfigForm({
  walletAddress,
  storyId,
  nftId,
}: RoyaltyConfigFormProps) {
  const { toast } = useToast();
  const [percentage, setPercentage] = useState(5);

  const { config, isLoading: configLoading, refetch } = useRoyaltyConfig({
    creatorWallet: walletAddress,
    storyId,
    nftId,
  });

  const { configure, isLoading: saving, error: saveError } = useConfigureRoyalty();

  // Populate form with existing config
  useEffect(() => {
    if (!config) return;

    const existing: RoyaltyConfig | undefined = Array.isArray(config)
      ? config[0]
      : config;

    if (existing?.royaltyPercentage !== undefined) {
      setPercentage(existing.royaltyPercentage);
    }
  }, [config]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!walletAddress) return;

    const result = await configure({
      creatorWallet: walletAddress,
      royaltyPercentage: percentage,
      storyId,
      nftId,
    });

    if (result) {
      toast({
        title: 'Royalty Updated',
        description: `Royalty percentage set to ${percentage}%`,
      });
      refetch();
    } else {
      toast({
        title: 'Error',
        description: saveError || 'Failed to update royalty configuration',
        variant: 'destructive',
      });
    }
  };

  if (configLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Royalty Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-12 w-32" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Royalty Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="royalty-percentage" className="font-bold">
              Royalty Percentage
            </Label>
            <div className="flex items-center gap-4">
              <Slider
                id="royalty-slider"
                min={0}
                max={50}
                step={1}
                value={[percentage]}
                onValueChange={([val]) => setPercentage(val)}
                className="flex-1"
              />
              <div className="w-24">
                <Input
                  id="royalty-percentage"
                  type="number"
                  min={0}
                  max={50}
                  value={percentage}
                  onChange={(e) => {
                    const val = Math.min(50, Math.max(0, Number(e.target.value)));
                    setPercentage(val);
                  }}
                />
              </div>
              <span className="font-bold text-lg">%</span>
            </div>
            <p className="text-sm text-muted-foreground">
              You earn {percentage}% of every secondary sale of your NFTs. Range: 0-50%.
            </p>
          </div>

          <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
            <p className="text-sm">
              <strong>Example:</strong> If your NFT sells for 1 ETH, you earn{' '}
              <strong>{(1 * (percentage / 100)).toFixed(4)} ETH</strong> as royalty.
            </p>
          </div>

          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Royalty Settings'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
