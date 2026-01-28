import dbConnect from '@/lib/dbConnect';
import Outbox from '../models/Outbox';
import MintIntent from '../models/MintIntent';
import Story from '../models/Story';
import { mintNFT, checkTxStatus } from '@/lib/blockchain';

const MAX_RETRIES = 20;

async function processOutbox() {
  await dbConnect();
  
  let event;
  try {
    event = await Outbox.findOneAndUpdate(
      { status: 'pending' },
      { 
        status: 'processing', 
        processedAt: new Date() 
      },
      { sort: { createdAt: 1 }, new: true }
    );
  } catch (err) {
    console.error("❌ Fatal: Failed to fetch from Outbox", err);
    return;
  }

  if (!event) return;

  try {
    if (event.eventType === 'MintRequested') {
      await handleMintSaga(event);
    } else {
      console.warn(`⚠️ Unknown event type: ${event.eventType}`);
    }
    
    await Outbox.updateOne({ _id: event._id }, { status: 'completed' });
  
  } catch (err: any) {
    const errorMsg = err?.message || 'Unknown error';
    const isPendingTx = errorMsg.includes('Transaction still pending');

    console.log(
      isPendingTx ? `⏳ [${event._id}] Waiting for tx...` : `❌ [${event._id}] Error: ${errorMsg}`
    );
    
    const currentAttempts = event.attempts || 0;
    
    const nextAttempts = isPendingTx ? currentAttempts : currentAttempts + 1;
    
    const status = (nextAttempts >= MAX_RETRIES && !isPendingTx) ? 'failed' : 'pending';
    
    await Outbox.updateOne({ _id: event._id }, { 
      status, 
      attempts: nextAttempts, 
      lastError: errorMsg.substring(0, 500)
    });
  }
}

async function handleMintSaga(event: any) {
  const { storyId, authorWallet, metadataUri } = event.payload;
  const intentId = `mint_${storyId}`;

  let intent = await MintIntent.findOne({ intentId });
  if (!intent) {
    intent = await MintIntent.create({
      intentId,
      storyId,
      status: 'pending'
    });
  }

  if (intent.status === 'pending') {
    console.log(`[Saga] Submitting mint for Story ${storyId}...`);
    const txHash = await mintNFT(authorWallet, metadataUri);
    
    intent.txHash = txHash;
    intent.status = 'submitted';
    await intent.save();
  }

  if (intent.status === 'submitted') {
    if (!intent.txHash) throw new Error("Missing txHash in submitted state");

    const receipt = await checkTxStatus(intent.txHash);
    
    if (receipt.status === 'confirmed') {
      console.log(`✅ [Saga] Mint Confirmed! Token ID: ${receipt.tokenId}`);
      
      intent.status = 'confirmed';
      intent.tokenId = receipt.tokenId;
      await intent.save();

      await Story.updateOne(
        { _id: storyId },
        { 
          status: 'minted', 
          nftTokenId: intent.tokenId,
          nftTxHash: intent.txHash 
        }
      );
    } 
    else if (receipt.status === 'reverted') {
      intent.status = 'failed';
      await intent.save();
      
      await Story.updateOne({ _id: storyId }, { status: 'failed' });
      
      throw new Error('Transaction reverted on-chain');
    } 
    else {
      throw new Error(`Transaction still pending (Block: ${receipt.blockNumber || 'mempool'})`);
    }
  }
}

async function runWorker() {
  console.log("🚀 Mint Worker Started");
  while (true) {
    try {
      await processOutbox();
    } catch (err) {
      console.error('🔥 Worker loop fatal error:', err);
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
}

runWorker();