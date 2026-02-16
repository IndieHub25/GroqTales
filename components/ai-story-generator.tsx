'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2,
  Wand2,
  BookOpen,
  Users,
  Sparkles,
  Zap,
  MessageSquare,
  Send,
  Save,
  Wallet,
  ChevronDown,
  Settings,
  Palette,
  Map,
  Target,
  Shield,
  Lightbulb,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { useWeb3 } from '@/components/providers/web3-provider';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { truncateAddress } from '@/lib/utils';

interface AIStoryGeneratorProps {
  className?: string;
}

const DRAFT_KEY = "groqtales_story_draft_v1";

interface StoryDraft {
  prompt: string;
  storyTitle: string;
  selectedGenres: string[];
  storyLength: string;
  mainCharacterName: string;
  characterCount: string;
  characterTraits: string[];
  characterAge: string;
  characterBackground: string;
  protagonistType: string;
  plotType: string;
  conflictType: string;
  storyArc: string;
  pacing: string;
  endingType: string;
  plotTwists: string;
  includeFlashbacks: boolean;
  timePeriod: string;
  locationType: string;
  worldBuildingDepth: string;
  atmosphere: string;
  narrativeVoice: string;
  tone: string;
  writingStyle: string;
  readingLevel: string;
  mood: string;
  dialoguePercentage: number[];
  descriptionDetail: string;
  primaryTheme: string;
  secondaryThemes: string[];
  moralComplexity: string;
  socialCommentary: boolean;
  socialCommentaryTopic: string;
  violenceLevel: string;
  romanceLevel: string;
  languageLevel: string;
  matureContent: boolean;
  chapterCount: string;
  foreshadowing: string;
  symbolism: string;
  multiplePOVs: boolean;
  povCount: string;
  similarTo: string;
  inspiredBy: string;
  avoidCliches: string[];
  includeTropes: string[];
  temperature: number[];
  modelSelection: string;
  updatedAt: number;
  version: number;
}

