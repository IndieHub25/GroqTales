<p align="center">
  <img src="https://www.groqtales.xyz/groq_tales_logo.png" alt="GroqTales Logo" width="150" />
</p>

# Minting NFTs with GroqTales 🖼️

<div align="center">
  <img src="../../public/GroqTales.png" alt="GroqTales Logo" width="300" />
</div>

Welcome to the exciting world of digital ownership with **GroqTales**! Our platform allows you to
transform your AI-generated stories into unique digital collectibles by minting them as Non-Fungible
Tokens (NFTs) on the Monad blockchain. This guide provides a comprehensive walkthrough of the NFT
minting process, ensuring you can establish ownership and authenticity for your creative works in
the digital realm.

---

## 📋 Overview

Minting an NFT on GroqTales turns your story into a blockchain-based asset, creating a permanent
record of ownership and enabling potential trading or showcasing. This process leverages the Monad
blockchain for security and transparency. Whether you're new to NFTs or an experienced creator, this
guide covers everything from prerequisites to troubleshooting, helping you navigate the journey of
digital storytelling ownership.

---

## 🌟 Table of Contents

- [What Are NFTs?](#what-are-nfts)
- [Prerequisites for Minting](#prerequisites-for-minting)
- [Generating a Story for Minting](#generating-a-story-for-minting)
- [Minting Your Story as an NFT](#minting-your-story-as-an-nft)
- [Viewing and Managing Your NFTs](#viewing-and-managing-your-nfts)
- [Understanding Transaction Fees](#understanding-transaction-fees)
- [Troubleshooting Minting Issues](#troubleshooting-minting-issues)
- [Next Steps](#next-steps)

---

## 🖌️ What Are NFTs?

**Non-Fungible Tokens (NFTs)** are unique digital assets stored on a blockchain, which serves as a
decentralized ledger. Unlike cryptocurrencies like Bitcoin or Ethereum, which are interchangeable,
NFTs are one-of-a-kind and cannot be exchanged on a one-to-one basis due to their distinct
properties. In the context of GroqTales, minting your story as an NFT means creating a digital
certificate of ownership for your unique content. This allows you to:

- **Prove Authenticity**: Each NFT is linked to metadata (like your story's content and title)
  stored on decentralized systems like IPFS, ensuring the asset's origin and uniqueness.
- **Establish Ownership**: The blockchain records your wallet address as the owner, providing an
  immutable proof of possession.
- **Showcase and Trade**: Display your NFT in galleries or, in the future, trade or sell it on
  compatible marketplaces, opening monetization opportunities.

NFTs on GroqTales are built on the Monad blockchain, currently using the Testnet for development,
with plans for Mainnet deployment to handle real-value transactions.

**Why Mint NFTs?**: Beyond ownership, NFTs add value to digital creations by making them
collectible, shareable in a verified form, and potentially profitable, revolutionizing how creators
interact with their audience in the digital space.

---

## 📋 Prerequisites for Minting

Before you can mint an NFT on GroqTales, ensure you meet the following requirements to avoid
interruptions during the process:

1. **Connected Wallet**: You must have a cryptocurrency wallet linked to your GroqTales account.
   Supported wallets include MetaMask, WalletConnect, and Ledger. This wallet interacts with the
   Monad blockchain to record ownership and process transactions. If not connected, follow the steps
   in [Managing Your Account](../Managing-Your-Account.md#connecting-a-wallet).
2. **Monad Network**: Ensure your wallet is set to the **Monad Testnet** (Chain ID: 10143, RPC URL:
   `https://testnet-rpc.monad.xyz`) for development purposes, or Mainnet when it becomes available.
   GroqTales will prompt you to switch networks if necessary, or you can configure it manually in
   your wallet settings.
3. **Sufficient Funds**: Minting an NFT requires a small transaction fee (gas fee) to cover
   blockchain processing costs:
   - On **Testnet**, fees are paid with test tokens, which are free and can be obtained from a Monad
     Testnet faucet (details to be provided when available, check
     [GitHub Discussions](https://github.com/Drago-03/GroqTales/discussions)).
   - On **Mainnet** (future), fees will be in real Monad tokens, typically a fraction of a cent to a
     few cents, depending on network demand. Ensure your wallet has enough tokens for the
     transaction.
4. **Generated Story**: You need an AI-generated story ready to mint. If you haven't created one,
   follow the [Creating Stories](Creating-Stories.md) guide to generate content using the AI Story
   Generator.

**Note**: Meeting these prerequisites ensures a smooth minting experience. If any are missing,
you'll encounter errors or be unable to proceed with minting.

---

## 📖 Generating a Story for Minting

Minting starts with a story, and GroqTales makes it easy to create content worthy of becoming a
digital asset. Follow these steps to prepare your story for minting:

1. **Access AI Story Generator**: Navigate to the "Create" section from the GroqTales homepage and
   select "AI Story Generator" as detailed in the
   [Creating Stories](Creating-Stories.md#accessing-the-ai-story-generator) guide. This is where
   you'll craft your narrative.
2. **Set Story Parameters**: Fill out the basic fields to define your story's foundation:
   - **Story Title (Optional)**: Give your story a name for identity (e.g., "The Cosmic Voyage").
   - **Story Type**: Choose "Text Story" for prose or "Comic" for panel-based narratives.
   - **Genres**: Select genres (e.g., Science Fiction, Adventure) to shape the theme.
   - **Story Overview**: Provide a brief concept (e.g., "An explorer discovers a hidden galaxy.").
3. **Customize for Depth (Optional)**: Expand the "Story Outline" section to add details like
   characters, setting, plot, and themes for a richer narrative. Detailed inputs ensure the story
   aligns with your vision, especially important since NFTs are permanent once minted. See
   [Creating Stories](Creating-Stories.md#customizing-your-story).
4. **Generate and Review**: Click "Generate Story" to create your content. Review the output
   carefully in the display area to ensure it meets your expectations. Edit or regenerate if needed
   to perfect it before minting (see
   [Creating Stories](Creating-Stories.md#editing-and-regenerating)).
5. **Prepare for Minting**: Once satisfied, switch to the "Mint as NFT" tab in the story generator
   interface to proceed with the blockchain process. Ensure the story preview reflects the final
   version you want to mint.

**Tip**: Since blockchain transactions are irreversible, take extra time to review your story's
content, title, and metadata (if editable) before moving to minting. A polished story enhances its
value as an NFT.

---

## 🖼️ Minting Your Story as an NFT

With your story ready and prerequisites met, follow these detailed steps to mint your story as an
NFT on the Monad blockchain, establishing it as a unique digital asset:

1. **Verify Wallet Connection**: Ensure your cryptocurrency wallet (e.g., MetaMask, WalletConnect)
   is connected to GroqTales and visible in the interface (usually in the header showing your
   address or a connected status). If not connected, click "Connect Wallet" and follow the prompts
   to link it (see [Managing Your Account](../Managing-Your-Account.md#connecting-a-wallet)).
2. **Confirm Network Setting**: Check that your wallet is set to the **Monad Testnet** (Chain ID:
   10143). If on a different network (e.g., Ethereum Mainnet), GroqTales will prompt you to switch.
   Approve the network switch in your wallet, or manually configure it with:
   - **Chain ID**: 10143
   - **RPC URL**: <https://testnet-rpc.monad.xyz>
   - **Currency Symbol**: MONAD
3. **Access Minting Interface**: In the AI Story Generator, after generating your story, switch to
   the "Mint as NFT" tab or click a "Mint as NFT" button if available. You'll see a preview of your
   story, including title, genre, and a snippet of content.
4. **Review Story Preview**: Carefully review the story details in the preview pane to confirm this
   is the exact content you wish to mint. Blockchain transactions are permanent, so ensure the
   title, content, and any metadata (if shown) are correct. If adjustments are needed, go back to
   edit or regenerate the story.
5. **Initiate Minting Process**: Click the "Mint as NFT" button to start the minting process. This
   triggers a confirmation dialog from your wallet, asking you to approve the transaction.
6. **Confirm Transaction in Wallet**: In your wallet (e.g., MetaMask), review the transaction
   details, including:
   - **Gas Fee**: A small fee for blockchain processing (minimal on Testnet with test tokens, real
     Monad tokens on Mainnet in the future).
   - **Contract Interaction**: Ensure it's interacting with a GroqTales contract (verify the address
     if familiar). Approve the transaction by clicking "Confirm" or equivalent in your wallet.
     Ensure you have sufficient test tokens for Testnet fees (request from a faucet if
     needed—details in [GitHub Discussions](https://github.com/Drago-03/GroqTales/discussions)).
7. **Wait for Processing**: After confirming, the transaction will be processed on the Monad
   blockchain. This typically takes a few seconds to a minute, depending on network congestion. A
   loading indicator or status message may appear in GroqTales during this time.
8. **Receive Confirmation**: Once the transaction is successful, GroqTales will display a
   confirmation notification with:
   - **Token ID**: A unique identifier for your NFT on the blockchain.
   - **Transaction Hash**: A record of the transaction (viewable on a blockchain explorer if
     available for Monad Testnet).
   - **Link to View NFT**: A link to see your minted NFT in the NFT Gallery or directly on the
     blockchain explorer.

**Note**: If the transaction fails, check for error messages in your wallet (e.g., "insufficient
funds" or "network error") and refer to the [Troubleshooting](#troubleshooting-minting-issues)
section below. Ensure your wallet is properly funded and on the correct network before retrying.

---

## 🗄️ Viewing and Managing Your NFTs

After minting, your NFT becomes a part of your digital collection on GroqTales and the Monad
blockchain. Here's how to view and manage your minted assets:

- **NFT Gallery**: Access your minted NFTs by navigating to the "NFT Gallery" section from the
  GroqTales homepage or navigation menu. This gallery displays all NFTs you've created or own,
  showcasing their titles, previews, and token IDs.
- **Profile Section**: Your minted NFTs will also appear in your user profile under a dedicated tab
  like "My NFTs" or "Created." This personal space lets you see your collection at a glance.
- **Blockchain Explorer (Advanced)**: For tech-savvy users, view detailed transaction and ownership
  information on the Monad blockchain explorer (URL to be provided when available for
  Testnet/Mainnet). Use the transaction hash or token ID from the minting confirmation to track your
  NFT on-chain.
- **Trading or Selling (Future Feature)**: While GroqTales currently focuses on minting and
  displaying NFTs within the platform, future updates may include marketplace features for trading
  or selling. For now, you can list your NFTs on external Monad-compatible NFT marketplaces if
  supported. Stay tuned for announcements in
  [GitHub Discussions](https://github.com/Drago-03/GroqTales/discussions).
- **Sharing Your NFT**: Share your NFT with others by copying the link from the NFT Gallery or your
  profile. This allows friends or collectors to view your digital story asset, increasing its
  visibility.

**Tip**: Keep track of your token IDs and transaction hashes (noted during minting) in a secure
place. These are essential for verifying ownership or resolving disputes if needed. Use your profile
or gallery to showcase your collection and engage with the community.

---

## 💰 Understanding Transaction Fees

Minting an NFT involves a small transaction fee, often called a "gas fee," to compensate for the
computational resources used by the blockchain network to process and record your transaction.
Here's a breakdown of these costs on GroqTales:

- **Testnet Fees (Current)**: On the Monad Testnet, used for development and testing, gas fees are
  paid with **test tokens**. These tokens have no real-world value and are free to obtain:
  - **How to Get Test Tokens**: Request test tokens from a Monad Testnet faucet (URL to be provided
    when available, check [GitHub Discussions](https://github.com/Drago-03/GroqTales/discussions)
    for updates). Add them to your wallet to cover minting fees.
  - **Cost**: Effectively free, as test tokens are for experimental purposes.
- **Mainnet Fees (Future)**: Once Monad Mainnet is live for production use, fees will be paid in
  real **Monad tokens**:
  - **Cost Estimate**: Typically a fraction of a cent to a few cents per transaction, varying based
    on network demand and congestion. Fees are generally low on Monad due to its high-performance
    design.
  - **Payment**: Ensure your wallet holds enough Monad tokens to cover these fees when Mainnet
    launches.
- **GroqTales Service Fees**: Currently, GroqTales does not charge additional fees for minting
  beyond the blockchain gas costs. However, stay updated via platform announcements or the
  [Terms of Service](../TERMS_OF_SERVICE.md) for any changes, especially regarding premium features
  or marketplace transactions in the future.

**Note**: Always check your wallet's transaction confirmation dialog for the exact gas fee before
approving a minting transaction. On Testnet, if you lack test tokens, minting will fail with an
"insufficient funds" error—obtain more tokens from a faucet to proceed.

---

## 🛠️ Troubleshooting Minting Issues

Encountering problems while minting your NFT? Don't worry—here are solutions to common issues to
help you complete the process successfully:

- **Wallet Not Connected Error**: If you see a "Wallet Not Connected" message or the minting button
  is disabled, click "Connect Wallet" in the GroqTales interface (usually in the header or minting
  tab). Follow the prompts to link your MetaMask, WalletConnect, or other supported wallet. Ensure
  the wallet is unlocked and permissions are granted. See
  [Managing Your Account](../Managing-Your-Account.md#connecting-a-wallet).
- **Wrong Network Detected**: If your wallet is on a different network (e.g., Ethereum Mainnet
  instead of Monad Testnet), GroqTales will prompt you to switch. Approve the switch in your wallet.
  If it fails, manually add the Monad Testnet in your wallet settings:
  - **Chain ID**: 10143
  - **RPC URL**: <https://testnet-rpc.monad.xyz>
  - **Currency Symbol**: MONAD Refer to
    [Managing Your Account](../Managing-Your-Account.md#switching-networks) for detailed steps.
- **Insufficient Funds for Fees**: Minting requires a small gas fee. On Testnet, ensure your wallet
  has test tokens:
  - Request test tokens from a Monad Testnet faucet (URL to be provided when available, check
    [GitHub Discussions](https://github.com/Drago-03/GroqTales/discussions)).
  - If on Mainnet (future), ensure you have real Monad tokens for fees. Check your wallet balance
    before minting.
- **Transaction Failed or Reverted**: If the transaction fails, review the error message in your
  wallet:
  - **Insufficient Funds**: See above for obtaining tokens.
  - **Transaction Underpriced**: Retry with a higher gas limit or price (adjust in wallet settings
    if possible).
  - **Network Error**: Check your internet connection and Monad network status. Wait for congestion
    to clear and retry.
  - **Contract Reverted**: This may indicate an issue with the story data or contract. Ensure your
    story is generated and complete before minting. Contact support via
    [GitHub Discussions](https://github.com/Drago-03/GroqTales/discussions) if persistent.
- **Minting Button Disabled**: If the "Mint as NFT" button is inactive, ensure you've generated a
  story (content must be present) and your wallet is connected. Complete these steps first, as
  minting won't proceed without them.
- **Slow Transaction Processing**: Blockchain transactions can take longer during high network
  demand. Wait for confirmation (up to a few minutes). If stuck, check the transaction status in
  your wallet or on a blockchain explorer using the transaction hash (if available for Monad
  Testnet).

**Tip**: Always note down the transaction hash during minting for tracking purposes. If issues
persist beyond these solutions, reach out to the community via
[GitHub Discussions](https://github.com/Drago-03/GroqTales/discussions) or check the
[FAQ](../FAQ.md) for additional help.

---

## 🚀 Next Steps

Congratulations on minting your first NFT with GroqTales! You've taken a significant step into the
world of digital storytelling and ownership. Explore these resources to deepen your experience and
expand your creative horizons:

- **Master Story Creation**: Enhance your storytelling skills with advanced techniques in
  [Creating Stories](../Creating-Stories.md).
- **Manage Your Assets**: Learn about account settings and wallet management for seamless
  interactions in [Managing Your Account](../Managing-Your-Account.md).
- **Join the Community**: Connect with other creators for inspiration and collaboration via
  [GitHub Discussions](https://github.com/Drago-03/GroqTales/discussions).
- **Return to Home**: Go back to the [Home](../Home.md) page for a complete overview of all wiki
  resources.

---

_Navigate the wiki using the sidebar on the right, or return to the top for quick access to key
sections._

---

[Back to Top](#minting-nfts-with-groqtales-️)
