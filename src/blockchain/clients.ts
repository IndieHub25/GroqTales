import { createWalletClient, createPublicClient, custom, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { optimism } from 'viem/chains';

export const publicClient = createPublicClient({
  chain: optimism,
  transport: http(),
});

// Check if window.ethereum is available before creating wallet client
export const walletClient =
  typeof window !== 'undefined' && window.ethereum
    ? createWalletClient({
        chain: optimism,
        transport: custom(window.ethereum),
      })
    : null;

// JSON-RPC Account
export const getAccount = async () => {
  if (walletClient) {
    const [account] = await walletClient.getAddresses();
    return account;
  }
  return null;
};

// Local Account (placeholder for private key)
// Use environment variable for security. Do NOT hardcode the private key here.
// Example: const privateKey = process.env.NEXT_PUBLIC_PRIVATE_KEY;
// if (privateKey) export const account = privateKeyToAccount(privateKey as `0x${string}`);
