<p align="center">
  <img src="https://www.groqtales.xyz/groq_tales_logo.png" alt="GroqTales Logo" width="150" />
</p>

# Smart Contracts on GroqTales

<div align="center">
  <img src="../../public/GroqTales.png" alt="GroqTales Logo" width="300" />
</div>

GroqTales leverages blockchain technology through smart contracts to enable the creation, ownership,
and trading of unique digital stories as Non-Fungible Tokens (NFTs) on the Monad blockchain. This
guide provides an overview of the smart contracts used in GroqTales, their functionality, and how
developers can interact with them.

**Note**: The smart contract details provided here are based on the current development stage of
GroqTales. As the platform evolves, contract addresses, ABIs, and functionalities may be updated.
Always refer to the latest repository information or official announcements for the most current
data.

## Table of Contents

- [What Are Smart Contracts?](#what-are-smart-contracts)
- [GroqTales Smart Contract Overview](#groqtales-smart-contract-overview)
- [NFT Minting Contract](#nft-minting-contract)
- [Interacting with Smart Contracts](#interacting-with-smart-contracts)
- [Contract Addresses](#contract-addresses)
- [ABI (Application Binary Interface)](#abi-application-binary-interface)
- [Security Considerations](#security-considerations)
- [Troubleshooting](#troubleshooting)
- [Next Steps](#next-steps)

## What Are Smart Contracts?

Smart contracts are self-executing programs stored on a blockchain that automatically enforce the
terms of an agreement when predefined conditions are met. In the context of GroqTales, smart
contracts handle the minting, ownership, and transfer of story NFTs, ensuring transparency and
immutability of digital assets without intermediaries.

GroqTales uses the Monad blockchain (currently Testnet, with Mainnet planned for the future) for its
smart contract operations, benefiting from its scalability and compatibility with Ethereum Virtual
Machine (EVM) standards.

## GroqTales Smart Contract Overview

The primary smart contracts in GroqTales are designed to support the following functionalities:

- **NFT Minting**: Creating unique tokens representing AI-generated stories, linked to metadata
  (title, content, author, etc.) stored on IPFS or similar decentralized storage.
- **Ownership Management**: Tracking and verifying ownership of story NFTs, allowing users to prove
  authenticity and control their digital assets.
- **Transfer and Trading**: Enabling the transfer of NFTs between users or listing them on
  marketplaces (future feature).
- **Royalty Distribution**: Potentially implementing royalty mechanisms where creators receive a
  percentage of future sales (planned feature).

These contracts adhere to standard NFT protocols like ERC-721 (for unique tokens) or ERC-1155 (for
multi-token support), ensuring compatibility with EVM-based tools and marketplaces.

## NFT Minting Contract

The core smart contract in GroqTales is the NFT Minting Contract, responsible for creating story
NFTs:

- **Functionality**:
  - **Mint**: Allows a user to create a new NFT by providing a token URI (link to metadata on IPFS)
    and associating it with their wallet address. Each minting operation generates a unique token
    ID.
  - **Metadata Storage**: Metadata (story content, title, author, etc.) is stored off-chain on IPFS
    via Pinata or similar services, with the URI linked to the NFT on-chain.
  - **Ownership**: Assigns ownership to the minter's wallet address, verifiable on the Monad
    blockchain.
- **Key Methods** (based on current implementation or planned):
  - `mintNFT(address recipient, string memory tokenURI)`: Mints a new NFT to the specified recipient
    with the provided metadata URI. Returns the token ID.
  - `ownerOf(uint256 tokenId)`: Returns the address of the owner of a specific NFT by token ID.
  - `tokenURI(uint256 tokenId)`: Retrieves the metadata URI for a given token ID.

## Interacting with Smart Contracts

Developers and advanced users can interact with GroqTales smart contracts in several ways:

1. **Through GroqTales Frontend**:
   - The easiest way to interact with the contracts is via the GroqTales web interface. When you
     click "Mint as NFT" in the AI Story Generator, the frontend handles the contract interaction,
     prompting your wallet (e.g., MetaMask) to confirm the transaction.
2. **Directly via Web3 Libraries**:
   - Use libraries like `ethers.js` or `web3.js` to call contract methods programmatically. You'll
     need the contract address and ABI (see below).
   - **Example with ethers.js**:

     ```javascript
     const { ethers } = require('ethers');
     // Connect to Monad Testnet via provider (e.g., MetaMask or custom RPC)
     const provider = new ethers.BrowserProvider(window.ethereum);
     await provider.send('eth_requestAccounts', []); // Request wallet access
     const signer = await provider.getSigner();
     // Contract details (replace with actual address and ABI)
     const contractAddress = '0xYourContractAddress';
     const contractABI = [
       /* ABI JSON here */
     ];
     const nftContract = new ethers.Contract(contractAddress, contractABI, signer);
     // Mint an NFT
     const tokenURI = 'ipfs://YourMetadataCID';
     const tx = await nftContract.mintNFT(await signer.getAddress(), tokenURI);
     const receipt = await tx.wait();
     console.log('NFT Minted, Token ID:', receipt.events[0].args.tokenId.toString());
     ```

3. **Using Blockchain Explorers**:
   - Once available, use the Monad blockchain explorer to view contract details, transactions, and
     NFT ownership by entering the contract address or transaction hash.
4. **Remix or Truffle**:
   - For development or testing, use tools like Remix IDE or Truffle Suite to deploy, test, or
     interact with GroqTales smart contracts on the Monad Testnet.

Ensure your wallet is connected to the Monad Testnet (Chain ID: 10143, RPC URL:
<https://testnet-rpc.monad.xyz>) when interacting with contracts.

## Contract Addresses

As GroqTales is in active development, specific contract addresses for the Monad Testnet are not yet
finalized or publicly deployed in the current repository. Placeholder or test addresses may be used
in local development:

- **NFT Minting Contract (Local/Test)**: Not specified in current codebase. Check the repository's
  `contracts` folder or deployment scripts for updates.
- **Production Contracts**: Will be announced and documented here once deployed to Monad Testnet or
  Mainnet.

To find the latest contract addresses:

1. Check the GroqTales GitHub repository under a `contracts` or `deployments` directory (if
   available).
2. Look for deployment logs or announcements in
   [GitHub Discussions](https://github.com/Drago-03/GroqTales/discussions).
3. For local development, deploy contracts manually using scripts or tools as outlined in
   [Development Setup](../Development-Setup.md).

## ABI (Application Binary Interface)

The ABI defines how to interact with the smart contract by specifying function signatures and
input/output formats. The ABI for GroqTales NFT contracts is not yet publicly available as contracts
are in development. A sample ABI structure for an ERC-721-like contract might look like:

```json
[
  {
    "constant": false,
    "inputs": [
      { "name": "recipient", "type": "address" },
      { "name": "tokenURI", "type": "string" }
    ],
    "name": "mintNFT",
    "outputs": [{ "name": "tokenId", "type": "uint256" }],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{ "name": "tokenId", "type": "uint256" }],
    "name": "ownerOf",
    "outputs": [{ "name": "owner", "type": "address" }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{ "name": "tokenId", "type": "uint256" }],
    "name": "tokenURI",
    "outputs": [{ "name": "uri", "type": "string" }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }
]
```

Once contracts are deployed, the full ABI will be available in the repository or via the Monad
explorer. Check the codebase or contact the development team for the latest ABI JSON files.

## Security Considerations

When interacting with smart contracts, keep the following security practices in mind:

- **Private Key Safety**: Never expose your wallet's private key or seed phrase in code or public
  forums. Use secure methods like environment variables or wallet provider integrations (e.g.,
  MetaMask) for authentication.
- **Contract Verification**: Ensure you're interacting with the official GroqTales contract
  addresses. Verify addresses through official channels to avoid phishing or scam contracts.
- **Gas Limits**: Set appropriate gas limits for transactions to prevent overpaying. Most wallets
  suggest reasonable limits, but be cautious of very high fees during network congestion.
- **Audits**: GroqTales smart contracts will undergo security audits as they near production
  deployment. Review audit reports (when available) in the repository for transparency on contract
  safety.
- **Testnet First**: Always test interactions on the Monad Testnet before engaging with Mainnet
  contracts to avoid loss of real funds due to errors.

## Troubleshooting

- **Transaction Fails**: If a minting transaction fails, check for error messages in your wallet
  (e.g., "insufficient funds" or "contract reverted"). Ensure you have enough Monad tokens for gas
  fees and are on the correct network.
- **Contract Not Found**: If you can't interact with the contract, verify the address and ensure
  it's deployed on the network you're using (Testnet vs. Mainnet). Check repository updates for the
  latest addresses.
- **ABI Mismatch**: If function calls fail with "invalid function" errors, ensure you're using the
  correct ABI version matching the deployed contract.
- **Wallet Issues**: Ensure your wallet is unlocked and has granted permission to the dApp or script
  you're using to interact with the contract.

For additional support, post questions in
[GitHub Discussions](https://github.com/Drago-03/GroqTales/discussions) or refer to the
[FAQ](../FAQ.md).

## Next Steps

- Set up a development environment to test or deploy contracts with
  [Development Setup](../Development-Setup.md).
- Explore API integrations for programmatic access in [API Documentation](../API-Documentation.md).
- Return to the [Home](../Home.md) page for more resources.

Understanding and interacting with GroqTales smart contracts opens up opportunities to build on top
of our platform, creating innovative storytelling and blockchain experiences. Stay tuned for updates
as contracts are finalized and deployed!
