'use client';

import { useState } from 'react';

interface StoryResponse {
  success: boolean;
  story?: string;
  error?: string;
  details?: Record<string, any>;
}

export default function CreateStoryForm() {
  const [prompt, setPrompt] = useState('');
  const [genre, setGenre] = useState('fantasy');
  const [tone, setTone] = useState('neutral');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedStory, setGeneratedStory] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    setError(null);
    setGeneratedStory(null);

    try {
      const res = await fetch('/api/stories/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, genre, tone }),
      });

      if (res.status === 429) {
        setError("You are creating stories too fast! Please wait a moment.");
        return;
      }

      const data: StoryResponse = await res.json();

      if (!res.ok) {
        if (data.details) {
          console.error("Validation Errors:", data.details);
          const fieldErrors = Object.keys(data.details._errors || {})
            .map(field => `${field}: ${data.details?._errors[field]}`)
            .join(', ');
            
          setError(fieldErrors || "Please fix the errors in the form (check console).");
        } else {
          setError(data.error || "Something went wrong.");
        }
        return;
      }

      if (data.success && data.story) {
        setGeneratedStory(data.story);
      }

    } catch (err) {
      console.error("Network or unexpected error:", err);
      setError("Failed to connect to the server.");
    } finally {
      setIsLoading(false);
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
            onChange={(e) => setGenre(e.target.value)}
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
            onChange={(e) => setTone(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="neutral">Neutral</option>
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
          disabled={isLoading}
          className={`w-full py-2 px-4 rounded-md text-white font-semibold transition-colors
            ${isLoading 
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
        <div className="mt-8 p-6 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="text-xl font-semibold mb-3 text-gray-800">Your Story</h3>
          <div className="prose text-gray-700 whitespace-pre-wrap leading-relaxed">
            {generatedStory}
          </div>
          
          <button className="mt-4 text-sm text-blue-600 hover:underline">Mint as NFT</button>
        </div>
      )}
    </div>
  );
}