# Installation Guide for GroqTales 🛠️

<div align="center">
  <img src="../../public/GroqTales.png" alt="GroqTales Logo" width="300" />
</div>

Welcome to the installation guide for **GroqTales**, your gateway to AI-powered Web3 storytelling!
Whether you're setting up GroqTales for personal use or local development to contribute to the
platform, this guide provides clear, step-by-step instructions to get you started quickly and
efficiently.

---

## 📋 Prerequisites

Before diving into the installation process, ensure you have the following tools and software ready
on your system. These are essential for running GroqTales smoothly:

- **Node.js** (version 16.x or higher) and **npm** (Node Package Manager) or **yarn** for managing
  project dependencies. Download and install from [nodejs.org](https://nodejs.org/) if not already
  on your system. Using `nvm` (Node Version Manager) can help manage multiple Node.js versions.
- **Git** for cloning the repository and handling version control. Install from
  [git-scm.com](https://git-scm.com/) or via your system's package manager if needed.
- **A Compatible Web Browser** (e.g., Google Chrome, Mozilla Firefox) for accessing the local
  development server. For NFT features, ensure you have a cryptocurrency wallet extension like
  MetaMask installed in your browser.

To verify you have the correct versions installed, run these commands in your terminal:

```bash
node -v  # Should output v16.x.x or higher
npm -v   # Should output a version number
yarn -v  # If using yarn, should output a version number
git --version  # Should output a version number
```

If any of these are missing or outdated, please install or update them before proceeding.

---

## 📥 Step 1: Clone the Repository

Start by downloading the GroqTales source code to your local machine using Git. This step retrieves
the latest version of the project from GitHub.

1. **Open Your Terminal or Command Prompt**: Navigate to the directory where you want to store the
   GroqTales project.
2. **Clone the Repository**: Run the following command to clone the GroqTales repository:

   ```bash
   git clone https://github.com/Drago-03/GroqTales.git
   cd GroqTales
   ```

3. **Optional - Switch to a Specific Branch**: If you're working on a specific feature or
   development branch, switch to it after cloning:

   ```bash
   git checkout dev  # Replace 'dev' with the relevant branch name if needed
   ```

---

## 🛠️ Step 2: Install Dependencies

GroqTales relies on various libraries and packages to function. Installing these dependencies is
crucial for running the application.

1. **Ensure You're in the Project Directory**: If you haven't already navigated into the `GroqTales`
   folder after cloning, do so now:

   ```bash
   cd GroqTales
   ```

2. **Install Dependencies**: Use npm or yarn to install the required packages defined in
   `package.json`:

   ```bash
   npm install
   # or
   yarn install
   ```

   This process may take a few minutes as it downloads and sets up libraries like Next.js, React,
   and Web3 tools.

**Note**: If you encounter permission errors during installation, ensure you have the necessary
rights to write to the directory. On Unix systems, you might need to use `sudo` (with caution), or
adjust folder permissions. If issues persist, try clearing your package manager's cache:

```bash
npm cache clean --force
# or
yarn cache clean
```

---

## 🔑 Step 3: Set Up Environment Variables

GroqTales uses environment variables to manage sensitive information (like API keys) and
configuration settings securely. Setting these up correctly is essential for the application to
function.

1. **Copy the Example File**: Duplicate the provided `.env.example` file to create your local
   configuration file:

   ```bash
   cp .env.example .env.local
   ```

2. **Edit the Configuration File**: Open `.env.local` in a text editor (e.g., VS Code, Notepad, or
   nano) and replace the placeholder values with your actual credentials or mock values for
   development purposes. **Never commit `.env.local` to version control** as it contains sensitive
   data.

   ```bash
   nano .env.local  # Use any text editor you prefer
   ```

   Key variables to configure include:
   - **API Keys for AI Services**: Such as `NEXT_PUBLIC_GROQ_API_KEY` for story generation.
   - **Blockchain Network Settings**: Like `MONAD_RPC_URL` for NFT minting on the Monad blockchain.
   - **WalletConnect Project ID**: `NEXT_PUBLIC_WALLET_CONECT_PROJECT_ID` for wallet integration.
   - **Build Mode**: Set `NEXT_PUBLIC_BUILD_MODE=false` for local development with real connections,
     or `true` to mock data.

   Example snippet from `.env.local` (values are placeholders):

   ```
   NEXT_PUBLIC_WALLET_CONECT_PROJECT_ID=your_wallet_connect_project_id_here
   NEXT_PUBLIC_GROQ_API_KEY=your_groq_api_key_here
   MONAD_RPC_URL=https://testnet-rpc.monad.xyz
   NEXT_PUBLIC_BUILD_MODE=false
   ```

3. **Obtaining Credentials**: If you don't have the necessary API keys or credentials, refer to the
   [Environment Variables Guide](Environment-Variables.md#obtaining-api-keys-and-credentials) for
   instructions on signing up for services like Groq, WalletConnect, or Pinata. For development,
   mock values can be used for non-critical services.

**Important**: Double-check that `.env.local` is in the project root directory and is correctly
formatted. Errors in this file can prevent the application from starting.

---

## 🚀 Step 4: Run the Development Server

With dependencies installed and environment variables set, you're ready to launch the GroqTales
application locally.

1. **Start the Development Server**: Run the following command to start the Next.js development
   environment:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

   You'll see output in your terminal indicating the server is running, typically on port 3000
   (e.g., `ready - started server on 0.0.0.0:3000`).

2. **Access GroqTales in Your Browser**: Open your preferred web browser and navigate to:

   ```
   http://localhost:3000
   ```

   You should see the GroqTales application interface load, confirming a successful setup.

3. **Hot Reloading**: The development server supports hot reloading, meaning any changes you make to
   the code will automatically refresh the application in your browser, speeding up development and
   testing.

**Note**: If port 3000 is already in use by another application, the server may start on a different
port (check the terminal output). Alternatively, stop the conflicting process or modify the port in
`package.json` scripts if needed.

---

## 🔒 Step 5: Connect a Wallet (Optional)

If you plan to test or use NFT minting features, connecting a cryptocurrency wallet is necessary.
This step allows you to interact with the Monad blockchain for creating digital assets.

1. **Install a Wallet Extension**: Ensure you have a supported wallet like MetaMask installed as a
   browser extension (available for Chrome, Firefox, etc.). If not, download it from
   [metamask.io](https://metamask.io/) and set up an account.
2. **Configure Wallet for Monad Testnet**: Set your wallet to the Monad Testnet network for
   development purposes:
   - **Chain ID**: 10143
   - **RPC URL**: <https://testnet-rpc.monad.xyz>
   - **Currency Symbol**: MONAD Add this network manually in your wallet settings if GroqTales
     doesn't prompt an automatic switch.
3. **Connect Wallet in GroqTales**: In the GroqTales application (at `http://localhost:3000`), click
   the "Connect Wallet" button (usually in the header or story generator page). Follow the prompts
   to link your wallet, approving the connection request in MetaMask or your chosen wallet.
4. **Obtain Test Tokens (If Needed)**: For testing on Monad Testnet, you may need test tokens for
   transaction fees. Request these from a Monad Testnet faucet (URL to be provided when available)
   or check [GitHub Discussions](https://github.com/Drago-03/GroqTales/discussions) for updates.

**Note**: Wallet connection is optional for basic story generation and browsing features but
required for publishing stories or minting NFTs.

---

## 🛠️ Troubleshooting

Encountering issues during installation? Here are solutions to common problems to help you get back
on track:

- **Node.js Version Issues**: If you see errors like "unsupported engine" or compatibility issues,
  ensure you're using Node.js version 16.x or higher. Use `nvm` to switch versions if needed:

  ```bash
  nvm use 16
  ```

  Download the correct version from [nodejs.org](https://nodejs.org/) if necessary.

- **Dependency Errors**: If `npm install` fails with errors, try clearing the `node_modules`
  directory and `package-lock.json` file, then reinstall:

  ```bash
  rm -rf node_modules package-lock.json
  npm install
  # or for yarn
  rm -rf node_modules yarn.lock
  yarn install
  ```

  Ensure your package manager (npm or yarn) is up to date.

- **Environment Variables Missing**: If the application fails to start with errors about missing
  environment variables, verify that `.env.local` is in the project root and all required variables
  are set. Check the terminal output for specific missing keys and refer to
  [Environment Variables](Environment-Variables.md) for guidance.
- **Port Already in Use**: If the development server won't start due to port 3000 being occupied,
  identify and stop the conflicting process:

  ```bash
  lsof -i :3000  # On Unix systems to find the process ID (PID)
  kill -9 <PID>  # Replace <PID> with the process ID
  ```

  Alternatively, start the server on a different port by modifying `package.json` or using an
  environment variable (check Next.js documentation).

- **Wallet Connection Issues**: If connecting a wallet fails, ensure the wallet extension (e.g.,
  MetaMask) is installed, unlocked, and granted permission to interact with the site. Use a
  compatible browser (Chrome or Firefox) and disable any extensions that might interfere with Web3
  connections.

If problems persist or you encounter unique issues, check the [FAQ](../FAQ.md) for additional
solutions or reach out to the community via
[GitHub Discussions](https://github.com/Drago-03/GroqTales/discussions) for support.

---

## 🚀 Next Steps

Congratulations on setting up GroqTales! Now that you have the application running locally, explore
these resources to dive deeper into using and contributing to the platform:

- **Create Your First Story**: Follow the [Quick Start Guide](Quick-Start-Guide.md) to generate your
  first AI-powered story or NFT in just a few steps.
- **Advanced Usage**: Learn more about crafting detailed narratives in
  [Creating Stories](Creating-Stories.md) or minting digital assets in
  [Minting NFTs](Minting-NFTs.md).
- **Contribute to Development**: If you're a developer, check out
  [Development Setup](Development-Setup.md) for contributing code or testing features.
- **Return to Home**: Go back to the [Home](../Home.md) page for a complete overview of all wiki
  resources.

---

_Navigate the wiki using the sidebar on the right, or return to the top for quick access to key
sections._

---

[Back to Top](#installation-guide-for-groqtales-️)
