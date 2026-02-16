'use client';

import React, { useState, useCallback } from 'react';

// Mock context type
interface MiniKitContext {
  client: {
    added: boolean;
  };
}
// Mock for useMiniKit

export function useMiniKit() {
  const [isReady, setIsReady] = useState(false);
  const [context, setContext] = useState<MiniKitContext | null>({
    client: { added: false },
  });

  const setFrameReady = useCallback(() => {
    setIsReady(true);
  }, []);

  return {
    setFrameReady,
    isFrameReady: isReady,
    context,
  };
}
// Mock for useAddFrame

export function useAddFrame() {
  return () => {
    console.log('Mock: Frame added');
    return true;
  };
}
// Mock for useOpenUrl

export function useOpenUrl() {
  return (url: string) => {
    console.log('Mock URL opened:', url);
    window.open(url, '_blank');
    return true;
  };
}
// Mock for useNotification

export function useNotification() {
  return async ({ title, body }: { title: string; body: string }) => {
    console.log('Mock notification sent:', { title, body });
    return true;
  };
}