export default function AIStoryGenerator({
  className = '',
}: AIStoryGeneratorProps) {
  // Core required fields
  const [prompt, setPrompt] = useState('');

  // Core optional fields
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [storyLength, setStoryLength] = useState('medium');
  const [storyTitle, setStoryTitle] = useState('');

  // Character customization
  const [mainCharacterName, setMainCharacterName] = useState('');
  const [characterCount, setCharacterCount] = useState('1');
  const [characterTraits, setCharacterTraits] = useState<string[]>([]);
  const [characterAge, setCharacterAge] = useState('');
  const [characterBackground, setCharacterBackground] = useState('');
  const [protagonistType, setProtagonistType] = useState('');

  // Plot & Structure
  const [plotType, setPlotType] = useState('');
  const [conflictType, setConflictType] = useState('');
  const [storyArc, setStoryArc] = useState('');
  const [pacing, setPacing] = useState('moderate');
  const [endingType, setEndingType] = useState('');

  // Setting & World
  const [timePeriod, setTimePeriod] = useState('');
  const [locationType, setLocationType] = useState('');
  const [worldBuildingDepth, setWorldBuildingDepth] = useState('moderate');
  const [atmosphere, setAtmosphere] = useState('');

  // Writing Style & Tone
  const [narrativeVoice, setNarrativeVoice] = useState('');
  const [tone, setTone] = useState('');
  const [writingStyle, setWritingStyle] = useState('');
  const [readingLevel, setReadingLevel] = useState('adult');
  const [mood, setMood] = useState('');

  // Themes
  const [primaryTheme, setPrimaryTheme] = useState('');
  const [secondaryThemes, setSecondaryThemes] = useState<string[]>([]);
  const [moralComplexity, setMoralComplexity] = useState('');
  const [socialCommentary, setSocialCommentary] = useState(false);
  const [socialCommentaryTopic, setSocialCommentaryTopic] = useState('');

  // Content Controls
  const [violenceLevel, setViolenceLevel] = useState('moderate');
  const [romanceLevel, setRomanceLevel] = useState('none');
  const [languageLevel, setLanguageLevel] = useState('family-friendly');
  const [matureContent, setMatureContent] = useState(false);

  // Advanced Options
  const [dialoguePercentage, setDialoguePercentage] = useState([50]);
  const [descriptionDetail, setDescriptionDetail] = useState('moderate');
  const [plotTwists, setPlotTwists] = useState('1');
  const [includeFlashbacks, setIncludeFlashbacks] = useState(false);
  const [chapterCount, setChapterCount] = useState('');
  const [foreshadowing, setForeshadowing] = useState('');
  const [symbolism, setSymbolism] = useState('');
  const [multiplePOVs, setMultiplePOVs] = useState(false);
  const [povCount, setPovCount] = useState('1');

  // Inspiration & References
  const [similarTo, setSimilarTo] = useState('');
  const [inspiredBy, setInspiredBy] = useState('');
  const [avoidCliches, setAvoidCliches] = useState<string[]>([]);
  const [includeTropes, setIncludeTropes] = useState<string[]>([]);

  // Technical Parameters
  const [temperature, setTemperature] = useState([0.7]);
  const [modelSelection, setModelSelection] = useState('default');

  // UI State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedStory, setGeneratedStory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('input');
  const [isMinting, setIsMinting] = useState(false);
  const [mintSuccess, setMintSuccess] = useState(false);

  // Draft Recovery State
  const [recoveredDraft, setRecoveredDraft] = useState<StoryDraft | null>(null);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);

  const { toast } = useToast();
  const { account, connected, connectWallet } = useWeb3();

  // Load initial data from local storage
  useEffect(() => {
    const storedData = localStorage.getItem('storyCreationData');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        if (parsedData.genre) {
          setSelectedGenres([parsedData.genre]);
        }
        localStorage.removeItem('storyCreationData');
      } catch (e) {
        console.error('Error parsing stored story data', e);
      }
    }
  }, []);

  // Draft recovery detection on mount
  useEffect(() => {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (!saved) return;

    try {
      const draft = JSON.parse(saved);
      if (draft?.prompt?.trim()) {
        setRecoveredDraft(draft);
        setShowRecoveryModal(true);
      }
    } catch (error) {
      console.error('Error parsing draft:', error);
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch (removeError) {
        console.warn('Draft cleanup failed:', removeError);
      }
    }
  }, []);

  // Autosave logic with debounce
  useEffect(() => {
    if (!prompt.trim()) return;

    const timeout = setTimeout(() => {
      const draft: StoryDraft = {
        prompt,
        storyTitle,
        selectedGenres,
        storyLength,
        mainCharacterName,
        characterCount,
        characterTraits,
        characterAge,
        characterBackground,
        protagonistType,
        plotType,
        conflictType,
        storyArc,
        pacing,
        endingType,
        plotTwists,
        includeFlashbacks,
        timePeriod,
        locationType,
        worldBuildingDepth,
        atmosphere,
        narrativeVoice,
        tone,
        writingStyle,
        readingLevel,
        mood,
        dialoguePercentage,
        descriptionDetail,
        primaryTheme,
        secondaryThemes,
        moralComplexity,
        socialCommentary,
        socialCommentaryTopic,
        violenceLevel,
        romanceLevel,
        languageLevel,
        matureContent,
        chapterCount,
        foreshadowing,
        symbolism,
        multiplePOVs,
        povCount,
        similarTo,
        inspiredBy,
        avoidCliches,
        includeTropes,
        temperature,
        modelSelection,
        updatedAt: Date.now(),
        version: 1,
      };
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      } catch (error) {
        console.warn('Autosave failed:', error);
      }
    }, 1000); // autosave every 1s after typing stops

    return () => clearTimeout(timeout);
  }, [
    prompt,
    storyTitle,
    selectedGenres,
    storyLength,
    mainCharacterName,
    characterCount,
    characterTraits,
    characterAge,
    characterBackground,
    protagonistType,
    plotType,
    conflictType,
    storyArc,
    pacing,
    endingType,
    plotTwists,
    includeFlashbacks,
    timePeriod,
    locationType,
    worldBuildingDepth,
    atmosphere,
    narrativeVoice,
    tone,
    writingStyle,
    readingLevel,
    mood,
    dialoguePercentage,
    descriptionDetail,
    primaryTheme,
    secondaryThemes,
    moralComplexity,
    socialCommentary,
    socialCommentaryTopic,
    violenceLevel,
    romanceLevel,
    languageLevel,
    matureContent,
    chapterCount,
    foreshadowing,
    symbolism,
    multiplePOVs,
    povCount,
    similarTo,
    inspiredBy,
    avoidCliches,
    includeTropes,
    temperature,
    modelSelection,
  ]);

  const genres = [
    'Fantasy',
    'Sci-Fi',
    'Horror',
    'Mystery',
    'Romance',
    'Adventure',
    'Comedy',
    'Cyberpunk',
    'Thriller',
    'Drama',
  ];

  const characterTraitOptions = [
    'Brave',
    'Cunning',
    'Mysterious',
    'Compassionate',
    'Ruthless',
    'Wise',
    'Impulsive',
    'Loyal',
  ];

  const themeOptions = [
    'Love',
    'Betrayal',
    'Redemption',
    'Power',
    'Freedom',
    'Identity',
    'Sacrifice',
    'Revenge',
    'Hope',
    'Justice',
  ];

  const toggleGenre = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter((g) => g !== genre));
    } else {
      if (selectedGenres.length < 3) {
        setSelectedGenres([...selectedGenres, genre]);
      } else {
        toast({
          title: 'MAXIMUM POWER REACHED!',
          description: 'You can only select up to 3 genres, hero!',
          variant: 'destructive',
          className:
            'font-bangers border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
        });
      }
    }
  };

  const toggleTrait = (trait: string) => {
    if (characterTraits.includes(trait)) {
      setCharacterTraits(characterTraits.filter((t) => t !== trait));
    } else {
      if (characterTraits.length < 5) {
        setCharacterTraits([...characterTraits, trait]);
      }
    }
  };

  const toggleTheme = (theme: string) => {
    if (secondaryThemes.includes(theme)) {
      setSecondaryThemes(secondaryThemes.filter((t) => t !== theme));
    } else {
      if (secondaryThemes.length < 3) {
        setSecondaryThemes([...secondaryThemes, theme]);
      }
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'EMPTY BUBBLE!',
        description: 'Please enter a prompt to start the adventure!',
        variant: 'destructive',
        className:
          'font-bangers border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
      });
      return;
    }

    setIsGenerating(true);
    setActiveTab('preview');

    // Build comprehensive prompt from all parameters
    const storyParams = {
      prompt,
      title: storyTitle,
      genres: selectedGenres,
      length: storyLength,
      character: {
        name: mainCharacterName,
        count: characterCount,
        traits: characterTraits,
        age: characterAge,
        type: protagonistType,
      },
      plot: {
        type: plotType,
        conflict: conflictType,
        arc: storyArc,
        pacing,
        ending: endingType,
        twists: plotTwists,
      },
      setting: {
        timePeriod,
        location: locationType,
        worldBuilding: worldBuildingDepth,
        atmosphere,
      },
      style: {
        voice: narrativeVoice,
        tone,
        writingStyle,
        readingLevel,
        mood,
        dialoguePercentage: dialoguePercentage[0],
        descriptionDetail,
      },
      themes: {
        primary: primaryTheme,
        secondary: secondaryThemes,
        moralComplexity,
      },
      content: {
        violence: violenceLevel,
        romance: romanceLevel,
        language: languageLevel,
      },
      advanced: {
        flashbacks: includeFlashbacks,
      },
    };

    console.log('Story Parameters:', storyParams);

    // Simulate API call
    setTimeout(() => {
      const mockStory = `In the neon-soaked streets of Neo-Tokyo, where the rain never stopped and the holograms danced like ghosts, ${
        mainCharacterName || 'Kael'
      } tightened ${
        mainCharacterName ? 'their' : 'his'
      } grip on the data-drive. "They said it couldn't be done," ${
        mainCharacterName ? 'they' : 'he'
      } muttered, the cybernetic implant in ${
        mainCharacterName ? 'their' : 'his'
      } left eye whirring softly.

The corporation known as Omni-Corp had eyes everywhere, but they didn't have this. A code so pure, so chaotic, it could rewrite reality itself.

Suddenly, a shadow detached itself from the alley wall. "Hand it over, ${
        mainCharacterName || 'Kael'
      }," a voice rasped, metallic and cold. It was Unit 734, a hunter-killer droid with a reputation for leaving no witnesses.

${mainCharacterName || 'Kael'} smirked, pulling ${
        mainCharacterName ? 'their' : 'his'
      } plasma-pistol from its holster. "Come and get it, tin can."

The air crackled with energy as the first shot was fired...`;

      setGeneratedStory(mockStory);
      setIsGenerating(false);
      toast({
        title: 'BOOM! STORY GENERATED!',
        description: 'Your epic tale is ready for review!',
        className:
          'font-bangers bg-green-400 text-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
      });
    }, 3000);
  };

  const handleMint = async () => {
    if (!connected) {
      toast({
        title: 'WALLET LOCKED!',
        description: 'Please connect your wallet to mint this masterpiece!',
        variant: 'destructive',
        className:
          'font-bangers border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
      });
      return;
    }

    setIsMinting(true);

    setTimeout(() => {
      setIsMinting(false);
      setMintSuccess(true);
      // Clear draft on successful mint
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch (error) {
        console.warn('Draft cleanup failed:', error);
      }
      toast({
        title: 'KAZAM! NFT MINTED!',
        description: 'Your story is now eternal on the blockchain!',
        className:
          'font-bangers bg-green-400 text-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
      });
    }, 3000);
  };

  const resetForm = () => {
    setPrompt('');
    setSelectedGenres([]);
    setGeneratedStory(null);
    setMintSuccess(false);
    setActiveTab('input');
  };

  return (
    <div className={`w-full max-w-5xl mx-auto ${className}`}>
      <Card className="border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] bg-white dark:bg-gray-900 overflow-hidden rounded-3xl">
        <CardHeader className="bg-yellow-400 border-b-4 border-black p-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:8px_8px]" />

          <div className="relative z-10 flex items-center justify-between">
            <CardTitle className="flex items-center space-x-3">
              <div className="bg-white p-2 rounded-full border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <Wand2 className="h-8 w-8 text-black" />
              </div>
              <span className="font-bangers text-4xl tracking-wide text-black drop-shadow-sm">
                STORY MAKER 3000
              </span>
            </CardTitle>
            <div className="hidden md:flex space-x-2">
              <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-black" />
              <div className="w-4 h-4 rounded-full bg-yellow-500 border-2 border-black" />
              <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-black" />
            </div>
          </div>
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
                  className="font-bangers text-xl px-6 py-2 rounded-xl border-4 border-transparent data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:border-black data-[state=active]:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)] text-white hover:text-yellow-400 transition-all"
                >
                  1. INPUT
                </TabsTrigger>
                <TabsTrigger
                  value="preview"
                  disabled={!generatedStory && !isGenerating}
                  className="font-bangers text-xl px-6 py-2 rounded-xl border-4 border-transparent data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:border-black data-[state=active]:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)] text-white hover:text-yellow-400 transition-all disabled:opacity-50"
                >
                  2. PREVIEW
                </TabsTrigger>
                <TabsTrigger
                  value="mint"
                  disabled={!generatedStory}
                  className="font-bangers text-xl px-6 py-2 rounded-xl border-4 border-transparent data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:border-black data-[state=active]:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)] text-white hover:text-yellow-400 transition-all disabled:opacity-50"
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
                      className="bg-white border-4 border-black rounded-2xl p-8 max-w-md w-full shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
                      role="dialog"
                      aria-modal="true"
                      aria-labelledby="draft-recovery-title"
                    >
                      <div className="text-center space-y-6">
                        <div className="inline-block bg-yellow-400 p-4 rounded-full border-4 border-black">
                          <Save className="h-8 w-8 text-black" />
                        </div>

                        <div>
                          <h3 id="draft-recovery-title" className="font-bangers text-2xl mb-2">
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
                                className: 'font-bangers bg-green-400 text-black border-4 border-black',
                              });
                            }}
                            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bangers px-6 py-3"
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
                                className: 'font-bangers bg-gray-400 text-black border-4 border-black',
                              });
                            }}
                            className="flex-1 font-bangers border-4 border-black bg-white text-black hover:bg-gray-100"
                          >
                            DISCARD
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              <TabsContent value="input" className="space-y-8 mt-0">
                {/* Core Prompt Section */}
                <div className="space-y-4">
                  <label className="font-bangers text-2xl flex items-center gap-2">
                    <MessageSquare className="fill-yellow-400 stroke-black" />
                    WHAT'S THE STORY, HERO? *
                  </label>
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-black rounded-2xl translate-x-2 translate-y-2 group-hover:translate-x-1 group-hover:translate-y-1 transition-transform" />
                    <Textarea
                      placeholder="Enter your prompt here... (e.g., A cyberpunk detective hunting a ghost in the machine)"
                      className="relative bg-white border-4 border-black rounded-xl p-6 text-lg font-medium min-h-[150px] resize-none focus-visible:ring-0 focus-visible:ring-offset-0 selection:bg-yellow-400 selection:text-black"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                    />
                    <div className="absolute bottom-4 right-4 text-xs font-bold bg-yellow-400 px-2 py-1 border-2 border-black rounded">
                      {prompt.length} CHARS
                    </div>
                  </div>
                </div>

                {/* Optional Title */}
                <div className="space-y-4">
                  <Label className="font-bangers text-xl flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    STORY TITLE (Optional)
                  </Label>
                  <Input
                    placeholder="Leave blank for auto-generation"
                    className="border-4 border-black rounded-lg p-4 text-lg font-medium focus-visible:ring-0 focus-visible:ring-offset-0"
                    value={storyTitle}
                    onChange={(e) => setStoryTitle(e.target.value)}
                  />
                </div>

                {/* Genre Selection */}
                <div className="space-y-4">
                  <label className="font-bangers text-2xl flex items-center gap-2">
                    <Zap className="fill-blue-400 stroke-black" />
                    CHOOSE YOUR FLAVOR (MAX 3)
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {genres.map((g) => (
                      <button
                        key={g}
                        onClick={() => toggleGenre(g)}
                        className={`
                          font-bangers text-lg px-4 py-2 rounded-lg border-4 border-black transition-all transform hover:-translate-y-1
                          ${
                            selectedGenres.includes(g)
                              ? 'bg-blue-400 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-1'
                              : 'bg-white text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                          }
                        `}
                      >
                        {g.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Story Length */}
                <div className="space-y-4">
                  <Label className="font-bangers text-xl flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    STORY LENGTH
                  </Label>
                  <Select value={storyLength} onValueChange={setStoryLength}>
                    <SelectTrigger className="border-4 border-black rounded-lg p-4 text-lg font-bangers">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flash">
                        FLASH (100-500 words)
                      </SelectItem>
                      <SelectItem value="short">
                        SHORT (500-2000 words)
                      </SelectItem>
                      <SelectItem value="medium">
                        MEDIUM (2000-5000 words)
                      </SelectItem>
                      <SelectItem value="long">
                        LONG (5000-10000 words)
                      </SelectItem>
                      <SelectItem value="epic">EPIC (10000+ words)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Advanced Options Accordion */}
                <div className="bg-gray-50 dark:bg-gray-800 border-4 border-black rounded-2xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex items-center gap-2 mb-4">
                    <Settings className="w-6 h-6" />
                    <h3 className="font-bangers text-2xl">ADVANCED OPTIONS</h3>
                    <Badge className="bg-yellow-400 text-black border-2 border-black font-bangers">
                      OPTIONAL
                    </Badge>
                  </div>

                  <Accordion type="multiple" className="space-y-2">
                    {/* Characters Section */}
                    <AccordionItem
                      value="characters"
                      className="border-4 border-black rounded-xl bg-white dark:bg-gray-900 overflow-hidden"
                    >
                      <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors">
                        <div className="flex items-center gap-3">
                          <Users className="w-6 h-6 text-blue-500" />
                          <span className="font-bangers text-xl">
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
                                className={`px-3 py-1 rounded-md border-2 border-black text-sm font-bold transition-all ${
                                  characterTraits.includes(trait)
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
                      className="border-4 border-black rounded-xl bg-white dark:bg-gray-900 overflow-hidden"
                    >
                      <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-green-50 dark:hover:bg-green-950 transition-colors">
                        <div className="flex items-center gap-3">
                          <Target className="w-6 h-6 text-green-500" />
                          <span className="font-bangers text-xl">
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
                      className="border-4 border-black rounded-xl bg-white dark:bg-gray-900 overflow-hidden"
                    >
                      <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-purple-50 dark:hover:bg-purple-950 transition-colors">
                        <div className="flex items-center gap-3">
                          <Map className="w-6 h-6 text-purple-500" />
                          <span className="font-bangers text-xl">
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
                      className="border-4 border-black rounded-xl bg-white dark:bg-gray-900 overflow-hidden"
                    >
                      <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-orange-50 dark:hover:bg-orange-950 transition-colors">
                        <div className="flex items-center gap-3">
                          <Palette className="w-6 h-6 text-orange-500" />
                          <span className="font-bangers text-xl">
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
                      className="border-4 border-black rounded-xl bg-white dark:bg-gray-900 overflow-hidden"
                    >
                      <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-pink-50 dark:hover:bg-pink-950 transition-colors">
                        <div className="flex items-center gap-3">
                          <Lightbulb className="w-6 h-6 text-pink-500" />
                          <span className="font-bangers text-xl">
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
                                className={`px-3 py-1 rounded-md border-2 border-black text-sm font-bold transition-all ${
                                  secondaryThemes.includes(theme.toLowerCase())
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
                      className="border-4 border-black rounded-xl bg-white dark:bg-gray-900 overflow-hidden"
                    >
                      <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-red-50 dark:hover:bg-red-950 transition-colors">
                        <div className="flex items-center gap-3">
                          <Shield className="w-6 h-6 text-red-500" />
                          <span className="font-bangers text-xl">
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
                      className="border-4 border-black rounded-xl bg-white dark:bg-gray-900 overflow-hidden"
                    >
                      <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-cyan-50 dark:hover:bg-cyan-950 transition-colors">
                        <div className="flex items-center gap-3">
                          <Settings className="w-6 h-6 text-cyan-500" />
                          <span className="font-bangers text-xl">
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
                      className="border-4 border-black rounded-xl bg-white dark:bg-gray-900 overflow-hidden"
                    >
                      <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-amber-50 dark:hover:bg-amber-950 transition-colors">
                        <div className="flex items-center gap-3">
                          <Lightbulb className="w-6 h-6 text-amber-500" />
                          <span className="font-bangers text-xl">
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
                                className={`px-3 py-1 rounded-md border-2 border-black text-sm font-bold transition-all ${
                                  avoidCliches.includes(trope.toLowerCase())
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
                                className={`px-3 py-1 rounded-md border-2 border-black text-sm font-bold transition-all ${
                                  includeTropes.includes(trope.toLowerCase())
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

                    {/* Technical Parameters Section */}
                    <AccordionItem
                      value="technical"
                      className="border-4 border-black rounded-xl bg-white dark:bg-gray-900 overflow-hidden"
                    >
                      <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors">
                        <div className="flex items-center gap-3">
                          <Zap className="w-6 h-6 text-indigo-500" />
                          <span className="font-bangers text-xl">
                            TECHNICAL PARAMETERS
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-6 space-y-4">
                        <div>
                          <Label className="font-bold mb-2 block">
                            AI Creativity (Temperature):{' '}
                            {temperature[0]?.toFixed(1) ?? '0.7'}
                          </Label>
                          <Slider
                            value={temperature}
                            onValueChange={setTemperature}
                            min={0.1}
                            max={1.0}
                            step={0.1}
                            className="w-full"
                            aria-label="AI Creativity Temperature"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>More Focused</span>
                            <span>More Creative</span>
                          </div>
                        </div>

                        <div>
                          <Label className="font-bold mb-2 block">
                            AI Model Selection
                          </Label>
                          <Select
                            value={modelSelection}
                            onValueChange={setModelSelection}
                          >
                            <SelectTrigger className="border-2 border-black" aria-label="AI Model Selection">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="default">
                                Default (Balanced)
                              </SelectItem>
                              <SelectItem value="creative">
                                Creative Mode
                              </SelectItem>
                              <SelectItem value="precise">
                                Precise Mode
                              </SelectItem>
                              <SelectItem value="fast">
                                Fast Generation
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>

                {/* Generate Button */}
                <div className="flex justify-end pt-4">
                  <Button
                    onClick={handleGenerate}
                    className="bg-red-500 hover:bg-red-600 text-white font-bangers text-3xl px-10 py-8 rounded-2xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all w-full md:w-auto group"
                  >
                    <Sparkles className="mr-3 h-8 w-8 group-hover:animate-spin" />
                    GENERATE STORY!
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="preview" className="mt-0">
                {isGenerating ? (
                  <div className="flex flex-col items-center justify-center py-20 space-y-8">
                    <div className="relative">
                      <div className="absolute inset-0 bg-yellow-400 rounded-full animate-ping opacity-20" />
                      <Loader2 className="h-24 w-24 animate-spin text-black" />
                    </div>
                    <h3 className="font-bangers text-4xl animate-bounce text-center">
                      CRUNCHING DATA...
                      <br />
                      <span className="text-blue-500">MAKING MAGIC!</span>
                    </h3>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-xl relative">
                      <div className="absolute -top-5 -left-5 bg-yellow-400 border-4 border-black px-4 py-2 font-bangers text-xl rotate-[-5deg] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        YOUR STORY
                      </div>
                      <div className="prose prose-lg max-w-none font-medium leading-relaxed">
                        {generatedStory?.split('\n\n').map((paragraph, i) => (
                          <p
                            key={i}
                            className="mb-4 first-letter:text-5xl first-letter:font-bangers first-letter:float-left first-letter:mr-3 first-letter:mt-[-10px]"
                          >
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <Button
                        onClick={() => setActiveTab('input')}
                        className="font-bangers text-xl border-4 border-black bg-white hover:bg-gray-100"
                      >
                        EDIT PARAMETERS
                      </Button>
                      <Button
                        onClick={() => setActiveTab('mint')}
                        className="bg-green-500 hover:bg-green-600 text-white font-bangers text-2xl px-8 py-6 rounded-xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all"
                      >
                        PROCEED TO MINT <Save className="ml-2 h-6 w-6" />
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="mint" className="mt-0">
                <div className="text-center space-y-8 py-10">
                  {!mintSuccess ? (
                    <>
                      <div className="inline-block relative">
                        <div className="absolute inset-0 bg-blue-400 blur-xl opacity-20 rounded-full" />
                        <Wallet className="h-32 w-32 mx-auto text-black relative z-10" />
                      </div>

                      <div className="space-y-2">
                        <h3 className="font-bangers text-4xl">
                          READY TO IMMORTALIZE?
                        </h3>
                        <p className="text-xl font-medium text-muted-foreground max-w-md mx-auto">
                          Mint your story as a unique NFT on the Monad
                          blockchain.
                        </p>
                      </div>

                      {!connected ? (
                        <Button
                          onClick={connectWallet}
                          className="bg-black text-white hover:bg-gray-800 font-bangers text-2xl px-10 py-6 rounded-xl border-4 border-transparent hover:border-yellow-400 transition-all shadow-lg"
                        >
                          CONNECT WALLET FIRST
                        </Button>
                      ) : (
                        <div className="space-y-6">
                          <div className="bg-gray-100 border-4 border-black p-4 rounded-lg inline-block">
                            <p className="font-mono text-sm">
                              Connected: {truncateAddress(account)}
                            </p>
                          </div>
                          <br />
                          <Button
                            onClick={handleMint}
                            disabled={isMinting}
                            className="bg-purple-500 hover:bg-purple-600 text-white font-bangers text-3xl px-12 py-8 rounded-2xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                          >
                            {isMinting ? (
                              <span className="flex items-center">
                                <Loader2 className="mr-3 h-8 w-8 animate-spin" />
                                MINTING...
                              </span>
                            ) : (
                              <span className="flex items-center">
                                <Zap className="mr-3 h-8 w-8 fill-yellow-400 stroke-white" />
                                MINT NFT NOW!
                              </span>
                            )}
                          </Button>
                        </div>
                      )}
                    </>
                  ) : (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="space-y-8"
                    >
                      <div className="inline-block bg-green-400 p-8 rounded-full border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <Sparkles className="h-20 w-20 text-white stroke-black stroke-2" />
                      </div>

                      <div className="space-y-2">
                        <h3 className="font-bangers text-5xl text-green-600 drop-shadow-sm">
                          SUCCESS!
                        </h3>
                        <p className="text-xl font-bold">
                          Your story has been minted successfully!
                        </p>
                      </div>

                      <div className="flex justify-center gap-4 pt-4">
                        <Button
                          onClick={() =>
                            window.open(
                              `https://explorer.monad.xyz/tx/0x...`,
                              '_blank'
                            )
                          }
                          className="bg-blue-500 hover:bg-blue-600 text-white font-bangers text-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                        >
                          VIEW ON EXPLORER
                        </Button>
                        <Button
                          onClick={resetForm}
                          className="bg-white hover:bg-gray-100 text-black font-bangers text-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                        >
                          CREATE ANOTHER
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
