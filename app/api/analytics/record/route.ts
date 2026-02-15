import { NextResponse } from 'next/server';
import { UserInteraction } from '../../../../models/UserInteraction';
import { connectMongoose } from '@/lib/db';
import { auth } from '@/auth/auth';

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const isMockDb =
    process.env.NEXT_PUBLIC_BUILD_MODE === 'true' || process.env.CI === 'true';
  if (isMockDb) {
    return NextResponse.json({ success: true });
  }
  await connectMongoose();
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

  await UserInteraction.create({
    userId: session.user.id,
    storyId,
    type,
    value: type === 'TIME_SPENT' ? duration : 1,
  });

  return NextResponse.json({ success: true });
}
