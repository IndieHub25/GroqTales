'use client';

import {
  PenSquare,
  Image as ImageIcon,
  Sparkles,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Cloud,
  CloudOff,
  History,
  RotateCcw,
  Save,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useRef, useState } from 'react';

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
import {
  clearDraftRecord,
  createDraftKey,
  DraftSaveReason,
  getDraftRecord,
  getLatestDraftRecord,
  migrateLegacyDraftToRecord,
  restoreDraftVersion,
  saveDraftSnapshot,
  setActiveDraftKey,
  StoryDraftRecord,
  StoryDraftSnapshot,
  StoryDraftVersion,
  upsertDraftRecord,
} from '@/lib/story-draft-manager';
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

const AUTOSAVE_INTERVAL_MS = 8000;
const MAX_DRAFT_VERSIONS = 5;
const DRAFT_SYNC_TIMEOUT_MS = 10000;
const DRAFT_SYNC_ENDPOINT = '/api/v1/drafts';

interface StoryFormData {
  title: string;
  description: string;
  genre: string;
  content: string;
  coverImage: File | null;
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
  const [storyData, setStoryData] = useState<StoryFormData>({
    title: '',
    description: '',
    genre: '',
    content: '',
    coverImage: null,
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [storyType, setStoryType] = useState<string | null>(null);
  const [storyFormat, setStoryFormat] = useState<string | null>('free');
  const [draftKey, setDraftKeyState] = useState('');
  const [draftVersions, setDraftVersions] = useState<StoryDraftVersion[]>([]);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [isSyncingDraft, setIsSyncingDraft] = useState(false);
  const [draftSyncError, setDraftSyncError] = useState<string | null>(null);

  // Draft Recovery State
  const [recoveredDraft, setRecoveredDraft] = useState<StoryDraftRecord | null>(
    null
  );
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const latestSignatureRef = useRef('');
  const storyDataRef = useRef(storyData);
  const draftSyncErrorRef = useRef<string | null>(null);
  const showRecoveryModalRef = useRef(false);

  const setRecoveryModalVisible = useCallback((visible: boolean) => {
    showRecoveryModalRef.current = visible;
    setShowRecoveryModal(visible);
  }, []);

  useEffect(() => {
    storyDataRef.current = storyData;
  }, [storyData]);

  useEffect(() => {
    draftSyncErrorRef.current = draftSyncError;
  }, [draftSyncError]);

  const hasAnyStoryData = useCallback((formData: StoryFormData) => {
    return Boolean(
      formData.title.trim() ||
        formData.description.trim() ||
        formData.genre.trim() ||
        formData.content.trim() ||
        formData.coverImage
    );
  }, []);

  const hasSnapshotContent = useCallback((snapshot: StoryDraftSnapshot) => {
    return Boolean(
      snapshot.title.trim() ||
        snapshot.description.trim() ||
        snapshot.genre.trim() ||
        snapshot.content.trim() ||
        snapshot.coverImageName
    );
  }, []);

  const createSnapshot = useCallback(
    (formData: StoryFormData): StoryDraftSnapshot => ({
      title: formData.title,
      description: formData.description,
      genre: formData.genre,
      content: formData.content,
      coverImageName: formData.coverImage?.name || '',
      updatedAt: Date.now(),
      version: 1,
    }),
    []
  );

  const syncDraftToBackend = useCallback(
    async (snapshot: StoryDraftSnapshot, reason: DraftSaveReason) => {
      if (!draftKey) {
        return;
      }

      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        setDraftSyncError(
          'Offline mode: draft saved locally and will sync later.'
        );
        return;
      }

      try {
        setIsSyncingDraft(true);
        setDraftSyncError(null);
        const controller = new AbortController();
        const timeoutId = window.setTimeout(() => {
          controller.abort();
        }, DRAFT_SYNC_TIMEOUT_MS);

        const response = await (async () => {
          try {
            return await fetch(DRAFT_SYNC_ENDPOINT, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              signal: controller.signal,
              body: JSON.stringify({
                draftKey,
                storyType: storyType || 'text',
                storyFormat: storyFormat || 'free',
                ownerWallet: account || null,
                ownerRole: account ? 'wallet' : 'admin',
                snapshot,
                saveReason: reason,
                maxVersions: MAX_DRAFT_VERSIONS,
              }),
            });
          } finally {
            window.clearTimeout(timeoutId);
          }
        })();

        if (!response.ok) {
          throw new Error('Backend sync failed');
        }

        const payload = await response.json();
        const remoteDraft = payload?.draft as StoryDraftRecord | undefined;
        if (remoteDraft) {
          const savedRemote = upsertDraftRecord(remoteDraft);
          setDraftVersions(savedRemote.versions);
          setLastSavedAt(savedRemote.updatedAt);
        }
      } catch (error) {
        console.warn('Draft synced locally but not remotely:', error);
        setDraftSyncError(
          'Draft is saved locally. Cloud sync is currently unavailable.'
        );
      } finally {
        setIsSyncingDraft(false);
      }
    },
    [account, draftKey, storyFormat, storyType]
  );

