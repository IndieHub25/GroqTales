import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Draft from '../../../../models/Draft';
import { VALIDATION_PATTERNS } from '@/lib/constants';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = (searchParams.get('wallet') || '').trim().toLowerCase();
    const query = (searchParams.get('q') || '').trim();
    const pipelineState = (searchParams.get('pipeline') || '').trim();
    const page = Math.max(1, Number.parseInt(searchParams.get('page') || '1', 10) || 1);
    const limit = Math.max(
      1,
      Math.min(50, Number.parseInt(searchParams.get('limit') || '20', 10) || 20)
    );

    if (!wallet || !VALIDATION_PATTERNS.walletAddress.test(wallet)) {
      return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 });
    }

    await dbConnect();

    const filter: Record<string, any> = { ownerWallet: wallet };

    if (pipelineState && ['idle', 'ready', 'processing'].includes(pipelineState)) {
      filter['aiMetadata.pipelineState'] = pipelineState;
    }

    if (query) {
      const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { draftKey: { $regex: escaped, $options: 'i' } },
        { 'current.title': { $regex: escaped, $options: 'i' } },
        { 'current.genre': { $regex: escaped, $options: 'i' } },
        { storyType: { $regex: escaped, $options: 'i' } },
        { storyFormat: { $regex: escaped, $options: 'i' } },
      ];
    }

    const total = await Draft.countDocuments(filter);
    const items = await Draft.find(filter)
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select({
        draftKey: 1,
        storyType: 1,
        storyFormat: 1,
        ownerWallet: 1,
        ownerRole: 1,
        current: { title: 1, genre: 1, updatedAt: 1, version: 1 },
        aiMetadata: { pipelineState: 1, lastEditedByAIAt: 1 },
        createdAt: 1,
        updatedAt: 1,
      })
      .lean();

    return NextResponse.json({
      items: items.map((item: any) => ({
        draftKey: item.draftKey,
        storyType: item.storyType,
        storyFormat: item.storyFormat,
        ownerWallet: item.ownerWallet,
        ownerRole: item.ownerRole,
        current: {
          title: item.current?.title || '',
          genre: item.current?.genre || '',
          updatedAt: item.current?.updatedAt ? new Date(item.current.updatedAt).getTime() : null,
          version: item.current?.version || 1,
        },
        aiMetadata: {
          pipelineState: item.aiMetadata?.pipelineState || 'idle',
          lastEditedByAIAt: item.aiMetadata?.lastEditedByAIAt
            ? new Date(item.aiMetadata.lastEditedByAIAt).getTime()
            : null,
        },
        createdAt: item.createdAt ? new Date(item.createdAt).getTime() : null,
        updatedAt: item.updatedAt ? new Date(item.updatedAt).getTime() : null,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

