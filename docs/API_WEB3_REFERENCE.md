# Web3 API Reference — GroqTales Backend

Base URL: `https://groqtales-backend-api.onrender.com`

## Authentication

All `POST` endpoints require Bearer token authentication:
```
Authorization: Bearer <supabase-jwt-token>
```

---

## Wallets — `/api/v1/wallets`

### `POST /api/v1/wallets`
Create or initialize a managed wallet. Returns existing wallet if already created.

**Response (201):**
```json
{
  "success": true,
  "message": "Wallet created",
  "data": {
    "walletAddress": "0x...",
    "walletType": "managed"
  }
}
```

### `GET /api/v1/wallets/me`
Get current user's wallet with on-chain balances.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "walletAddress": "0x...",
    "walletType": "managed",
    "craftsBalance": "500.0",
    "nativeBalance": "1.5",
    "hasWallet": true
  }
}
```

### `GET /api/v1/wallets/:userId/balance`
Get CRAFTS + native balance for any user (public).

### `POST /api/v1/wallets/transfer`
Transfer CRAFTS tokens (server-validated, max 10K on testnet).

**Body:**
```json
{ "to": "0x...", "amount": "100.5" }
```

---

## Marketplace — `/api/v1/marketplace`

### `GET /api/v1/marketplace`
Browse listings with filters.

**Query params:** `page`, `limit`, `minPrice`, `maxPrice`, `genre`, `sort` (price_asc, price_desc, newest, oldest)

### `GET /api/v1/marketplace/pricing`
Get platform fee %, royalty model, and mint price info.

### `POST /api/v1/marketplace/list`
List an NFT for sale in CRAFTS.

**Body:**
```json
{ "nftId": "db-id", "price": "150", "onChainTokenId": "42" }
```

### `POST /api/v1/marketplace/buy`
Buy a listed NFT.

**Body:**
```json
{ "listingId": "uuid" }
```

### `POST /api/v1/marketplace/cancel`
Cancel an active listing (seller only).

**Body:**
```json
{ "listingId": "uuid" }
```

### `GET /api/v1/marketplace/history/:userId`
Transaction history (sold + canceled).

---

## Health — `/api/health/web3`

### `GET /api/health/web3`
Web3 connectivity diagnostics.

**Response (200):**
```json
{
  "status": "healthy",
  "service": "monad-testnet",
  "configured": true,
  "connected": true,
  "chainId": 10143,
  "blockNumber": 12345,
  "signerAddress": "0x..."
}
```

Status values: `healthy`, `degraded` (configured but can't connect), `not_configured`, `error`.

---

## Error Codes

| Code | Description |
|---|---|
| `INSUFFICIENT_FUNDS` | Not enough tokens/gas for the transaction |
| `NONCE_CONFLICT` | Transaction nonce collision — retry |
| `EXECUTION_REVERTED` | Smart contract rejected the call |
| `RPC_TIMEOUT` | Alchemy RPC timed out |
| `RPC_UNREACHABLE` | Cannot connect to Monad RPC |
| `WEB3_ERROR` | Generic Web3 error |
| `TRANSFER_FAILED` | CRAFTS transfer failed |