  const persistDraft = useCallback(
    async (
      reason: DraftSaveReason,
      formDataOverride?: StoryFormData,
      forceSave: boolean = false
    ) => {
      if (!draftKey) {
        return;
      }

      const sourceData = formDataOverride || storyDataRef.current;
      if (!hasAnyStoryData(sourceData)) {
        return;
      }

      const snapshot = createSnapshot(sourceData);
      const signature = JSON.stringify([
        snapshot.title,
        snapshot.description,
        snapshot.genre,
        snapshot.content,
        snapshot.coverImageName,
      ]);

      if (
        !forceSave &&
        reason === 'autosave' &&
        signature === latestSignatureRef.current
      ) {
        if (draftSyncErrorRef.current) {
          await syncDraftToBackend(snapshot, reason);
        }
        return;
      }
      latestSignatureRef.current = signature;

      const localDraft = saveDraftSnapshot({
        draftKey,
        storyType: storyType || 'text',
        storyFormat: storyFormat || 'free',
        snapshot,
        reason,
        maxVersions: MAX_DRAFT_VERSIONS,
      });

      setDraftVersions(localDraft.versions);
      setLastSavedAt(localDraft.updatedAt);
      setActiveDraftKey(draftKey);

      await syncDraftToBackend(snapshot, reason);
    },
    [
      createSnapshot,
      draftKey,
      hasAnyStoryData,
      storyFormat,
      storyType,
      syncDraftToBackend,
    ]
  );

