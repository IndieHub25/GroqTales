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
import React, { useState, useEffect, useRef } from 'react';

import { useWeb3 } from '@/components/providers/web3-provider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { generateContentHash } from '@/lib/story-hash';
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
  const [mintStatus, setMintStatus] = useState<'idle' | 'checking' | 'minted' | 'pending' | 'failed'>('idle');
  const [currentStoryHash, setCurrentStoryHash] = useState('');

  // Session lock to prevent double-clicks during mint
  const mintSessionLock = useRef(false);

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
    setMintStatus('idle');
    setCurrentStoryHash('');
    try {      // Simulate AI story generation
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

      // Generate content hash for idempotent minting
      const contentHash = generateContentHash(mockStory);
      setCurrentStoryHash(contentHash);
      
      // Check if this content has already been minted
      try {
        const checkResponse = await fetch((process.env.NEXT_PUBLIC_API_URL || 'https://groqtales-backend-api.onrender.com') + '/api/mint/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            storyHash: contentHash,
            authorAddress: account // Include wallet address for ownership check
          }),
        });
        
        if (checkResponse.ok) {
          const checkData = await checkResponse.json();
          if (checkData.status === 'MINTED') {
            setMintStatus('minted');
          } else if (checkData.status === 'PENDING') {
            setMintStatus('pending');
          }
        }
      } catch (error) {
        // If check fails, allow minting attempt
        console.error('Failed to check mint status:', error);
      }
      
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
    // Step 1: Guard to prevent double-click spam using session lock
    if (mintSessionLock.current) {
      console.log("Mint blocked: Session lock is active");
      return;
    }

    // Acquire session lock immediately
    mintSessionLock.current = true;

    console.log("MINT FUNCTION TRIGGERED");

    try {
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
      setMintStatus('checking');

      // Generate content hash for idempotent minting
      const storyHash = currentStoryHash || generateContentHash(generatedContent);

    // Simulate API call
    setTimeout(() => {
      const mockStory = `In the neon-soaked streets of Neo-Tokyo, where the rain never stopped and the holograms danced like ghosts, ${mainCharacterName || 'Kael'
        } tightened ${mainCharacterName ? 'their' : 'his'
        } grip on the data-drive. "They said it couldn't be done," ${mainCharacterName ? 'they' : 'he'
        } muttered, the cybernetic implant in ${mainCharacterName ? 'their' : 'his'
        } left eye whirring softly.

The corporation known as Omni-Corp had eyes everywhere, but they didn't have this. A code so pure, so chaotic, it could rewrite reality itself.

Suddenly, a shadow detached itself from the alley wall. "Hand it over, ${mainCharacterName || 'Kael'
        }," a voice rasped, metallic and cold. It was Unit 734, a hunter-killer droid with a reputation for leaving no witnesses.

${mainCharacterName || 'Kael'} smirked, pulling ${mainCharacterName ? 'their' : 'his'
        } plasma-pistol from its holster. "Come and get it, tin can."

      if (!mintResponse.ok) {
        // Other errors - but not 409 which we handled above
        throw new Error(mintData.error || 'Failed to mint NFT');
      }

      // Success case
      setMintStatus('minted');

      // Set NFT URL if we have tokenId and contract address from the backend
      // Otherwise leave it empty and hide the OpenSea link
      const { tokenId, contractAddress } = mintData.record ?? {};
      if (tokenId && contractAddress) {
        setMintedNftUrl(`https://opensea.io/assets/${contractAddress}/${tokenId}`);
      } else {
        setMintedNftUrl('');
      }
      toast({
        title: 'NFT Minted Successfully!',
        description: 'Your story has been minted as an NFT on the blockchain.',
      });
    } catch (error: unknown) {
      setMintStatus('failed');
      const errMsg = error instanceof Error ? error.message : String(error);
      toast({
        title: 'Minting Failed',
        description: errMsg || 'Failed to mint NFT. Please try again.',
        variant: 'destructive',
      });
    } finally {
      // Always release the session lock and reset minting state
      setIsMinting(false);
      mintSessionLock.current = false;
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
    setMintStatus('idle');
    setCurrentStoryHash('');
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

        <CardContent className="p-0">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="bg-black p-2 flex justify-center gap-4 border-b-4 border-black">
              <TabsList className="bg-transparent gap-4 p-0 h-auto">
                <TabsTrigger
                  value="input"
                  className="font-semibold tracking-wide text-xl px-6 py-2 rounded-xl border-4 border-transparent data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:border-black data-[state=active]:shadow-[0_0_15px_rgba(255,255,255,0.1)] text-white hover:text-emerald-400 transition-all"
                >
                  1. INPUT
                </TabsTrigger>
                <TabsTrigger
                  value="preview"
                  disabled={!generatedStory && !isGenerating}
                  className="font-semibold tracking-wide text-xl px-6 py-2 rounded-xl border-4 border-transparent data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:border-black data-[state=active]:shadow-[0_0_15px_rgba(255,255,255,0.1)] text-white hover:text-emerald-400 transition-all disabled:opacity-50"
                >
                  2. PREVIEW
                </TabsTrigger>
                <TabsTrigger
                  value="mint"
                  disabled={!generatedStory}
                  className="font-semibold tracking-wide text-xl px-6 py-2 rounded-xl border-4 border-transparent data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:border-black data-[state=active]:shadow-[0_0_15px_rgba(255,255,255,0.1)] text-white hover:text-emerald-400 transition-all disabled:opacity-50"
                >
                  3. MINT NFT
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6 md:p-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-50">
              {/* Draft Recovery Modal */}
              <AnimatePresence>
                {showRecoveryModal && recoveredDraft && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                  >
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="bg-white border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl shadow-black/50"
                      role="dialog"
                      aria-modal="true"
                      aria-labelledby="draft-recovery-title"
                    >
                      <div className="text-center space-y-6">
                        <div className="inline-block bg-emerald-500 hover:bg-emerald-400 text-black p-4 rounded-full border border-white/10">
                          <Save className="h-8 w-8 text-black" />
                        </div>

                        <div>
                          <h3 id="draft-recovery-title" className="font-semibold tracking-wide text-2xl mb-2">
                            DRAFT RECOVERED!
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            We found an unsaved draft from{' '}
                            {new Date(recoveredDraft.updatedAt).toLocaleString()}.
                            Would you like to restore it?
                          </p>
                        </div>

                        <div className="flex gap-4">
                          <Button
                            onClick={() => {
                              // Restore draft
                              setPrompt(recoveredDraft.prompt);
                              setStoryTitle(recoveredDraft.storyTitle);
                              setSelectedGenres(recoveredDraft.selectedGenres);
                              setStoryLength(recoveredDraft.storyLength);
                              setMainCharacterName(recoveredDraft.mainCharacterName);
                              setCharacterCount(recoveredDraft.characterCount);
                              setCharacterTraits(recoveredDraft.characterTraits);
                              setCharacterAge(recoveredDraft.characterAge);
                              setCharacterBackground(recoveredDraft.characterBackground);
                              setProtagonistType(recoveredDraft.protagonistType);
                              setPlotType(recoveredDraft.plotType);
                              setConflictType(recoveredDraft.conflictType);
                              setStoryArc(recoveredDraft.storyArc);
                              setPacing(recoveredDraft.pacing);
                              setEndingType(recoveredDraft.endingType);
                              setPlotTwists(recoveredDraft.plotTwists);
                              setIncludeFlashbacks(recoveredDraft.includeFlashbacks);
                              setTimePeriod(recoveredDraft.timePeriod);
                              setLocationType(recoveredDraft.locationType);
                              setWorldBuildingDepth(recoveredDraft.worldBuildingDepth);
                              setAtmosphere(recoveredDraft.atmosphere);
                              setNarrativeVoice(recoveredDraft.narrativeVoice);
                              setTone(recoveredDraft.tone);
                              setWritingStyle(recoveredDraft.writingStyle);
                              setReadingLevel(recoveredDraft.readingLevel);
                              setMood(recoveredDraft.mood);
                              setDialoguePercentage(recoveredDraft.dialoguePercentage);
                              setDescriptionDetail(recoveredDraft.descriptionDetail);
                              setPrimaryTheme(recoveredDraft.primaryTheme);
                              setSecondaryThemes(recoveredDraft.secondaryThemes);
                              setMoralComplexity(recoveredDraft.moralComplexity);
                              setSocialCommentary(recoveredDraft.socialCommentary);
                              setSocialCommentaryTopic(recoveredDraft.socialCommentaryTopic);
                              setViolenceLevel(recoveredDraft.violenceLevel);
                              setRomanceLevel(recoveredDraft.romanceLevel);
                              setLanguageLevel(recoveredDraft.languageLevel);
                              setMatureContent(recoveredDraft.matureContent);
                              setChapterCount(recoveredDraft.chapterCount);
                              setForeshadowing(recoveredDraft.foreshadowing);
                              setSymbolism(recoveredDraft.symbolism);
                              setMultiplePOVs(recoveredDraft.multiplePOVs);
                              setPovCount(recoveredDraft.povCount);
                              setSimilarTo(recoveredDraft.similarTo);
                              setInspiredBy(recoveredDraft.inspiredBy);
                              setAvoidCliches(recoveredDraft.avoidCliches);
                              setIncludeTropes(recoveredDraft.includeTropes);
                              setTemperature(recoveredDraft.temperature);
                              setModelSelection(recoveredDraft.modelSelection);
                              setShowRecoveryModal(false);
                              setRecoveredDraft(null);
                              toast({
                                title: 'DRAFT RESTORED!',
                                description: 'Your previous work has been recovered.',
                                className: 'font-semibold tracking-wide bg-green-400 text-black border border-white/10',
                              });
                            }}
                            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold tracking-wide px-6 py-3"
                          >
                            RESTORE DRAFT
                          </Button>
                          <Button
                            onClick={() => {
                              // Discard draft
                              try {
                                localStorage.removeItem(DRAFT_KEY);
                              } catch (error) {
                                console.warn('Draft discard failed:', error);
                              }
                              setShowRecoveryModal(false);
                              setRecoveredDraft(null);
                              toast({
                                title: 'DRAFT DISCARDED',
                                description: 'Starting fresh!',
                                className: 'font-semibold tracking-wide bg-gray-400 text-black border border-white/10',
                              });
                            }}
                            className="flex-1 font-semibold tracking-wide border border-white/10 bg-white/5 text-white hover:bg-white/5"
                          >
                            DISCARD
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className={`flex-1 relative ${activeTab === "input" ? "block" : "hidden"} space-y-8 mt-0`}>
                {/* Core Prompt Section */}
                <div className="space-y-4">
                  <label htmlFor="ai-prompt" className="font-bangers text-2xl flex items-center gap-2">
                    <MessageSquare className="fill-yellow-400 stroke-black" />
                    WHAT&apos;S THE STORY, HERO? *
                  </label>
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-black rounded-2xl translate-x-2 translate-y-2 group-hover:translate-x-1 group-hover:translate-y-1 transition-transform" />
                    <Textarea
                      id="ai-prompt"
                      placeholder="Enter your prompt here... (e.g., A cyberpunk detective hunting a ghost in the machine)"
                      className="relative bg-white border border-white/10 rounded-xl p-6 text-lg font-medium min-h-[150px] resize-none focus-visible:ring-0 focus-visible:ring-offset-0 selection:bg-emerald-500 hover:border-emerald-400 text-black selection:text-black"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
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
                  <div className="flex flex-wrap gap-3">
                    {genres.map((g) => (
                      <button
                        key={g}
                        onClick={() => toggleGenre(g)}
                        className={`
                          font-bangers text-lg px-4 py-2 rounded-lg border-4 border-black transition-all transform hover:-translate-y-1
                          ${selectedGenres.includes(g)
                            ? 'bg-blue-400 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-1'
                            : 'bg-white text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                          }
                        `}
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

                  <Accordion type="multiple" className="space-y-2">
                    {/* Characters Section */}
                    <AccordionItem
                      value="characters"
                      className="border border-white/10 rounded-xl bg-white dark:bg-gray-900 overflow-hidden"
                    >
                      <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors">
                        <div className="flex items-center gap-3">
                          <Users className="w-6 h-6 text-blue-500" />
                          <span className="font-semibold tracking-wide text-xl">
                            CHARACTER CUSTOMIZATION
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-6 space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label className="font-bold mb-2 block">
                              Main Character Name
                            </Label>
                            <Input
                              placeholder="e.g., Alex"
                              value={mainCharacterName}
                              onChange={(e) =>
                                setMainCharacterName(e.target.value)
                              }
                              className="border-2 border-black"
                              aria-label="Main Character Name"
                            />
                          </div>
                          <div>
                            <Label className="font-bold mb-2 block">
                              Character Count
                            </Label>
                            <Select
                              value={characterCount}
                              onValueChange={setCharacterCount}
                            >
                              <SelectTrigger className="border-2 border-black" aria-label="Character Count">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">1 Character</SelectItem>
                                <SelectItem value="2">2 Characters</SelectItem>
                                <SelectItem value="3">3 Characters</SelectItem>
                                <SelectItem value="4">4 Characters</SelectItem>
                                <SelectItem value="5">5 Characters</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div>
                          <Label className="font-bold mb-2 block">
                            Character Traits (Max 5)
                          </Label>
                          <div className="flex flex-wrap gap-2">
                            {characterTraitOptions.map((trait) => (
                              <button
                                key={trait}
                                onClick={() => toggleTrait(trait)}
                                className={`px-3 py-1 rounded-md border-2 border-black text-sm font-bold transition-all ${characterTraits.includes(trait)
                                    ? 'bg-blue-400 text-white'
                                    : 'bg-white text-black hover:bg-gray-100'
                                  }`}
                              >
                                {trait}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label className="font-bold mb-2 block">
                              Character Age
                            </Label>
                            <Select
                              value={characterAge}
                              onValueChange={setCharacterAge}
                            >
                              <SelectTrigger className="border-2 border-black" aria-label="Character Age">
                                <SelectValue placeholder="Select age range" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="child">Child</SelectItem>
                                <SelectItem value="teen">Teen</SelectItem>
                                <SelectItem value="adult">Adult</SelectItem>
                                <SelectItem value="elder">Elder</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="font-bold mb-2 block">
                              Protagonist Type
                            </Label>
                            <Select
                              value={protagonistType}
                              onValueChange={setProtagonistType}
                            >
                              <SelectTrigger className="border-2 border-black" aria-label="Protagonist Type">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="hero">Hero</SelectItem>
                                <SelectItem value="antihero">
                                  Anti-hero
                                </SelectItem>
                                <SelectItem value="reluctant">
                                  Reluctant Hero
                                </SelectItem>
                                <SelectItem value="villain">
                                  Villain Protagonist
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div>
                          <Label className="font-bold mb-2 block">
                            Character Background (Optional)
                          </Label>
                          <Textarea
                            placeholder="Brief background or backstory for your character..."
                            value={characterBackground}
                            onChange={(e) =>
                              setCharacterBackground(e.target.value)
                            }
                            className="border-2 border-black min-h-[80px]"
                          />
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Plot & Structure Section */}
                    <AccordionItem
                      value="plot"
                      className="border border-white/10 rounded-xl bg-white dark:bg-gray-900 overflow-hidden"
                    >
                      <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-green-50 dark:hover:bg-green-950 transition-colors">
                        <div className="flex items-center gap-3">
                          <Target className="w-6 h-6 text-green-500" />
                          <span className="font-semibold tracking-wide text-xl">
                            PLOT & STRUCTURE
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-6 space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label className="font-bold mb-2 block">
                              Plot Type
                            </Label>
                            <Select
                              value={plotType}
                              onValueChange={setPlotType}
                            >
                              <SelectTrigger className="border-2 border-black" aria-label="Plot Type">
                                <SelectValue placeholder="Select plot type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="quest">Quest</SelectItem>
                                <SelectItem value="mystery">Mystery</SelectItem>
                                <SelectItem value="romance">Romance</SelectItem>
                                <SelectItem value="revenge">Revenge</SelectItem>
                                <SelectItem value="coming-of-age">
                                  Coming of Age
                                </SelectItem>
                                <SelectItem value="survival">
                                  Survival
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="font-bold mb-2 block">
                              Conflict Type
                            </Label>
                            <Select
                              value={conflictType}
                              onValueChange={setConflictType}
                            >
                              <SelectTrigger className="border-2 border-black" aria-label="Conflict Type">
                                <SelectValue placeholder="Select conflict" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="man-vs-man">
                                  Man vs Man
                                </SelectItem>
                                <SelectItem value="man-vs-nature">
                                  Man vs Nature
                                </SelectItem>
                                <SelectItem value="man-vs-self">
                                  Man vs Self
                                </SelectItem>
                                <SelectItem value="man-vs-society">
                                  Man vs Society
                                </SelectItem>
                                <SelectItem value="man-vs-technology">
                                  Man vs Technology
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label className="font-bold mb-2 block">
                              Story Arc
                            </Label>
                            <Select
                              value={storyArc}
                              onValueChange={setStoryArc}
                            >
                              <SelectTrigger className="border-2 border-black" aria-label="Story Arc">
                                <SelectValue placeholder="Select arc" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="three-act">
                                  Three-Act
                                </SelectItem>
                                <SelectItem value="heros-journey">
                                  Hero's Journey
                                </SelectItem>
                                <SelectItem value="in-media-res">
                                  In Media Res
                                </SelectItem>
                                <SelectItem value="non-linear">
                                  Non-linear
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="font-bold mb-2 block">
                              Pacing
                            </Label>
                            <Select value={pacing} onValueChange={setPacing}>
                              <SelectTrigger className="border-2 border-black" aria-label="Pacing">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="slow">Slow Burn</SelectItem>
                                <SelectItem value="moderate">
                                  Moderate
                                </SelectItem>
                                <SelectItem value="fast">Fast-paced</SelectItem>
                                <SelectItem value="action">
                                  Action-packed
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label className="font-bold mb-2 block">
                              Ending Type
                            </Label>
                            <Select
                              value={endingType}
                              onValueChange={setEndingType}
                            >
                              <SelectTrigger className="border-2 border-black">
                                <SelectValue placeholder="Select ending" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="happy">Happy</SelectItem>
                                <SelectItem value="tragic">Tragic</SelectItem>
                                <SelectItem value="bittersweet">
                                  Bittersweet
                                </SelectItem>
                                <SelectItem value="cliffhanger">
                                  Cliffhanger
                                </SelectItem>
                                <SelectItem value="open">Open-ended</SelectItem>
                                <SelectItem value="twist">Twist</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="font-bold mb-2 block">
                              Plot Twists
                            </Label>
                            <Select
                              value={plotTwists}
                              onValueChange={setPlotTwists}
                            >
                              <SelectTrigger className="border-2 border-black">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="0">None</SelectItem>
                                <SelectItem value="1">1 Twist</SelectItem>
                                <SelectItem value="2">2 Twists</SelectItem>
                                <SelectItem value="3">3 Twists</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Setting & World Section */}
                    <AccordionItem
                      value="setting"
                      className="border border-white/10 rounded-xl bg-white dark:bg-gray-900 overflow-hidden"
                    >
                      <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-purple-50 dark:hover:bg-purple-950 transition-colors">
                        <div className="flex items-center gap-3">
                          <Map className="w-6 h-6 text-purple-500" />
                          <span className="font-semibold tracking-wide text-xl">
                            SETTING & WORLD
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-6 space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label className="font-bold mb-2 block">
                              Time Period
                            </Label>
                            <Select
                              value={timePeriod}
                              onValueChange={setTimePeriod}
                            >
                              <SelectTrigger className="border-2 border-black">
                                <SelectValue placeholder="Select period" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ancient">Ancient</SelectItem>
                                <SelectItem value="medieval">
                                  Medieval
                                </SelectItem>
                                <SelectItem value="renaissance">
                                  Renaissance
                                </SelectItem>
                                <SelectItem value="industrial">
                                  Industrial
                                </SelectItem>
                                <SelectItem value="modern">Modern</SelectItem>
                                <SelectItem value="near-future">
                                  Near Future
                                </SelectItem>
                                <SelectItem value="far-future">
                                  Far Future
                                </SelectItem>
                                <SelectItem value="timeless">
                                  Timeless
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="font-bold mb-2 block">
                              Location Type
                            </Label>
                            <Select
                              value={locationType}
                              onValueChange={setLocationType}
                            >
                              <SelectTrigger className="border-2 border-black">
                                <SelectValue placeholder="Select location" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="urban">Urban</SelectItem>
                                <SelectItem value="rural">Rural</SelectItem>
                                <SelectItem value="wilderness">
                                  Wilderness
                                </SelectItem>
                                <SelectItem value="space">Space</SelectItem>
                                <SelectItem value="underwater">
                                  Underwater
                                </SelectItem>
                                <SelectItem value="underground">
                                  Underground
                                </SelectItem>
                                <SelectItem value="fantasy-realm">
                                  Fantasy Realm
                                </SelectItem>
                                <SelectItem value="cyberpunk-city">
                                  Cyberpunk City
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label className="font-bold mb-2 block">
                              World Building Depth
                            </Label>
                            <Select
                              value={worldBuildingDepth}
                              onValueChange={setWorldBuildingDepth}
                            >
                              <SelectTrigger className="border-2 border-black">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="minimal">Minimal</SelectItem>
                                <SelectItem value="moderate">
                                  Moderate
                                </SelectItem>
                                <SelectItem value="rich">Rich</SelectItem>
                                <SelectItem value="immersive">
                                  Immersive
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="font-bold mb-2 block">
                              Atmosphere
                            </Label>
                            <Select
                              value={atmosphere}
                              onValueChange={setAtmosphere}
                            >
                              <SelectTrigger className="border-2 border-black">
                                <SelectValue placeholder="Select atmosphere" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="sunny">Sunny</SelectItem>
                                <SelectItem value="rainy">Rainy</SelectItem>
                                <SelectItem value="stormy">Stormy</SelectItem>
                                <SelectItem value="foggy">Foggy</SelectItem>
                                <SelectItem value="snowy">Snowy</SelectItem>
                                <SelectItem value="mysterious">
                                  Mysterious
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Writing Style Section */}
                    <AccordionItem
                      value="style"
                      className="border border-white/10 rounded-xl bg-white dark:bg-gray-900 overflow-hidden"
                    >
                      <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-orange-50 dark:hover:bg-orange-950 transition-colors">
                        <div className="flex items-center gap-3">
                          <Palette className="w-6 h-6 text-orange-500" />
                          <span className="font-semibold tracking-wide text-xl">
                            WRITING STYLE & TONE
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-6 space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label className="font-bold mb-2 block">
                              Narrative Voice
                            </Label>
                            <Select
                              value={narrativeVoice}
                              onValueChange={setNarrativeVoice}
                            >
                              <SelectTrigger className="border-2 border-black">
                                <SelectValue placeholder="Select voice" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="first-person">
                                  First Person
                                </SelectItem>
                                <SelectItem value="second-person">
                                  Second Person
                                </SelectItem>
                                <SelectItem value="third-limited">
                                  Third Person Limited
                                </SelectItem>
                                <SelectItem value="third-omniscient">
                                  Third Person Omniscient
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="font-bold mb-2 block">Tone</Label>
                            <Select value={tone} onValueChange={setTone}>
                              <SelectTrigger className="border-2 border-black">
                                <SelectValue placeholder="Select tone" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="serious">Serious</SelectItem>
                                <SelectItem value="humorous">
                                  Humorous
                                </SelectItem>
                                <SelectItem value="dark">Dark</SelectItem>
                                <SelectItem value="light">
                                  Light-hearted
                                </SelectItem>
                                <SelectItem value="satirical">
                                  Satirical
                                </SelectItem>
                                <SelectItem value="philosophical">
                                  Philosophical
                                </SelectItem>
                                <SelectItem value="suspenseful">
                                  Suspenseful
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label className="font-bold mb-2 block">
                              Writing Style
                            </Label>
                            <Select
                              value={writingStyle}
                              onValueChange={setWritingStyle}
                            >
                              <SelectTrigger className="border-2 border-black">
                                <SelectValue placeholder="Select style" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="descriptive">
                                  Descriptive
                                </SelectItem>
                                <SelectItem value="dialogue-heavy">
                                  Dialogue-heavy
                                </SelectItem>
                                <SelectItem value="action-oriented">
                                  Action-oriented
                                </SelectItem>
                                <SelectItem value="introspective">
                                  Introspective
                                </SelectItem>
                                <SelectItem value="poetic">Poetic</SelectItem>
                                <SelectItem value="minimalist">
                                  Minimalist
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="font-bold mb-2 block">
                              Reading Level
                            </Label>
                            <Select
                              value={readingLevel}
                              onValueChange={setReadingLevel}
                            >
                              <SelectTrigger className="border-2 border-black">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="children">
                                  Children
                                </SelectItem>
                                <SelectItem value="young-adult">
                                  Young Adult
                                </SelectItem>
                                <SelectItem value="adult">Adult</SelectItem>
                                <SelectItem value="literary">
                                  Literary
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div>
                          <Label className="font-bold mb-2 block">Mood</Label>
                          <Select value={mood} onValueChange={setMood}>
                            <SelectTrigger className="border-2 border-black">
                              <SelectValue placeholder="Select mood" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="hopeful">Hopeful</SelectItem>
                              <SelectItem value="melancholic">
                                Melancholic
                              </SelectItem>
                              <SelectItem value="tense">Tense</SelectItem>
                              <SelectItem value="whimsical">
                                Whimsical
                              </SelectItem>
                              <SelectItem value="gritty">Gritty</SelectItem>
                              <SelectItem value="inspirational">
                                Inspirational
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="font-bold mb-2 block">
                            Dialogue Percentage: {dialoguePercentage[0]}%
                          </Label>
                          <Slider
                            value={dialoguePercentage}
                            onValueChange={setDialoguePercentage}
                            max={100}
                            step={10}
                            className="w-full"
                            aria-label="Dialogue Percentage"
                          />
                        </div>

                        <div>
                          <Label className="font-bold mb-2 block">
                            Description Detail
                          </Label>
                          <Select
                            value={descriptionDetail}
                            onValueChange={setDescriptionDetail}
                          >
                            <SelectTrigger className="border-2 border-black">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="minimal">Minimal</SelectItem>
                              <SelectItem value="moderate">Moderate</SelectItem>
                              <SelectItem value="rich">Rich</SelectItem>
                              <SelectItem value="very-detailed">
                                Very Detailed
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Themes Section */}
                    <AccordionItem
                      value="themes"
                      className="border border-white/10 rounded-xl bg-white dark:bg-gray-900 overflow-hidden"
                    >
                      <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-pink-50 dark:hover:bg-pink-950 transition-colors">
                        <div className="flex items-center gap-3">
                          <Lightbulb className="w-6 h-6 text-pink-500" />
                          <span className="font-semibold tracking-wide text-xl">
                            THEMES & MESSAGES
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-6 space-y-4">
                        <div>
                          <Label className="font-bold mb-2 block">
                            Primary Theme
                          </Label>
                          <Select
                            value={primaryTheme}
                            onValueChange={setPrimaryTheme}
                          >
                            <SelectTrigger className="border-2 border-black">
                              <SelectValue placeholder="Select primary theme" />
                            </SelectTrigger>
                            <SelectContent>
                              {themeOptions.map((theme) => (
                                <SelectItem
                                  key={theme}
                                  value={theme.toLowerCase()}
                                >
                                  {theme}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="font-bold mb-2 block">
                            Secondary Themes (Max 3)
                          </Label>
                          <div className="flex flex-wrap gap-2">
                            {themeOptions.map((theme) => (
                              <button
                                key={theme}
                                onClick={() => toggleTheme(theme.toLowerCase())}
                                className={`px-3 py-1 rounded-md border-2 border-black text-sm font-bold transition-all ${secondaryThemes.includes(theme.toLowerCase())
                                    ? 'bg-pink-400 text-white'
                                    : 'bg-white text-black hover:bg-gray-100'
                                  }`}
                              >
                                {theme}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <Label className="font-bold mb-2 block">
                            Moral Complexity
                          </Label>
                          <Select
                            value={moralComplexity}
                            onValueChange={setMoralComplexity}
                          >
                            <SelectTrigger className="border-2 border-black">
                              <SelectValue placeholder="Select complexity" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="black-white">
                                Black & White
                              </SelectItem>
                              <SelectItem value="shades-gray">
                                Shades of Gray
                              </SelectItem>
                              <SelectItem value="ambiguous">
                                Morally Ambiguous
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-4 pt-4 border-t-2 border-gray-200">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="socialCommentary"
                              checked={socialCommentary}
                              onChange={(e) =>
                                setSocialCommentary(e.target.checked)
                              }
                              className="w-4 h-4 border-2 border-black rounded"
                            />
                            <Label
                              htmlFor="socialCommentary"
                              className="font-bold"
                            >
                              Include Social Commentary
                            </Label>
                          </div>
                          {socialCommentary && (
                            <Input
                              placeholder="Topic or theme for social commentary..."
                              value={socialCommentaryTopic}
                              onChange={(e) =>
                                setSocialCommentaryTopic(e.target.value)
                              }
                              className="border-2 border-black"
                            />
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Content Controls Section */}
                    <AccordionItem
                      value="content"
                      className="border border-white/10 rounded-xl bg-white dark:bg-gray-900 overflow-hidden"
                    >
                      <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-red-50 dark:hover:bg-red-950 transition-colors">
                        <div className="flex items-center gap-3">
                          <Shield className="w-6 h-6 text-red-500" />
                          <span className="font-semibold tracking-wide text-xl">
                            CONTENT CONTROLS
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-6 space-y-4">
                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <Label className="font-bold mb-2 block">
                              Violence Level
                            </Label>
                            <Select
                              value={violenceLevel}
                              onValueChange={setViolenceLevel}
                            >
                              <SelectTrigger className="border-2 border-black">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                <SelectItem value="mild">Mild</SelectItem>
                                <SelectItem value="moderate">
                                  Moderate
                                </SelectItem>
                                <SelectItem value="intense">Intense</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="font-bold mb-2 block">
                              Romance Level
                            </Label>
                            <Select
                              value={romanceLevel}
                              onValueChange={setRomanceLevel}
                            >
                              <SelectTrigger className="border-2 border-black">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                <SelectItem value="subtle">Subtle</SelectItem>
                                <SelectItem value="moderate">
                                  Moderate
                                </SelectItem>
                                <SelectItem value="central">Central</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="font-bold mb-2 block">
                              Language Level
                            </Label>
                            <Select
                              value={languageLevel}
                              onValueChange={setLanguageLevel}
                            >
                              <SelectTrigger className="border-2 border-black">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="family-friendly">
                                  Family-friendly
                                </SelectItem>
                                <SelectItem value="mild">Mild</SelectItem>
                                <SelectItem value="moderate">
                                  Moderate
                                </SelectItem>
                                <SelectItem value="mature">Mature</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="pt-4 border-t-2 border-gray-200">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="matureContent"
                              checked={matureContent}
                              onChange={(e) =>
                                setMatureContent(e.target.checked)
                              }
                              className="w-4 h-4 border-2 border-black rounded"
                            />
                            <Label
                              htmlFor="matureContent"
                              className="font-bold"
                            >
                              Mature Content Warning
                            </Label>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">
                            Enable if story contains mature themes
                          </p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Advanced Options Extended Section */}
                    <AccordionItem
                      value="advanced"
                      className="border border-white/10 rounded-xl bg-white dark:bg-gray-900 overflow-hidden"
                    >
                      <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-cyan-50 dark:hover:bg-cyan-950 transition-colors">
                        <div className="flex items-center gap-3">
                          <Settings className="w-6 h-6 text-cyan-500" />
                          <span className="font-semibold tracking-wide text-xl">
                            ADVANCED OPTIONS
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-6 space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label className="font-bold mb-2 block">
                              Chapter/Section Count
                            </Label>
                            <Select
                              value={chapterCount}
                              onValueChange={setChapterCount}
                            >
                              <SelectTrigger className="border-2 border-black">
                                <SelectValue placeholder="Auto (based on length)" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">1 Chapter</SelectItem>
                                <SelectItem value="3">3 Chapters</SelectItem>
                                <SelectItem value="5">5 Chapters</SelectItem>
                                <SelectItem value="10">10 Chapters</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="font-bold mb-2 block">
                              Foreshadowing
                            </Label>
                            <Select
                              value={foreshadowing}
                              onValueChange={setForeshadowing}
                            >
                              <SelectTrigger className="border-2 border-black">
                                <SelectValue placeholder="Select level" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                <SelectItem value="subtle">Subtle</SelectItem>
                                <SelectItem value="obvious">Obvious</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label className="font-bold mb-2 block">
                              Symbolism
                            </Label>
                            <Select
                              value={symbolism}
                              onValueChange={setSymbolism}
                            >
                              <SelectTrigger className="border-2 border-black">
                                <SelectValue placeholder="Select level" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                <SelectItem value="subtle">Subtle</SelectItem>
                                <SelectItem value="prominent">
                                  Prominent
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <div className="flex items-center space-x-2 mb-2">
                              <input
                                type="checkbox"
                                id="multiplePOVs"
                                checked={multiplePOVs}
                                onChange={(e) =>
                                  setMultiplePOVs(e.target.checked)
                                }
                                className="w-4 h-4 border-2 border-black rounded"
                              />
                              <Label
                                htmlFor="multiplePOVs"
                                className="font-bold"
                              >
                                Multiple POVs
                              </Label>
                            </div>
                            {multiplePOVs && (
                              <Select
                                value={povCount}
                                onValueChange={setPovCount}
                              >
                                <SelectTrigger className="border-2 border-black">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="2">2 POVs</SelectItem>
                                  <SelectItem value="3">3 POVs</SelectItem>
                                  <SelectItem value="4">4 POVs</SelectItem>
                                  <SelectItem value="5">5 POVs</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Inspiration & References Section */}
                    <AccordionItem
                      value="inspiration"
                      className="border border-white/10 rounded-xl bg-white dark:bg-gray-900 overflow-hidden"
                    >
                      <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-amber-50 dark:hover:bg-amber-950 transition-colors">
                        <div className="flex items-center gap-3">
                          <Lightbulb className="w-6 h-6 text-amber-500" />
                          <span className="font-semibold tracking-wide text-xl">
                            INSPIRATION & REFERENCES
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-6 space-y-4">
                        <div>
                          <Label className="font-bold mb-2 block">
                            Similar To (e.g., "X meets Y")
                          </Label>
                          <Input
                            placeholder="e.g., 'Lord of the Rings meets Cyberpunk 2077'"
                            value={similarTo}
                            onChange={(e) => setSimilarTo(e.target.value)}
                            className="border-2 border-black"
                          />
                        </div>

                        <div>
                          <Label className="font-bold mb-2 block">
                            Inspired By (Authors/Works)
                          </Label>
                          <Input
                            placeholder="e.g., 'Tolkien, Asimov, Blade Runner'"
                            value={inspiredBy}
                            onChange={(e) => setInspiredBy(e.target.value)}
                            className="border-2 border-black"
                          />
                        </div>

                        <div>
                          <Label className="font-bold mb-2 block">
                            Tropes to Avoid (Optional)
                          </Label>
                          <div className="flex flex-wrap gap-2">
                            {[
                              'Chosen One',
                              'Love Triangle',
                              'Deus Ex Machina',
                              'Amnesia Plot',
                              'Evil Twin',
                            ].map((trope) => (
                              <button
                                key={trope}
                                onClick={() => {
                                  if (
                                    avoidCliches.includes(trope.toLowerCase())
                                  ) {
                                    setAvoidCliches(
                                      avoidCliches.filter(
                                        (t) => t !== trope.toLowerCase()
                                      )
                                    );
                                  } else {
                                    setAvoidCliches([
                                      ...avoidCliches,
                                      trope.toLowerCase(),
                                    ]);
                                  }
                                }}
                                className={`px-3 py-1 rounded-md border-2 border-black text-sm font-bold transition-all ${avoidCliches.includes(trope.toLowerCase())
                                    ? 'bg-red-400 text-white'
                                    : 'bg-white text-black hover:bg-gray-100'
                                  }`}
                              >
                                {trope}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <Label className="font-bold mb-2 block">
                            Tropes to Include (Optional)
                          </Label>
                          <div className="flex flex-wrap gap-2">
                            {[
                              'Hero Journey',
                              'Mentor Figure',
                              'Found Family',
                              'Redemption Arc',
                              'Underdog Story',
                            ].map((trope) => (
                              <button
                                key={trope}
                                onClick={() => {
                                  if (
                                    includeTropes.includes(trope.toLowerCase())
                                  ) {
                                    setIncludeTropes(
                                      includeTropes.filter(
                                        (t) => t !== trope.toLowerCase()
                                      )
                                    );
                                  } else {
                                    setIncludeTropes([
                                      ...includeTropes,
                                      trope.toLowerCase(),
                                    ]);
                                  }
                                }}
                                className={`px-3 py-1 rounded-md border-2 border-black text-sm font-bold transition-all ${includeTropes.includes(trope.toLowerCase())
                                    ? 'bg-green-400 text-white'
                                    : 'bg-white text-black hover:bg-gray-100'
                                  }`}
                              >
                                {trope}
                              </button>
                            ))}
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

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

                  {(() => {
                    const isMinted = Boolean(mintedNftUrl) || String(mintStatus) === 'minted';
                    const isPending = String(mintStatus) === 'pending';

                    if (isMinted && mintedNftUrl) {
                      return (
                        <div className="text-center space-y-4">
                          <div className="text-green-600">
                            <Sparkles className="h-12 w-12 mx-auto mb-2" />
                            <h3 className="text-lg font-medium">NFT Minted Successfully!</h3>
                          </div>
                          <Button asChild>
                            <a href={mintedNftUrl} target="_blank" rel="noopener noreferrer">
                              View on OpenSea
                            </a>
                          </Button>
                        </div>
                      );
                    }

                    if (isMinted && !mintedNftUrl) {
                      // Minted but no URL available - show success without link
                      return (
                        <div className="text-center space-y-4">
                          <div className="text-green-600">
                            <Sparkles className="h-12 w-12 mx-auto mb-2" />
                            <h3 className="text-lg font-medium">NFT Minted Successfully!</h3>
                            <p className="text-sm text-muted-foreground">
                              Your story has been minted. Transaction details will be available shortly.
                            </p>
                          </div>
                        </div>
                      );
                    }

                    if (isPending) {
                      return (
                        <div className="text-center space-y-4">
                          <div className="text-yellow-600">
                            <Loader2 className="h-12 w-12 mx-auto mb-2 animate-spin" />
                            <h3 className="text-lg font-medium">Minting In Progress</h3>
                            <p className="text-sm text-muted-foreground">
                              A minting request is already in progress for this story.
                            </p>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <Button onClick={handleMintNFT} disabled={isMinting} className="w-full" size="lg">
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
                    );
                  })()}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
