import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth'; 
import { authOptions } from '@/lib/auth';
import Story from '../../../../models/Story';
import Outbox from '../../../../models/Outbox';
import dbConnect from '@/lib/dbConnect';

interface CustomUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  wallet?: string;
}

export async function POST(req: Request) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  const user = session?.user as CustomUser;

  if (!session || !user || !user.wallet) {
    return NextResponse.json(
      { success: false, error: "Unauthorized: Wallet not connected" }, 
      { status: 401 }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch (e) {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  const { storyId } = body;

  if (!storyId || !mongoose.Types.ObjectId.isValid(storyId)) {
    return NextResponse.json({ success: false, error: 'Invalid or missing storyId' }, { status: 400 });
  }

  const existingStory = await Story.findById(storyId).select('authorWallet status');
  
  if (!existingStory) {
    return NextResponse.json({ success: false, error: 'Story not found' }, { status: 404 });
  }
  
  if (existingStory.authorWallet.toLowerCase() !== user.wallet.toLowerCase()) {
    return NextResponse.json({ success: false, error: 'Forbidden: You do not own this story' }, { status: 403 });
  }

  if (existingStory.status !== 'draft') {
    return NextResponse.json({ success: false, error: 'Story is already published or processing' }, { status: 409 });
  }

  const mongoSession = await mongoose.startSession();
  
  try {
    mongoSession.startTransaction();

    const story = await Story.findOneAndUpdate(
      { 
        _id: storyId, 
        status: 'draft', 
        authorWallet: user.wallet.toLowerCase()
      },
      { status: 'publishing' },
      { session: mongoSession, new: true }
    );

    if (!story) {
      await mongoSession.abortTransaction();
      return NextResponse.json(
        { success: false, error: "Conflict: Story was modified by another process" }, 
        { status: 409 }
      );
    }

    if (!story.ipfsHash) {
      await mongoSession.abortTransaction();
      return NextResponse.json(
        { success: false, error: "Validation Error: Story missing IPFS metadata" }, 
        { status: 400 }
      );
    }

    const eventPayload = {
      storyId: story._id,
      authorWallet: story.authorWallet,
      metadataUri: story.ipfsHash,
      title: story.title
    };

    await Outbox.create([{
      eventType: 'MintRequested',
      aggregateId: story._id,
      payload: eventPayload,
      status: 'pending'
    }], { session: mongoSession });

    await mongoSession.commitTransaction();
    
    return NextResponse.json({ success: true, storyId });

  } catch (error: any) {
    if (mongoSession.inTransaction()) {
        await mongoSession.abortTransaction();
    }
    console.error("Publish Transaction Error:", error);
    
    return NextResponse.json(
      { success: false, error: "Internal Server Error" }, 
      { status: 500 }
    );
  } finally {
    mongoSession.endSession();
  }
}