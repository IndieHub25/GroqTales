'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export const BULBUL_SPEAKERS = [
    'Shubh', 'Aditya', 'Ritu', 'Priya', 'Neha', 'Rahul', 'Pooja', 'Rohan',
    'Simran', 'Kavya', 'Amit', 'Dev', 'Ishita', 'Shreya', 'Ratan', 'Varun',
    'Manan', 'Sumit', 'Roopa', 'Kabir', 'Aayan', 'Ashutosh', 'Advait',
    'Amelia', 'Sophia', 'Anand', 'Tanya', 'Tarun', 'Sunny', 'Mani',
    'Gokul', 'Vijay', 'Shruti', 'Suhani', 'Mohit', 'Kavitha', 'Rehan',
    'Soham', 'Rupali',
];

export const BULBUL_LANGUAGES = [
    { code: 'en-IN', label: 'English (India)' },
    { code: 'hi-IN', label: 'हिंदी' },
    { code: 'bn-IN', label: 'বাংলা' },
    { code: 'ta-IN', label: 'தமிழ்' },
    { code: 'te-IN', label: 'తెలుగు' },
    { code: 'gu-IN', label: 'ગુજરાતી' },
    { code: 'kn-IN', label: 'ಕನ್ನಡ' },
    { code: 'ml-IN', label: 'മലയാളം' },
    { code: 'mr-IN', label: 'मराठी' },
    { code: 'pa-IN', label: 'ਪੰਜਾਬੀ' },
    { code: 'od-IN', label: 'ଓଡ଼ିଆ' },
];

export interface TTSOptions {
    storyId: string;
    chapterIndex?: number;
    text: string;
    speaker?: string;
    languageCode?: string;
    pace?: number;
}

interface TTSState {
    audioUrl: string | null;
    isPlaying: boolean;
    isGenerating: boolean;
    isLoading: boolean;
    currentTime: number;
    duration: number;
    speaker: string;
    languageCode: string;
    pace: number;
    error: string | null;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://groqtales-backend-api.onrender.com';
export const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export function useTTS(storyId: string, chapterIndex = 0, defaultSpeaker = 'Shubh', defaultLang = 'en-IN') {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [state, setState] = useState<TTSState>({
        audioUrl: null,
        isPlaying: false,
        isGenerating: false,
        isLoading: false,
        currentTime: 0,
        duration: 0,
        speaker: defaultSpeaker,
        languageCode: defaultLang,
        pace: 1,
        error: null,
    });

    // Fetch existing audio on mount/param change
    useEffect(() => {
        if (!storyId) return;
        let cancelled = false;

        async function fetchExisting() {
            setState(prev => ({ ...prev, isLoading: true, audioUrl: null, error: null }));
            try {
                const params = new URLSearchParams({
                    storyId,
                    chapterIndex: String(chapterIndex),
                    speaker: state.speaker,
                    languageCode: state.languageCode,
                });
                const res = await fetch(`${API_BASE}/api/v1/tts/audio?${params}`);
                if (!cancelled && res.ok) {
                    const data = await res.json();
                    setState(prev => ({
                        ...prev,
                        audioUrl: data.audioUrl || null,
                        isLoading: false,
                    }));
                } else if (!cancelled) {
                    setState(prev => ({ ...prev, isLoading: false }));
                }
            } catch {
                if (!cancelled) setState(prev => ({ ...prev, isLoading: false }));
            }
        }
        fetchExisting();
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [storyId, chapterIndex, state.speaker, state.languageCode]);

    // Sync audio element when audioUrl changes
    useEffect(() => {
        if (!state.audioUrl) return;
        const audio = audioRef.current || new Audio();
        audioRef.current = audio;
        audio.src = state.audioUrl;
        audio.playbackRate = state.pace;

        const onTimeUpdate = () => setState(prev => ({ ...prev, currentTime: audio.currentTime }));
        const onDurationChange = () => setState(prev => ({ ...prev, duration: audio.duration || 0 }));
        const onEnded = () => setState(prev => ({ ...prev, isPlaying: false, currentTime: 0 }));
        const onError = () => setState(prev => ({ ...prev, error: 'Audio playback error', isPlaying: false }));

        audio.addEventListener('timeupdate', onTimeUpdate);
        audio.addEventListener('durationchange', onDurationChange);
        audio.addEventListener('ended', onEnded);
        audio.addEventListener('error', onError);

        return () => {
            audio.pause();
            audio.currentTime = 0;
            audio.src = '';
            if (audioRef.current === audio) {
                audioRef.current = null;
            }
            audio.removeEventListener('timeupdate', onTimeUpdate);
            audio.removeEventListener('durationchange', onDurationChange);
            audio.removeEventListener('ended', onEnded);
            audio.removeEventListener('error', onError);
        };
    }, [state.audioUrl, state.pace]);

    const play = useCallback(() => {
        if (!audioRef.current || !state.audioUrl) return;
        audioRef.current.play();
        setState(prev => ({ ...prev, isPlaying: true }));
    }, [state.audioUrl]);

    const pause = useCallback(() => {
        if (!audioRef.current) return;
        audioRef.current.pause();
        setState(prev => ({ ...prev, isPlaying: false }));
    }, []);

    const seek = useCallback((time: number) => {
        if (!audioRef.current) return;
        audioRef.current.currentTime = time;
        setState(prev => ({ ...prev, currentTime: time }));
    }, []);

    const setSpeed = useCallback((speed: number) => {
        if (audioRef.current) audioRef.current.playbackRate = speed;
        setState(prev => ({ ...prev, pace: speed }));
    }, []);

    const setSpeaker = useCallback((speaker: string) => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current.src = '';
            audioRef.current = null;
        }
        setState(prev => ({ ...prev, speaker, audioUrl: null, isPlaying: false }));
    }, []);

    const setLanguage = useCallback((languageCode: string) => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current.src = '';
            audioRef.current = null;
        }
        setState(prev => ({ ...prev, languageCode, audioUrl: null, isPlaying: false }));
    }, []);

    const generateAudio = useCallback(async (text: string, token?: string) => {
        if (!text || !storyId) return;
        setState(prev => ({ ...prev, isGenerating: true, error: null }));
        try {
            const res = await fetch(`${API_BASE}/api/v1/tts/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    storyId,
                    chapterIndex,
                    text,
                    speaker: state.speaker,
                    languageCode: state.languageCode,
                    pace: state.pace,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                setState(prev => ({
                    ...prev,
                    isGenerating: false,
                    error: data.error || 'Failed to generate audio',
                }));
                return;
            }
            setState(prev => ({
                ...prev,
                audioUrl: data.audioUrl,
                isGenerating: false,
                error: null,
            }));
        } catch (err) {
            setState(prev => ({
                ...prev,
                isGenerating: false,
                error: 'Audio generation failed. Check your connection.',
            }));
        }
    }, [storyId, chapterIndex, state.speaker, state.languageCode, state.pace]);

    return {
        ...state,
        audioRef,
        play,
        pause,
        seek,
        setSpeed,
        setSpeaker,
        setLanguage,
        generateAudio,
        SPEEDS,
        BULBUL_SPEAKERS,
        BULBUL_LANGUAGES,
    };
}
