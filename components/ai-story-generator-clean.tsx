'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2,
  Wand2,
  BookOpen,
  Users,
  MapPin,
  Lightbulb,
  Sparkles,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { useWeb3 } from '@/components/providers/web3-provider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

interface AIStoryGeneratorProps {
  className?: string;
}

interface StoryData {
  title: string;
  content: string;
  genre: string[];
  characters: string[];
  setting: string;
  themes: string[];
}

const genres = [
  'Fantasy',
  'Sci-Fi',
  'Mystery',
  'Romance',
  'Thriller',
  'Horror',
  'Adventure',
  'Comedy',
  'Drama',
  'Historical',
  'Western',
  'Cyberpunk',
];

const storyFormats = [
  { id: 'short', name: 'Short Story', description: '2,000-5,000 words' },
  { id: 'novella', name: 'Novella', description: '17,500-40,000 words' },
  { id: 'novel', name: 'Novel', description: '80,000+ words' },
  { id: 'comic', name: 'Comic Script', description: 'Panel-based narrative' },
];

function LoadingStateIndicator({ message }: { message: string | null }) {
  const messages = [
    'Generating story',
    'Creating worlds',
    'Crafting characters',
    'Building plot',
    'Finalizing details',
  ];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center space-x-3">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <span className="text-lg font-medium">
        {message || messages[currentIndex]}
      </span>
    </div>
  );
}

