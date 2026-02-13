# Off-Chain Royalty Tracking System

## Overview

The Off-Chain Royalty Tracking system enables GroqTales creators to earn royalties on secondary NFT sales. When a story is minted as an NFT, a royalty configuration is automatically created. Each subsequent sale records a royalty transaction and updates the creator's earnings — all tracked off-chain in MongoDB for fast queries and dashboard rendering.

This system is designed to work alongside eventual on-chain royalty enforcement (EIP-2981) while providing immediate tracking capabilities.

## Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  NFT Mint   │────▶│  RoyaltyConfig   │     │  Creator Revenue │
│  Endpoint   │     │  (default 5%)    │     │    Dashboard     │
└─────────────┘     └──────────────────┘     └────────┬─────────┘
                            │                         │
┌─────────────┐             ▼                         ▼
│  NFT Buy    │────▶ RoyaltyTransaction ────▶ CreatorEarnings
│  Endpoint   │     (sale recorded)          ($inc totals)
└─────────────┘
```

### Components

| Layer | Files | Purpose |
|-------|-------|---------|
| **Models** | `models/RoyaltyConfig.ts`, `models/RoyaltyTransaction.ts`, `models/CreatorEarnings.ts` | Mongoose schemas |
| **Service** | `lib/royalty-service.ts` | Business logic (configure, record, query) |
| **API** | `app/api/royalties/` | REST endpoints (4 routes) |
| **Hook** | `hooks/use-royalties.ts` | React data fetching (4 hooks) |
| **UI** | `components/royalty/` | Dashboard components (4 components) |
| **Page** | `app/dashboard/royalties/page.tsx` | Creator Revenue Dashboard |
| **Integration** | `server/routes/nft.js` | Royalty tracking in mint/buy flows |
| **Types** | `types/royalty.ts` | Centralized TypeScript types |

## Database Schema

### RoyaltyConfig

Stores the royalty settings for each NFT. Created automatically when an NFT is minted.

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `nftId` | ObjectId (ref: Nft) | — | Associated NFT |
| `storyId` | ObjectId (ref: Story) | — | Associated story |
| `creatorWallet` | String | required | Creator's wallet address |
| `royaltyPercentage` | Number | 5 | Percentage (0-50) |
| `isActive` | Boolean | true | Whether config is active |
| `createdAt` | Date | auto | Timestamp |
| `updatedAt` | Date | auto | Timestamp |

**Indexes:** `creatorWallet`, `nftId`, `storyId`, compound `(creatorWallet, storyId)`

### RoyaltyTransaction

Immutable record of each royalty event. Created when an NFT is purchased.

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `nftId` | ObjectId (ref: Nft) | required | NFT that was sold |
| `salePrice` | Number | required | Total sale price (ETH) |
| `royaltyAmount` | Number | required | Royalty paid to creator (ETH) |
| `royaltyPercentage` | Number | required | Percentage applied |
| `sellerWallet` | String | required | Seller's wallet |
| `buyerWallet` | String | required | Buyer's wallet |
| `creatorWallet` | String | required | Original creator's wallet |
| `txHash` | String | — | Blockchain tx reference |
| `status` | Enum | 'pending' | pending / completed / failed |
| `createdAt` | Date | auto | Timestamp (no updatedAt) |

**Indexes:** `nftId`, `creatorWallet`, `status`, compound `(creatorWallet, createdAt)`, `(nftId, createdAt)`

### CreatorEarnings

Aggregated earnings per creator. Updated atomically via `$inc` on each sale.

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `creatorWallet` | String | required, unique | Creator's wallet |
| `totalEarned` | Number | 0 | Lifetime royalties (ETH) |
| `pendingPayout` | Number | 0 | Awaiting withdrawal (ETH) |
| `paidOut` | Number | 0 | Already withdrawn (ETH) |
| `totalSales` | Number | 0 | Number of secondary sales |
| `lastUpdated` | Date | now | Last earnings update |

## API Reference

### POST /api/royalties/configure

Create or update a royalty configuration.

**Request:**
```json
{
  "nftId": "507f1f77bcf86cd799439011",
  "storyId": "507f1f77bcf86cd799439012",
  "creatorWallet": "0x1234567890abcdef1234567890abcdef12345678",
  "royaltyPercentage": 10
}
```

**Response (200):**
```json
{
  "success": true,
  "config": {
    "_id": "...",
    "nftId": "507f1f77bcf86cd799439011",
    "creatorWallet": "0x1234...",
    "royaltyPercentage": 10,
    "isActive": true
  }
}
```

### GET /api/royalties/configure?nftId=xxx

Fetch royalty configuration. Query params: `nftId`, `storyId`, or `creatorWallet`.

### GET /api/royalties/earnings/{walletAddress}

Fetch aggregated earnings for a creator.

**Response (200):**
```json
{
  "success": true,
  "earnings": {
    "creatorWallet": "0x1234...",
    "totalEarned": 1.5,
    "pendingPayout": 0.3,
    "paidOut": 1.2,
    "totalSales": 12,
    "lastUpdated": "2026-02-12T10:00:00.000Z"
  }
}
```

### GET /api/royalties/transactions/{walletAddress}

Fetch paginated royalty transaction history.

**Query params:** `page` (default: 1), `limit` (default: 10, max: 100), `status` (optional: pending/completed/failed)

**Response (200):**
```json
{
  "success": true,
  "transactions": [
    {
      "_id": "...",
      "nftId": "...",
      "salePrice": 0.5,
      "royaltyAmount": 0.025,
      "royaltyPercentage": 5,
      "sellerWallet": "0xaaaa...",
      "buyerWallet": "0xbbbb...",
      "creatorWallet": "0x1234...",
      "status": "completed",
      "createdAt": "2026-02-12T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 42,
    "page": 1,
    "totalPages": 5,
    "limit": 10
  }
}
```

### POST /api/royalties/record

Record a royalty transaction (called internally when an NFT sale occurs).

**Request:**
```json
{
  "nftId": "507f1f77bcf86cd799439011",
  "salePrice": 0.5,
  "sellerWallet": "0xaaaa...",
  "buyerWallet": "0xbbbb...",
  "txHash": "0xdeadbeef..."
}
```

## How It Works

### Minting Flow

1. Creator mints story as NFT via `POST /api/v1/nft/mint`
2. NFT is saved with `royaltyPercentage` (default 5%) and `royaltyRecipient`
3. A `RoyaltyConfig` is automatically created linking the NFT, story, and creator wallet
4. The config ID is stored on the NFT document as `royaltyConfigId`
5. If config creation fails, the mint still succeeds (non-critical path)

### Purchase Flow

1. Buyer purchases NFT via `PATCH /api/v1/nft/buy/:tokenId`
2. NFT ownership is transferred and listing removed
3. System looks up `RoyaltyConfig` for the NFT (`nftId + isActive: true`)
4. If config found, calculates: `royaltyAmount = salePrice * (royaltyPercentage / 100)`
5. Creates `RoyaltyTransaction` with status `completed`
6. Atomically updates `CreatorEarnings` via `$inc` (totalEarned, pendingPayout, totalSales)
7. If royalty tracking fails, the purchase still completes (wrapped in try/catch)

### Dashboard

- Accessible at `/dashboard/royalties` (also linked from main dashboard and header nav)
- Requires wallet connection — shows "Connect Wallet" prompt if not connected
- Displays: earnings overview cards, revenue-over-time chart, transaction history table, royalty settings form
- "Earnings" link appears in header navigation only when wallet is connected

## Configuration

| Setting | Default | Range | Location |
|---------|---------|-------|----------|
| Royalty percentage | 5% | 0-50% | Set on mint, adjustable via dashboard |
| Pagination limit | 10 | 1-100 | Query parameter |
| Wallet validation | Ethereum format | `0x` + 40 hex chars | Service layer |

Creators can update their royalty percentage at any time via the Royalty Settings tab on the dashboard. Changes apply to future sales only.

## Future Enhancements

- **On-chain royalty enforcement** via EIP-2981 in the MonadStoryNFT contract
- **Automated payouts** — batch withdraw accumulated royalties to creator wallets
- **Multi-recipient splits** — distribute royalties among co-creators (types already support `RoyaltyDistribution[]`)
- **Analytics** — per-NFT revenue breakdown, top-performing stories, earnings forecasting
- **Notifications** — real-time alerts when royalty payments are received
