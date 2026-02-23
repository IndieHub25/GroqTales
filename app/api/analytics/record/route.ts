import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const isMockDb =
    process.env.NEXT_PUBLIC_BUILD_MODE === 'true' || process.env.CI === 'true';
  if (isMockDb) {
    return NextResponse.json({ success: true });
  }

  const { storyId, type, duration } = await req.json();
  const allowedTypes = [
    'VIEW',
    'LIKE',
    'BOOKMARK',
    'SHARE',
    'TIME_SPENT',
  ] as const;

  if (typeof storyId !== 'string' || !storyId) {
    return NextResponse.json({ error: 'Invalid storyId' }, { status: 400 });
  }
  if (!allowedTypes.includes(type)) {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  }
  if (type === 'TIME_SPENT' && (typeof duration !== 'number' || duration < 0)) {
    return NextResponse.json({ error: 'Invalid duration' }, { status: 400 });
  }

  const { error } = await supabase
    .from('user_interactions')
    .insert({
      user_id: session.user.id,
      story_id: storyId,
      interaction_type: type,
      value: type === 'TIME_SPENT' ? duration : 1
    });

  if (error) {
    console.error('Failed to log interaction', error);
    return NextResponse.json({ error: 'Failed to record interaction' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
