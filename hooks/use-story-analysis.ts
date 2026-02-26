import { useEffect, useRef, useCallback } from 'react';

type InteractionType = 'VIEW' | 'LIKE' | 'BOOKMARK' | 'SHARE' | 'TIME_SPENT';

export function useStoryAnalytics(storyId: string) {
  const startTime = useRef<number>(Date.now());
  const hasRecordedView = useRef(false);

  const sendSignal = (type: InteractionType, value: number = 1) => {
    const data = { storyId, type, value };
    
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/analytics/record', blob);
    } else {
      fetch('/api/analytics/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        keepalive: true,
      }).catch((e) => console.error('Analytics error:', e));
    }
  };

  useEffect(() => {
    if (!storyId) return;

    startTime.current = Date.now();

    if (!hasRecordedView.current) {
      fetch('/api/analytics/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storyId, type: 'VIEW', value: 1 }),
      }).catch(console.error);
      
      hasRecordedView.current = true;
    }

    return () => {
      const durationSeconds = (Date.now() - startTime.current) / 1000;
      
      if (durationSeconds > 5) {
        sendSignal('TIME_SPENT', durationSeconds);
      }
    };
  }, [storyId]);

  const trackInteraction = useCallback((type: InteractionType) => {
    fetch('/api/analytics/record', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storyId, type, value: 1 }),
    }).catch(console.error);
  }, [storyId]);

  return { trackInteraction };
}