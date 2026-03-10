import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SARVAM_API_URL = 'https://api.sarvam.ai/text-to-speech';
const SARVAM_API_KEY = process.env.SARVAM_API_KEY || '';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nipmqxecwnzwsmfrrkpl.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { storyId, chapterIndex = 0, text, speaker = 'Shubh', languageCode = 'en-IN', pace = 1 } = body;

    if (!text || !storyId) {
      return NextResponse.json({ error: 'Missing required fields: text, storyId' }, { status: 400 });
    }

    if (!SARVAM_API_KEY) {
      return NextResponse.json(
        { error: 'TTS service not configured. SARVAM_API_KEY is not set.' },
        { status: 503 }
      );
    }

    // Truncate text for TTS (Sarvam has a limit)
    const truncatedText = text.slice(0, 5000);

    // Call Sarvam TTS API
    const sarvamRes = await fetch(SARVAM_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'API-Subscription-Key': SARVAM_API_KEY,
      },
      body: JSON.stringify({
        inputs: [truncatedText],
        target_language_code: languageCode,
        speaker: speaker,
        model: 'bulbul:v2',
        pitch: 0,
        pace: pace,
        loudness: 1.5,
        enable_preprocessing: true,
      }),
    });

    if (!sarvamRes.ok) {
      const errText = await sarvamRes.text();
      console.error('Sarvam TTS error:', sarvamRes.status, errText);
      return NextResponse.json(
        { error: `TTS generation failed (${sarvamRes.status})` },
        { status: 502 }
      );
    }

    const sarvamData = await sarvamRes.json();
    const base64Audio = sarvamData.audios?.[0];

    if (!base64Audio) {
      return NextResponse.json({ error: 'No audio returned from TTS service' }, { status: 502 });
    }

    // Convert base64 to buffer
    const audioBuffer = Buffer.from(base64Audio, 'base64');

    // Try to upload to Supabase Storage if service key is available
    let audioUrl = `data:audio/wav;base64,${base64Audio}`;

    if (SUPABASE_SERVICE_KEY) {
      try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
        const fileName = `tts/${storyId}/ch${chapterIndex}_${speaker}_${languageCode}.wav`;
        
        const { data, error } = await supabase.storage
          .from('story-audio')
          .upload(fileName, audioBuffer, {
            contentType: 'audio/wav',
            upsert: true,
          });

        if (!error && data) {
          const { data: urlData } = supabase.storage
            .from('story-audio')
            .getPublicUrl(fileName);
          audioUrl = urlData.publicUrl;
        }
      } catch (uploadErr) {
        console.warn('Failed to upload audio to storage, using base64 fallback:', uploadErr);
      }
    }

    // Also store record in story_audio table if available
    if (SUPABASE_SERVICE_KEY) {
      try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
        await supabase.from('story_audio').upsert({
          story_id: storyId,
          chapter_index: chapterIndex,
          speaker,
          language_code: languageCode,
          audio_url: audioUrl,
        }, { onConflict: 'story_id,chapter_index,speaker,language_code' }).select();
      } catch {
        // Non-critical — continue even if DB insert fails
      }
    }

    return NextResponse.json({ audioUrl });
  } catch (err: any) {
    console.error('TTS generate error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
