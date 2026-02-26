<p align="center">
  <img src="https://www.groqtales.xyz/groq_tales_logo.png" alt="GroqTales Logo" width="150" />
</p>

# API Documentation for GroqTales

<div align="center">
  <img src="../../public/GroqTales.png" alt="GroqTales Logo" width="300" />
</div>

GroqTales provides a set of APIs that allow developers to interact with the platform
programmatically. These APIs enable integration with the AI story generation, NFT minting, and user
management features of GroqTales. This guide is intended for developers who wish to build
applications or services that leverage GroqTales' capabilities.

**Note**: The API documentation is a work in progress. As GroqTales evolves, more endpoints and
features will be added. Check back for updates or contribute to the API development via the
[Contributing Guide](../CONTRIBUTING.md).

## Table of Contents

- [Getting Started](#getting-started)
- [Authentication](#authentication)
- [Base URL](#base-url)
- [API Endpoints](#api-endpoints)
  - [Story Generation](#story-generation)
  - [NFT Minting](#nft-minting)
  - [User Management](#user-management)
- [Error Handling](#error-handling)
- [Rate Limits](#rate-limits)
- [SDKs and Libraries](#sdks-and-libraries)
- [Troubleshooting](#troubleshooting)
- [Next Steps](#next-steps)

## Getting Started

To begin using the GroqTales API, you'll need:

1. **API Key**: Currently, GroqTales may require an API key for certain operations (like AI story
   generation). Obtain your key by signing up or connecting a wallet, then check your account
   settings or profile for an API key section. If not yet implemented, API access may be tied to
   wallet authentication (see [Authentication](#authentication)).
2. **Wallet Connection**: For blockchain-related operations (e.g., NFT minting), ensure you have a
   connected cryptocurrency wallet (MetaMask, WalletConnect, etc.) set to the Monad Testnet or
   Mainnet.
3. **Development Environment**: Set up a development environment with tools to make HTTP requests
   (e.g., Postman, cURL, or a programming language like Node.js with `axios` or `fetch`).

## Authentication

GroqTales API authentication is primarily handled through wallet-based signatures or API keys:

- **Wallet-Based Authentication**: For endpoints involving blockchain operations (like NFT minting),
  authenticate by signing a message with your wallet. This typically happens automatically when
  using the GroqTales frontend, but for direct API calls, you'll need to include a signature or
  connect via a Web3 provider.
- **API Key**: For non-blockchain operations (like story generation), include your API key in the
  request header:

  ```bash
  Authorization: Bearer YOUR_API_KEY
  ```

  or as a query parameter if headers are not supported:

  ```bash
  ?api_key=YOUR_API_KEY
  ```

Specific authentication methods will be detailed per endpoint as the API matures.

## Base URL

All API requests should be made to the base URL of the GroqTales platform. As of now, since
GroqTales is under active development, the base URL for API calls is not finalized. For local
development:

```
http://localhost:3000/api
```

For production (when available):

```
https://groqtales.com/api
```

Check the latest repository updates or announcements for the official production API URL once
deployed.

## API Endpoints

Below are the primary categories of API endpoints that GroqTales plans to support. Detailed
specifications for each endpoint will be added as they are implemented.

### Story Generation

Endpoints for generating AI-powered stories. These interact with Groq AI or other integrated models.

- **Generate Story** (POST `/stories/generate`)
  - **Description**: Generate a story based on provided parameters like genre, title, and prompt.
  - **Request Body** (example):

    ```json
    {
      "title": "The Lost Kingdom",
      "genres": ["fantasy", "adventure"],
      "overview": "A knight seeks to reclaim his lost kingdom.",
      "storyType": "text",
      "mainCharacters": "Sir Eldric, a brave knight; Lila, a witty rogue",
      "setting": "Medieval fantasy world",
      "plotOutline": "Overcome a dark sorcerer to reclaim the throne",
      "themes": "Courage and redemption",
      "additionalInstructions": "Include a plot twist",
      "temperature": 0.7
    }
    ```

  - **Response** (example):

    ```json
    {
      "id": "story-12345",
      "title": "The Lost Kingdom",
      "content": "Once upon a time, in a land far away...",
      "genre": "fantasy, adventure",
      "createdAt": "2023-10-01T12:00:00Z",
      "status": "generated"
    }
    ```

  - **Headers**: `Authorization: Bearer YOUR_API_KEY`
  - **Status**: Planned/In Development

### NFT Minting

Endpoints for minting stories as NFTs on the Monad blockchain.

- **Mint NFT** (POST `/nfts/mint`)
  - **Description**: Mint a generated story as an NFT. Requires a connected wallet and Monad
    network.
  - **Request Body** (example):

    ```json
    {
      "storyId": "story-12345",
      "metadata": {
        "title": "The Lost Kingdom",
        "description": "A knight's epic journey...",
        "content": "Full story content here...",
        "authorAddress": "0xYourWalletAddress",
        "coverImage": "https://example.com/image.jpg",
        "genre": "fantasy, adventure"
      }
    }
    ```

  - **Response** (example):

    ```json
    {
      "tokenId": "nft-67890",
      "transactionHash": "0xTransactionHash",
      "nftUrl": "/nft-gallery/67890",
      "status": "minted",
      "blockchain": "Monad Testnet"
    }
    ```

  - **Headers**: Requires wallet signature or Web3 authentication.
  - **Status**: Planned/In Development (see `/api/monad/mint` in current codebase for early
    implementation).

### User Management

Endpoints for managing user accounts and profiles.

- **Get User Profile** (GET `/users/profile`)
  - **Description**: Retrieve the profile information associated with the connected wallet or API
    key.
  - **Response** (example):

    ```json
    {
      "address": "0xYourWalletAddress",
      "username": "Storyteller123",
      "stories": ["story-12345"],
      "nfts": ["nft-67890"],
      "createdAt": "2023-09-01T10:00:00Z"
    }
    ```

  - **Headers**: `Authorization: Bearer YOUR_API_KEY` or wallet signature.
  - **Status**: Planned

## Error Handling

GroqTales API responses will include standard HTTP status codes to indicate the success or failure
of requests:

- **200 OK**: Request successful.
- **400 Bad Request**: Invalid input or missing parameters. Check the response body for specific
  error messages.
- **401 Unauthorized**: Authentication failed. Verify your API key or wallet signature.
- **403 Forbidden**: You do not have permission to access this resource.
- **429 Too Many Requests**: Rate limit exceeded. See [Rate Limits](#rate-limits).
- **500 Internal Server Error**: Server-side issue. Retry later or contact support.

Error responses will typically include a JSON object with details:

```json
{
  "error": {
    "code": "INVALID_INPUT",
    "message": "Missing required field: genre"
  }
}
```

## Rate Limits

To ensure fair usage and protect server resources, GroqTales API may impose rate limits, especially
for AI story generation endpoints which are computationally intensive:

- **Limit**: Currently not specified as the API is in development. Expect limits like 10 requests
  per minute for story generation when live.
- **Headers**: Responses may include headers like `X-Rate-Limit-Limit`, `X-Rate-Limit-Remaining`,
  and `X-Rate-Limit-Reset` to inform you of your current rate limit status.
- **Exceeding Limits**: If you exceed the rate limit, you'll receive a `429 Too Many Requests`
  error. Wait until the reset time or use a custom API key if available for higher limits.

## SDKs and Libraries

While official SDKs for GroqTales are not yet available, you can interact with the API using
standard HTTP clients in your preferred programming language:

- **JavaScript/Node.js**: Use `axios` or `fetch` for making requests. Example with `axios`:

  ```javascript
  const axios = require('axios');

  async function generateStory(apiKey, storyData) {
    try {
      const response = await axios.post('http://localhost:3000/api/stories/generate', storyData, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      console.log('Generated Story:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
      throw error;
    }
  }
  ```

- **Python**: Use `requests` library for API calls.
- **Web3 Integration**: For blockchain operations, use libraries like `ethers.js` or `web3.js` to
  handle wallet signatures and interactions with Monad smart contracts.

Future updates may include official SDKs to simplify integration.

## Troubleshooting

- **Authentication Errors**: Ensure your API key is correct and not expired. For wallet-based auth,
  verify your wallet is connected and on the correct network (Monad Testnet).
- **Invalid Input Errors**: Check the API documentation for required fields and formats. Ensure JSON
  payloads are properly structured.
- **Network Issues**: If requests timeout or fail, verify your internet connection and the API base
  URL. For local development, ensure your server is running (`npm run dev`).
- **Rate Limit Exceeded**: Wait for the reset period or consider using a custom API key for higher
  limits if supported.

For additional support, post questions in
[GitHub Discussions](https://github.com/Drago-03/GroqTales/discussions) or refer to the
[FAQ](../FAQ.md).

## Next Steps

- Explore smart contract details for blockchain integration in
  [Smart Contracts](../Smart-Contracts.md).
- Set up a development environment with [Development Setup](../Development-Setup.md).
- Return to the [Home](../Home.md) page for more resources.

As the GroqTales API continues to develop, this documentation will be updated with more detailed
endpoints and examples. Stay tuned for enhancements to programmatically interact with our AI-powered
storytelling platform!
