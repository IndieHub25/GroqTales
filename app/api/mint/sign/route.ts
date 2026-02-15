import { NextRequest, NextResponse } from 'next/server';
import { mintRequestSchema } from '@/lib/schemas';
import { ethers } from 'ethers';
import { headers } from 'next/headers';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY;

function logAudit(event: string, status: 'SUCCESS' | 'FAILURE', details: Record<string, any>) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    event,
    status,
    ...details
  }));
}

export async function POST(req: NextRequest) {
  const headerStore = await headers();
  const ip = headerStore.get("x-forwarded-for") ?? "unknown";

  try {
    if (!ADMIN_PRIVATE_KEY || !ADMIN_PRIVATE_KEY.startsWith("0x") || ADMIN_PRIVATE_KEY.length !== 66) {
      console.error("CRITICAL: Server Key Misconfiguration");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      logAudit('MINT_SIGNATURE_REQUEST', 'FAILURE', { reason: "No active session", ip });
      return NextResponse.json({ error: "Unauthorized: Please sign in" }, { status: 401 });
    }

    let body;
    try { body = await req.json(); } catch (e) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parseResult = mintRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ error: parseResult.error.flatten() }, { status: 400 });
    }

    const { userWallet, storyId } = parseResult.data;
 
    const user = await prisma.user.findUnique({
      where: { id: (session.user as any).id },
      select: { walletAddress: true }
    });

    if (!user?.walletAddress) {
      return NextResponse.json({ error: "No wallet linked to your account" }, { status: 403 });
    }

    if (user.walletAddress.toLowerCase() !== userWallet.toLowerCase()) {
      logAudit('MINT_SIGNATURE_REQUEST', 'FAILURE', { 
        reason: "Identity Mismatch", 
        sessionWallet: user.walletAddress,
        requestedWallet: userWallet,
        ip 
      });
      return NextResponse.json({ error: "Forbidden: Wallet address does not match session" }, { status: 403 });
    }

    const story = await prisma.story.findUnique({
      where: { id: storyId },
      select: { id: true, isMinted: true, authorWallet: true, signature: true }
    });

    if (!story) {
      logAudit('MINT_SIGNATURE_REQUEST', 'FAILURE', { reason: "Story not found", storyId, userWallet, ip });
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    if (story.isMinted || story.signature) {
      logAudit('MINT_SIGNATURE_REQUEST', 'FAILURE', { reason: "Already minted or signature issued", storyId, userWallet, ip });
      return NextResponse.json({ error: "Story already minted or signature pending" }, { status: 403 });
    }

    if (!story.authorWallet) {
      logAudit('MINT_SIGNATURE_REQUEST', 'FAILURE', { reason: "No author wallet on story", storyId, userWallet, ip });
      return NextResponse.json({ error: "Story has no linked author wallet" }, { status: 403 });
    }

    if (story.authorWallet.toLowerCase() !== userWallet.toLowerCase()) {
      logAudit('MINT_SIGNATURE_REQUEST', 'FAILURE', { reason: "Not the author", storyId, userWallet, ip });
      return NextResponse.json({ error: "Forbidden: You are not the author of this story" }, { status: 403 });
    }

    const wallet = new ethers.Wallet(ADMIN_PRIVATE_KEY);
    const messageHash = ethers.solidityPackedKeccak256(
      ["address", "string"], 
      [userWallet, storyId]
    );
    const signature = await wallet.signMessage(ethers.getBytes(messageHash));

    logAudit('MINT_SIGNATURE_GENERATED', 'SUCCESS', { userWallet, storyId, ip });
    
    return NextResponse.json({ signature, userWallet, storyId });

  } catch (error) {
    console.error("Mint Signing Error:", error);
    logAudit('MINT_SIGNATURE_REQUEST', 'FAILURE', { reason: "Critical Exception", ip });
    return NextResponse.json({ error: "Internal processing failed" }, { status: 500 });
  }
}