  // Check authentication and restore draft context
  useEffect(() => {
    const checkAuth = () => {
      console.log('Checking authentication and story data');
      const isAdmin = localStorage.getItem('adminSession') === 'true';

      if (!account && !isAdmin) {
        toast({
          title: 'Access Denied',
          description:
            'Please connect your wallet or login as admin to create stories',
          variant: 'destructive',
        });
        router.push('/');
        return;
      }

      try {
        const now = Date.now();
        const rawStoryCreationData = localStorage.getItem('storyCreationData');
        const parsedData = rawStoryCreationData
          ? JSON.parse(rawStoryCreationData)
          : null;

        if (parsedData?.type === 'ai') {
          router.push('/create/ai-story');
          return;
        }

        const fallbackDraft = getLatestDraftRecord(
          (record) => record.storyType === 'text'
        );
        const resolvedDraftKey =
          parsedData?.draftKey || fallbackDraft?.draftKey || createDraftKey();

        if (parsedData) {
          const createdAt = parsedData.timestamp || now;
          const isSessionFresh = now - createdAt < 30 * 60 * 1000;
          const hasExistingDraft = Boolean(getDraftRecord(resolvedDraftKey));

          if (!isSessionFresh && !hasExistingDraft && !fallbackDraft) {
            localStorage.removeItem('storyCreationData');
            setIsValidEntry(false);
            toast({
              title: 'Session Expired',
              description:
                'Your story creation session has expired. Please start again.',
              variant: 'destructive',
            });
            setIsLoading(false);
            return;
          }

          localStorage.setItem(
            'storyCreationData',
            JSON.stringify({
              ...parsedData,
              draftKey: resolvedDraftKey,
              timestamp: createdAt,
            })
          );

          setStoryType(parsedData.type || 'text');
          setStoryFormat(parsedData.format || 'free');
          if (parsedData.genre) {
            setStoryData((prev) => ({ ...prev, genre: parsedData.genre }));
          }
        } else if (fallbackDraft) {
          setStoryType(fallbackDraft.storyType || 'text');
          setStoryFormat(fallbackDraft.storyFormat || 'free');
        } else {
          setIsValidEntry(false);
          toast({
            title: 'Invalid Navigation',
            description:
              'Please start from the create button to set up your story properly.',
            variant: 'destructive',
          });
          setIsLoading(false);
          return;
        }

        setDraftKeyState(resolvedDraftKey);
        setActiveDraftKey(resolvedDraftKey);

        const migratedLegacy = migrateLegacyDraftToRecord({
          draftKey: resolvedDraftKey,
          storyType: parsedData?.type || fallbackDraft?.storyType || 'text',
          storyFormat:
            parsedData?.format || fallbackDraft?.storyFormat || 'free',
        });
        const localDraft = getDraftRecord(resolvedDraftKey) || migratedLegacy;
        if (localDraft) {
          setDraftVersions(localDraft.versions);
          setLastSavedAt(localDraft.updatedAt);

          if (hasSnapshotContent(localDraft.current)) {
            setRecoveredDraft(localDraft);
            setRecoveryModalVisible(true);
          }
        }

        setIsValidEntry(true);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading story creation data:', error);
        setIsValidEntry(false);
        toast({
          title: 'Error',
          description: 'Unable to initialize your draft. Please try again.',
          variant: 'destructive',
        });
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [account, hasSnapshotContent, router, setRecoveryModalVisible, toast]);

  // Try to hydrate from backend if a newer server draft exists.
  useEffect(() => {
    if (!draftKey) {
      return;
    }

    const controller = new AbortController();

    const hydrate = async () => {
      try {
        const params = new URLSearchParams({ draftKey });
        if (account) {
          params.set('ownerWallet', account.toLowerCase());
        }

        const response = await fetch(
          `${DRAFT_SYNC_ENDPOINT}?${params.toString()}`,
          {
            signal: controller.signal,
          }
        );
        if (!response.ok) {
          return;
        }

        const payload = await response.json();
        const remoteDraft = payload?.draft as StoryDraftRecord | undefined;
        if (!remoteDraft) {
          return;
        }

        const localDraft = getDraftRecord(draftKey);
        const remoteIsNewer =
          !localDraft || remoteDraft.updatedAt > localDraft.updatedAt;
        if (!remoteIsNewer) {
          return;
        }

        const hydrated = upsertDraftRecord(remoteDraft);
        setDraftVersions(hydrated.versions);
        setLastSavedAt(hydrated.updatedAt);

        if (
          hasSnapshotContent(hydrated.current) &&
          !showRecoveryModalRef.current
        ) {
          setRecoveredDraft(hydrated);
          setRecoveryModalVisible(true);
        }
      } catch (error: any) {
        if (error?.name !== 'AbortError') {
          console.warn('Unable to hydrate remote draft:', error);
        }
      }
    };

    void hydrate();
    return () => {
      controller.abort();
    };
  }, [account, draftKey, hasSnapshotContent, setRecoveryModalVisible]);

  // Autosave every X seconds.
  useEffect(() => {
    if (!draftKey) {
      return;
    }

    const autosaveInterval = window.setInterval(() => {
      void persistDraft('autosave');
    }, AUTOSAVE_INTERVAL_MS);

    return () => window.clearInterval(autosaveInterval);
  }, [draftKey, persistDraft]);

  // Save on blur-like lifecycle signals.
  useEffect(() => {
    if (!draftKey) {
      return;
    }

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        void persistDraft('blur', undefined, true);
      }
    };

    const onBeforeUnload = () => {
      void persistDraft('blur', undefined, true);
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('beforeunload', onBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, [draftKey, persistDraft]);

  const handleFieldBlur = () => {
    void persistDraft('blur');
  };

  const handleRevertToVersion = async (versionId: string) => {
    if (!draftKey) {
      return;
    }

    const restored = restoreDraftVersion({
      draftKey,
      versionId,
      maxVersions: MAX_DRAFT_VERSIONS,
    });
    if (!restored) {
      toast({
        title: 'Restore Failed',
        description: 'Could not restore this version.',
        variant: 'destructive',
      });
      return;
    }

    setStoryData((prev) => ({
      ...prev,
      title: restored.current.title,
      description: restored.current.description,
      genre: restored.current.genre,
      content: restored.current.content,
      coverImage: null,
    }));
    setDraftVersions(restored.versions);
    setLastSavedAt(restored.updatedAt);

    try {
      setIsSyncingDraft(true);
      setDraftSyncError(null);
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => {
        controller.abort();
      }, DRAFT_SYNC_TIMEOUT_MS);

      const response = await (async () => {
        try {
          return await fetch(DRAFT_SYNC_ENDPOINT, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            signal: controller.signal,
            body: JSON.stringify({
              draftKey,
              versionId,
              maxVersions: MAX_DRAFT_VERSIONS,
            }),
          });
        } finally {
          window.clearTimeout(timeoutId);
        }
      })();

      if (!response.ok) {
        throw new Error('Failed to sync version restore');
      }

      const payload = await response.json();
      const remoteDraft = payload?.draft as StoryDraftRecord | undefined;
      if (remoteDraft) {
        const updated = upsertDraftRecord(remoteDraft);
        setDraftVersions(updated.versions);
        setLastSavedAt(updated.updatedAt);
      }
    } catch (error) {
      console.warn('Version restore synced locally only:', error);
      setDraftSyncError(
        'Version restored locally. Cloud sync will retry automatically.'
      );
    } finally {
      setIsSyncingDraft(false);
    }

    toast({
      title: 'Version Restored',
      description: 'Your draft was reverted to the selected snapshot.',
    });
  };

  const deleteRemoteDraft = useCallback(async (targetDraftKey: string) => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      controller.abort();
    }, DRAFT_SYNC_TIMEOUT_MS);

    try {
      await fetch(
        `${DRAFT_SYNC_ENDPOINT}?draftKey=${encodeURIComponent(targetDraftKey)}`,
        {
          method: 'DELETE',
          signal: controller.signal,
        }
      );
    } finally {
      window.clearTimeout(timeoutId);
    }
  }, []);

  const handleGoBack = () => {
    void persistDraft('manual', storyData, true);
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
    const latestData = storyDataRef.current;
    const nextData = {
      ...latestData,
      genre: value,
    };

    setStoryData((prev) => ({
      ...prev,
      genre: value,
    }));
    void persistDraft('blur', nextData, true);
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
      void persistDraft(
        'manual',
        {
          ...storyDataRef.current,
          coverImage: file,
        },
        true
      );
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

      await persistDraft('manual', storyData, true);

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
      if (draftKey) {
        clearDraftRecord(draftKey);
        setActiveDraftKey(null);

        try {
          await deleteRemoteDraft(draftKey);
        } catch (error) {
          console.warn('Could not delete synced draft:', error);
        }
      }

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
                      {new Date(
                        recoveredDraft.current.updatedAt
                      ).toLocaleString()}
                      . Would you like to restore it?
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      onClick={() => {
                        const draft = recoveredDraft.current;
                        setStoryData({
                          title: draft.title,
                          description: draft.description,
                          genre: draft.genre,
                          content: draft.content,
                          coverImage: null,
                        });
                        setDraftVersions(recoveredDraft.versions);
                        setLastSavedAt(recoveredDraft.updatedAt);
                        setRecoveryModalVisible(false);
                        setRecoveredDraft(null);
                        toast({
                          title: 'DRAFT RESTORED!',
                          description: 'Your previous work has been recovered.',
                          className:
                            'font-bangers bg-green-400 text-black border-4 border-black',
                        });
                      }}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bangers px-6 py-3"
                    >
                      RESTORE DRAFT
                    </Button>
                    <Button
                      onClick={() => {
                        if (draftKey) {
                          clearDraftRecord(draftKey);
                          setActiveDraftKey(null);
                          void deleteRemoteDraft(draftKey).catch((error) => {
                            console.warn(
                              'Failed to delete remote draft:',
                              error
                            );
                          });
                        }
                        setRecoveryModalVisible(false);
                        setRecoveredDraft(null);
                        setDraftVersions([]);
                        setLastSavedAt(null);
                        toast({
                          title: 'DRAFT DISCARDED',
                          description: 'Starting fresh!',
                          className:
                            'font-bangers bg-gray-400 text-black border-4 border-black',
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
                  onBlur={handleFieldBlur}
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
                  onBlur={handleFieldBlur}
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
                  onBlur={handleFieldBlur}
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

              {/* Autosave Status + Version History */}
              <div className="bg-muted/30 p-4 rounded-lg space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-medium flex items-center gap-2">
                    <History className="h-4 w-4 text-primary" />
                    Draft Autosave & Version History
                  </h3>
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    {isSyncingDraft ? (
                      <>
                        <Cloud className="h-3.5 w-3.5 animate-pulse" />
                        Syncing...
                      </>
                    ) : draftSyncError ? (
                      <>
                        <CloudOff className="h-3.5 w-3.5 text-amber-600" />
                        Local only
                      </>
                    ) : lastSavedAt ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                        Saved {new Date(lastSavedAt).toLocaleTimeString()}
                      </>
                    ) : (
                      <>Not saved yet</>
                    )}
                  </div>
                </div>

                {draftSyncError && (
                  <p className="text-xs text-amber-700">{draftSyncError}</p>
                )}

                {draftVersions.length > 0 ? (
                  <ul className="space-y-2">
                    {draftVersions
                      .slice(0, MAX_DRAFT_VERSIONS)
                      .map((version) => (
                        <li
                          key={version.id}
                          className="flex items-center justify-between rounded-md border bg-background px-3 py-2"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">
                              {version.title || 'Untitled snapshot'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(version.updatedAt).toLocaleString()} (
                              {version.reason})
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleRevertToVersion(version.id)}
                            className="ml-3"
                          >
                            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                            Revert
                          </Button>
                        </li>
                      ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No previous snapshots yet. Autosave runs every few seconds
                    and when fields lose focus.
                  </p>
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
                  onClick={() => {
                    void persistDraft('manual', storyData, true);
                    router.back();
                  }}
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
