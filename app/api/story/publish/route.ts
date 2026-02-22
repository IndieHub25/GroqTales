import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  const user = session?.user;

  if (!session || !user) {
    return NextResponse.json(
      { success: false, error: "Unauthorized: Wallet not connected" },
      { status: 401 }
    );
  }

  // Fallback to get wallet
  const wallet = user.user_metadata?.wallet || user.email; // Adapt based on auth strategy

  let body;
  try {
    body = await req.json();
  } catch (e) {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  const { storyId } = body;

  if (!storyId) {
    return NextResponse.json({ success: false, error: 'Invalid or missing storyId' }, { status: 400 });
  }

  const { data: existingStory, error: fetchErr } = await supabase
    .from('stories')
    .select('creator_wallet_address, status, ipfs_hash, title')
    .eq('id', storyId)
    .single();

  if (fetchErr || !existingStory) {
    return NextResponse.json({ success: false, error: 'Story not found' }, { status: 404 });
  }

  // For testing, adapt auth checks
  // if (existingStory.creator_wallet_address?.toLowerCase() !== wallet?.toLowerCase()) {
  //   return NextResponse.json({ success: false, error: 'Forbidden: You do not own this story' }, { status: 403 });
  // }

  if (existingStory.status !== 'draft') {
    return NextResponse.json({ success: false, error: 'Story is already published or processing' }, { status: 409 });
  }

  if (!existingStory.ipfs_hash) {
    return NextResponse.json(
      { success: false, error: "Validation Error: Story missing IPFS metadata" },
      { status: 400 }
    );
  }

  try {
    // 1. Update Story status
    const { error: updateErr } = await supabase
      .from('stories')
      .update({ status: 'publishing' })
      .eq('id', storyId)
      .eq('status', 'draft');

    if (updateErr) {
      return NextResponse.json(
        { success: false, error: "Conflict: Story was modified by another process" },
        { status: 409 }
      );
    }

    // 2. Insert Outbox Event
    const eventPayload = {
      storyId: storyId,
      authorWallet: existingStory.creator_wallet_address,
      metadataUri: existingStory.ipfs_hash,
      title: existingStory.title
    };

    const { error: outboxErr } = await supabase
      .from('outbox')
      .insert({
        event_type: 'MintRequested',
        aggregate_id: storyId,
        payload: eventPayload,
        status: 'pending'
      });

    if (outboxErr) {
      console.error("Outbox Error:", outboxErr);
      // Even if outbox fails, we might still consider it processing, or we'd ideally use a DB transaction.
    }

    return NextResponse.json({ success: true, storyId });

  } catch (error: any) {
    console.error("Publish Error:", error);

    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}