import { NextResponse } from 'next/server';
import { UserInteraction } from '../../../../models/UserInteraction';
import { connectMongoose } from '@/lib/db';
import { auth } from '@/auth/auth';

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectMongoose();
  const { storyId, type, duration } = await req.json();

  await UserInteraction.create({
    userId: session.user.id,
    storyId,
    type,
    value: type === 'TIME_SPENT' ? duration : 1
  });

  return NextResponse.json({ success: true });
}