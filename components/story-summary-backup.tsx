'use client';

import {
  Loader2,
  RefreshCw,
  Trash2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { useStorySummary } from '@/hooks/use-story-summary';

interface StorySummaryProps {
  storyId: string;
  content: string;
  title?: string;
  onSummaryGenerated?: (summary: any) => void;
  apiKey?: string;
  className?: string;
}
export function StorySummary({
  storyId,
  content,
  title = 'Story Summary',
  onSummaryGenerated,
  apiKey,
  className,
}: StorySummaryProps) {
  const {
    generateSummary,
    fetchSummary,
    updateSummary,
    deleteSummary,
    isLoading,
    error,
  } = useStorySummary();
  const [summary, setSummary] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>('summary');
  const { toast } = useToast();

  // Get existing summary on mount
  useEffect(() => {
    if (storyId) {
      loadSummary();
    }
  }, [storyId]);

  const loadSummary = async () => {
    const result = await fetchSummary(storyId);
    if (result) {
      setSummary(result);
      if (onSummaryGenerated) {
        onSummaryGenerated(result);
      }
    }
  };

  const handleGenerateSummary = async () => {
    const result = await generateSummary(storyId, content, undefined, apiKey);

    if (result) {
      setSummary(result);
      toast({
        title: 'Summary Generated',
        description: 'The AI summary has been created successfully.',
        variant: 'default',
      });

      if (onSummaryGenerated) {
        onSummaryGenerated(result);
      }
    } else if (error) {
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive',
      });
    }
  };

  const handleRegenerate = async () => {
    if (!summary || !summary._id) return;

    const result = await updateSummary(
      summary._id.toString(),
      {},
      true,
      content
    );

    if (result) {
      setSummary(result);
      toast({
        title: 'Summary Updated',
        description: 'The AI summary has been regenerated successfully.',
        variant: 'default',
      });

      if (onSummaryGenerated) {
        onSummaryGenerated(result);
      }
    } else if (error) {
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!summary || !summary._id) return;

    const success = await deleteSummary(summary._id.toString());

    if (success) {
      setSummary(null);
      toast({
        title: 'Summary Deleted',
        description: 'The AI summary has been removed.',
        variant: 'default',
      });
    } else if (error) {
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive',
      });
    }
  };

  // Render sentiment badge with appropriate color
  const renderSentimentBadge = (sentiment: string) => {
    const sentimentMap: Record<string, { color: string; icon: JSX.Element }> = {
      positive: {
        color: 'bg-green-500/10 text-green-500 hover:bg-green-500/20',
        icon: <CheckCircle className="h-3 w-3 mr-1" />,
      },
      negative: {
        color: 'bg-red-500/10 text-red-500 hover:bg-red-500/20',
        icon: <AlertCircle className="h-3 w-3 mr-1" />,
      },
      mixed: {
        color: 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20',
        icon: <></>,
      },
      neutral: {
        color: 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20',
        icon: <></>,
      },
    };

    const { color, icon } = sentimentMap[sentiment.toLowerCase()] || {
      color: 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20',
      icon: <></>,
    };

    return (
      <Badge
        variant="outline"
        className={`${color} flex items-center capitalize`}
      >
        {icon}
        {sentiment}
      </Badge>
    );
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>{title}</span>
          {summary?.sentiment && renderSentimentBadge(summary.sentiment)}
        </CardTitle>
        <CardDescription>
          AI-powered analysis and summary using Groq's LLM
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Processing with AI...</span>
          </div>
        ) : !summary ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              No summary has been generated yet. Click the button below to
              create an AI-powered summary of this story.
            </p>
            <Button onClick={handleGenerateSummary}>Generate Summary</Button>
          </div>
        ) : (
          <Tabs
            defaultValue="summary"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="keyPoints">Key Points</TabsTrigger>
              <TabsTrigger value="keywords">Keywords</TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="mt-4">
              <div className="whitespace-pre-line">{summary.summary}</div>
            </TabsContent>

            <TabsContent value="keyPoints" className="mt-4">
              <ul className="space-y-2 pl-5 list-disc">
                {summary.keyPoints.map((point: string, index: number) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            </TabsContent>

            <TabsContent value="keywords" className="mt-4">
              <div className="flex flex-wrap gap-2">
                {summary.keywords.map((keyword: string, index: number) => (
                  <Badge key={index} variant="secondary">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>

      {summary && (
        <CardFooter className="flex justify-between">
          <div className="text-xs text-muted-foreground">
            {new Date(summary.updatedAt).toLocaleDateString()} ·{' '}
            {summary.model?.split('/').pop() || 'AI'}
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRegenerate}
              disabled={isLoading}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Regenerate
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={isLoading}
              className="text-destructive border-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}

export default StorySummary;
