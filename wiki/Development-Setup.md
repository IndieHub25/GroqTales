# Development Setup for GroqTales

<div align="center">
  <img src="../../public/GroqTales.png" alt="GroqTales Logo" width="300" />
</div>

Setting up a development environment for GroqTales allows you to contribute to the platform, test
features locally, or build custom integrations. This guide provides detailed instructions for
developers to clone the repository, install dependencies, configure the environment, and run the
application locally.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Cloning the Repository](#cloning-the-repository)
- [Installing Dependencies](#installing-dependencies)
- [Configuring Environment Variables](#configuring-environment-variables)
- [Running the Development Server](#running-the-development-server)
- [Testing Smart Contracts Locally](#testing-smart-contracts-locally)
- [Building for Production](#building-for-production)
- [Contributing Changes](#contributing-changes)
- [Troubleshooting](#troubleshooting)
- [Next Steps](#next-steps)

## Prerequisites

Before setting up the GroqTales development environment, ensure you have the following tools and
software installed on your system:

- **Node.js**: Version 16.x or higher, including npm (Node Package Manager). Download from
  [nodejs.org](https://nodejs.org/) if not already installed. You can use `nvm` (Node Version
  Manager) to manage multiple Node.js versions.
- **Yarn (Optional)**: An alternative to npm for dependency management. Install via
  `npm install -g yarn` or from [yarnpkg.com](https://yarnpkg.com/).
- **Git**: For cloning the repository and version control. Install from
  [git-scm.com](https://git-scm.com/) or your package manager.
- **Code Editor**: A text editor or IDE like Visual Studio Code, WebStorm, or any editor with
  JavaScript/TypeScript support.
- **Cryptocurrency Wallet (Optional)**: For testing NFT minting features, install a wallet extension
  like MetaMask in your browser (Chrome or Firefox recommended).
- **Truffle or Hardhat (Optional)**: For smart contract development and testing. Install via
  `npm install -g truffle` or follow
  [Hardhat's installation guide](https://hardhat.org/getting-started/#installation) if you plan to
  work on blockchain components.

Verify your Node.js and npm/yarn versions with:

```bash
node -v  # Should output v16.x.x or higher
npm -v   # Should output a version number
yarn -v  # If using yarn, should output a version number
```

## Cloning the Repository

To start, clone the GroqTales repository to your local machine:

1. **Open Terminal or Command Prompt**: Navigate to the directory where you want to store the
   project.
2. **Clone the Repository**: Use the following command to clone the GroqTales repository. Replace
   `yourusername` with the actual repository owner's username if different.

   ```bash
   git clone https://github.com/Drago-03/GroqTales.git
   cd GroqTales
   ```

3. **Switch to Development Branch (Optional)**: If there's a specific development branch, switch to
   it after cloning:

   ```bash
   git checkout dev  # or the relevant branch name
   ```

## Installing Dependencies

After cloning, install the required dependencies for the GroqTales project:

1. **Navigate to Project Directory**: If not already in the `GroqTales` folder, `cd` into it.
2. **Install Dependencies**: Run one of the following commands based on your package manager:

   ```bash
   npm install
   # or
   yarn install
   ```

   This will download and install all necessary packages defined in `package.json`, including
   Next.js, React, and Web3 libraries.

If you encounter permission errors, ensure you have the necessary rights, or use `sudo` (on Unix
systems) with caution, or adjust folder permissions.

## Configuring Environment Variables

GroqTales uses environment variables to manage sensitive information and configuration settings. You
need to set these up before running the application:

1. **Copy Example File**: Duplicate the `.env.example` file to create your local configuration:

   ```bash
   cp .env.example .env.local
   ```

2. **Edit Environment Variables**: Open `.env.local` in a text editor and replace placeholder values
   with your actual credentials or mock values for development. **Do not commit `.env.local` to
   version control.** Key variables include:
   - **WalletConnect Project ID**: For wallet integrations (`NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID`).
   - **API Keys**: For AI services like Groq (`NEXT_PUBLIC_GROQ_API_KEY`), Stability AI
     (`NEXT_PUBLIC_STABILITY_AI_API_KEY`), and others.
   - **IPFS Credentials**: For decentralized storage via Pinata (`NEXT_PUBLIC_PINATA_API_KEY`,
     `PINATA_API_SECRET`, `PINATA_JWT`).
   - **Blockchain Settings**: For Monad network interactions (`MONAD_RPC_URL`, `MINTER_PRIVATE_KEY`
     for test deployments).
   - **Build Mode**: Set `NEXT_PUBLIC_BUILD_MODE=false` for local development to enable full
     functionality.

   Example snippet from `.env.local` (values are placeholders):

   ```
   NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_wallet_connect_project_id_here
   NEXT_PUBLIC_GROQ_API_KEY=your_groq_api_key_here
   MONAD_RPC_URL=https://testnet-rpc.monad.xyz
   NEXT_PUBLIC_BUILD_MODE=false
   ```

3. **Obtain API Keys**: If you don't have the necessary keys:
   - Sign up at [Groq](https://console.groq.com/keys) for AI story generation API access.
   - Register at [WalletConnect](https://cloud.walletconnect.com/) for a project ID.
   - Use test credentials or mock values for non-critical services during development.

Refer to the [Environment Variables](../Environment-Variables.md) guide for a full list and detailed
explanations.

## Running the Development Server

With dependencies installed and environment variables configured, you can start the local
development server:

1. **Start the Server**: Run the following command to launch the Next.js development environment:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

2. **Access the Application**: Once the server starts (you'll see output like
   `ready - started server on 0.0.0.0:3000`), open your browser and navigate to:

   ```
   http://localhost:3000
   ```

   You should see the GroqTales application running locally.

3. **Test Wallet Connection (Optional)**: For NFT minting features, ensure your browser wallet
   (e.g., MetaMask) is installed and set to the Monad Testnet (Chain ID: 10143). Click "Connect
   Wallet" in the app to test the integration.

The development server supports hot reloading, so changes to code will automatically refresh the
application in your browser.

## Testing Smart Contracts Locally

If you're contributing to or testing the blockchain components of GroqTales, you may need to deploy
and interact with smart contracts locally:

1. **Install Blockchain Tools**: Ensure Truffle or Hardhat is installed (see
   [Prerequisites](#prerequisites)).
2. **Local Blockchain (Optional)**: Set up a local blockchain environment like Ganache for testing:

   ```bash
   npm install -g ganache-cli
   ganache-cli --chainId 10143 --networkId 10143
   ```

   This simulates the Monad Testnet locally with Chain ID 10143.

3. **Deploy Contracts**: If smart contract code is available in the repository (e.g., in a
   `contracts` folder), deploy them using Truffle or Hardhat scripts. Check for a `deploy.js` or
   similar script:

   ```bash
   truffle migrate --network development
   # or
   npx hardhat run scripts/deploy.js --network localhost
   ```

4. **Update Configuration**: Update `.env.local` with local contract addresses outputted after
   deployment for the frontend to interact with them.
5. **Test Interactions**: Use the GroqTales frontend or scripts to test minting NFTs or other
   contract functions locally.

For Monad Testnet interactions, ensure your wallet is connected to the testnet RPC
(`https://testnet-rpc.monad.xyz`) and has test tokens (obtainable from a faucet when available).

## Building for Production

If you want to test a production build locally or prepare for deployment:

1. **Build the Application**: Run the build command to create an optimized production version:

   ```bash
   npm run build
   # or
   yarn build
   ```

   This generates a `.next` folder with compiled assets.

2. **Start Production Server**: Run the production server to test the build:

   ```bash
   npm start
   # or
   yarn start
   ```

   Access it at `http://localhost:3000`.

3. **Environment for Production**: Ensure `NEXT_PUBLIC_BUILD_MODE=false` in `.env.local` for full
   functionality, or set to `true` to mock database connections if testing without real data.

## Contributing Changes

After making changes or fixes in your local environment, contribute back to the project:

1. **Commit Changes**: Stage and commit your changes with meaningful messages following the
   [Conventional Commits](https://www.conventionalcommits.org/) format if possible:

   ```bash
   git add .
   git commit -m "feat: add new story generation endpoint"
   ```

2. **Create a Branch**: If not already on a feature branch, create one:

   ```bash
   git checkout -b feature/add-new-feature
   ```

3. **Push Changes**: Push your branch to the repository:

   ```bash
   git push origin feature/add-new-feature
   ```

4. **Open a Pull Request**: Go to the GroqTales repository on GitHub, switch to your branch, and
   click "New Pull Request." Fill out the PR template with details of your changes. Follow the
   [Contributing Guide](../CONTRIBUTING.md) for full guidelines.

Ensure your code passes linting and tests before submitting a PR:

```bash
npm run lint
npm run test
# or
yarn lint
yarn test
```

## Troubleshooting

- **Node.js Version Issues**: If you encounter errors like "unsupported engine," ensure you're using
  Node.js 16.x or higher. Use `nvm` to switch versions:

  ```bash
  nvm use 16
  ```

- **Dependency Installation Fails**: Clear the `node_modules` directory and `package-lock.json` (or
  `yarn.lock`), then reinstall:

  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```

- **Environment Variables Missing**: If the app fails to start with errors about missing variables,
  ensure `.env.local` is correctly set up. Check logs for specific missing keys and add them with
  mock or real values.
- **Server Won't Start**: Verify no other process is using port 3000 (`lsof -i :3000` on Unix). Kill
  conflicting processes or change the port in `package.json` scripts.
- **Wallet Connection Fails**: Ensure MetaMask or your wallet extension is installed, unlocked, and
  set to Monad Testnet. Disable browser extensions that might interfere with Web3 connections.
- **Smart Contract Deployment Errors**: If deploying contracts locally fails, check for correct
  network settings in Truffle/Hardhat config and ensure your local blockchain (Ganache) is running.

For additional help, post questions in
[GitHub Discussions](https://github.com/Drago-03/GroqTales/discussions) or refer to the
[FAQ](../FAQ.md).

## Next Steps

- Explore smart contract details for blockchain integration in
  [Smart Contracts](../Smart-Contracts.md).
- Learn about API integrations for programmatic access in
  [API Documentation](../API-Documentation.md).
- Return to the [Home](../Home.md) page for more resources.

Setting up a development environment for GroqTales empowers you to contribute to an innovative AI
and Web3 storytelling platform. Dive in and start building!
