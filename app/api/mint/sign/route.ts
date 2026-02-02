import { NextRequest, NextResponse } from 'next/server';
import { mintRequestSchema } from '@/lib/schemas';
import { ethers } from 'ethers'; 
import z from 'zod';

const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY!; 

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userWallet, storyId } = mintRequestSchema.parse(body);

    const isMintable = true; // Need to cross-check DB lookup
    if (!isMintable) {
      return NextResponse.json({ error: "Story already minted or not eligible" }, { status: 403 });
    }

    const wallet = new ethers.Wallet(ADMIN_PRIVATE_KEY);
    
    const messageHash = ethers.solidityPackedKeccak256(
      ["address", "string"], 
      [userWallet, storyId]
    );
    
    const signature = await wallet.signMessage(ethers.getBytes(messageHash));

    return NextResponse.json({ 
      signature, 
      userWallet, 
      storyId 
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: "Mint signing failed" }, { status: 500 });
  }
}