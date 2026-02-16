# Quick Start Guide for GroqTales 🚀

<div align="center">
  <img src="../../public/GroqTales.png" alt="GroqTales Logo" width="300" />
</div>

Welcome to **GroqTales**, the AI-powered Web3 storytelling platform! This Quick Start Guide is
designed to get you up and running in minutes, helping you create your first AI-generated story or
mint it as an NFT on the Monad blockchain. If you haven't set up GroqTales yet, please follow the
[Installation Guide](Installation.md) before proceeding.

---

## 📋 Overview

This guide provides a fast track for new users to experience the core features of GroqTales. We'll
walk you through launching the application, connecting a wallet (optional for NFTs), generating a
story with AI, and publishing or minting it. Let's dive in and unleash your creativity!

---

## 🌟 Step 1: Launch GroqTales

Ensure your local development server is running to access the GroqTales application. If it's not
already started, follow these steps:

1. **Navigate to the Project Directory**: Open your terminal or command prompt and move to the
   GroqTales folder if you're not already there:

   ```bash
   cd GroqTales
   ```

2. **Start the Development Server**: Run the command to launch the Next.js server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

   Wait for the server to start (you'll see output like `ready - started server on 0.0.0.0:3000`).

3. **Access GroqTales**: Open your web browser and go to:

   ```
   http://localhost:3000
   ```

   You should see the GroqTales homepage load, confirming the application is running.

**Note**: If the server fails to start or you can't access the URL, check the
[Troubleshooting](#-troubleshooting) section below or refer to the
[Installation Guide](Installation.md) for setup issues.

---

## 🔑 Step 2: Connect a Wallet (Optional for NFTs)

If you plan to mint your story as an NFT or publish it to the community, connecting a cryptocurrency
wallet is necessary. This step links your blockchain identity to GroqTales for secure transactions
and ownership.

1. **Install a Wallet (If Needed)**: Ensure you have a supported wallet like MetaMask installed as a
   browser extension (available for Chrome, Firefox, etc.). Download from
   [metamask.io](https://metamask.io/) if not already set up.
2. **Locate Connect Wallet Button**: On the GroqTales homepage or within any page, find the "Connect
   Wallet" button, typically in the header or story generator interface.
3. **Connect Your Wallet**: Click the button and select your wallet type (e.g., MetaMask,
   WalletConnect). Follow the prompts to approve the connection in your wallet. For WalletConnect,
   scan the QR code with a mobile wallet app if needed.
4. **Switch to Monad Network**: Ensure your wallet is set to the Monad Testnet (Chain ID: 10143, RPC
   URL: `https://testnet-rpc.monad.xyz`). GroqTales will prompt you to switch if on a different
   network; approve the switch in your wallet.
5. **Verify Connection**: Once connected, you'll see your wallet address or a connection indicator
   in the GroqTales interface, confirming successful linkage.

**Note**: Connecting a wallet is optional for basic story generation but required for publishing or
minting NFTs. If you're just exploring, you can skip this step and proceed to story creation.

---

## 📖 Step 3: Navigate to AI Story Generator

The AI Story Generator is the heart of GroqTales, where you create unique stories using artificial
intelligence.

1. **Find the Create Section**: From the homepage, look for the "Create" link or button in the
   navigation menu (usually in the header).
2. **Select AI Story Generator**: Click on "Create" and choose "AI Story Generator" from the
   options, or navigate directly if a specific link is provided. This will take you to the story
   creation interface.

**Tip**: If you're unsure where to find it, check the homepage for a prominent "Create Story" or
"Start Creating" button that leads to the generator.

---

## ✍️ Step 4: Create Your First Story

Now, let's generate your first story using the AI Story Generator. This process is intuitive and
allows for customization based on your preferences.

1. **Set Story Parameters**: In the AI Story Generator interface, fill out the basic fields to guide
   the AI:
   - **Story Title (Optional)**: Enter a title for your story, or leave it blank for the AI to
     suggest one.
   - **Story Type**: Choose between "Text Story" for a traditional narrative or "Comic" for a
     panel-by-panel graphic novel style.
   - **Genres**: Select one or more genres (e.g., Fantasy, Science Fiction) to define the story's
     style and theme.
   - **Story Overview**: Provide a brief idea or summary of the story you want (e.g., "A knight
     seeks a lost treasure in a haunted forest.").
2. **Customize (Optional)**: For a more tailored story, expand the "Story Outline" section to add
   details:
   - **Main Characters**: Describe key characters (e.g., names, traits, motivations).
   - **World & Setting**: Specify the environment or time period (e.g., "A futuristic city on
     Mars").
   - **Plot Outline**: Outline major events or conflicts.
   - **Themes & Motifs**: Add underlying messages or symbols (e.g., "Courage in the face of fear").
   - **Additional Instructions**: Include any specific requests (e.g., "Include a surprising plot
     twist").
3. **Adjust Creativity (Optional)**: Under "Advanced Options," tweak the "Creativity Level" slider
   to influence the AI's output—lower for structured stories, higher for creative and experimental
   ones.
4. **Generate Story**: Click the "Generate Story" button to let the AI craft your narrative based on
   your inputs. This process may take a few seconds to a minute, depending on complexity and server
   load.

**Tip**: Once generated, review the story in the output area. If it's not quite right, click
"Generate Story" again or tweak your inputs for a different result.

---

## 📢 Step 5: Publish or Mint as NFT

After creating your story, decide whether to share it with the community for free or mint it as a
unique digital asset (NFT) on the blockchain.

- **Publish for Free**: To make your story accessible to everyone without blockchain involvement:
  1. Ensure you're logged in or have a connected wallet (if required by the platform).
  2. Click the "Publish Story" button or navigate to the "Publish" tab if available.
  3. Confirm the publication. Your story will appear in the Community Gallery or your profile for
     others to read and engage with.

- **Mint as NFT**: To create a blockchain-based digital collectible (requires a connected wallet):
  1. Verify your wallet is connected and set to the Monad Testnet (see Step 2).
  2. Switch to the "Mint as NFT" tab in the story generator interface.
  3. Review the story preview to ensure it's the content you want to mint (blockchain transactions
     are permanent).
  4. Click "Mint as NFT" and approve the transaction in your wallet, confirming any gas fees
     (minimal on Testnet with test tokens).
  5. Wait for confirmation—once minted, you'll receive a token ID and a link to view your NFT in the
     NFT Gallery or on a blockchain explorer (if available for Monad Testnet).

**Note**: Minting may take a few seconds to a minute depending on network conditions. Ensure your
wallet has test tokens for Testnet fees (request from a faucet if needed—details in
[GitHub Discussions](https://github.com/Drago-03/GroqTales/discussions)).

---

## 🌐 Step 6: Share and Engage

Once your story is published or minted, it's time to share your creation and connect with the
GroqTales community.

1. **Access Your Story**: After publishing or minting, your story will be accessible in your profile
   under "My Stories" or "My NFTs," or in public sections like the Community Gallery or NFT Gallery.
2. **Share the Link**: Use the share option (if available) to copy a link to your story or NFT, or
   manually note the URL from the gallery page. Share it on social media, forums, or with friends to
   gain visibility.
3. **Engage with Feedback**: Check for comments or likes from other users on your story. Respond to
   feedback to build connections and improve your craft.
4. **Explore Others' Work**: Browse the Community Gallery or NFT Gallery to read and interact with
   stories from other creators, fostering a collaborative environment.

**Tip**: Engaging with the community can inspire new ideas and increase the visibility of your work.
Be active, provide constructive feedback, and participate in discussions.

---

## 💡 Tips for Success

Maximize your GroqTales experience with these practical tips:

- **Experiment with Prompts**: The more specific and creative your inputs (e.g., detailed characters
  or unique settings), the more tailored and interesting the AI's output will be. Try mixing genres
  or adding unexpected elements for variety.
- **Review Before Minting**: Since blockchain transactions are permanent, ensure your story is
  exactly how you want it before clicking "Mint as NFT." Double-check content, title, and metadata.
- **Adjust Creativity Levels**: If your story feels too generic, increase the creativity level in
  advanced options for more originality. If it's too chaotic, lower it for a structured narrative.
- **Test with Testnet First**: For NFT minting, use the Monad Testnet to practice without real
  costs. This helps you understand the process before Mainnet launches.
- **Join the Community**: Connect with other users for inspiration, collaboration, and support via
  [GitHub Discussions](https://github.com/Drago-03/GroqTales/discussions). Share your journey and
  learn from others.

---

## 🛠️ Troubleshooting

Running into issues while getting started? Here are quick fixes for common problems:

- **Server Not Running**: If you can't access `http://localhost:3000`, ensure your development
  server is active (`npm run dev`). Check for port conflicts (see
  [Installation](Installation.md#troubleshooting)) and restart if needed.
- **Wallet Connection Fails**: Verify your wallet extension (e.g., MetaMask) is installed, unlocked,
  and granted permission. Use a compatible browser (Chrome or Firefox) and disable conflicting
  extensions. See
  [Managing Your Account](../Managing-Your-Account.md#troubleshooting-account-issues).
- **Story Generation Fails**: If the AI doesn't generate content, check your internet connection and
  ensure required fields (like genre or overview) are filled. Simplify your prompt or retry. If
  using a custom API key, confirm it's valid.
- **Publishing or Minting Errors**: Ensure your wallet is connected and on the Monad Testnet (Chain
  ID: 10143). For minting, check for sufficient test tokens for fees (request from a faucet if
  needed). Review error messages in your wallet for specifics.

For persistent issues, dive into the [FAQ](../FAQ.md) or ask for help in
[GitHub Discussions](https://github.com/Drago-03/GroqTales/discussions).

---

## 🚀 Next Steps

Congratulations on creating your first story with GroqTales! You're now part of a revolutionary
storytelling community. Take your journey further with these resources:

- **Deepen Your Skills**: Explore advanced story creation techniques in
  [Creating Stories](../Creating-Stories.md).
- **Master NFT Minting**: Learn the ins and outs of blockchain integration with
  [Minting NFTs](../Minting-NFTs.md).
- **Manage Your Profile**: Understand wallet connections and settings in
  [Managing Your Account](../Managing-Your-Account.md).
- **Return to Home**: Go back to the [Home](../Home.md) page for a full overview of all wiki
  resources.

---

_Navigate the wiki using the sidebar on the right, or return to the top for quick access to key
sections._

---

[Back to Top](#quick-start-guide-for-groqtales-)