export default function AIStoryGenerator({
  className = '',
}: AIStoryGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [storyFormat, setStoryFormat] = useState('short');
  const [title, setTitle] = useState('');
  const [mainCharacters, setMainCharacters] = useState('');
  const [plotOutline, setPlotOutline] = useState('');
  const [setting, setSetting] = useState('');
  const [themes, setThemes] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [mintedNftUrl, setMintedNftUrl] = useState('');
  const [activeTab, setActiveTab] = useState('input');

  const { toast } = useToast();
  const { account, connected, connectWallet } = useWeb3();

  const handleGenreToggle = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const generateStory = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Missing Prompt',
        description: 'Please enter a story prompt to generate content.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Simulate AI story generation
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const mockStory = `# ${title || 'Generated Story'}

## Chapter 1: The Beginning

${prompt}

In the ${setting || 'mysterious realm'}, our protagonist ${
        mainCharacters || 'a brave hero'
      } embarked on an extraordinary journey. The themes of ${
        themes || 'courage and discovery'
      } wove through every aspect of this ${
        selectedGenres.join(', ') || 'adventure'
      } tale.

The story unfolded with unexpected twists and turns, leading to a climactic confrontation that would change everything. Through trials and tribulations, our characters discovered the true meaning of ${
        themes || 'friendship and perseverance'
      }.

## Chapter 2: The Journey Continues

As the adventure progressed, new challenges emerged. The ${storyFormat} format allowed for deep exploration of character development and plot complexity. Each scene built upon the last, creating a rich tapestry of narrative elements.

The setting of ${
        setting || 'an enchanted world'
      } provided the perfect backdrop for the unfolding drama. Characters faced their deepest fears and highest aspirations, all while navigating the intricate plot outlined in the initial concept.

## Conclusion

This generated story demonstrates the power of AI-assisted creative writing, combining user input with intelligent narrative construction to create engaging, original content ready for publication or NFT minting.`;

      setGeneratedContent(mockStory);
      setActiveTab('preview');

      toast({
        title: 'Story Generated!',
        description: 'Your AI-powered story has been created successfully.',
      });
    } catch (error) {
      toast({
        title: 'Generation Failed',
        description: 'Failed to generate story. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleMintNFT = async () => {
    if (!connected) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to mint NFTs.',
        variant: 'destructive',
      });
      return;
    }

    if (!generatedContent) {
      toast({
        title: 'No Content',
        description: 'Please generate a story first before minting.',
        variant: 'destructive',
      });
      return;
    }

    setIsMinting(true);
    try {
      // Simulate NFT minting process
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const mockNftUrl = `https://opensea.io/assets/ethereum/0x123.../1`;
      setMintedNftUrl(mockNftUrl);

      toast({
        title: 'NFT Minted Successfully!',
        description: 'Your story has been minted as an NFT on the blockchain.',
      });
    } catch (error) {
      toast({
        title: 'Minting Failed',
        description: 'Failed to mint NFT. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsMinting(false);
    }
  };

  const resetForm = () => {
    setPrompt('');
    setTitle('');
    setMainCharacters('');
    setPlotOutline('');
    setSetting('');
    setThemes('');
    setSelectedGenres([]);
    setGeneratedContent('');
    setMintedNftUrl('');
    setActiveTab('input');
  };

  return (
    <div className={`w-full max-w-6xl mx-auto p-6 space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wand2 className="h-6 w-6 text-primary" />
            <span>AI Story Generator</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="input">Story Input</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="mint">Mint NFT</TabsTrigger>
            </TabsList>

            <TabsContent value="input" className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Story Prompt *
                  </label>
                  <Textarea
                    placeholder="Enter your story idea, theme, or concept..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Title (Optional)
                    </label>
                    <Input
                      placeholder="Story title..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Setting
                    </label>
                    <Input
                      placeholder="Where does your story take place?"
                      value={setting}
                      onChange={(e) => setSetting(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Main Characters
                  </label>
                  <Input
                    placeholder="Describe your main characters..."
                    value={mainCharacters}
                    onChange={(e) => setMainCharacters(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Themes
                  </label>
                  <Input
                    placeholder="Love, adventure, mystery, redemption..."
                    value={themes}
                    onChange={(e) => setThemes(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Genres
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {genres.map((genre) => (
                      <Badge
                        key={genre}
                        variant={
                          selectedGenres.includes(genre) ? 'default' : 'outline'
                        }
                        className="cursor-pointer"
                        onClick={() => handleGenreToggle(genre)}
                      >
                        {genre}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Story Format
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {storyFormats.map((format) => (
                      <Button
                        key={format.id}
                        variant={
                          storyFormat === format.id ? 'default' : 'outline'
                        }
                        className="h-auto p-3 flex flex-col items-start"
                        onClick={() => setStoryFormat(format.id)}
                      >
                        <span className="font-medium">{format.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {format.description}
                        </span>
                      </Button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={generateStory}
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full"
                  size="lg"
                >
                  {isGenerating ? (
                    <LoadingStateIndicator message="Generating your story..." />
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Generate Story
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="space-y-4">
              {generatedContent ? (
                <div className="space-y-4">
                  <div className="prose prose-sm max-w-none bg-muted/50 p-6 rounded-lg">
                    <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                      {generatedContent}
                    </pre>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => setActiveTab('mint')}
                      className="flex-1"
                    >
                      <BookOpen className="mr-2 h-4 w-4" />
                      Mint as NFT
                    </Button>
                    <Button onClick={resetForm} variant="outline">
                      Create New Story
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No story generated yet. Go to Story Input to create one.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="mint" className="space-y-4">
              {!connected ? (
                <div className="text-center py-12 space-y-4">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto" />
                  <div>
                    <h3 className="text-lg font-medium">Connect Your Wallet</h3>
                    <p className="text-muted-foreground">
                      Connect your Web3 wallet to mint your story as an NFT
                    </p>
                  </div>
                  <Button onClick={connectWallet}>Connect Wallet</Button>
                </div>
              ) : !generatedContent ? (
                <div className="text-center py-12">
                  <Wand2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Generate a story first before minting an NFT.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-muted/50 p-6 rounded-lg">
                    <h3 className="font-medium mb-2">Story Details</h3>
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>Title:</strong> {title || 'Untitled Story'}
                      </p>
                      <p>
                        <strong>Genres:</strong>{' '}
                        {selectedGenres.join(', ') || 'None selected'}
                      </p>
                      <p>
                        <strong>Format:</strong>{' '}
                        {storyFormats.find((f) => f.id === storyFormat)?.name}
                      </p>
                      <p>
                        <strong>Length:</strong> ~{generatedContent.length}{' '}
                        characters
                      </p>
                    </div>
                  </div>

                  {mintedNftUrl ? (
                    <div className="text-center space-y-4">
                      <div className="text-green-600">
                        <Sparkles className="h-12 w-12 mx-auto mb-2" />
                        <h3 className="text-lg font-medium">
                          NFT Minted Successfully!
                        </h3>
                      </div>
                      <Button asChild>
                        <a
                          href={mintedNftUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View on OpenSea
                        </a>
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={handleMintNFT}
                      disabled={isMinting}
                      className="w-full"
                      size="lg"
                    >
                      {isMinting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Minting NFT...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-5 w-5" />
                          Mint Story as NFT
                        </>
                      )}
                    </Button>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
