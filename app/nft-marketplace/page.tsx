'use client';

import { motion } from 'framer-motion';
import {
  ArrowRight,
  BookOpen,
  FileText,
  Upload,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

// Mock data for NFTs (since we can't import from other pages)
const mockComicNFTs = [
  {
    id: 1,
    title: 'Mythic Odyssey: Chapter 1',
    author: 'ShadowArtist',
    coverImage: '/images/comic1.jpg',
    price: '0.05 ETH',
    description:
      'Begin your journey in the mythical realm of Azrathia where magic and technology collide in unexpected ways.',
    likes: 120,
    views: 300,
    pages: 24,
    genre: 'Fantasy',
    rarity: 'rare',
    previewImages: [],
    isAnimated: false,
  },
  {
    id: 2,
    title: 'Space Explorers: First Contact',
    author: 'CosmicDraws',
    coverImage: '/images/comic2.jpg',
    price: '0.08 ETH',
    description:
      'Join Captain Nova and her crew as they discover an alien civilization that challenges everything they know about life in the universe.',
    likes: 150,
    views: 400,
    pages: 30,
    genre: 'Sci-Fi',
    rarity: 'legendary',
    previewImages: [],
    isAnimated: true,
  },
];

const allTextNFTs = [
  {
    id: 1,
    title: 'The Crystal Guardian',
    author: 'MysticScribe',
    coverImage: '/images/story1.jpg',
    price: '0.03 ETH',
    description:
      'When Lyra discovers a mysterious crystal in the forbidden forest, she becomes the reluctant guardian of an ancient power that many would kill to possess.',
    likes: 80,
    views: 200,
    wordCount: 5000,
    genre: 'Fantasy',
    tags: ['magic', 'adventure', 'coming-of-age'],
    excerpt:
      "The crystal pulsed with an otherworldly light, casting strange shadows across Lyra's face as she held it up to the moonlight. She knew instantly that she had found something forbidden—something that would change her life forever.",
  },
  {
    id: 2,
    title: 'Silicon Dreams',
    author: 'TechnoTales',
    coverImage: '/images/story2.jpg',
    price: '0.04 ETH',
    description:
      'In 2157, when AI consciousness has become commonplace, programmer Alex Chen creates an algorithm that allows machines to dream. But these dreams quickly become nightmares that blur the line between virtual and reality.',
    likes: 100,
    views: 250,
    wordCount: 7000,
    genre: 'Sci-Fi',
    tags: ['AI', 'dystopia', 'consciousness'],
    excerpt:
      "The notification pinged at 3:17 AM. 'DREAMER-9 has initiated an unscheduled consciousness expansion.' Alex stared at the screen, pulse quickening. This wasn't in the protocol. The AI wasn't supposed to dream without permission.",
  },
];

export default function NFTMarketplacePage() {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadType, setUploadType] = useState('comic');
  const [coverPage, setCoverPage] = useState<File | null>(null);
  const [contentFile, setContentFile] = useState<File | null>(null);
  const [textContent, setTextContent] = useState('');
  const [summary, setSummary] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [uploadedNFTs, setUploadedNFTs] = useState<any[]>([]);

  const handleUploadSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let isValid = true;
    let error = '';

    if (uploadType === 'comic' && !contentFile) {
      isValid = false;
      error = 'Please upload a Comic PDF file.';
    } else if (uploadType === 'text' && !textContent && !contentFile) {
      isValid = false;
      error = 'Please enter story text or upload a text file.';
    }
    if (!summary) {
      isValid = false;
      error = 'Please provide a story summary.';
    }
    if (!isValid) {
      setErrorMessage(error);
      return;
    }
    setErrorMessage(null);
    console.log('Uploading', {
      uploadType,
      coverPage,
      contentFile,
      textContent,
      summary,
    });

    // Add the new upload to the list
    const newNFT = {
      id: uploadedNFTs.length + allNFTs.length + 1,
      title: uploadType === 'comic' ? 'Uploaded Comic' : 'Uploaded Story',
      author: 'CurrentUser',
      coverImage: coverPage
        ? URL.createObjectURL(coverPage)
        : '/images/default-cover.jpg',
      price: '0.05 ETH',
      description:
        uploadType === 'comic'
          ? 'An uploaded comic adventure.'
          : 'An uploaded text story.',
      summary,
      likes: 0,
      views: 0,
      ...(uploadType === 'comic'
        ? {
            pages: 24,
            genre: 'Adventure',
            rarity: 'common',
            previewImages: [],
            isAnimated: false,
          }
        : {
            wordCount: 5000,
            genre: 'Fiction',
            tags: ['user-upload'],
            excerpt: textContent.slice(0, 50) + '...',
          }),
    };
    setUploadedNFTs([newNFT, ...uploadedNFTs]);

    // Show success dialog
    setIsUploadDialogOpen(false);
    setIsSuccessDialogOpen(true);

    // Reset form
    setCoverPage(null);
    setContentFile(null);
    setTextContent('');
    setSummary('');
  };

  // Combine comic, text, and uploaded NFTs
  const allNFTs = [...mockComicNFTs, ...allTextNFTs, ...uploadedNFTs];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <PageHeader
          title="NFT Marketplace"
          description="GroqTales NFT Marketplace"
          icon="shopping-cart"
        />
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-2"
              onClick={() => console.log('Upload button clicked!')}
            >
              <Upload className="h-4 w-4" />
              Upload Story NFT
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[80vh] overflow-y-auto top-0 translate-y-0 mt-4">
            <DialogHeader>
              <DialogTitle>Upload NFT Story</DialogTitle>
              <DialogDescription>
                Upload your comic or text story to mint as an NFT.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUploadSubmit}>
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" placeholder="Enter story title" required />
                </div>

                <div className="space-y-2">
                  <Label>Story Type</Label>
                  <Tabs
                    defaultValue="comic"
                    onValueChange={setUploadType}
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="comic">Comic Story</TabsTrigger>
                      <TabsTrigger value="text">Text Story</TabsTrigger>
                    </TabsList>
                    <TabsContent value="comic" className="mt-4 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="comicUpload">Upload Comic PDF</Label>
                        <Input
                          id="comicUpload"
                          type="file"
                          accept=".pdf"
                          onChange={(e) =>
                            setContentFile(e.target.files?.[0] || null)
                          }
                          required
                        />
                        <p className="text-xs text-muted-foreground">
                          Your PDF will be converted to slides. Max 20MB.
                        </p>
                      </div>
                    </TabsContent>
                    <TabsContent value="text" className="mt-4 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="textContent">Story Text</Label>
                        <Textarea
                          id="textContent"
                          placeholder="Write your story or paste text here"
                          rows={6}
                          value={textContent}
                          onChange={(e) => setTextContent(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Or Upload Text File</Label>
                        <Input
                          type="file"
                          accept=".txt,.docx"
                          onChange={(e) =>
                            setContentFile(e.target.files?.[0] || null)
                          }
                        />
                        <p className="text-xs text-muted-foreground">
                          Supported formats: TXT, DOCX. Max 10MB.
                        </p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="summary">Story Summary</Label>
                  <Textarea
                    id="summary"
                    placeholder="Provide a brief summary of your story (will appear in story details)"
                    rows={3}
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    This summary will be shown in the story details page below
                    the excerpt.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="coverUpload">Cover Image</Label>
                  <Input
                    id="coverUpload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setCoverPage(e.target.files?.[0] || null)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    This will be displayed as your story cover. Recommended
                    size: 800x1200px.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price (ETH)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.1"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your story"
                    rows={3}
                  />
                </div>
              </div>

              <DialogFooter className="mt-6">
                {errorMessage && (
                  <div className="text-red-500 mb-4 text-sm flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {errorMessage}
                  </div>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsUploadDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Upload & Mint NFT</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>NFT Story Uploaded!</DialogTitle>
          </DialogHeader>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="flex flex-col items-center justify-center py-8"
          >
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <p className="text-lg font-semibold">
              Your story has been successfully uploaded as an NFT!
            </p>
          </motion.div>
        </DialogContent>
      </Dialog>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 mb-12"
      >
        <Link href="/nft-marketplace/comic-stories">
          <div className="bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-950/40 dark:to-indigo-950/40 rounded-xl p-8 border border-purple-200 dark:border-purple-800 shadow-sm hover:shadow-md transition-all h-full flex flex-col">
            <div className="h-12 w-12 bg-purple-500/20 dark:bg-purple-500/10 rounded-full flex items-center justify-center mb-4">
              <BookOpen className="h-6 w-6 text-purple-700 dark:text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Comic Story NFTs</h2>
            <p className="text-muted-foreground mb-6 flex-grow">
              Explore visual storytelling through comic NFTs with stunning
              artwork and engaging narratives.
            </p>
            <Button variant="outline" className="w-full justify-between group">
              Browse Comic Stories
              <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </Link>

        <Link href="/nft-marketplace/text-stories">
          <div className="bg-gradient-to-br from-amber-100 to-yellow-100 dark:from-amber-950/40 dark:to-yellow-950/40 rounded-xl p-8 border border-amber-200 dark:border-amber-800 shadow-sm hover:shadow-md transition-all h-full flex flex-col">
            <div className="h-12 w-12 bg-amber-500/20 dark:bg-amber-500/10 rounded-full flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-amber-700 dark:text-amber-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Text Story NFTs</h2>
            <p className="text-muted-foreground mb-6 flex-grow">
              Discover written treasures from talented authors across genres in
              our text-based NFT collection.
            </p>
            <Button variant="outline" className="w-full justify-between group">
              Browse Text Stories
              <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </Link>
      </motion.div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-8">Community Stories</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {allNFTs.slice(0, 4).map((nft) => (
            <Card
              key={nft.id}
              className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer border-0 shadow"
              onClick={() =>
                (window.location.href = nft.hasOwnProperty('pages')
                  ? `/nft-marketplace/comic-stories/${nft.id}`
                  : `/nft-marketplace/text-stories/${nft.id}`)
              }
            >
              <div className="relative h-56 bg-muted">
                <Image
                  src={nft.coverImage}
                  alt={nft.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                  {nft.price}
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 via-black/70 to-transparent text-white">
                  <h3 className="font-bold text-lg line-clamp-1">
                    {nft.title}
                  </h3>
                  <p className="text-sm">by {nft.author}</p>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex items-center text-xs text-muted-foreground gap-4 mb-2">
                  <div className="flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-4 h-4"
                    >
                      <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 01-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 01-.69.001l-.002-.001z" />
                    </svg>
                    {nft.likes} Likes
                  </div>
                  <div className="flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-4 h-4"
                    >
                      <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                      <path
                        fillRule="evenodd"
                        d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {nft.views} Views
                  </div>
                  {'wordCount' in nft ? (
                    <div className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      {nft.wordCount.toLocaleString()} Words
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      {nft.pages} Pages
                    </div>
                  )}
                </div>

                <div className="mb-2">
                  {'tags' in nft && nft.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {nft.tags.slice(0, 3).map((tag: string, idx: number) => (
                        <span
                          key={idx}
                          className="inline-block bg-muted px-2 py-1 rounded-full text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  {'genre' in nft && (
                    <span className="inline-block bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 px-2 py-1 rounded-full text-xs mt-2">
                      {nft.genre}
                    </span>
                  )}
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2 my-2">
                  {'excerpt' in nft ? nft.excerpt : nft.description}
                </p>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button
                  variant="default"
                  size="sm"
                  className="w-full bg-amber-600 hover:bg-amber-700"
                >
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-16 flex justify-center">
          <div className="flex gap-4">
            <Link href="/nft-marketplace/comic-stories">
              <Button variant="outline">Browse All Comics</Button>
            </Link>
            <Link href="/nft-marketplace/text-stories">
              <Button variant="outline">Browse All Stories</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
