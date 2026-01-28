import { ethers } from 'ethers';

const RPC_URL = process.env.MONAD_RPC_URL;
const PRIVATE_KEY = process.env.MINT_AUTHORITY_PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDR;

if (!RPC_URL || !PRIVATE_KEY || !CONTRACT_ADDRESS) {
  console.warn("⚠️ Blockchain config missing. Worker will fail if blockchain ops are attempted.");
}

const CONTRACT_ABI = [
  "function safeMint(address to, string memory uri) public returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
];

/**
 * Initializes the wallet and contract instance with strict validation.
 * Fails fast if configuration is invalid.
 */
function getContract() {
  if (!RPC_URL) throw new Error("Blockchain Config Error: Missing 'MONAD_RPC_URL'");
  if (!PRIVATE_KEY) throw new Error("Blockchain Config Error: Missing 'MINT_AUTHORITY_PRIVATE_KEY'");
  if (!CONTRACT_ADDRESS) throw new Error("Blockchain Config Error: Missing 'NEXT_PUBLIC_CONTRACT_ADDR'");

  if (!ethers.isAddress(CONTRACT_ADDRESS)) {
    throw new Error(`Blockchain Config Error: Invalid Contract Address format '${CONTRACT_ADDRESS}'`);
  }

  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);
    
    return { contract, provider, wallet };
  } catch (error: any) {
    throw new Error(`Blockchain Adapter Init Failed: ${error.message}`);
  }
}

/**
 * Submits a mint transaction to the Monad blockchain.
 * Returns the Transaction Hash immediately.
 */
export async function mintNFT(toAddress: string, tokenURI: string): Promise<string> {
  try {
    const { contract } = getContract();
    
    if (!ethers.isAddress(toAddress)) {
      throw new Error(`Invalid recipient address: ${toAddress}`);
    }

    console.log(`[Blockchain] Submitting mint for ${toAddress}...`);
    
    const tx = await contract.safeMint!(toAddress, tokenURI);
    
    console.log(`[Blockchain] Mint tx submitted: ${tx.hash}`);
    return tx.hash;
  } catch (error: any) {
    console.error("[Blockchain] Mint submission failed:", error);
    throw new Error(`Blockchain Error: ${error.message}`);
  }
}

/**
 * Checks the status of a submitted transaction.
 * Returns 'pending', 'confirmed', or 'reverted'.
 */
export async function checkTxStatus(txHash: string) {
  try {
    const { provider } = getContract();
    
    const receipt = await provider.getTransactionReceipt(txHash);

    if (!receipt) {
      return { status: 'pending' };
    }

    if (receipt.status === 1) {
      const iface = new ethers.Interface(CONTRACT_ABI);
      let tokenId = null;

      for (const log of receipt.logs) {
        try {
          const parsed = iface.parseLog(log);
          if (parsed && parsed.name === 'Transfer') {
            tokenId = parsed.args[2].toString();
            break;
          }
        } catch (e) {
          continue;
        }
      }

      return { 
        status: 'confirmed', 
        tokenId: tokenId, 
        blockNumber: receipt.blockNumber 
      };
    } else {
      return { status: 'reverted' };
    }
  } catch (error: any) {
    console.error(`[Blockchain] Error checking tx ${txHash}:`, error);
    throw error;
  }
}