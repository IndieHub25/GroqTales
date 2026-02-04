'use client';

import {
  PenSquare,
  Image as ImageIcon,
  Sparkles,
  AlertCircle,
  ArrowLeft,
  Save,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import { genres } from '@/components/genre-selector';
import { LoadingAnimation } from '@/components/loading-animation';
import { useWeb3 } from '@/components/providers/web3-provider';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
// We'll import ipfs conditionally to avoid errors
// import { create } from 'ipfs-http-client';

// Move IPFS client creation to a to avoid initialization at module scope
const getIpfsClient = async () => {
  try {
    // Dynamically import ipfs-http-client only when needed
    const { create } = await import('ipfs-http-client');

    const projectId = process.env.NEXT_PUBLIC_INFURA_IPFS_PROJECT_ID;
    const projectSecret = process.env.NEXT_PUBLIC_INFURA_IPFS_PROJECT_SECRET;

    if (!projectId || !projectSecret) {
      console.warn(
        'IPFS Project ID or Secret not defined in environment variables'
      );

      // Show a more friendly message to the user through toast notification
      // We'll return a special error that the caller can check for
      const error = new Error('IPFS credentials missing');
      error.name = 'IpfsConfigError';
      throw error;
    }
    // Create auth header
    const auth =
      'Basic ' +
      Buffer.from(projectId + ':' + projectSecret).toString('base64');

    // Use a more compatible configuration that avoids readonly property issues
    return create({
      url: 'https://ipfs.infura.io:5001/api/v0',
      headers: {
        authorization: auth,
      },
      timeout: 30000, // 30 second timeout
    });
  } catch (error: any) {
    console.error('Error creating IPFS client:', error);

    // Add better error handling based on error type
    if (error.name === 'IpfsConfigError') {
      throw error; // Rethrow config errors
    }
    // Add fallback behavior for deployments without IPFS
    if (process.env.NODE_ENV === 'production') {
      console.warn(
        'IPFS client creation failed in production, using mock IPFS client'
      );
      // Return a mock IPFS client that can be used in production without failing
      return {
        add: async (content: Uint8Array | Buffer | string) => {
          console.warn(
            'Using mock IPFS client, content will not be stored on IPFS'
          );
          return { path: `mock-ipfs-hash-${Date.now()}` };
        },
      };
    }
    // For other errors, provide a more specific error message
    const errorMessage =
      error.message || 'Unknown error initializing IPFS client';
    const newError = new Error(
      `Failed to initialize IPFS client: ${errorMessage}`
    );
    newError.name = 'IpfsInitError';
    throw newError;
  }
};

const DRAFT_KEY = "groqtales_text_story_draft_v1";

interface StoryDraft {
  title: string;
  description: string;
  genre: string;
  content: string;
  coverImageName?: string;
  updatedAt: number;
  version: number;
}

interface StoryMetadata {
  title: string;
  description: string;
  genre: string;
  content: string;
  coverImage: string;
  author: string;
  createdAt: string;
  ipfsHash: string;
}
export default function CreateStoryPage() {
  const router = useRouter();
  const { account } = useWeb3();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidEntry, setIsValidEntry] = useState(true);
  const [storyData, setStoryData] = useState({
    title: '',
    description: '',
    genre: '',
    content: '',
    coverImage: null as File | null,
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [storyType, setStoryType] = useState<string | null>(null);
  const [storyFormat, setStoryFormat] = useState<string | null>('free');

  // Draft Recovery State
  const [recoveredDraft, setRecoveredDraft] = useState<StoryDraft | null>(null);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);

  // Check authentication on mount and load story creation data
  useEffect(() => {
    const checkAuth = () => {
      console.log('Checking authentication and story data');
      const isAdmin = localStorage.getItem('adminSession');

      // Check authentication first
      if (!account && !isAdmin) {
        console.warn('User not authenticated');
        toast({
          title: 'Access Denied',
          description:
            'Please connect your wallet or login as admin to create stories',
          variant: 'destructive',
        });
        router.push('/');
        return;
      }
      // Try to load story creation data from localStorage
      try {
        console.log('Checking for storyCreationData in localStorage');
        const savedData = localStorage.getItem('storyCreationData');

        if (!savedData) {
          console.warn('No storyCreationData found in localStorage');
          setIsValidEntry(false);
          toast({
            title: 'Invalid Navigation',
            description:
              'Please start from the create button to set up your story properly',
            variant: 'destructive',
          });
          setIsLoading(false);
          return;
        }
        // Parse and validate data
        const parsedData = JSON.parse(savedData);
        console.log('Found storyCreationData:', parsedData);

        // Check timestamp validity
        const now = new Date().getTime();
        const createdAt = parsedData.timestamp || 0;
        const isValid = now - createdAt < 30 * 60 * 1000; // 30 minutes

        if (!isValid) {
          console.warn('storyCreationData timestamp is expired');
          localStorage.removeItem('storyCreationData');
          setIsValidEntry(false);
          toast({
            title: 'Session Expired',
            description:
              'Your story creation session has expired. Please start again',
            variant: 'destructive',
          });
          setIsLoading(false);
          return;
        }
        // Check for correct story type
        if (parsedData.type === 'ai') {
          console.warn("Wrong story type: 'ai', redirecting to ai-story page");
          router.push('/create/ai-story');
          return;
        }
        // Valid entry, set up the form
        setStoryType(parsedData.type || 'text');
        setStoryFormat(parsedData.format || 'free');

        // Initialize the genre from saved data
        if (parsedData.genre) {
          setStoryData((prev) => ({
            ...prev,
            genre: parsedData.genre,
          }));
        }
        console.log('Successfully loaded story creation data:', parsedData);
        setIsValidEntry(true);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading story creation data:', error);
        setIsValidEntry(false);
        toast({
          title: 'Error',
          description:
            'An error occurred loading your data. Please start again',
          variant: 'destructive',
        });
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [account, router, toast]);

  // Draft recovery detection on mount
  useEffect(() => {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (!saved) return;

    try {
      const draft = JSON.parse(saved);
      if (draft?.content?.trim()) {
        setRecoveredDraft(draft);
        setShowRecoveryModal(true);
      }
    } catch (error) {
      console.error('Error parsing draft:', error);
      localStorage.removeItem(DRAFT_KEY);
    }
  }, []);

  // Autosave logic with debounce
  useEffect(() => {
    const hasAnyDraftData =
      storyData.title.trim() ||
      storyData.description.trim() ||
      storyData.genre.trim() ||
      storyData.content.trim() ||
      storyData.coverImage;
    if (!hasAnyDraftData) return;

     const timeout = setTimeout(() => {
       const draft: StoryDraft = {
         title: storyData.title,
         description: storyData.description,
         genre: storyData.genre,
         content: storyData.content,
         coverImageName: storyData.coverImage?.name,
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
  }, [storyData.title, storyData.description, storyData.genre, storyData.content, storyData.coverImage]);

  const handleGoBack = () => {
    router.push('/');
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setStoryData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGenreChange = (value: string) => {
    setStoryData((prev) => ({
      ...prev,
      genre: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      setStoryData((prev) => ({
        ...prev,
        coverImage: file,
      }));
    }
  };

  const uploadToIPFS = async (file: File): Promise<string> => {
    try {
      // Get IPFS client when needed
      const ipfsClient = await getIpfsClient();

      // Create a buffer from the file
      const buffer = await file.arrayBuffer();
      const added = await ipfsClient.add(new Uint8Array(buffer));
      return added.path;
    } catch (error: any) {
      console.error('Error uploading to IPFS:', error);

      // Handle specific error types
      if (error.name === 'IpfsConfigError') {
        toast({
          title: 'IPFS Configuration Error',
          description:
            'Missing IPFS credentials. Please check environment variables.',
          variant: 'destructive',
        });
        throw new Error(
          'Missing IPFS credentials. Please check environment variables.'
        );
      } else if (error.name === 'IpfsInitError') {
        toast({
          title: 'IPFS Connection Error',
          description: 'Failed to connect to IPFS. Please try again later.',
          variant: 'destructive',
        });
        throw new Error('Failed to connect to IPFS. Please try again later.');
      } else if (error.message.includes('timeout')) {
        toast({
          title: 'IPFS Timeout',
          description:
            'Upload to IPFS timed out. Please try again with a smaller file.',
          variant: 'destructive',
        });
        throw new Error(
          'Upload to IPFS timed out. Please try again with a smaller file.'
        );
      }
      // Generic error
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload to IPFS. Please try again later.',
        variant: 'destructive',
      });
      throw new Error('Failed to upload to IPFS. Please try again later.');
    }
  };

  const createStoryNFT = async (metadata: StoryMetadata) => {
    try {
      // Here you would:
      // 1. Deploy NFT contract if not already deployed
      // 2. Mint NFT with metadata
      // 3. Return NFT contract address and token ID

      // For now, we'll simulate the NFT creation
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return {
        contractAddress: '0x...',
        tokenId: '1',
      };
    } catch (error) {
      console.error('Error creating NFT:', error);
      throw new Error('Failed to create NFT');
    }
  };

  const saveToDatabase = async (metadata: StoryMetadata, nftData: any) => {
    try {
      // Here you would save the story data to your backend
      // For now, we'll simulate the database save
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // In production, you would make an API call:
      // await fetch('/api/stories', {
      //   method: 'POST',
      //   body: JSON.stringify({ ...metadata, ...nftData }),
      // });
    } catch (error) {
      console.error('Error saving to database:', error);
      throw new Error('Failed to save story data');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate inputs
      if (!storyData.title || !storyData.content || !storyData.genre) {
        throw new Error('Please fill in all required fields');
      }
      // Show progress toast
      toast({
        title:
          storyFormat === 'nft' ? 'Creating NFT Story' : 'Publishing Story',
        description: 'Preparing your content...',
      });

      // Create story metadata
      const metadata: StoryMetadata = {
        title: storyData.title,
        description: storyData.description,
        genre: storyData.genre,
        content: storyData.content,
        coverImage: '',
        author: account || 'admin',
        createdAt: new Date().toISOString(),
        ipfsHash: '', // Will be set after content upload
      };

      // Upload cover image to IPFS if available
      let coverImageHash = '';
      if (storyData.coverImage) {
        toast({
          title: 'Processing',
          description: 'Uploading cover image to IPFS...',
        });

        try {
          coverImageHash = await uploadToIPFS(storyData.coverImage);
          metadata.coverImage = coverImageHash;
        } catch (error: any) {
          console.error('Cover image upload failed:', error);
          // Continue without cover image if upload fails
          toast({
            title: 'Warning',
            description: 'Failed to upload cover image. Continuing without it.',
            variant: 'destructive',
          });
        }
      }
      // Upload story content to IPFS
      toast({
        title: 'Processing',
        description: 'Uploading story content to IPFS...',
      });

      const contentBlob = new Blob([JSON.stringify(metadata)], {
        type: 'application/json',
      });
      const contentFile = new File([contentBlob], 'story.json');
      const contentHash = await uploadToIPFS(contentFile);
      metadata.ipfsHash = contentHash;

      // Final destination paths
      const redirectPath =
        storyFormat === 'nft'
          ? `/nft-gallery/${contentHash}`
          : `/stories/${contentHash}`;

      // Handle based on story format
      if (storyFormat === 'nft') {
        // Create NFT for NFT stories
        toast({
          title: 'Processing',
          description: 'Creating NFT on blockchain...',
        });

        const nftData = await createStoryNFT(metadata);

        // Save to database
        await saveToDatabase(metadata, nftData);

        toast({
          title: 'NFT Created!',
          description:
            'Your story has been successfully published and minted as an NFT.',
        });
      } else {
        // For free stories, just save to database
        toast({
          title: 'Processing',
          description: 'Saving your story...',
        });

        await saveToDatabase(metadata, null);

        toast({
          title: 'Story Published!',
          description: 'Your story has been successfully published.',
        });
      }
      // Clear story creation data from localStorage after successful submission
      localStorage.removeItem('storyCreationData');

      // Clear draft on successful publication
      localStorage.removeItem(DRAFT_KEY);

      // Finally, perform the redirect with a slight delay to allow toasts to be seen
      setTimeout(() => {
        console.log('Redirecting to:', redirectPath);

        try {
          // Try Next.js router first (CSR)
          router.push(redirectPath);
        } catch (navError) {
          console.error('Navigation error:', navError);
          // Fallback to direct location change
          window.location.href = redirectPath;
        }
      }, 300);
    } catch (error: any) {
      console.error('Error creating story:', error);

      const errorMessage =
        error.message || 'Failed to create story. Please try again.';
      let errorTitle = 'Error';

      // Provide more specific error messages based on the error type
      if (errorMessage.includes('IPFS')) {
        errorTitle = 'Storage Error';
      } else if (
        errorMessage.includes('NFT') ||
        errorMessage.includes('blockchain')
      ) {
        errorTitle = 'NFT Creation Error';
      } else if (errorMessage.includes('database')) {
        errorTitle = 'Database Error';
      }
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isValidEntry) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <div className="max-w-md mx-auto p-8 border rounded-lg bg-muted/20">
          <h1 className="text-2xl font-bold mb-4">Invalid Navigation</h1>
          <p className="mb-6 text-muted-foreground">
            Please start from the home page and use the Create Story button to
            properly set up your story.
          </p>
          <Button
            onClick={handleGoBack}
            className="theme-gradient-bg"
            type="button"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back Home
          </Button>
        </div>
      </div>
    );
  }
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingAnimation message="Loading Story Creator" />
      </div>
    );
  }
  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full theme-gradient-bg">
                <PenSquare className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle>
                  Create Your{' '}
                  {storyType
                    ? `${
                        storyType.charAt(0).toUpperCase() + storyType.slice(1)
                      } `
                    : ''}
                  Story
                  {storyFormat === 'nft' && ' NFT'}
                </CardTitle>
                <CardDescription>
                  {storyFormat === 'nft'
                    ? 'Create a digital collectible story NFT on the blockchain'
                    : 'Share your creativity with the world'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          {/* Draft Recovery Modal */}
          {showRecoveryModal && recoveredDraft && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white border-4 border-black rounded-2xl p-8 max-w-md w-full shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                <div className="text-center space-y-6">
                  <div className="inline-block bg-yellow-400 p-4 rounded-full border-4 border-black">
                    <Save className="h-8 w-8 text-black" />
                  </div>

                  <div>
                    <h3 className="font-bangers text-2xl mb-2">
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
                        setStoryData({
                          title: recoveredDraft.title,
                          description: recoveredDraft.description,
                          genre: recoveredDraft.genre,
                          content: recoveredDraft.content,
                          coverImage: null, // Can't restore file objects
                        });
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
                        localStorage.removeItem(DRAFT_KEY);
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
              </div>
            </div>
          )}

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">
                  Story Title
                </label>
                <Input
                  id="title"
                  name="title"
                  value={storyData.title}
                  onChange={handleInputChange}
                  placeholder="Enter your story title"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="genre" className="text-sm font-medium">
                  Genre
                </label>
                <Select
                  onValueChange={handleGenreChange}
                  value={storyData.genre}
                  defaultValue={storyData.genre}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a genre" />
                  </SelectTrigger>
                  <SelectContent>
                    {genres.map((genre) => (
                      <SelectItem key={genre.slug} value={genre.slug}>
                        <div className="flex items-center">
                          <span className="mr-2">{genre.icon}</span>
                          <span>{genre.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Short Description
                </label>
                <Textarea
                  id="description"
                  name="description"
                  value={storyData.description}
                  onChange={handleInputChange}
                  placeholder="Write a brief description of your story"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="content" className="text-sm font-medium">
                  Story Content
                </label>
                <Textarea
                  id="content"
                  name="content"
                  value={storyData.content}
                  onChange={handleInputChange}
                  placeholder="Write your story here..."
                  className="min-h-[300px]"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="coverImage" className="text-sm font-medium">
                  Cover Image
                </label>
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      document.getElementById('coverImage')?.click()
                    }
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Choose Image
                  </Button>
                  <input
                    id="coverImage"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  {storyData.coverImage && (
                    <span className="text-sm text-muted-foreground">
                      {storyData.coverImage.name}
                    </span>
                  )}
                </div>
                {previewUrl && (
                  <div className="mt-4">
                    <img
                      src={previewUrl}
                      alt="Cover preview"
                      className="max-w-[200px] rounded-md border"
                    />
                  </div>
                )}
              </div>

              {/* Creation Process Steps */}
              <div className="bg-muted/30 p-4 rounded-lg">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-primary" />
                  Story Creation Process
                </h3>
                <ol className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    1. Your story content will be uploaded to IPFS for permanent
                    storage
                  </li>
                  {storyFormat === 'nft' ? (
                    <>
                      <li>
                        2. A unique NFT will be created with your story metadata
                      </li>
                      <li>
                        3. You'll be able to manage and sell your story NFT from
                        your profile
                      </li>
                    </>
                  ) : (
                    <>
                      <li>2. Your story will be stored in our database</li>
                      <li>
                        3. Readers can view and interact with your story for
                        free
                      </li>
                    </>
                  )}
                </ol>
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="theme-gradient-bg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <LoadingAnimation message="Creating Story" />
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      {storyFormat === 'nft'
                        ? 'Create & Mint NFT'
                        : 'Publish Story'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
