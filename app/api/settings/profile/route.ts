import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongoose';
import { User } from '../../../../models/User';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();

    const user = await User.findOne({ email: session.user?.email } as any)
      .select('-password')
      .lean();

    if (!user)
      return NextResponse.json({ error: 'User not found' }, { status: 404 });

    return NextResponse.json(user);
  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { username, displayName, bio, primaryGenre } = body;

    if (bio && bio.length > 500) {
      return NextResponse.json(
        { error: 'Bio exceeds 500 characters' },
        { status: 400 }
      );
    }

    await connectDB();

    if (username) {
      const existingUser = await User.findOne({
        username,
        email: { $ne: session.user?.email },
      } as any);

      if (existingUser)
        return NextResponse.json({ error: 'Username taken' }, { status: 409 });
    }

    const updateData: any = {};
    if (username !== undefined) updateData.username = username;
    if (displayName !== undefined) updateData.displayName = displayName;
    if (bio !== undefined) updateData.bio = bio;
    if (primaryGenre !== undefined) updateData.primaryGenre = primaryGenre;

    const updatedUser = await User.findOneAndUpdate(
      { email: session.user?.email } as any,
      updateData,
      { new: true } as any
    ).select('-password');

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
