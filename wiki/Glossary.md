# Glossary for GroqTales

<div align="center">
  <img src="../../public/GroqTales.png" alt="GroqTales Logo" width="300" />
</div>

This glossary provides definitions and explanations for key terms and concepts used in GroqTales, an
AI-powered Web3 storytelling platform. Understanding these terms will help you navigate the
platform, create stories, mint NFTs, and engage with the community more effectively.

## Table of Contents

- [AI and Technology Terms](#ai-and-technology-terms)
- [Web3 and Blockchain Terms](#web3-and-blockchain-terms)
- [Storytelling Terms](#storytelling-terms)
- [GroqTales-Specific Terms](#groqtales-specific-terms)
- [Next Steps](#next-steps)

## AI and Technology Terms

- **Artificial Intelligence (AI)**: The simulation of human intelligence by machines, particularly
  computer systems. In GroqTales, AI is used to generate stories based on user inputs, leveraging
  models like those from Groq to create narratives, characters, and plots automatically.
- **API (Application Programming Interface)**: A set of protocols and tools that allow different
  software applications to communicate with each other. GroqTales offers APIs for developers to
  programmatically generate stories or mint NFTs. See [API Documentation](../API-Documentation.md).
- **Creativity Level**: A setting in the AI Story Generator that adjusts how predictable or
  experimental the AI's output is. Lower values produce more structured, predictable stories, while
  higher values encourage unique, creative narratives.
- **Groq**: A provider of AI models and infrastructure used by GroqTales for high-speed story
  generation. Groq's technology powers the natural language processing behind the platform's AI
  Story Generator.
- **IPFS (InterPlanetary File System)**: A decentralized protocol for storing and sharing files.
  GroqTales uses IPFS (via services like Pinata) to store story metadata and content for NFTs,
  ensuring data persistence off-chain while linking to it on the blockchain.

## Web3 and Blockchain Terms

- **Blockchain**: A decentralized, distributed ledger technology that records transactions across
  many computers. GroqTales uses the Monad blockchain to mint and manage story NFTs, ensuring
  transparency and immutability of ownership.
- **Cryptocurrency Wallet**: A software program or physical device that stores private and public
  keys for cryptocurrency transactions. In GroqTales, wallets like MetaMask or WalletConnect are
  used to connect to the platform, authenticate users, and interact with the Monad blockchain for
  NFT minting. See [Managing Your Account](../Managing-Your-Account.md#connecting-a-wallet).
- **EVM (Ethereum Virtual Machine)**: A computation engine that executes smart contracts on
  Ethereum-compatible blockchains. Monad, used by GroqTales, is EVM-compatible, meaning tools and
  contracts designed for Ethereum can often work with Monad.
- **Gas Fee**: A transaction fee paid to compensate for the computational resources used on a
  blockchain network. When minting NFTs on GroqTales (on Monad Mainnet), users pay a small gas fee
  in Monad tokens. On Testnet, these fees use free test tokens. See
  [Minting NFTs](../Minting-NFTs.md#understanding-transaction-fees).
- **Mainnet**: The primary, production blockchain network where real transactions occur with real
  value. GroqTales plans to use Monad Mainnet for live NFT operations once available.
- **Monad Blockchain**: A high-performance, EVM-compatible blockchain designed for scalability.
  GroqTales uses Monad for NFT minting, currently on the Testnet (Chain ID: 10143) for development,
  with plans for Mainnet deployment.
- **NFT (Non-Fungible Token)**: A unique digital asset stored on a blockchain, representing
  ownership of a specific item or content. In GroqTales, stories can be minted as NFTs, proving
  authenticity and enabling trading or collecting. See [Minting NFTs](../Minting-NFTs.md).
- **Smart Contract**: A self-executing program on a blockchain that automatically enforces agreement
  terms when conditions are met. GroqTales uses smart contracts on Monad for minting and managing
  story NFTs. See [Smart Contracts](../Smart-Contracts.md).
- **Testnet**: A testing blockchain network that mimics the Mainnet but uses valueless tokens for
  experimentation. GroqTales currently operates on Monad Testnet for NFT minting, allowing users to
  test features without real financial risk.
- **Token ID**: A unique identifier for an NFT on the blockchain. Each story NFT minted on GroqTales
  has a distinct Token ID, used to track ownership and metadata.
- **Token URI**: A link (often to IPFS) stored in an NFT's smart contract that points to the
  metadata of the digital asset. In GroqTales, the Token URI connects to the story's content, title,
  and other details stored off-chain.
- **Web3**: A vision for a decentralized internet built on blockchain technology, emphasizing user
  ownership and control. GroqTales is a Web3 platform, integrating blockchain for NFT ownership and
  decentralized storage for story content.

## Storytelling Terms

- **Genre**: A category of artistic composition characterized by similarities in form, style, or
  subject matter. GroqTales supports multiple genres like Fantasy, Science Fiction, and Mystery,
  which users select to guide AI story generation. See
  [Creating Stories](../Creating-Stories.md#setting-story-parameters).
- **Motif**: A recurring theme, subject, or idea in a story. In GroqTales, users can specify motifs
  (e.g., "light versus darkness") in the story outline to shape the AI-generated narrative.
- **Narrative**: A spoken or written account of connected events; a story. GroqTales focuses on
  generating narratives through AI, structured as text stories or comic-style panel breakdowns.
- **Plot Outline**: A structured summary of a story's main events, conflicts, and resolution. Users
  can provide a plot outline in GroqTales to guide the AI in crafting a coherent story arc. See
  [Creating Stories](../Creating-Stories.md#customizing-your-story).
- **Setting**: The time and place in which a story occurs. In GroqTales, users can define the
  setting (e.g., "medieval fantasy world") to influence the AI's depiction of the story's
  environment.
- **Theme**: The central topic, subject, or message in a story. Users can input themes (e.g.,
  "courage and redemption") in GroqTales to add depth to AI-generated content.

## GroqTales-Specific Terms

- **AI Story Generator**: The core feature of GroqTales that uses AI to create stories based on user
  inputs like genre, characters, and plot. It's the primary tool for content creation on the
  platform. See [Creating Stories](../Creating-Stories.md).
- **Community Gallery**: A section of GroqTales where published stories (non-NFT) are displayed for
  other users to read and engage with. It's a place to share and discover free content.
- **Mint as NFT**: The process in GroqTales of turning an AI-generated story into a unique digital
  asset (NFT) on the Monad blockchain, establishing ownership and enabling potential trading. See
  [Minting NFTs](../Minting-NFTs.md).
- **NFT Gallery**: A dedicated area in GroqTales where users can view their minted NFTs or browse
  NFTs created by others. It showcases blockchain-based digital stories.
- **Story Outline**: A section in the AI Story Generator where users can input detailed information
  about characters, setting, plot, and themes to customize the AI-generated story. See
  [Creating Stories](../Creating-Stories.md#customizing-your-story).

## Next Steps

- Learn how to create stories with [Creating Stories](../Creating-Stories.md).
- Explore minting digital collectibles in [Minting NFTs](../Minting-NFTs.md).
- Dive into development with [Development Setup](../Development-Setup.md).
- Return to the [Home](../Home.md) page for more resources.

This glossary will be updated as GroqTales evolves with new features and terminology. If you
encounter unfamiliar terms not listed here, ask in
[GitHub Discussions](https://github.com/Drago-03/GroqTales/discussions) for clarification.
