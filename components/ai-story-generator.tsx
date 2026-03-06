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
  Save,
  Wallet,
  Settings,
  Palette,
  Map,
  Target,
  Shield,
  Lightbulb,
} from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';

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
import { generateContentHash } from '@/lib/story-hash';

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
  const [mintStatus, setMintStatus] = useState<'idle' | 'checking' | 'minted' | 'pending' | 'failed'>('idle');
  const [mintedNftUrl, setMintedNftUrl] = useState('');
  const [currentStoryHash, setCurrentStoryHash] = useState('');

  // Draft Recovery State
  const [recoveredDraft, setRecoveredDraft] = useState<StoryDraft | null>(null);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);

  // Session lock for minting
  const mintSessionLock = useRef(false);

  const { toast } = useToast();
  const { account, connected, connectWallet } = useWeb3();

  const genres = [
    'Fantasy', 'Sci-Fi', 'Horror', 'Mystery', 'Romance', 
    'Adventure', 'Comedy', 'Cyberpunk', 'Thriller', 'Drama'
  ];

  const characterTraitOptions = [
    'Brave', 'Cunning', 'Mysterious', 'Compassionate', 
    'Ruthless', 'Wise', 'Impulsive', 'Loyal'
  ];

  const themeOptions = [
    'Love', 'Betrayal', 'Redemption', 'Power', 'Freedom', 
    'Identity', 'Sacrifice', 'Revenge', 'Hope', 'Justice'
  ];

  // Load initial data
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

  // Draft recovery detection
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
      localStorage.removeItem(DRAFT_KEY);
    }
  }, []);

  // Autosave logic
  useEffect(() => {
    if (!prompt.trim()) return;
    const timeout = setTimeout(() => {
      const draft: StoryDraft = {
        prompt, storyTitle, selectedGenres, storyLength, mainCharacterName,
        characterCount, characterTraits, characterAge, characterBackground,
        protagonistType, plotType, conflictType, storyArc, pacing, endingType,
        plotTwists, includeFlashbacks, timePeriod, locationType, worldBuildingDepth,
        atmosphere, narrativeVoice, tone, writingStyle, readingLevel, mood,
        dialoguePercentage, descriptionDetail, primaryTheme, secondaryThemes,
        moralComplexity, socialCommentary, socialCommentaryTopic, violenceLevel,
        romanceLevel, languageLevel, matureContent, chapterCount, foreshadowing,
        symbolism, multiplePOVs, povCount, similarTo, inspiredBy, avoidCliches,
        includeTropes, temperature, modelSelection, updatedAt: Date.now(), version: 1,
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    }, 1000);
    return () => clearTimeout(timeout);
  }, [
    prompt, storyTitle, selectedGenres, storyLength, mainCharacterName,
    characterCount, characterTraits, characterAge, characterBackground,
    protagonistType, plotType, conflictType, storyArc, pacing, endingType,
    plotTwists, includeFlashbacks, timePeriod, locationType, worldBuildingDepth,
    atmosphere, narrativeVoice, tone, writingStyle, readingLevel, mood,
    dialoguePercentage, descriptionDetail, primaryTheme, secondaryThemes,
    moralComplexity, socialCommentary, socialCommentaryTopic, violenceLevel,
    romanceLevel, languageLevel, matureContent, chapterCount, foreshadowing,
    symbolism, multiplePOVs, povCount, similarTo, inspiredBy, avoidCliches,
    includeTropes, temperature, modelSelection,
  ]);

  const toggleGenre = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter((g) => g !== genre));
    } else if (selectedGenres.length < 3) {
      setSelectedGenres([...selectedGenres, genre]);
    } else {
      toast({
        title: 'MAXIMUM POWER REACHED!',
        description: 'You can only select up to 3 genres, hero!',
        variant: 'destructive',
        className: 'font-bangers border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
      });
    }
  };

  const toggleTrait = (trait: string) => {
    if (characterTraits.includes(trait)) {
      setCharacterTraits(characterTraits.filter((t) => t !== trait));
    } else if (characterTraits.length < 5) {
      setCharacterTraits([...characterTraits, trait]);
    }
  };

  const toggleTheme = (theme: string) => {
    if (secondaryThemes.includes(theme)) {
      setSecondaryThemes(secondaryThemes.filter((t) => t !== theme));
    } else if (secondaryThemes.length < 3) {
      setSecondaryThemes([...secondaryThemes, theme]);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'EMPTY BUBBLE!',
        description: 'Please enter a prompt to start the adventure!',
        variant: 'destructive',
        className: 'font-bangers border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
      });
      return;
    }

    setIsGenerating(true);
    setMintStatus('idle');
    setCurrentStoryHash('');
    setActiveTab('preview');

    try {
      const requestBody = {
        action: 'generate',
        prompt: prompt,
        genre: selectedGenres[0] || 'Fantasy',
        length: storyLength,
        options: {
          tone,
          setting: `${timePeriod} ${locationType}`,
          characters: mainCharacterName,
          title: storyTitle,
          traits: characterTraits,
          plotType,
          conflictType,
          pacing,
          atmosphere,
          writingStyle,
          temperature: temperature[0],
          model: modelSelection
        }
      };

      const response = await fetch('/api/groq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to generate story');

      const content = data.result;
      setGeneratedStory(content);

      // Idempotency check logic from MAIN
      const contentHash = generateContentHash(content);
      setCurrentStoryHash(contentHash);
      
      try {
        const checkResponse = await fetch((process.env.NEXT_PUBLIC_API_URL || 'https://groqtales-backend-api.onrender.com') + '/api/mint/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ storyHash: contentHash, authorAddress: account }),
        });
        
        if (checkResponse.ok) {
          const checkData = await checkResponse.json();
          if (checkData.status === 'MINTED') setMintStatus('minted');
          else if (checkData.status === 'PENDING') setMintStatus('pending');
        }
      } catch (error) {
        console.error('Failed to check mint status:', error);
      }

      toast({
        title: 'BOOM! STORY GENERATED!',
        description: 'Your epic tale is ready for review!',
        className: 'font-bangers bg-green-400 text-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
      });
    } catch (error: any) {
      toast({
        title: 'KABOOM!',
        description: error.message || 'The AI ran out of ink!',
        variant: 'destructive',
        className: 'font-bangers border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
      });
      setActiveTab('input');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleMint = async () => {
    if (mintSessionLock.current) return;
    mintSessionLock.current = true;

    try {
      if (!connected) {
        toast({
          title: 'WALLET LOCKED!',
          description: 'Please connect your wallet to mint this masterpiece!',
          variant: 'destructive',
          className: 'font-bangers border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
        });
        return;
      }

      if (!generatedStory) return;

      setIsMinting(true);
      setMintStatus('checking');

      const storyHash = currentStoryHash || generateContentHash(generatedStory);

      const mintResponse = await fetch((process.env.NEXT_PUBLIC_API_URL || 'https://groqtales-backend-api.onrender.com') + '/api/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyHash,
          authorAddress: account,
          title: storyTitle || 'Untitled Story',
        }),
      });

      const mintData = await mintResponse.json();

      if (mintResponse.status === 409) {
        if (mintData.status === 'MINTED') {
          setMintStatus('minted');
          return;
        } else if (mintData.status === 'PENDING') {
          setMintStatus('pending');
          return;
        }
      }

      if (!mintResponse.ok) throw new Error(mintData.error || 'Failed to mint NFT');

      setMintStatus('minted');
      const { tokenId, contractAddress } = mintData.record ?? {};
      if (tokenId && contractAddress) {
        setMintedNftUrl(`https://opensea.io/assets/${contractAddress}/${tokenId}`);
      }

      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch (error) {
        console.warn('Draft cleanup failed:', error);
      }

      toast({
        title: 'KAZAM! NFT MINTED!',
        description: 'Your story is now eternal on the blockchain!',
        className: 'font-bangers bg-green-400 text-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
      });
    } catch (error: any) {
      setMintStatus('failed');
      toast({
        title: 'MINTING FAILED!',
        description: error.message || 'The blockchain is busy!',
        variant: 'destructive',
        className: 'font-bangers border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
      });
    } finally {
      setIsMinting(false);
      mintSessionLock.current = false;
    }
  };

  const resetForm = () => {
    setPrompt('');
    setSelectedGenres([]);
    setGeneratedStory(null);
    setMintStatus('idle');
    setMintedNftUrl('');
    setActiveTab('input');
    setStoryTitle('');
    setMainCharacterName('');
    setCharacterTraits([]);
    setCurrentStoryHash('');
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
              <span className="font-bangers text-4xl tracking-wide text-black drop-shadow-sm">STORY MAKER 3000</span>
            </CardTitle>
            <div className="hidden md:flex space-x-2">
              <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-black" />
              <div className="w-4 h-4 rounded-full bg-yellow-500 border-2 border-black" />
              <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-black" />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="bg-black p-2 flex justify-center gap-4 border-b-4 border-black">
              <TabsList className="bg-transparent gap-4 p-0 h-auto">
                <TabsTrigger value="input" className="font-bangers text-xl px-6 py-2 rounded-xl border-4 border-transparent data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:border-black text-white hover:text-yellow-400 transition-all">1. INPUT</TabsTrigger>
                <TabsTrigger value="preview" disabled={!generatedStory && !isGenerating} className="font-bangers text-xl px-6 py-2 rounded-xl border-4 border-transparent data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:border-black text-white hover:text-yellow-400 transition-all disabled:opacity-50">2. PREVIEW</TabsTrigger>
                <TabsTrigger value="mint" disabled={!generatedStory} className="font-bangers text-xl px-6 py-2 rounded-xl border-4 border-transparent data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:border-black text-white hover:text-yellow-400 transition-all disabled:opacity-50">3. MINT NFT</TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6 md:p-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-50">
              <AnimatePresence>
                {showRecoveryModal && recoveredDraft && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="bg-white border-4 border-black rounded-2xl p-8 max-w-md w-full shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                      <div className="text-center space-y-6">
                        <div className="inline-block bg-yellow-400 p-4 rounded-full border-4 border-black"><Save className="h-8 w-8 text-black" /></div>
                        <div>
                          <h3 className="font-bangers text-2xl mb-2">DRAFT RECOVERED!</h3>
                          <p className="text-sm text-muted-foreground">We found an unsaved draft from {new Date(recoveredDraft.updatedAt).toLocaleString()}.</p>
                        </div>
                        <div className="flex gap-4">
                          <Button onClick={() => {
                            setPrompt(recoveredDraft.prompt); setStoryTitle(recoveredDraft.storyTitle);
                            setSelectedGenres(recoveredDraft.selectedGenres); setStoryLength(recoveredDraft.storyLength);
                            setMainCharacterName(recoveredDraft.mainCharacterName); setCharacterCount(recoveredDraft.characterCount);
                            setCharacterTraits(recoveredDraft.characterTraits); setCharacterAge(recoveredDraft.characterAge);
                            setCharacterBackground(recoveredDraft.characterBackground); setProtagonistType(recoveredDraft.protagonistType);
                            setPlotType(recoveredDraft.plotType); setConflictType(recoveredDraft.conflictType);
                            setStoryArc(recoveredDraft.storyArc); setPacing(recoveredDraft.pacing);
                            setEndingType(recoveredDraft.endingType); setPlotTwists(recoveredDraft.plotTwists);
                            setIncludeFlashbacks(recoveredDraft.includeFlashbacks); setTimePeriod(recoveredDraft.timePeriod);
                            setLocationType(recoveredDraft.locationType); setWorldBuildingDepth(recoveredDraft.worldBuildingDepth);
                            setAtmosphere(recoveredDraft.atmosphere); setNarrativeVoice(recoveredDraft.narrativeVoice);
                            setTone(recoveredDraft.tone); setWritingStyle(recoveredDraft.writingStyle);
                            setReadingLevel(recoveredDraft.readingLevel); setMood(recoveredDraft.mood);
                            setDialoguePercentage(recoveredDraft.dialoguePercentage); setDescriptionDetail(recoveredDraft.descriptionDetail);
                            setPrimaryTheme(recoveredDraft.primaryTheme); setSecondaryThemes(recoveredDraft.secondaryThemes);
                            setMoralComplexity(recoveredDraft.moralComplexity); setSocialCommentary(recoveredDraft.socialCommentary);
                            setSocialCommentaryTopic(recoveredDraft.socialCommentaryTopic); setViolenceLevel(recoveredDraft.violenceLevel);
                            setRomanceLevel(recoveredDraft.romanceLevel); setLanguageLevel(recoveredDraft.languageLevel);
                            setMatureContent(recoveredDraft.matureContent); setChapterCount(recoveredDraft.chapterCount);
                            setForeshadowing(recoveredDraft.foreshadowing); setSymbolism(recoveredDraft.symbolism);
                            setMultiplePOVs(recoveredDraft.multiplePOVs); setPovCount(recoveredDraft.povCount);
                            setSimilarTo(recoveredDraft.similarTo); setInspiredBy(recoveredDraft.inspiredBy);
                            setAvoidCliches(recoveredDraft.avoidCliches); setIncludeTropes(recoveredDraft.includeTropes);
                            setTemperature(recoveredDraft.temperature); setModelSelection(recoveredDraft.modelSelection);
                            setShowRecoveryModal(false); setRecoveredDraft(null);
                          }} className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bangers">RESTORE</Button>
                          <Button onClick={() => { localStorage.removeItem(DRAFT_KEY); setShowRecoveryModal(false); setRecoveredDraft(null); }} className="flex-1 font-bangers border-4 border-black bg-white text-black">DISCARD</Button>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              <TabsContent value="input" className="space-y-8 mt-0">
                <div className="space-y-4">
                  <label className="font-bangers text-2xl flex items-center gap-2"><MessageSquare className="fill-yellow-400 stroke-black" /> WHAT'S THE STORY, HERO? *</label>
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-black rounded-2xl translate-x-2 translate-y-2 group-hover:translate-x-1 group-hover:translate-y-1 transition-transform" />
                    <Textarea placeholder="Enter your prompt here..." className="relative bg-white border-4 border-black rounded-xl p-6 text-lg min-h-[150px] focus-visible:ring-0" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="font-bangers text-xl flex items-center gap-2"><BookOpen className="w-5 h-5" /> STORY TITLE (Optional)</Label>
                  <Input placeholder="Leave blank for auto-generation" className="border-4 border-black rounded-lg p-4 text-lg" value={storyTitle} onChange={(e) => setStoryTitle(e.target.value)} />
                </div>

                <div className="space-y-4">
                  <label className="font-bangers text-2xl flex items-center gap-2"><Zap className="fill-blue-400 stroke-black" /> CHOOSE YOUR FLAVOR (MAX 3)</label>
                  <div className="flex flex-wrap gap-3">
                    {genres.map((g) => (
                      <button key={g} onClick={() => toggleGenre(g)} className={`font-bangers text-lg px-4 py-2 rounded-lg border-4 border-black transition-all transform hover:-translate-y-1 ${selectedGenres.includes(g) ? 'bg-blue-400 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'bg-white text-black'}`}>{g.toUpperCase()}</button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="font-bangers text-xl flex items-center gap-2"><Target className="w-5 h-5" /> STORY LENGTH</Label>
                  <Select value={storyLength} onValueChange={setStoryLength}>
                    <SelectTrigger className="border-4 border-black rounded-lg p-4 font-bangers"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flash">FLASH (100-500 words)</SelectItem>
                      <SelectItem value="short">SHORT (500-2000 words)</SelectItem>
                      <SelectItem value="medium">MEDIUM (2000-5000 words)</SelectItem>
                      <SelectItem value="long">LONG (5000-10000 words)</SelectItem>
                      <SelectItem value="epic">EPIC (10000+ words)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 border-4 border-black rounded-2xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex items-center gap-2 mb-4">
                    <Settings className="w-6 h-6" /><h3 className="font-bangers text-2xl">ADVANCED OPTIONS</h3>
                    <Badge className="bg-yellow-400 text-black border-2 border-black font-bangers">OPTIONAL</Badge>
                  </div>
                  <Accordion type="multiple" className="space-y-2">
                    <AccordionItem value="characters" className="border-4 border-black rounded-xl bg-white dark:bg-gray-900 overflow-hidden">
                      <AccordionTrigger className="px-6 py-4 hover:no-underline font-bangers text-xl"><div className="flex items-center gap-3"><Users className="w-6 h-6 text-blue-500" /> CHARACTER CUSTOMIZATION</div></AccordionTrigger>
                      <AccordionContent className="px-6 pb-6 space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <Input placeholder="Main Character Name" value={mainCharacterName} onChange={(e) => setMainCharacterName(e.target.value)} className="border-2 border-black" />
                          <Select value={characterCount} onValueChange={setCharacterCount}>
                            <SelectTrigger className="border-2 border-black"><SelectValue placeholder="Count" /></SelectTrigger>
                            <SelectContent>{['1','2','3','4','5'].map(n => <SelectItem key={n} value={n}>{n} Character(s)</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {characterTraitOptions.map(t => <button key={t} onClick={() => toggleTrait(t)} className={`px-3 py-1 rounded-md border-2 border-black text-sm font-bold ${characterTraits.includes(t) ? 'bg-blue-400 text-white' : 'bg-white'}`}>{t}</button>)}
                        </div>
                        <Textarea placeholder="Character Background..." value={characterBackground} onChange={(e) => setCharacterBackground(e.target.value)} className="border-2 border-black" />
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="plot" className="border-4 border-black rounded-xl bg-white dark:bg-gray-900 overflow-hidden">
                      <AccordionTrigger className="px-6 py-4 hover:no-underline font-bangers text-xl"><div className="flex items-center gap-3"><Target className="w-6 h-6 text-green-500" /> PLOT & STRUCTURE</div></AccordionTrigger>
                      <AccordionContent className="px-6 pb-6 space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <Select value={plotType} onValueChange={setPlotType}><SelectTrigger className="border-2 border-black"><SelectValue placeholder="Plot Type" /></SelectTrigger><SelectContent><SelectItem value="quest">Quest</SelectItem><SelectItem value="mystery">Mystery</SelectItem></SelectContent></Select>
                          <Select value={pacing} onValueChange={setPacing}><SelectTrigger className="border-2 border-black"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="slow">Slow Burn</SelectItem><SelectItem value="fast">Fast-paced</SelectItem></SelectContent></Select>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="technical" className="border-4 border-black rounded-xl bg-white dark:bg-gray-900 overflow-hidden">
                      <AccordionTrigger className="px-6 py-4 hover:no-underline font-bangers text-xl"><div className="flex items-center gap-3"><Zap className="w-6 h-6 text-indigo-500" /> TECHNICAL PARAMETERS</div></AccordionTrigger>
                      <AccordionContent className="px-6 pb-6 space-y-4">
                        <Label>Creativity (Temperature): {temperature[0]}</Label>
                        <Slider value={temperature} onValueChange={setTemperature} min={0.1} max={1.0} step={0.1} className="w-full" />
                        <Select value={modelSelection} onValueChange={setModelSelection}><SelectTrigger className="border-2 border-black"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="default">Default</SelectItem><SelectItem value="creative">Creative</SelectItem></SelectContent></Select>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>

                <Button onClick={handleGenerate} className="bg-red-500 hover:bg-red-600 text-white font-bangers text-3xl px-10 py-8 rounded-2xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full md:w-auto group">
                  <Sparkles className="mr-3 h-8 w-8 group-hover:animate-spin" /> GENERATE STORY!
                </Button>
              </TabsContent>

              <TabsContent value="preview" className="mt-0">
                {isGenerating ? (
                  <div className="flex flex-col items-center justify-center py-20 space-y-8">
                    <Loader2 className="h-24 w-24 animate-spin text-black" />
                    <h3 className="font-bangers text-4xl animate-bounce">CRUNCHING DATA...</h3>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-xl relative prose prose-lg max-w-none">
                      <div className="absolute -top-5 -left-5 bg-yellow-400 border-4 border-black px-4 py-2 font-bangers text-xl rotate-[-5deg]">YOUR STORY</div>
                      {generatedStory?.split('\n\n').map((paragraph, i) => <p key={i}>{paragraph}</p>)}
                    </div>
                    <div className="flex justify-between">
                      <Button onClick={() => setActiveTab('input')} className="font-bangers text-xl border-4 border-black bg-white">EDIT</Button>
                      <Button onClick={() => setActiveTab('mint')} className="bg-green-500 text-white font-bangers text-2xl px-8 py-6 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">MINT NFT <Save className="ml-2 h-6 w-6" /></Button>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="mint" className="mt-0">
                <div className="text-center space-y-8 py-10">
                  {String(mintStatus) !== 'minted' ? (
                    <>
                      <Wallet className="h-32 w-32 mx-auto text-black" />
                      <h3 className="font-bangers text-4xl">READY TO IMMORTALIZE?</h3>
                      {!connected ? <Button onClick={connectWallet} className="bg-black text-white font-bangers text-2xl px-10 py-6 border-4 border-black">CONNECT WALLET</Button> : (
                        <div className="space-y-6">
                          <p className="font-mono bg-gray-100 p-2 inline-block border-2 border-black rounded">{truncateAddress(account)}</p><br/>
                          <Button onClick={handleMint} disabled={isMinting || String(mintStatus) === 'pending'} className="bg-purple-500 text-white font-bangers text-3xl px-12 py-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                            {isMinting || String(mintStatus) === 'pending' ? <><Loader2 className="mr-3 animate-spin" /> MINTING...</> : 'MINT NFT NOW!'}
                          </Button>
                        </div>
                      )}
                    </>
                  ) : (
                    <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="space-y-8">
                      <Sparkles className="h-20 w-20 text-green-500 mx-auto" />
                      <h3 className="font-bangers text-5xl text-green-600">SUCCESS!</h3>
                      {mintedNftUrl && <Button asChild className="bg-blue-500 text-white font-bangers border-4 border-black"><a href={mintedNftUrl} target="_blank">VIEW ON OPENSEA</a></Button>}
                      <Button onClick={resetForm} className="bg-white text-black font-bangers border-4 border-black ml-4">CREATE ANOTHER</Button>
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