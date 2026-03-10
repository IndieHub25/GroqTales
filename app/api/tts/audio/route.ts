import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nipmqxecwnzwsmfrrkpl.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pcG1xeGVjd256d3NtZnJya3BsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwNDY2MDIsImV4cCI6MjA1NjYyMjYwMn0.pBBXvtjEHrMTFD3GGpoK0oLxHHZEigVksm7ZBYUIzJg';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storyId = searchParams.get('storyId');
    const chapterIndex = searchParams.get('chapterIndex') || '0';
    const speaker = searchParams.get('speaker') || 'Shubh';
    const languageCode = searchParams.get('languageCode') || 'en-IN';

    if (!storyId) {
      return NextResponse.json({ error: 'storyId is required' }, { status: 400 });
    }

    const key = SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY;
    const supabase = createClient(SUPABASE_URL, key);

    // Check story_audio table for existing audio
    const { data, error } = await supabase
      .from('story_audio')
      .select('audio_url')
      .eq('story_id', storyId)
      .eq('chapter_index', Number(chapterIndex))
      .eq('speaker', speaker)
      .eq('language_code', languageCode)
      .maybeSingle();

    if (error) {
      // Table may not exist — that's OK, just return no audio
      return NextResponse.json({ audioUrl: null });
    }

    return NextResponse.json({ audioUrl: data?.audio_url || null });
  } catch (err: any) {
    console.error('TTS audio fetch error:', err);
    return NextResponse.json({ audioUrl: null });
  }
}
