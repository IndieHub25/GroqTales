'use client';

import { useState } from 'react';
import { ethers } from 'ethers';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_STORY_NFT_CONTRACT; 

type Genre = 'fantasy' | 'scifi' | 'horror' | 'adventure' | 'mystery';
type Tone = 'dark' | 'humorous' | 'epic' | 'whimsical' | '';

interface StoryResponse {
  success: boolean;
  story?: string;
  storyId?: string;
  error?: string;
  details?: Record<string, any>;
}

const CONTRACT_ABI = [
  "function mintStory(string memory tokenURI, bytes memory signature) public"
];

export default function CreateStoryForm() {
  const [prompt, setPrompt] = useState('');
  const [genre, setGenre] = useState<Genre>('fantasy');
  const [tone, setTone] = useState<Tone>(''); 
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedStory, setGeneratedStory] = useState<string | null>(null);
  const [isMinting, setIsMinting] = useState(false);
  const [mintStatus, setMintStatus] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [storyId, setStoryId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setGeneratedStory(null);
    setMintStatus(null);
    setTxHash(null);

    try {
      const payload = {
        prompt,
        genre,
        ...(tone ? { tone } : {}) 
      };

      const res = await fetch('/api/stories/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.status === 429) {
        setError("You are creating stories too fast! Please wait a moment.");
        return;
      }

      const data: StoryResponse = await res.json();

      if (!res.ok) {
        if (data.details) {
          const fieldErrors = Object.entries(data.details)
            .filter(([key, val]) => key !== '_errors' && val && (val as any)._errors?.length)
            .map(([field, val]) => `${field}: ${(val as any)._errors.join(', ')}`)
            .join(', ');
          setError(fieldErrors || "Please fix the errors in the form.");
        } else {
          setError(data.error || "Something went wrong.");
        }
        return;
      }

      if (data.success && data.story) {
        setGeneratedStory(data.story);
        setStoryId(data.storyId as string);
      }
    } catch (err) {
      console.error("Network error:", err);
      setError("Failed to connect to the server.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMint = async () => {
    if (!generatedStory) return;
    if (!CONTRACT_ADDRESS) {
      setError("Contract address not configured in environment.");
      return;
    }
    
    setIsMinting(true);
    setMintStatus("Connecting Wallet...");
    setError(null);

    try {
      if (!window.ethereum) {
        throw new Error("No crypto wallet found. Please install MetaMask.");
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();

      setMintStatus("Verifying with server...");
      
      if (!storyId) {
        setError("Story ID not available");
        return;
      }

      const signRes = await fetch('/api/mint/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userWallet: userAddress, 
          storyId: storyId 
        }),
      });

      if (!signRes.ok) {
        const errData = await signRes.json();
        throw new Error(errData.error || "Failed to get mint signature");
      }

      const { signature } = await signRes.json();

      setMintStatus("Confirm transaction in wallet...");
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      // Call the Smart Contract
      if (!contract.mintStory) {
        throw new Error("Contract method mintStory not found");
      }
      const tx = await contract.mintStory(generatedStory, signature);
      
      setMintStatus("Transaction sent! Waiting for confirmation...");
      await tx.wait();

      setMintStatus("Minted Successfully! 🎉");
      setTxHash(tx.hash);

    } catch (err: any) {
      console.error("Minting failed:", err);
      if (err.code === 'ACTION_REJECTED') {
        setError("Transaction rejected by user.");
      } else {
        setError(err.message || "Minting failed.");
      }
      setMintStatus(null);
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Generate a New Story</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
          <select
            value={genre}
            onChange={(e) => setGenre(e.target.value as Genre)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="fantasy">Fantasy</option>
            <option value="scifi">Sci-Fi</option>
            <option value="horror">Horror</option>
            <option value="adventure">Adventure</option>
            <option value="mystery">Mystery</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tone</label>
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value as Tone)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Neutral (Default)</option>
            <option value="dark">Dark</option>
            <option value="humorous">Humorous</option>
            <option value="epic">Epic</option>
            <option value="whimsical">Whimsical</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Prompt <span className="text-xs text-gray-500">(Min 10 chars)</span>
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="A robot discovers a flower in the wasteland..."
            required
            minLength={10}
            maxLength={300}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || isMinting}
          className={`w-full py-2 px-4 rounded-md text-white font-semibold transition-colors
            ${isLoading || isMinting
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
            }`}
        >
          {isLoading ? 'Generating Story...' : 'Generate Story'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-md">
          <strong>Error:</strong> {error}
        </div>
      )}

      {generatedStory && (
        <div className="mt-8 p-6 bg-gray-50 border border-gray-200 rounded-lg animate-fade-in">
          <h3 className="text-xl font-semibold mb-3 text-gray-800">Your Story</h3>
          <div className="prose text-gray-700 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto mb-4">
            {generatedStory}
          </div>
          
          <div className="flex flex-col gap-2">
            <button 
              onClick={handleMint}
              disabled={isMinting}
              className={`py-2 px-4 rounded-md font-semibold text-white transition-colors
                ${isMinting 
                  ? 'bg-purple-300 cursor-wait' 
                  : 'bg-purple-600 hover:bg-purple-700'
                }`}
            >
              {isMinting ? 'Minting in progress...' : 'Mint as NFT'}
            </button>
            
            {mintStatus && (
              <p className="text-sm text-center text-purple-700 font-medium mt-2">
                {mintStatus}
              </p>
            )}
            
            {txHash && (
              <a 
                href={`https://explorer.monad.xyz/tx/${txHash}`} 
                target="_blank"
                rel="noreferrer"
                className="text-xs text-center text-gray-500 hover:text-purple-600 underline"
              >
                View Transaction
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}