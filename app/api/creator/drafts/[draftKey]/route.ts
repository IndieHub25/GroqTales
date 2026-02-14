import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Draft from '../../../../../models/Draft';
import { VALIDATION_PATTERNS } from '@/lib/constants';

export async function GET(
  request: NextRequest,
  { params }: { params: { draftKey: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = (searchParams.get('wallet') || '').trim().toLowerCase();
    const draftKey = (params.draftKey || '').trim();

    if (!wallet || !VALIDATION_PATTERNS.walletAddress.test(wallet)) {
      return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 });
    }
    if (!draftKey) {
      return NextResponse.json({ error: 'draftKey is required' }, { status: 400 });
    }

    await dbConnect();

    const draft = await Draft.findOne({ draftKey, ownerWallet: wallet }).lean();
    if (!draft) {
      return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
    }

    const currentUpdatedAt = draft.current?.updatedAt
      ? new Date(draft.current.updatedAt).getTime()
      : Date.now();

    return NextResponse.json({
      draftKey: draft.draftKey,
      storyType: draft.storyType,
      storyFormat: draft.storyFormat,
      ownerWallet: draft.ownerWallet,
      ownerRole: draft.ownerRole,
      current: {
        title: draft.current?.title || '',
        description: draft.current?.description || '',
        genre: draft.current?.genre || '',
        content: draft.current?.content || '',
        coverImageName: draft.current?.coverImageName || '',
        updatedAt: currentUpdatedAt,
        version: draft.current?.version || 1,
      },
      versions: (draft.versions || []).map((version: any) => ({
        id: version._id?.toString?.() || '',
        title: version.title || '',
        description: version.description || '',
        genre: version.genre || '',
        content: version.content || '',
        coverImageName: version.coverImageName || '',
        updatedAt: version.updatedAt ? new Date(version.updatedAt).getTime() : Date.now(),
        version: version.version || 1,
        reason: version.reason || 'autosave',
      })),
      aiMetadata: {
        pipelineState: draft.aiMetadata?.pipelineState || 'idle',
        suggestedEdits: draft.aiMetadata?.suggestedEdits || [],
        lastEditedByAIAt: draft.aiMetadata?.lastEditedByAIAt
          ? new Date(draft.aiMetadata.lastEditedByAIAt).getTime()
          : null,
      },
      createdAt: draft.createdAt ? new Date(draft.createdAt).getTime() : null,
      updatedAt: draft.updatedAt ? new Date(draft.updatedAt).getTime() : null,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

