import { useState, useCallback } from 'react';

/**
 * Types for the Groq API responses
 */
type GroqModels = {
  [key: string]: string;
};

type ModelNames = {
  [key: string]: string;
};

type GenerateOptions = {
  temperature?: number;
  max_tokens?: number;
  system_prompt?: string;
  apiKey?: string;
};

type UseGroqResult = {
  generate: (
    prompt: string,
    model?: string,
    options?: GenerateOptions
  ) => Promise<string>;
  analyze: (content: string, apiKey?: string) => Promise<any>;
  generateIdeas: (
    genre: string,
    theme?: string,
    length?: 'short' | 'medium' | 'long',
    apiKey?: string
  ) => Promise<any[]>;
  improve: (
    content: string,
    focus?: string,
    apiKey?: string
  ) => Promise<string>;
  testConnection: (
    apiKey?: string,
    useSpecialModel?: boolean
  ) => Promise<{ success: boolean; message: string; model?: string }>;
  availableModels: GroqModels;
  modelNames: ModelNames;
  defaultModel: string;
  isLoading: boolean;
  error: string | null;
  fetchModels: () => Promise<void>;
};

/**
 * Hook for interacting with the Groq AI service
 */
export function useGroq(): UseGroqResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableModels, setAvailableModels] = useState<GroqModels>({});
  const [modelNames, setModelNames] = useState<ModelNames>({});
  const [defaultModel, setDefaultModel] = useState<string>('');

  /**
   * Fetch available Groq models
   */
  const fetchModels = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/groq/models');
      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.statusText}`);
      }
      const data = await response.json();
      setAvailableModels(data.models);
      setDefaultModel(data.default);

      // Set model names if provided
      if (data.modelNames) {
        setModelNames(data.modelNames);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch models');
      console.error('Error fetching Groq models:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Test connection to Groq API
   */
  const testConnection = useCallback(
    async (
      apiKey?: string,
      useSpecialModel = true
    ): Promise<{ success: boolean; message: string; model?: string }> => {
      try {
        setIsLoading(true);
        setError(null);

        const url = `/api/groq/models?action=test&special=${useSpecialModel}&apiKey=${
          apiKey || ''
        }`;
        const response = await fetch(url);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Connection test failed');
        }
        const data = await response.json();
        return {
          success: data.success,
          message: data.message || 'Connection successful',
          model: data.model,
        };
      } catch (err: any) {
        setError(err.message || 'Connection test failed');
        console.error('Error testing Groq connection:', err);
        return {
          success: false,
          message: err.message || 'Connection test failed',
        };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Generate content with Groq
   */
  const generate = useCallback(
    async (
      prompt: string,
      model?: string,
      options?: GenerateOptions
    ): Promise<string> => {
      try {
        setIsLoading(true);
        setError(null);

        // Extract apiKey from options if present
        const { apiKey, ...restOptions } = options || {};

        const response = await fetch('/api/groq', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'generate',
            prompt,
            model: model || defaultModel,
            options: restOptions,
            apiKey,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to generate content');
        }
        const data = await response.json();
        return data.result;
      } catch (err: any) {
        setError(err.message || 'Failed to generate content');
        console.error('Error generating content with Groq:', err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [defaultModel]
  );

  /**
   * Analyze content with Groq
   */
  const analyze = useCallback(
    async (content: string, apiKey?: string): Promise<any> => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch('/api/groq', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'analyze',
            content,
            apiKey,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to analyze content');
        }
        const data = await response.json();
        return data.result;
      } catch (err: any) {
        setError(err.message || 'Failed to analyze content');
        console.error('Error analyzing content with Groq:', err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Generate story ideas with Groq
   */
  const generateIdeas = useCallback(
    async (
      genre: string,
      theme?: string,
      length: 'short' | 'medium' | 'long' = 'medium',
      apiKey?: string
    ): Promise<any[]> => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch('/api/groq', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'ideas',
            genre,
            theme,
            length,
            apiKey,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to generate story ideas');
        }
        const data = await response.json();
        return data.result;
      } catch (err: any) {
        setError(err.message || 'Failed to generate story ideas');
        console.error('Error generating story ideas with Groq:', err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Improve content with Groq
   */
  const improve = useCallback(
    async (
      content: string,
      focus?: string,
      apiKey?: string
    ): Promise<string> => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch('/api/groq', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'improve',
            content,
            focus,
            apiKey,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to improve content');
        }
        const data = await response.json();
        return data.result;
      } catch (err: any) {
        setError(err.message || 'Failed to improve content');
        console.error('Error improving content with Groq:', err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    generate,
    analyze,
    generateIdeas,
    improve,
    testConnection,
    availableModels,
    modelNames,
    defaultModel,
    isLoading,
    error,
    fetchModels,
  };
}
