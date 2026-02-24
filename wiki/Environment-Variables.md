<p align="center">
  <img src="https://www.groqtales.xyz/groq_tales_logo.png" alt="GroqTales Logo" width="150" />
</p>

# Environment Variables in GroqTales

<div align="center">
  <img src="../../public/GroqTales.png" alt="GroqTales Logo" width="300" />
</div>

Environment variables are used in GroqTales to manage sensitive information, API credentials, and
configuration settings without hardcoding them into the source code. This guide provides a
comprehensive overview of the environment variables required or optional for running GroqTales
locally or in production, ensuring secure and flexible setup for developers and users.

## Table of Contents

- [Why Use Environment Variables?](#why-use-environment-variables)
- [Setting Up Environment Variables](#setting-up-environment-variables)
- [List of Environment Variables](#list-of-environment-variables)
  - [WalletConnect Configuration](#walletconnect-configuration)
  - [IPFS Configuration](#ipfs-configuration)
  - [Web3 Configuration](#web3-configuration)
  - [MongoDB Configuration](#mongodb-configuration)
  - [AI API Configurations](#ai-api-configurations)
  - [Blockchain Configuration](#blockchain-configuration)
  - [Development and Build Settings](#development-and-build-settings)
- [Obtaining API Keys and Credentials](#obtaining-api-keys-and-credentials)
- [Security Best Practices](#security-best-practices)
- [Troubleshooting](#troubleshooting)
- [Next Steps](#next-steps)

## Why Use Environment Variables?

Environment variables are key-value pairs that configure the runtime environment of an application.
In GroqTales, they are crucial for:

- **Security**: Keeping sensitive data like API keys, private keys, and database credentials out of
  version control, preventing accidental exposure in public repositories.
- **Flexibility**: Allowing different configurations for development, testing, and production
  environments without changing code.
- **Customization**: Enabling developers to use their own credentials or mock data for testing
  purposes.

GroqTales uses a `.env.local` file for local development to store these variables, which should
never be committed to GitHub.

## Setting Up Environment Variables

To configure environment variables for GroqTales:

1. **Copy the Example File**: After cloning the repository, duplicate the `.env.example` file to
   create your local configuration:

   ```bash
   cp .env.example .env.local
   ```

2. **Edit the File**: Open `.env.local` in a text editor and replace placeholder values with your
   actual credentials or mock values for development. The `.env.example` file lists all variables
   used by GroqTales with placeholder values.
3. **Ensure Privacy**: Do not commit `.env.local` to version control. It is ignored by `.gitignore`
   by default to prevent accidental exposure of sensitive data.

For production deployments, environment variables are set directly on the hosting platform (e.g.,
Vercel, Netlify) or in server configuration, not in a file.

## List of Environment Variables

Below is a detailed list of environment variables used in GroqTales, grouped by category. Each
variable includes its purpose, whether it's required, and default or example values. Refer to
`.env.example` in the repository for the latest template.

### WalletConnect Configuration

- **NEXT_PUBLIC_WALLET_CONECT_PROJECT_ID**
  - **Purpose**: Project ID for WalletConnect integration, used to enable wallet connections via QR
    code scanning or mobile apps.
  - **Required**: Yes, for wallet connection features.
  - **Example**: `your_wallet_connect_project_id_here`
  - **Source**: Obtain from [WalletConnect Cloud](https://cloud.walletconnect.com/).

### IPFS Configuration

- **NEXT_PUBLIC_INFURA_IPFS_PROJECT_ID**
  - **Purpose**: Project ID for Infura IPFS service, used for decentralized storage of story
    metadata (alternative to Pinata).
  - **Required**: Optional, if using Infura for IPFS.
  - **Example**: `your_project_id_here`
  - **Source**: Register at [Infura](https://infura.io/).
- **NEXT_PUBLIC_INFURA_IPFS_PROJECT_SECRET**
  - **Purpose**: Secret key for Infura IPFS authentication.
  - **Required**: Optional, if using Infura for IPFS.
  - **Example**: `your_project_secret_here`
  - **Source**: Available with Infura project setup.
- **NEXT_PUBLIC_PINATA_API_KEY**
  - **Purpose**: API key for Pinata, the primary IPFS pinning service used by GroqTales to store
    story content and metadata for NFTs.
  - **Required**: Yes, for IPFS storage.
  - **Example**: `your_pinata_api_key_here`
  - **Source**: Sign up at [Pinata](https://www.pinata.cloud/).
- **PINATA_API_SECRET**
  - **Purpose**: Secret key for Pinata API authentication.
  - **Required**: Yes, for IPFS storage.
  - **Example**: `your_pinata_api_secret_here`
  - **Source**: Provided by Pinata during API key creation.
- **PINATA_JWT**
  - **Purpose**: JSON Web Token for additional Pinata authentication, used for secure API
    interactions.
  - **Required**: Yes, for IPFS storage.
  - **Example**: `your_pinata_jwt_here`
  - **Source**: Generated by Pinata for your account.
- **NEXT_PUBLIC_STORACHA_KEY**
  - **Purpose**: Key for Storacha, an alternative decentralized storage solution (if implemented).
  - **Required**: Optional.
  - **Example**: `your_storacha_key_here`
  - **Source**: Obtain from Storacha documentation or service.

### Web3 Configuration

- **NEXT_PUBLIC_ALCHEMY_API_KEY**
  - **Purpose**: API key for Alchemy, a blockchain infrastructure provider, used for Ethereum or
    compatible network interactions (may be used for fallback or additional Web3 services).
  - **Required**: Optional, unless specific Web3 features require Alchemy.
  - **Example**: `your_alchemy_api_key_here`
  - **Source**: Sign up at [Alchemy](https://www.alchemy.com/).

### MongoDB Configuration

- **MONGODB_URI**
  - **Purpose**: Connection string for MongoDB, used to store user data, stories, or other
    non-blockchain data.
  - **Required**: Yes, for database operations in production or full local setup.
  - **Example**: `your_mongodb_uri_here`
  - **Source**: Create a database at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) or use a
    local MongoDB instance.
- **MONGODB_DB_NAME**
  - **Purpose**: Specific database name within MongoDB for GroqTales data.
  - **Required**: Yes, for database operations.
  - **Example**: `your_mongodb_db_name_here`
  - **Source**: Define during MongoDB setup, often `groqtales` or similar.

### AI API Configurations

- **NEXT_PUBLIC_GROQ_API_KEY**
  - **Purpose**: API key for Groq, the primary AI service powering story generation in GroqTales.
  - **Required**: Yes, for AI story generation.
  - **Example**: `your_groq_api_key_here`
  - **Source**: Obtain from [Groq Console](https://console.groq.com/keys).
- **NEXT_PUBLIC_GOOGLE_IMAGEN_API_KEY**
  - **Purpose**: API key for Google Imagen, potentially used for generating visual content or story
    illustrations (if integrated).
  - **Required**: Optional, for image generation features.
  - **Example**: `your_google_imagen_api_key_here`
  - **Source**: Available through Google Cloud services.
- **NEXT_PUBLIC_STABILITY_AI_API_KEY**
  - **Purpose**: API key for Stability AI, used for generating comic-style images or other visuals
    for stories.
  - **Required**: Yes, for comic or image generation features.
  - **Example**: `your_stability_ai_api_key_here`
  - **Source**: Sign up at [Stability AI](https://stability.ai/).
- **NEXT_PUBLIC_UNSPLASH_API_KEY**
  - **Purpose**: API key for Unsplash, used as a fallback for fetching placeholder images when AI
    image generation fails.
  - **Required**: Optional, for image placeholders.
  - **Example**: `your_unsplash_api_key_here`
  - **Source**: Register at
    [Unsplash Developers](https://unsplash.com/documentation#creating-a-developer-account).

### Blockchain Configuration

- **MONAD_RPC_URL**
  - **Purpose**: Remote Procedure Call (RPC) endpoint for connecting to the Monad blockchain, used
    for NFT minting and smart contract interactions.
  - **Required**: Yes, for blockchain operations.
  - **Example**: `https://testnet-rpc.monad.xyz`
  - **Source**: Provided by Monad documentation or set to testnet URL for development.
- **MINTER_PRIVATE_KEY**
  - **Purpose**: Private key for a minter account, used in development or testing to deploy
    contracts or mint NFTs on behalf of users (use with caution, only in secure environments).
  - **Required**: Optional, for test deployments or backend operations.
  - **Example**: `your_minter_private_key_here`
  - **Source**: Generate a test wallet private key for development (never use real Mainnet keys in
    code).

### Development and Build Settings

- **NEXT_PUBLIC_BUILD_MODE**
  - **Purpose**: A flag to control build behavior, set to `true` during builds to mock or disable
    database connections for testing, or `false` for full functionality in local development.
  - **Required**: Yes, for development configuration.
  - **Example**: `false` (for local dev with real connections) or `true` (to mock data).
  - **Source**: Set based on your development needs.

## Obtaining API Keys and Credentials

To fully configure GroqTales, you'll need to obtain various API keys and credentials. Here's how to
get them:

- **WalletConnect Project ID**: Sign up at [WalletConnect Cloud](https://cloud.walletconnect.com/),
  create a project, and copy the Project ID.
- **Groq API Key**: Register at [Groq Console](https://console.groq.com/keys), create an API key,
  and securely store it.
- **Pinata API Credentials**: Sign up at [Pinata](https://www.pinata.cloud/), generate API key and
  secret, and obtain the JWT from your dashboard.
- **Stability AI API Key**: Create an account at [Stability AI](https://stability.ai/), access your
  API keys in the account settings.
- **Unsplash API Key**: Register as a developer at
  [Unsplash](https://unsplash.com/documentation#creating-a-developer-account) to get an access key
  for image fetching.
- **Alchemy API Key**: Sign up at [Alchemy](https://www.alchemy.com/), create an app, and copy the
  API key for blockchain interactions.
- **MongoDB URI**: Set up a database with [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) or
  locally, and get the connection string.
- **Monad Testnet Tokens**: For testing NFT minting, request test tokens from a Monad Testnet faucet
  (URL to be provided when available).

For development, you can use mock values or test credentials if real keys are unavailable or to
avoid rate limits during testing.

## Security Best Practices

Handling environment variables securely is critical to protect sensitive data:

- **Never Commit `.env.local`**: Ensure `.env.local` is listed in `.gitignore` to prevent accidental
  commits to version control. If exposed, immediately revoke and regenerate compromised keys.
- **Use Secure Storage**: Store sensitive keys (like private keys or API secrets) in a secure
  password manager or vault, not in plain text files outside of `.env.local`.
- **Limit Key Scope**: Use API keys with the minimum permissions necessary. For example, create
  separate keys for development and production with restricted access.
- **Rotate Keys Regularly**: Periodically regenerate API keys and update `.env.local` to minimize
  risk if a key is compromised.
- **Environment-Specific Configurations**: Use different `.env` files or configurations for
  development, staging, and production to avoid using production keys in test environments.

## Troubleshooting

- **Missing Variable Errors**: If the application fails to start with errors like "Missing
  environment variable," check `.env.local` for the specified variable and ensure it's set. Review
  logs for exact variable names.
- **Invalid API Key**: If API calls fail with authentication errors, verify the key in `.env.local`
  is correct, not expired, and has the necessary permissions. Test with a new key if needed.
- **Database Connection Fails**: For MongoDB errors, ensure `MONGODB_URI` and `MONGODB_DB_NAME` are
  correct. Test the connection string in a MongoDB client to isolate issues.
- **Blockchain RPC Errors**: If NFT minting or wallet interactions fail, confirm `MONAD_RPC_URL` is
  accessible and your wallet is on the correct network (Monad Testnet, Chain ID: 10143).
- **Environment Not Loading**: If variables aren't recognized, ensure `.env.local` is in the project
  root and restart the development server after changes (`npm run dev` or `yarn dev`).

For additional help, post questions in
[GitHub Discussions](https://github.com/Drago-03/GroqTales/discussions) or refer to the
[FAQ](../FAQ.md).

## Next Steps

- Set up your development environment with [Development Setup](../Development-Setup.md).
- Learn about smart contract interactions in [Smart Contracts](../Smart-Contracts.md).
- Explore API integrations in [API Documentation](../API-Documentation.md).
- Return to the [Home](../Home.md) page for more resources.

Understanding and configuring environment variables correctly ensures a smooth development and
testing experience with GroqTales. Keep your credentials secure and tailored to your environment!
