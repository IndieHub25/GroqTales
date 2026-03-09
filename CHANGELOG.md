# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Supported Versions

Active full support: 1.9.0 (latest). Security maintenance (critical fixes only): 1.1.0. All versions < 1.1.0 are End of Security Support (EoSS). See `SECURITY.md` for the evolving support policy.

## [1.9.1] - 2026-03-09

### Fixed

- **Security**: Fixed Polynomial regular expression denial of service (ReDoS) vulnerability in `server/routes/auth.js` by removing ambiguity from the email validation regex and limiting input length (CodeQL warning).
- **Security**: Replaced predictable wallet credentials with standard SIWE (EIP-191) nonce-based signature verification in `server/routes/auth.js` for enhanced wallet login security.
- **Frontend**: Fixed `use-user-role` and `use-ethereum` hooks to remove unsafe hardcoded API URL fallbacks, properly validating required API URL usage configurations or defaulting to same-origin.
- **Frontend**: Formatted `app/actions/auth.ts` to satisfy Prettier rules and removed unsafe `localStorage` token persistence in favor of secure cookie-based auth.
- **Frontend**: Fixed API data shapes in `app/dashboard/page.tsx` that were causing the dashboard metrics to incorrectly parse token and asset balances.
- **Frontend**: Improved publisher profile timing issues in `app/profile/story/publish/page.tsx` to handle async session storage updates dynamically.
- **Frontend**: Updated the NFT Mint Request payload in `components/nft-mint-modal.tsx` to include crucial collected form data (e.g., `nftName`, `feeAmount`, `supply`) matching the required backend shape.
- **Backend API**: Fixed the Alchemy RPC methods in `server/services/alchemyMainnetClient.js` to use correct `getNFTsForOwner` method and required object parameters instead of raw JSON-RPC positional arguments.
- **Backend API**: Fixed incorrect ABI method and transaction return parameters in `server/services/nftMintService.js` to safely call the custom `mintStory` function and handle Ethereum v6 properties.
- **Backend API**: Addressed the HTTP 200 response on failed user creation loops in wallet auth by properly throwing 500 status codes.
- **Smoke Tests**: Updated Alchemy tests script to properly read outputs of API calls (e.g. `nfts.totalCount`) ensuring correct validation logic.

## [1.9.0] - 2026-03-09

### Added

- **`POST /api/v1/auth/wallet-login`** (`server/routes/auth.js`): New endpoint for wallet-based authentication — auto-creates Supabase user on first connect, returns access + refresh tokens, and creates a profile entry.
- **`POST /api/v1/auth/login-username`** (`server/routes/auth.js`): New endpoint that looks up email from username in profiles table, then authenticates via Supabase — enables login by username or email.
- **`GET /api/v1/auth/me`** (`server/routes/auth.js`): Returns the current authenticated user's profile from Supabase, including display name, avatar, bio, role, and wallet address.
- **`GET /api/v1/dashboard`** (`server/backend.js`): Aggregated dashboard endpoint returning total stories, drafts, published count, and 5 most recent stories for the authenticated user.
- **`GET /api/v1/stories/:id`** (`server/routes/stories.js`): Alias route that fetches a single story by ID with author profile join and view count increment — enables BFF-consistent story fetching.

### Changed

- **Backend Hardening** (`server/routes/stories.js`, `server/routes/drafts.js`): Added `supabaseAdmin` null guards to **all** route handlers (8 story routes, 5 draft routes) to return `503 Database not configured` instead of crashing with unhandled null reference errors when `SUPABASE_SERVICE_ROLE_KEY` is missing in production.
- **BFF Refactor — Story Detail** (`app/stories/[id]/client.tsx`): Replaced direct Supabase `.from('stories').select()` query with `fetch` to backend `GET /api/v1/stories/:id`. Removed `createClient` import.
- **BFF Refactor — Community Feed** (`components/community-feed.tsx`): Replaced direct Supabase `.from('profiles')` call with `fetch` to `GET /api/v1/auth/me` using stored access token. Removed `createClient` import.
- **BFF Refactor — Publish Page** (`app/profile/story/publish/page.tsx`): Replaced Supabase session/profile fetch with `GET /api/v1/auth/me` using localStorage token. Removed `createClient` import.
- **BFF Refactor — Profile Form** (`components/settings/profile-form.tsx`): Removed all direct Supabase calls (`auth.updateUser`, `from('profiles').upsert`). Profile load/save now exclusively uses backend `GET/PATCH /api/v1/settings/profile`. Removed `createClient` import.
- **BFF Refactor — Auth Actions** (`app/actions/auth.ts`): Replaced direct Supabase username lookup with backend `POST /api/v1/auth/login-username`. Stores tokens in localStorage.
- **BFF Refactor — User Role Hook** (`hooks/use-user-role.ts`): Replaced Supabase `onAuthStateChange` listener with `GET /api/v1/auth/me` call using stored token. Listens for `storage` events to react to login/logout.
- **Wallet Auth Flow** (`components/providers/web3-provider.tsx`): After `eth_requestAccounts`, now calls `POST /api/v1/auth/wallet-login`, stores returned tokens in localStorage, and dispatches `StorageEvent` for cross-component reactivity. Disconnect clears tokens. Replaced `credentials: "include"` with `Authorization: Bearer` header pattern.

### Fixed

- **Backend 500/503 Errors**: All story and draft routes now gracefully handle missing `supabaseAdmin` instead of crashing.
- **"Authentication service not configured"**: Backend auth middleware already returned 503 for missing Supabase; now all downstream routes also guard against it.
- **Wallet Connection Never Completing**: `web3-provider.tsx` now creates a full Supabase auth session via wallet-login, stores tokens, and sets `connecting` state properly.
- **Profile Form Crashing**: Removed references to `sessionUser` state variable that was deleted during refactor.
- **Frontend Supabase Violations**: Eliminated all remaining direct-to-Supabase calls from the frontend, enforcing the BFF architecture.

### Security

- All frontend authentication now uses `Authorization: Bearer <token>` headers with tokens stored in localStorage. No direct Supabase client interaction from the browser.
- Wallet login uses deterministic password derived from wallet address + server JWT secret — never transmitted to client.

## [1.8.3] - 2026-03-09

### Fixed

- **Accessibility**: Added programmatic focus trapping and Escape key management natively to `components/connect-account-modal.tsx` so keyboard users have a strict cycle scope when authenticating.
- **Form State Sync**: Hardened component state invalidation in `components/nft-mint-modal.tsx`; changing between duplicate titles across different `storyId` variations now properly flushes the internal mint form buffers. Fixed broken ARIA descriptive bindings on sub-views.
- **Data Selection Faults**: Stripped missing un-migrated schema columns (`description`, `cover_image`, `parameters`) from standard `maybeSingle` queries inside `app/stories/[id]/client.tsx` to stop PostgreSQL masking structural errors as soft 404s. Also wrapped `useEffect` hook state sets with strict unmount/ID-switch cancellation bounds to prevent asynchronous UI overwrites.
- **Draft Sorting**: Fixed the `/api/v1/drafts/list` endpoint query internally requesting `updated_at` ordering when user intentions strictly dictate tracking the JSON snapshot buffer's synthetic `current_updated_at` timestamps instead.

## [1.8.2] - 2026-03-09

### Fixed

- **API Keys**: Added validation in `scripts/Groqpe.py` to immediately exit if `GROQ_API_KEY` is not set, preventing cryptic type errors downstream.
- **Seed Script**: Updated `scripts/seed_demo_story.py` and `scripts/seed-demo-story.js` to identify demo rows deterministically using `source='demo'` rather than fragile title-matching that could conflict with legitimate user generated content. Added robust HTTP response validation for insertions.
- **Dependency Paths**: Fixed hard-coded nested module resolution in `scripts/seed-demo-story.js` replacing it with the standard package boundary `require('@supabase/supabase-js')`.
- **Query Bounds & Error Masking**: Hardened `server/routes/drafts.js`; `limit` query parameters are strictly clamped, and internal Supabase errors are securely logged server-side rather than leaked to clients.
- **WAV Buffer Concatenation**: Replaced native `Buffer.concat` with proper cross-chunk sample merging using the `wavefile` dependency in `server/services/bulbulService.js`, correcting multi-chunk audio corruption.
- **Startup Configuration Validation**: Enforced strict validation of `ETHEREUM_CHAIN_ID` via integer parsing in `server/services/web3Service.js` and `lib/chain-config.ts` during service initialization to fail fast before any RPC bindings are established.

## [1.8.1] - 2026-03-09

### Fixed

- **Profile Ownership Check** (`app/profile/[slug]/client.tsx`): Fixed profile ownership detection on public profile pages. The ownership comparison used `_id` but Supabase returns `id`, so the check never matched — meaning users couldn't see edit/owner actions on their own public profile page. Now compares using the `id` field from both self-profile and public-profile API responses.
- **Story Cards Not Clickable** (`app/profile/[slug]/client.tsx`): Story cards on profile pages were static with no navigation links. Wrapped `StoryCard` in `<Link>` components pointing to `/stories/{id}` so users can click through to the full story detail page.
- **Dashboard Blank on Expired Tokens** (`app/dashboard/page.tsx`): Dashboard silently failed when `getUserProfile()` returned 401 (expired token) — the user saw a blank loading state forever. Now detects 401/missing tokens and shows a clear "Session Expired" or "Not Logged In" error with sign-in redirect. Also added a general error state with retry for transient failures. Fixed `display_name` and `avatar_url` field mapping for Supabase profiles.
- **Publish Cover Upload Error Silently Swallowed** (`app/profile/story/publish/page.tsx`): The cover image upload had an empty `catch {}` block. If Supabase Storage was down or upload failed, the story would publish without a cover — contradicting the mandatory cover requirement. Now surfaces the upload error and blocks publish until the cover uploads successfully.
- **Public Profile Hides Freshly Published Stories** (`server/routes/users.js`): The public profile username endpoint filtered stories by `.eq('moderation_status', 'approved')`, but stories published via `publish-vedascript` don't set `moderation_status` (it defaults to NULL). Changed to `.or('moderation_status.eq.approved,moderation_status.is.null')` so freshly published stories appear on public profiles immediately.

## [1.8.0] - 2026-03-09

### Added

- **Central Chain Configuration Module** (`lib/chain-config.ts`) [NEW]: Single source of truth for blockchain network settings. Exports `ACTIVE_CHAIN` (chainId, name, rpcUrl, wsUrl, explorerUrl, nativeCurrency), `CONTRACTS` (storyNFT, marketplace, craftsToken), and helpers (`getExplorerUrl`, `isCorrectChain`, `CHAIN_ID_HEX`). All values from environment variables — nothing hardcoded.
- **Ethereum Service** (`lib/ethereum-service.ts`) [NEW]: Replacement for the deprecated Monad service. Provides `StoryMetadata`, `MintedNFT` types and blockchain interaction stubs for Ethereum mainnet via Alchemy.
- **Ethereum Hook** (`hooks/use-ethereum.ts`) [NEW]: React hook (`useEthereum`) targeting Ethereum mainnet (chain ID 1). Handles network switching via `wallet_switchEthereumChain`, mint request submission through the admin pipeline, and wallet state management.
- **ComiCraft Story NFT Contract** (`smart_contracts/contracts/ComiCraftStoryNFT.sol`) [NEW]: Renamed from `MonadStoryNFT`. ERC721URIStorage contract with name "Comicraft Story NFT" and symbol "CRAFT". Same functionality, new branding.

### Changed

- **COMICRAFT Logo** (`components/comicraft-logo.tsx`): Replaced inline SVG wordmark with `next/image` component loading the official `public/logo.png` asset. Ensures the full "COMICRAFT" text is visible at all viewport sizes (mobile 375px through desktop 1920px). Supports `mono-light`/`mono-dark` color schemes via CSS filter.
- **Footer Branding** (`components/footer.tsx`): "Powered by **Monad** × **Groq AI**" → "Powered by **Ethereum** & **Alchemy** × **Groq AI**" with blue/indigo Ethereum gradient and amber/orange Alchemy gradient replacing the emerald Monad gradient. Glitch hover animation preserved.
- **Blockchain Core** (`lib/blockchain.ts`): `MONAD_RPC_URL` → `ALCHEMY_ETH_MAINNET_HTTP_URL`. Provider connects to Ethereum mainnet with chain config from `chain-config.ts`. Error messages reference Ethereum mainnet.
- **Gallery Bug Fix** (`app/gallery/page.tsx`): Removed an errant filter that was excluding `is_minted: true` stories from the public feed. Built-in blockchain stories now properly display.
- **Admin Mint Sync** (`server/routes/admin.js`): Added logic to update a story's `is_minted` flag to `true` in Supabase whenever its NFT Mint Request is approved by an admin, ensuring the minted state is reflected platform-wide.
- **Web3 Provider** (`components/providers/web3-provider.tsx`): Removed all commented-out `mintNFTOnMonad` references and the large disabled fallback context block. Added live network name resolution in `handleChainChanged` for Ethereum, Polygon, Base, Arbitrum, Optimism, and Sepolia.
- **Constants** (`lib/constants.ts`): Removed `monad` entry from `BLOCKCHAIN_CONFIG.networks`. Updated `APP_CONFIG.name` to "Comicraft", URLs to `comicraft.xyz`. Updated `EXTERNAL_URLS` to Comicraft domains.
- **Web3 Service** (`server/services/web3Service.js`): `MONAD_RPC_URL` → `ALCHEMY_ETH_MAINNET_HTTP_URL`, `MONAD_CHAIN_ID` → `ETHEREUM_CHAIN_ID` (default 1), network name `monad-testnet` → `eth-mainnet`. Health check updated accordingly.
- **NFT Contract Service** (`server/services/nftContractService.js`): Comment references updated from "MonadStoryNFT" to "ComiCraftStoryNFT".
- **Marketplace Routes** (`server/routes/marketplace.js`): `MONAD_RPC_URL` → `ALCHEMY_ETH_MAINNET_HTTP_URL`. Mint price unit `MON` → `ETH`. JSDoc header updated from "Monad testnet" to "Ethereum mainnet".
- **Wallet Routes** (`server/routes/wallets.js`): All 3 `MONAD_RPC_URL` references → `ALCHEMY_ETH_MAINNET_HTTP_URL`.
- **Backend Health** (`server/backend.js`): Web3 health endpoint service label `monad-testnet` → `eth-mainnet`. Swagger description updated.
- **Hardhat Config** (`smart_contracts/hardhat.config.js`): Removed `monad_testnet` and `monad_mainnet` networks. Added `ethereum_mainnet` network using `ALCHEMY_ETH_MAINNET_HTTP_URL` with chain ID 1. Replaced `monadscan` with `etherscan` verification block.
- **Helper Hardhat Config** (`smart_contracts/helper-hardhat-config.js`): Removed `monad_mainnet` (143) and `monad_testnet` (10143) entries. Added `ethereum_mainnet` (1).
- **Environment Variables** (`.env.example`): Removed `MONAD_TEST_RPC_URL`, `MONAD_MAIN_RPC_URL`, `MONAD_RPC_URL`, `MONAD_CHAIN_ID`, `MONADSCAN_API_KEY`, `MINTER_PRIVATE_KEY`, `NODE_RPC_SETUP`, and Base network vars. Added `ALCHEMY_ETH_MAINNET_API_KEY`, `ALCHEMY_ETH_MAINNET_HTTP_URL`, `ALCHEMY_ETH_MAINNET_WS_URL`, `ETHEREUM_CHAIN_ID`, `ETHERSCAN_API_KEY`, `MINT_AUTHORITY_PRIVATE_KEY`.
- **Footer Test** (`components/__tests__/footer.test.tsx`): Updated assertion from "Monad" to "Ethereum" and "Alchemy" to match new branding.

### Deprecated

- `lib/monad-service.ts` — Now re-exports from `lib/ethereum-service.ts`. Import `@/lib/ethereum-service` for new code.
- `hooks/use-monad.ts` — Now re-exports from `hooks/use-ethereum.ts`. Import `@/hooks/use-ethereum` for new code.

### Security

- All Alchemy API keys, RPC URLs, private keys, and contract addresses are read exclusively from environment variables. No secrets are hardcoded in any file.
- `MINT_AUTHORITY_PRIVATE_KEY` is server-side only (not prefixed with `NEXT_PUBLIC_`).

### Technical Details

- **Target Chain**: Ethereum Mainnet (Chain ID 1) via Alchemy JSON-RPC
- **Contract Standard**: ERC-721 (ERC721URIStorage + Ownable + ReentrancyGuard)
- **Contract Addresses**: Configured via `STORY_NFT_CONTRACT_ADDRESS`, `CRAFTS_MARKETPLACE_ADDRESS`, `CRAFTS_TOKEN_ADDRESS` env vars. Must be deployed separately to Ethereum mainnet.
- **Backward Compatibility**: `monad-service.ts` and `use-monad.ts` re-export from their Ethereum counterparts so existing imports continue to work.

## [1.7.0] - 2026-03-09

### Added

- **NFT Mint Request Pipeline** [NEW]: Full end-to-end post-publish NFT minting flow with admin review.
  - `nft_mint_requests` Supabase table with status tracking (`pending_review`, `approved`, `rejected`).
  - `POST /api/v1/nft/mint-request`: Auth-required endpoint to submit a mint request for a published story.
  - `GET /api/v1/admin/mint-requests`: Admin-only endpoint to list all requests with story/author data.
  - `POST /api/v1/admin/mint-requests/:id/approve` and `/reject`: Admin actions with rejection reason support.
- **NFT Mint Modal** (`components/nft-mint-modal.tsx`) [NEW]: 3-step post-publish modal.
  - Step 1: Benefits & credibility messaging (configurable copy).
  - Step 2: NFT configuration form (name, description, fee, currency, supply, royalty %).
  - Step 3: Success confirmation.
- **Admin Mint Review Dashboard** (`app/admin/mint-requests/page.tsx`) [NEW]: Admin page for managing mint requests.
  - Status filtering, expandable cards with full metadata, approve/reject actions.
- **Auto-Tag Suggestions**: Publish page now auto-suggests up to 12 tags from genres, themes, setting, and plot keywords.

### Changed

- **Publish Story Page** (`app/profile/story/publish/page.tsx`): Complete overhaul.
  - Cover image is now **mandatory** (validated before publish).
  - Story title is **editable** on the publish screen.
  - "Ready to publish?" summary now shows **Author** (publisher name from profile).
  - Cover status shows "Required" (red) instead of "None (optional)".
  - Post-publish success screen now includes "Mint as NFT" CTA opening the mint modal.

## [1.6.0] - 2026-03-09

### Added

- **Sarvam AI Bulbul v3 TTS Service** (`server/services/bulbulService.js`) [NEW]: Full wrapper around the Sarvam AI REST API for high-quality Indian-accented text-to-speech.
  - Default model: `bulbul:v3`, default speaker: `Shubh`, default language: `en-IN`.
  - 39 speaker voices: Shubh, Priya, Simran, Rahul, Kavya, Amit, and many more.
  - 11 language codes: `en-IN`, `hi-IN`, `bn-IN`, `ta-IN`, `te-IN`, `gu-IN`, `kn-IN`, `ml-IN`, `mr-IN`, `pa-IN`, `od-IN`.
  - Automatic text chunking for inputs >2500 chars; chunks concatenated into one audio buffer.
  - `pace` (0.5x–2.0x), `sampleRate` (up to 48kHz via REST) configurable per request.
  - All credentials via `SARVAM_API_KEY` env var; **no key ever reaches the client bundle**.
- **TTS REST Endpoints** (`server/routes/tts.js`) [NEW]: Mounted at `/api/v1/tts`.
  - `POST /api/v1/tts/generate` (auth-required): Generates narration, uploads WAV to Supabase Storage `tts-audio` bucket, upserts record in `story_audio` table. Returns cached URL if audio already exists for same story/chapter/speaker/language params. Graceful error codes: `TTS_NOT_CONFIGURED`, `TTS_TIMEOUT`, `TTS_API_ERROR`.
  - `GET /api/v1/tts/audio`: Public endpoint to fetch existing audio metadata for a story chapter (no re-generation).
  - `GET /api/v1/tts/speakers`: Returns all valid Bulbul v3 speakers and language codes.
  - Full Swagger/OpenAPI annotations added. TTS tag added to API docs.
- **`story_audio` Supabase Table** [NEW]: Stores audio metadata keyed by `(story_id, chapter_index, speaker, language_code)`. Unique constraint prevents duplicates. Fields: `audio_url`, `pace`, `sample_rate`, `duration_seconds`, timestamps.
- **`useTTS` Hook** (`hooks/use-tts.ts`) [NEW]: React hook managing full TTS player state: fetches existing audio on mount, syncs HTML Audio element, exposes `play()`, `pause()`, `seek()`, `setSpeed()`, `setSpeaker()`, `setLanguage()`, `generateAudio()`. No secrets on client.
- **`BookView` Component** (`components/book-view.tsx`) [NEW]: Kindle/audiobook-style story reading experience.
  - Glassmorphic dark book surface with subtle page glow, serif typography, and 60vh scrollable content.
  - Chapter tab navigation for multi-chapter stories.
  - **TTS Audio Bar** docked below the book: animated waveform, play/pause, seek bar (with mm:ss display), speaker dropdown (39 voices), language dropdown, speed selector (0.5x–2x), "Generate Audio Narration" button with loading state.
  - Compact variant (`compact={true}`) for marketplace cards: mini play/pause button with waveform.
  - `TTSAudioBar` exported for standalone use.
- **Comicraft Logo System** (`components/comicraft-logo.tsx`) [NEW]: Fully responsive SVG-based logo component replacing the generic text logo.
  - Features an interlocking hexagonal 'C' icon symbolizing storytelling frames, blockchain nodes, and AI geometry.
  - Supports `full`, `icon`, and `mark` variants with `color`, `mono-light`, and `mono-dark` schemes.
  - Includes Framer Motion micro-interactions (fade-in, hover scale).
  - Integrated into navbar (`header.tsx`), footer (`footer.tsx`), landing page hero (`app/page.tsx`), splash screen (`splash-screen.tsx`), and loading screen (`loading-screen.tsx`).
- **Demo Story: "Chains of Trust: The Birth of Blockchain"** [SEEDED]: 3-chapter cinematic origin story of blockchain technology, inserted into Supabase `stories` table.
  - **Chapter 1 — The Broken Ledger**: Satoshi's 2008 world, the double-spend problem, the whitepaper.
  - **Chapter 2 — The Genesis Block**: The first Bitcoin block, Hal Finney's "Running bitcoin", blockchain mechanics explained.
  - **Chapter 3 — The Fever, The Skeptics, and The Believers**: 2011 fervor, Vitalik Buterin, Ethereum, the power of math-based trust.
  - Cover image, genre "Technology", `author_name: 'Comicraft'`, `parameters` with default TTS settings.
- **`scripts/seed-demo-story.js`** [NEW]: Idempotent Node.js seed script for the demo story (upserts on re-run).
- **`SARVAM_API_KEY`** added to `.env.example` with comment linking to Sarvam dashboard.

### Changed

- **Story Detail Page** (`app/stories/[id]/page.tsx` + new `client.tsx`): Replaced static mock-data approach with a dynamic client-side Supabase fetch. Parses JSON chapter arrays or plain-text content. Renders `BookView` with full audio controls. Cover image hero with gradient. Back-nav to Marketplace.
- **Marketplace Page** (`app/marketplace/page.tsx`): Enhanced story cards with:
  - "Audio" badge (headphones icon) on cards that have pre-generated narration.
  - `MiniAudioPreview` inline player for lazy audio preview on interaction.
  - Fetches `story_audio` table alongside stories to show audio availability without extra round-trips.
  - Animated card entry (Framer Motion), hover lift, "Read & Listen" CTA.
- **Backend** (`server/backend.js`): Added TTS route mount and `TTS` Swagger tag.

### Security

- `SARVAM_API_KEY` is read server-side only (`process.env.SARVAM_API_KEY`). It is **never** included in the Next.js client bundle (not prefixed with `NEXT_PUBLIC_`).
- TTS endpoint returns `503 TTS_NOT_CONFIGURED` if the key is absent, rather than crashing.
- All audio files are stored in Supabase Storage; clients receive only a public URL.

### Technical Details

- Audio format: WAV (base64 decoded from Bulbul v3 response), uploaded to Supabase Storage with `upsert: true`.
- Storage path convention: `tts-audio/stories/{storyId}/chapters/{chapterIndex}/bulbul-v3-{speaker}-{lang}.wav`.
- Cache key: `(story_id, chapter_index, speaker, language_code)` — callers can force-regenerate via `forceRegenerate: true`.
- `useTTS` re-fetches existing audio metadata when speaker or language changes, clearing stale state first.

## [1.5.0] - 2026-03-09


### Added

- **ConnectAccountModal** (`components/connect-account-modal.tsx`) [NEW]: Reusable auth gate modal with emerald accent, Login / Connect + Create Account + Cancel actions, and backdrop blur. Used to prompt unauthenticated users before story lifecycle actions.
- **"Save as Draft" button** (`app/create/ai-story/page.tsx`): Glassy two-tone button below the Generate CTA. Authenticated: calls `PUT /api/v1/drafts` with all VedaScript data (chapters, genres, parameters) packed as JSON snapshot; also saves local backup. Unauthenticated: opens ConnectAccountModal.
- **"Finish Storyline" button** (`app/create/ai-story/page.tsx`): Blue gradient button that cloud-saves the current draft, then navigates to `/profile/story/publish?draftKey=…`. Unauthenticated: opens ConnectAccountModal.
- **Publish Page** (`app/profile/story/publish/page.tsx`) [NEW]: Full-screen publish flow at `/profile/story/publish`:
  - Left panel: cinematic scrollable story preview (title, genres as chips, chapters formatted with serif body text).
  - Right panel: optional drag-and-drop cover image upload (PNG/JPG/WEBP, max 5 MB), tag chips input (max 12 tags), publish-readiness summary card.
  - "Publish Story" primary button → `POST /api/v1/stories/publish-vedascript`.
  - "Back to Editing" returns to VedaScript Engine with `?restore=1`.
  - Success state with confetti-style confirmation and "View Profile" / "View Story" actions.
  - Graceful error and "no draft found" states.
- **`POST /api/v1/stories/publish-vedascript`** (`server/routes/stories.js`): Auth-required endpoint that accepts title, genres, chapters, parameters, tags, and cover image URL. Builds compiled content, inserts to Supabase `stories` table with `status='published'`, `source='vedascript'`. Includes fallback minimal insert if extended columns don't exist on table yet.
- **`POST /api/v1/stories/upload-cover`** (`server/routes/stories.js`): Auth-required cover image upload endpoint. Validates type (PNG/JPG/WEBP) and size (≤5 MB), uploads to Supabase Storage `covers` bucket, returns public URL.
- **`GET /api/v1/stories/mine`** (`server/routes/stories.js`): Auth-required endpoint returning all stories for the current user ordered by `created_at` desc. Supports `?status=draft|published` and `?limit`/`?offset` pagination.
- **`GET /api/v1/drafts/list`** (`server/routes/drafts.js`): Auth-required endpoint returning all drafts for the current user (summary fields only: draftKey, title, genre, version, timestamps). Supports `?storyType` filter.
- **"Drafts" tab on Profile** (`app/profile/[slug]/client.tsx`): Owner-only tab listing VedaScript drafts fetched from `/api/v1/drafts/list`. Shows title, genre chip, version, and last-saved date. Each card links to `/create/ai-story?draftKey=…`.

### Changed

- **Profile Client Field Mapping** (`app/profile/[slug]/client.tsx`): Fixed critical mismatch between Supabase PostgreSQL field names (`id`, `first_name`, `last_name`, `avatar_url`, `wallet_address`, `created_at`) and frontend expectations. Both the self-profile (`slug === 'me'`) and public-profile code paths now normalize field names, story stats, and moderation status on load.
- **Profile Client UserProfile Interface**: Extended to accept both `id`/`_id`, `firstName`/`first_name`, `lastName`/`last_name`, `avatar`/`avatar_url`, `walletAddress`/`wallet_address`, `createdAt`/`created_at`. Story items extended similarly.
- **Backend API branding** (`server/backend.js`): Updated Swagger/OpenAPI `title`, `description`, `customSiteTitle`, landing page name, and startup log from `GroqTales` to `COMICRAFT`.

### Fixed

- **Profile dashboard 404/5xx**: Root cause was profile type field mismatch (`_id` vs Supabase's `id`). Resolved by normalizing in both profile fetch branches without changing backend response shape.

### Technical Details

- Draft key format: `vedascript-{slugified-title}-{stored-key}` persisted to `localStorage('draftKey')` so VedaScript and Publish pages share state.
- Draft snapshot uses `content` field as JSON-encoded VedaScript state (chapters, genres, parameters, storyPrompt). The drafts API's `content` field is `100 000` char max — sufficient for typical stories.
- Publish endpoint: resilient to `42703` (unknown column) errors via a minimal-insert fallback, allowing deployment before Supabase schema columns are added.

## [1.4.0] - 2026-03-07


### Added
- **Web3 CRAFTS Purchase Page** (`app/buy/CRAFTS/page.tsx`): Built a premium token purchase marketplace interface bridging Fiat constraints into Web3 interactions.
  - Implemented 4 pricing tiers (Starter, Pro Creator, Elite Stack, Studio Master) with localized INR conversion alongside standard USD base ($1 = ₹85 baseline, 30+5 tier logic).
  - Enforced authentication via NextAuth (`useSession`) and Ethereum Web3 Wallet connection (`useWeb3`), handling connection prompts directly via UI alerts.
- **Panelra Engine — Sketch-Based Comic Generation** (`app/create/comic/page.tsx`) [REWRITE]: Complete 3-column studio layout for AI comic creation:
  - **Left Panel — Character & Story Setup**: Hero sketch upload with drag-drop + preview, name/description fields. Dynamic co-star section (add/remove with image, name, traits). Story basics with title, logline, dual genre pills (up to 2 from 10 options), and art style selector (Manga, Western, Minimalist, Noir, Watercolor, Pixel Art).
  - **Middle Panel — Layout & Structure**: Pages/panels-per-page selectors, layout style picker (Classic Grid, Cinematic, Hero Shots) with visual descriptions, beat outline with 4 slots (Intro/Conflict/Climax/Resolution).
  - **Right Panel — AI Generation & Preview**: "Generate Comic with Panelra Engine" CTA, 4-phase animated progress (Analyzing → Composing → Rendering → Finalizing), panel preview grid organized by page with per-panel hover actions (regenerate, edit caption), Save Comic / Regenerate post-generation actions.
- **Sketch Generation Endpoint** (`server/routes/comics.js`): New `POST /api/v1/comics/generate-from-sketches` endpoint accepting multipart form data with `heroSketch` + `coStarSketches` files plus JSON metadata (title, logline, genres, stylePreset, layoutConfig, beatOutline, character details). Creates comic record with `status: 'draft'`, uploads hero sketch to IPFS as cover, generates structured mock panel data with beat labels, camera directions, and character assignments.
- **API Client Functions** (`lib/api-client.ts`): Added `generateComicFromSketches()`, `getUserComics()`, `getUserDrafts()`, `getUserNFTs()`, `getUserFeed()`, `getUserSettings()`, `updateUserSettings()`, `getUserProfile()` — all with auth headers and retry logic.
- **User Dashboard — Full Overhaul** (`app/dashboard/page.tsx`) [REWRITE]: Replaced basic stats page with 5-tab command center:
  - **Hero Welcome Block**: User avatar, personalized greeting, 4 stat cards (Stories, Comics, NFTs Minted, Drafts) with colored gradients and glass styling.
  - **Stories Tab**: Published stories list (from `/api/v1/stories`) + Drafts section (from `/api/v1/drafts`) with status badges, time-ago, view counts, and chevron navigation.
  - **Comics Tab**: Card grid (from `/api/v1/comics`) with cover thumbnails, hero name, genre badges, page count, and status indicators.
  - **Collectibles Tab**: NFT card grid (from `/api/v1/nft/user`) with token images, linked content, token IDs, and mint status.
  - **Feed Tab**: Activity stream (from `/api/feed`) with creator avatars, action descriptions, and timestamps.
  - **Settings Tab**: Profile form (display name, bio), notification/privacy toggles, optimistic save with animated feedback.
  - All tabs feature loading skeletons, empty states with CTAs, and error banners with retry buttons.

### Changed
- **Supported Version**: Bumped to `1.4.0`.

## [1.3.105] - 2026-03-07

### Added
- **Shakti Spark Page** (`app/create/spark/page.tsx`) [NEW]: Dedicated short-story/idea-seed generator with prompt textarea, genre pill selector, mood pills (Epic/Dark/Whimsical/Tense/Hopeful/Mysterious), "Spark it" CTA, and glass output card. Actions: Save as Draft, Open in VedaScript Engine, Copy idea. Generates via `/api/groq` with `format: 'short'`.
- **README VedaScript Parameter Documentation**: Added comprehensive "VedaScript Engine Parameters" section documenting all 71 UI parameters across 10 categories.
- **Parameter Presets** (`lib/ai-story-parameters.ts`): Added `PARAMETER_PRESETS` (Minimal, Standard, Advanced, Worldbuilder), `AI_STORY_PARAMETERS`, `AIStoryParameter` type, `searchParameters()`, and `applyPreset()` exports.
- **VedaScript Guided Tour Redesign** (`components/guided-tour.tsx`): Rewrote `AI_STORY_TOUR_STEPS` from 6 outdated steps to 7 steps matching the 3-column studio layout. Removed NFT minting references. Added `data-tour` attributes for all spotlight targets.

### Changed
- **Forge Root Redesign** (`app/create/page.tsx`): Replaced tab-based engine selection with a 2×2 glassmorphism engine card grid. Each engine (VedaScript, Panelra, Mythloom, Shakti Spark) has distinct color, icon, subtitle, description, and CTA. Mythloom shows "Coming Soon". Cards feature hover scale, glow, and press animations via Framer Motion.
- **VedaScript Engine Redesign** (`app/create/ai-story/page.tsx`): Complete rewrite of the 3-column studio layout:
  - **Top Bar**: Sticky header with engine branding, story title context, Save Draft, Export, and Back to Forge actions.
  - **Left Column**: Chapter-centric canvas with Add Chapter / Delete Chapter controls, replacing generic act-based nodes.
  - **Middle Column**: Story Details form (title, genre pills, description, characters, setting) + VedaScript Parameters panel with Reset/Apply sticky footer.
  - **Right Column**: Tabbed editor (Current Chapter / Compiled Story) with live word count and chapter stats, "Generate with VedaScript" primary CTA, and generation progress overlay.
  - Removed "ComicCraft Story Studio" branding; renamed to "VedaScript Engine."
- **AI Story Generator** (`components/ai-story-generator.tsx`): Simplified from 3-tab (Input/Preview/Mint) to 2-tab (Input/Preview) layout. Replaced mock story generation with actual `/api/groq` API call. Added copy-to-clipboard. Removed all blockchain/wallet imports.
- **Canvas Nodes**: Canvas now creates chapter nodes (`ch-1`, `ch-2`, ...) instead of act nodes, aligning with the chapter-centric VedaScript workflow.

### Removed
- **Mint NFT from AI Story Generator**: Removed `handleMintNFT` function (110+ lines), mint status tracking, wallet connection logic, content hash generation, session lock, OpenSea URL generation, and the "Mint NFT" tab from `components/ai-story-generator.tsx`. Minting actions are deferred to the Storymint Gateway / Bazaar.
- **Long-form story formats**: Removed `novella`, `novel`, and `comic` from `storyFormats` array in AI Story Generator. Shakti Spark is now explicitly short-story/idea-seed only.
- **Web3 import from AI Story Generator**: Removed `useWeb3` hook import and `connected`/`account`/`connectWallet` references.
- **story-hash import**: Removed `generateContentHash` import (no longer needed without minting).

## [1.3.104] - 2026-03-07

### Added
- **AI Story Studio Implementation** (`app/create/ai-story`): fully orchestrated sequential, multi-panel story creation feature combining Groq (for parameter processing) and Gemini (for prose generation).
- **Core Services** (`lib/services/`): implemented `panel-lifecycle-manager.ts`, `story-memory-manager.ts`, and `ai-orchestration-service.ts` to manage story constraints, character memory, and model interplay.
- **Data Models & Parameters** (`lib/types/`, `lib/ai-story-parameters.ts`): defined full TypeScript schemas (`StorySession`, `PanelData`) and 70+ AI story generation parameters, categorized comprehensively.
- **UI Components** (`app/create/ai-story/components/`): built modular UI for story tracking including `panel-progress-tracker`, `genre-lock-indicator`, `story-memory-display`, `story-output-display`, and `panel-creation-form`.
- **Testing Suites** (`__tests__/utils/`): generated property-based and unit tests for genre management and story memory features ensuring logic consistency.

### Changed
- **Backend API Client** (`lib/api-client.ts`): added new robust methods (`createStory`, `saveDraft`, `processAI`) for integration with the new AI Story Studio endpoints.
- **AI Story Studio Layout** (`app/create/ai-story/page.tsx`): radically expanded the multi-panel workflow supporting compose/read views, session persistence, and genre locking.

## 2026-03-07

### Changed
- **Rebranding - Comicraft**: Executed platform-wide rebrand from "GroqTales" to "Comicraft" unifying the experience.
- **Brand Positioning**: Updated hero tagline to "AI-native comics, stories, and collectibles on Monad."
- **Navigation Structure**: Renamed main overarching navigation to Prime (Home), Worlds (Genres), Forge (Create), Bazaar (Marketplace), Commons (Community), and Atlas (Docs).
- **Creator Engines**: Remapped the story creation engines in the Forge flow to VedaScript Engine, Panelra Engine, Mythloom Engine, and Shakti Spark.
- **Microcopy**: Replaced generic terms with cohesive identity vocabulary throughout the landing page, UI navigation, and footer components.

## 2026-03-07

### Added
- **CRAFTS Token Contract** (`smart_contracts/contracts/CraftToken.sol`): ERC-20 ComicCraft Tokens (CRAFTS) with owner-minted supply, burnable by holders, 1M initial supply. Deployed via `03-deploy-CraftToken.js`.
- **CRAFTS Marketplace Contract** (`smart_contracts/contracts/CraftsMarketplace.sol`): Full NFT marketplace settling in CRAFTS tokens instead of native ETH. Supports list, buy, cancel, update listings with configurable platform fees (basis points), creator royalties (up to 50%), and pull-payment proceeds withdrawal. Follows CEI (Checks-Effects-Interactions) pattern with ReentrancyGuard.
- **Web3 Service Layer** (`server/services/web3Service.js`): Core Monad testnet provider/signer management via Alchemy RPC. Includes gas estimation with 20% buffer, transaction sending with error mapping (insufficient funds → `INSUFFICIENT_FUNDS`, nonce conflicts, reverts, timeouts), and `checkWeb3Health()` returning chain ID, block height, and signer status.
- **Token Service** (`server/services/tokenService.js`): CRAFTS balance reads, server-initiated transfers via platform signer, ERC-20 approval management, and token metadata queries.
- **NFT Contract Service** (`server/services/nftContractService.js`): On-chain MonadStoryNFT minting with event parsing (StoryMinted + Transfer fallback), ownership lookups, metadata URI queries, and marketplace approval helpers.
- **Wallet Routes** (`server/routes/wallets.js`): `/api/v1/wallets` — POST create managed wallet, GET `/me` with on-chain CRAFTS + MON balances, GET `/:userId/balance` public lookup, POST `/transfer` with business-rule gating (10K CRAFTS max on testnet).
- **Marketplace Routes** (`server/routes/marketplace.js`): `/api/v1/marketplace` — GET browse with price range/genre/sort filters + pagination, GET `/pricing` (fee model, royalty info), POST `/list`, POST `/buy` (prevents self-purchase), POST `/cancel` (seller-only), GET `/history/:userId`.
- **Web3 Health Endpoint**: `GET /api/health/web3` — returns Monad testnet connectivity, chain ID, block height, and platform signer status.
- **Deploy Scripts**: `03-deploy-CraftToken.js`, `04-deploy-CraftsMarketplace.js` for Hardhat deployment with tag dependencies.
- **Test Suites**: 4 new test files with 50+ assertions:
  - `__tests__/services/web3Service.test.js` — provider/signer init, health checks, error mapping
  - `__tests__/services/tokenService.test.js` — balance, transfer, approval, metadata
  - `__tests__/routes/wallets.test.js` — wallet CRUD, transfer validation, auth enforcement
  - `__tests__/routes/marketplace.test.js` — browse, list, buy, cancel, history
- **Architecture Doc** (`docs/WEB3_ARCHITECTURE.md`): Mermaid diagrams, contract flow, env var reference, mainnet migration notes.
- **API Reference** (`docs/API_WEB3_REFERENCE.md`): Full endpoint docs for wallets, marketplace, NFT, and Web3 health routes.

### Changed
- **CORS** (`server/config/cors.js`): Added `https://www.comiccrafts.xyz` and `https://comiccrafts.xyz` to allowed origins.
- **Swagger Config** (`server/backend.js`): Added `Wallets` and `Marketplace` tags. Updated welcome endpoint with wallet and marketplace descriptions.
- **Route Mounts** (`server/backend.js`): Wired `/api/v1/wallets` and `/api/v1/marketplace` routes.
- **Environment Variables** (`.env.example`): Added `MONAD_RPC_URL`, `MONAD_CHAIN_ID`, `ALCHEMY_API_KEY`, `PLATFORM_SIGNER_KEY`, `PLATFORM_TREASURY_ADDRESS`, `PLATFORM_FEE_PERCENT`, `CRAFTS_TOKEN_ADDRESS`, `STORY_NFT_CONTRACT_ADDRESS`, `CRAFTS_MARKETPLACE_ADDRESS`.

### Fixed
- **Hardhat Config** (`smart_contracts/hardhat.config.js`): Removed duplicate `MONADSCAN_API_KEY` declaration that caused a build error.

### Technical Details
- **Chain Target**: Monad testnet (Chain ID 10143) via Alchemy RPC
- **Token Standard**: ERC-20 (CRAFTS) with OpenZeppelin ERC20 + ERC20Burnable + Ownable
- **Marketplace Standard**: ERC-721 support with SafeERC20 transfers, ReentrancyGuard, Ownable
- **Error Handling**: Mapped error codes: `INSUFFICIENT_FUNDS`, `NONCE_CONFLICT`, `EXECUTION_REVERTED`, `RPC_TIMEOUT`, `RPC_UNREACHABLE`, `WEB3_ERROR`
- **Security**: Platform signer key stays server-side; no secrets in client payloads; all env-var driven

## 2026-03-07

### Added
- **Story Creation UI Overhaul - Complete Implementation**: Redesigned all three story creation routes with professional canvas-based interfaces and guided tours.
  - **Text Story Route** (`/app/create/page.tsx`): Canvas-based chapter visualization with metadata panel (title, genre, description, cover image), live content editor, auto-save, and guided tour with 5 steps.
  - **Comic Creation Route** (`/app/create/comic/page.tsx`): Visual panel builder with canvas grid layout, individual panel editor (scene description, dialogue, camera notes), metadata management (title, genre, rating), panel count and page estimation (6 panels/page), and guided tour with 4 steps.
  - **AI Story Generation Route** (`/app/create/ai-story/page.tsx`): 3-column responsive layout featuring parameter panel (70+ interactive controls), real-time canvas preview based on parameter selection, story prompt input (5 textarea fields for title, characters, setting, plot, themes), story generation with markdown output, copy-to-clipboard functionality, and guided tour with 6 steps.

- **Story Canvas Component** (`/components/story-canvas.tsx`): Reusable SVG-based canvas supporting drag-drop node positioning with grid snapping, zoom in/out (Ctrl+±), center view (Ctrl+0), node selection, duplicate (Ctrl+D), delete, and real-time info panel showing node count, edges, and zoom level. Exports canvas state to localStorage with auto-save (1-second debounce).

- **Parameter Management System**:
  - **Parameter Schema** (`/lib/ai-story-parameters.ts`): 70+ AI story generation parameters organized across 10 categories (Character Development, Plot Structure, World Building, Tone & Style, Narrative Perspective, Dialogue, Pacing, Conflict & Stakes, Magic System, Themes & Symbolism). Four intelligence-level presets (Quick/5 params, Standard/15 params, Detailed/40 params, Epic/70 params) with 20+ utility functions for parameter management, preset application, and search.
  - **Parameter Panel** (`/components/parameter-panel.tsx`): Advanced parameter selection UI with real-time search filtering, category organization with collapse/expand, preset buttons, individual toggle controls, dynamic input sections (slider, select, text, textarea, toggle, multiselect), and stats footer showing enabled parameter count. Supports compact mode (max-h-500px) for space-constrained layouts.

- **Guided Tour System** (`/components/guided-tour.tsx`): Interactive onboarding with spotlight overlay highlighting, contextual tooltips (auto-positioned top/bottom/left/right), step navigation (Previous/Next/Skip/Finish), progress indicator, smooth animations (slideIn, slideUp effects with Framer Motion), and localStorage-based completion tracking (`tour-{tourId}` key) to prevent re-showing. Respects prefers-reduced-motion accessibility setting.

- **Canvas Utilities Library** (`/lib/canvas-utils.ts`): 30+ utility functions providing CRUD operations for canvas nodes and edges, layout algorithms (circle, grid, tree layouts), view management (zoom, pan, center), validation, serialization, and story structure presets (three-act, hero's journey, save-the-cat structures).

- **Canvas Types** (`/types/canvas.ts`): Type-safe TypeScript definitions for CanvasNode, CanvasEdge, CanvasState, CanvasView including story structure presets for text (chapters), comic (panels), and AI (acts/scenes). Comprehensive metadata support for custom attributes on nodes.

- **Canvas State Management Hook** (`/hooks/useStoryCanvas.ts`): React hook managing canvas persistence and operations with configurable localStorage keys, auto-load on mount, auto-save (debounced 1s) on state changes, and methods for adding, removing, updating, and moving nodes. Returns canvasState, setCanvasState, and operation helpers.

### Changed
- **CSS Module Architecture - Pure Selector Compliance**: Fixed all CSS modules to comply with Next.js/Webpack CSS Module requirements by removing nested selectors (&:hover, &:focus, &::before in nested context) and global selectors (:root, *, html), ensuring production build compatibility.
  - **canvas.module.css**: Removed nested `.toolbar button` rules; created flat `.toolbarButton` class. Removed nested `.metric .label` and `.metric .value`; created `.metricLabel` and `.metricValue` classes. All animations (pulse, glow) and responsive media queries properly scoped.
  - **guided-tour.module.css**: Flattened nested `.actions button`, `.skipButton`, `.closeButton`, and `.restartButton` selectors into individual classes. Updated component to use conditional className logic for position variants (`.positionTop`, `.positionBottom`, etc.). Responsive mobile breakpoints (max-width: 768px) at root level.
  - **parameter-panel.module.css**: Recreated with 100% flat structure; converted 18+ nested selectors into variant classes (`.selectHover`, `.inputFocus`, `.checkboxActive`, `.tabsActive`, etc.). All pseudo-states now explicit class names rather than nesting operators.

- **Unified Story Creation Entry Point** (`/app/create/page.tsx`): Refactored as tabbed interface with lazy-loaded components for Text Story, AI Story, and Comic creation routes, supporting cross-route navigation via query parameters (`?tab=ai`, `?tab=comic`). Cinematic dark-theme background with gradient overlays and glassmorphism design.

- **Build Optimization**: Optimized route bundle sizes: `/create/ai-story` reduced to 15.2 kB (from ~136 kB), `/create/comic` at 4.59 kB, `/create` at 3.6 kB. All routes maintain type safety and full feature parity.

### Fixed
- **CSS Module Pure Selector Errors**: Resolved webpack compilation errors caused by nested selectors in canvas, guided-tour, and parameter-panel CSS modules. All selectors now flat, enabling successful Next.js production builds across all 142 routes.
- **Component CSS Class References**: Updated all component button and element references to use new flattened CSS module class names (.toolbarButton for toolbar buttons, .metricLabel/.metricValue for metrics, position variant classes for tour positioning).

### Tested
- **Canvas Interactions**: Verified drag-drop with grid snapping, zoom in/out buttons, center view, node selection, delete, duplicate, and real-time info panel updates work smoothly across all routes.
- **Parameter System**: Confirmed all 70+ parameters display correctly, search filters in <100ms, category collapse/expand works, all four presets toggle correct parameter counts, and all control types (slider, select, text, textarea, toggle, multiselect) function properly.
- **Data Persistence**: Validated localStorage auto-save on every change (debounced 1s), draft loading on mount, guided tour completion tracking, and reset functionality clears all data properly.
- **Guided Tours**: Verified spotlight highlights correct elements via data-tour attributes, tooltips position accurately, all step navigation works, progress bar shows current position, and localStorage prevents re-showing completed tours.
- **Responsive Design**: Tested mobile (375px), tablet (768px), and desktop (1920px) layouts; confirmed single-column mobile layout, 2-column tablet layout, and full 3-column desktop layout work correctly.
- **Build Verification**: Production build successful with all 142 routes compiling, zero TypeScript errors, zero CSS module syntax errors, zero console errors. First Load JS at 85.2 kB (acceptable).

### Performance
- **Auto-Save Debouncing**: 1-second debounce prevents excessive localStorage writes while maintaining responsive persistence.
- **Parameter Search**: <100ms filtering of 70+ parameters via indexed object lookup.
- **Canvas Rendering**: Smooth SVG rendering with 50+ nodes; no performance degradation with large canvases.
- **Component Optimization**: All components memo-ized where appropriate; reusable across all three routes to minimize bundle size.

### Documentation
- **Implementation Complete**: Text story, comic, and AI story routes fully implemented with comprehensive component architecture, type safety, and production-ready code.
- **Feature Matrix**: All features (canvas, guided tours, auto-save, parameter system, responsive design, dark theme, professional styling) complete and verified functional.
- **Testing Evidence**: Canvas interactions, parameter system, data persistence, guided tours, responsive design, and build compilation all verified successful.

## 2026-03-06

### Added
- **Gemini API Service**: Introduced `/server/services/geminiService.js` implementing Google Gemini 2.0 wrapper with token budgets, retry logic, streaming support, and safety classification.
- **AI Orchestrator Service**: Created `/server/services/ai-orchestrator.js` implementing "Gemini Chairman" pattern for coordinating Gemini and Groq models with task delegation and output merging.
- **AI Generation Endpoint**: New `POST /api/v1/ai/generate` endpoint with SSE streaming, full config validation via Zod schema, and orchestrated generation with 70+ parameters.
- **AI Configuration Schema**: Comprehensive `/lib/ai-config-schema.ts` with 9 tab categories and 78+ fields covering Core Setup, World & Tone, Character Design, Plot, Style, Comic-Specific, Output Structure, Safety, and Performance.
- **Health Endpoint Enhancements**: Added Gemini and Groq service health checks to `/api/health` endpoint with detailed status and latency metrics.
- **Correlation ID Middleware**: New `/server/middleware/correlation-id.js` for request tracing via `X-Request-ID` header and request logging.
- **Status Dashboard Page**: Created `/app/status/page.tsx` displaying real-time system health with service status table, color-coded latency indicators, auto-polling, and manual refresh.
- **Comic Creation Page**: New `/app/create/comic/page.tsx` with panel editor, metadata fields, drag-to-reorder capability, and AI art toggle.
- **Comprehensive Test Suite**:
  - `/__tests__/services/geminiService.test.js` (50+ assertions)
  - `/__tests__/services/aiOrchestrator.test.js` (60+ assertions)
  - `/__tests__/routes/aiGeneration.test.js` (55+ assertions)
  - `/__tests__/routes/health.test.js` (65+ assertions)
  - `/__tests__/middleware/correlationId.test.js` (70+ assertions)
  - `/__tests__/lib/aiConfigSchema.test.ts` (85+ assertions)
  - `/__tests__/pages/status.test.tsx` (75+ assertions)

### Changed
- **Create Story Modal** (`components/create-story-dialog.tsx`):
  - Redesigned from emoji-based to professional image-driven cards
  - Removed 4px bold borders; replaced with subtle shadows
  - Renamed "Image Story" → "Comic Story"
  - Fixed routing (no fallbacks, explicit router.push)
  - Proper localStorage persistence with 100ms delay for modal close

- **Supabase Schema** (`server/config/supabase-schema.sql`):
  - Added `moderation_status` enum column (pending | approved | rejected | flagged)
  - Added `panel_breakdown` JSONB column for comic panel structure
  - Added `cover_image_url` TEXT column for story covers
  - Added `description` TEXT column for story summaries
  - Added `story_type` enum column (text | comic | ai-generated | hybrid)
  - Added `moderation_reviewed_at` TIMESTAMPTZ for tracking
  - Added performance indexes: `idx_stories_moderation_created`, `idx_stories_genre_created`

- **Backend Server** (`server/backend.js`):
  - Integrated Gemini + Groq health checks into `/api/health`
  - Added correlation ID middleware to request pipeline
  - Wired `/api/v1/ai/generate` route
  - Structured service status response with detailed diagnostics

### Fixed
- **Feed Endpoint 500 Errors**: Fixed `/api/feed` querying non-existent `moderation_status` column by adding schema migration
- **Degraded Performance Status**: No health indicators were surfaced; created status page for transparent monitoring
- **Missing Correlation IDs**: Request tracing was difficult; added correlation ID middleware for debugging

### Removed
- Deprecated hardcoded emoji-based story creation flow

### Technical Details
- **Model Orchestration**: Gemini as "chairman" makes decisions; Groq handles specific subtasks (outline, safety, panel breakdown)
- **Token Management**: Per-model token budgets enforced; Gemini: 512-2800 tokens depending on content type
- **Rate Limiting**: 1000 req/15min global window, exempts health checks and status page
- **CORS**: Dynamic callback validation supporting 7+ origins (Vercel, Cloudflare Pages, localhost, Render, GroqTales domains)
- **Logging**: Winston logger with daily rotation + correlation IDs for request tracing
- **Error Handling**: Custom error hierarchy (AppError → ValidationError, AuthError, DatabaseError, ExternalServiceError)
- **Streaming**: Server-Sent Events (SSE) support for real-time prose generation with progress tracking

### Testing Notes
- All 7 test suites created with 400+ total assertions
- Tests cover success paths, error scenarios, edge cases, and integration flows
- Mocked external dependencies (Gemini API, Groq API, database)
- Tests can be run with: `npm test`
- Coverage includes: schema validation, service health checks, endpoint behavior, middleware functionality, component rendering, real-time updates

## [1.3.103] - 2026-03-05

### Fixed
- **Deprecated Groq Model**: Replaced `mixtral-8x7b-32768` with `mistral-saba-24b` in both `lib/groq-service.ts` (`GROQ_MODELS.CONTENT_IMPROVEMENT`) and `server/services/groqService.js` (`MODELS.LONG_CONTEXT`).
- **Backend Test Lint**: Converted `forEach` expression-bodied arrow to block-bodied in `scripts/backend-test.js` (no implicit return).
- **Backend Test Start Script**: Relaxed assertion to accept any `start*` script name (supports `start:backend`, `start-backend`, etc.).
- **Test Fetch Leak**: Saved and restored `global.fetch` in `tests/backend/groq-service.test.js` via `afterAll` to prevent cross-test contamination.

### Changed
- **Groq Route Security** (`server/routes/groq.js`):
  - `/models` now reads API key from `Authorization: Bearer …` header (query param kept as fallback).
  - `ideas` action validates and clamps `count` to 1–20 range.
  - Error responses no longer leak raw error messages; return generic `AI operation failed` with code.
- **Groq Service Enhancements** (`server/services/groqService.js`):
  - `buildIdeasPrompt` now incorporates the `theme` parameter.
  - `callGroq` fetch calls protected by 30-second `AbortController` timeout.
- **Worker Security** (`server/worker.js`):
  - `/run` and `/track-usage` endpoints gated by `WORKER_SECRET` shared-secret auth.
  - `tokens` payload validated as a finite positive number before accumulation.
- **Backend Test**: Added `healthCheckPath: /healthz` assertion for Render config.

### Documentation
- **README.md**: Standardized `UNSPLASH_API_KEY` → `NEXT_PUBLIC_UNSPLASH_API_KEY` in env table and For Developers section.
- **SECURITY.md**: Bumped latest version to 1.3.103→1.3.104, added worker secret and timeout notes.
- **wiki/Backend-Testing.md**: Updated model list to include `mistral-saba-24b`.
- **wiki/API-Documentation.md**: Corrected production base URL to `groqtales-backend-api.onrender.com/api`.

## [1.3.103] - 2026-03-05

### Fixed
- **Cloudflare Pages Build Failure (`Invalid Version:`)**: Fixed `npm ci` crash caused by `@upstash/redis` having `"version": "v1.36.3"` in `package-lock.json`. The `v` prefix is not valid semver; npm 10.9.2 strictly validates version strings during `npm clean-install`, causing the build to exit with code 1. Corrected to `"1.36.3"`.

### Changed
- **ARCHITECTURE.md — Hybrid Database State**: Updated the Core Technologies section and added a "Data Layer — Transitional State" section documenting that MongoDB is still active for the NFT minting pipeline (`StoryMint` model via `lib/dbConnect.ts`). Includes a module-by-module audit table (live/stubbed/dead code), development guidance targeting Supabase for all new work, onboarding credentials, and a cleanup plan. Marked the document as transitional.

## [1.3.102] - 2026-03-05

### Added
- **Groq AI Centralized Service**: Introduced `/server/services/groqService.js` to handle all Groq API calls (LLaMA 3.3/3.1, Mixtral) with 70+ parameters schema, robust error handling, and timeout limits.
- **Groq Multiplexer Route**: Created `server/routes/groq.js` for flexible `/api/groq` requests matching the frontend `use-groq` hook exactly.
- **Backend Worker Pipelines**: Implemented `server/worker.js` with functional ML analytics, background cleanup jobs, and metrics tracing.
- **Automated Render Deployment Test**: Wrote `/scripts/backend-test.js` (`npm run test:backend`) to assert standard deployment structures, missing modules, package settings, and placeholder eliminations are completed securely.
- **Documentation**: Updated `README.md`, `API-Documentation.md`, `AI-Prompt-Engineering.md`, and `Backend-Testing.md` to reflect full Groq backend operations.
- **Swagger Updates**: Restructured and exposed endpoints across the backend properly replacing placeholder returns in `server/routes/stories.js` and `server/routes/ai.js`.

### Fixed
- **Render Health Check Flapping (429 Errors)**: Resolved an issue where Render liveness probes flap between "failed" and "recovered" due to HTTP 429 Too Many Requests.
  - Added dedicated `/healthz` endpoints at the top of `backend.js` and `sdk-server.js` to ensure instantaneous, dependency-free responses.
  - Safelisted `/healthz`, `/`, and `/api/health` in the global `express-rate-limit` configuration to guarantee liveness probes are never blocked.
  - Updated `render.yaml` `healthCheckPath` from `/api/health` and `/sdk/health` to the isolated `/healthz` endpoint.
  - Added explicit logging to `/healthz` requests for easier production debugging.
- **Winston Crash Loop**: Designed fallback console logging for `groqService` execution in scenarios where `winston` modules suffer disk access issues.
- **Module Resolution Issues**: Corrected EPERM/Lusca errors across testing infrastructure by designing standalone tester bypassing standard tree constraints.
- **Model Namings**: Cleansed the frontend and backend of deprecated Groq mock-model nomenclature (e.g. `llama3-8b-8192-analysis`) ensuring legitimate tokens execute successfully.

## [1.3.101] - 2026-03-03

### Added
- **Dynamic Blog Architecture**: Rebuilt the `/blog` system. Created a visually appealing Blog Index listing page at `/blog`, converting the previous statically-routed article into a dynamic nested route at `/blog/[slug]`. 
- **Real-Time Marketplace Sync**: Overhauled the Marketplace feature. Renamed the legacy `/nft-marketplace` route to `/marketplace`, deleted all old static mock-data files, and constructed an intelligent UI that reads and syncs directly from the Supabase `stories` table in real time.

### Fixed
- **Image Overlays**: Configured the frontend to prioritize rendering external logo media located at `/blogs/blog-data/Blog 1/blog-logo.png` for both the index cover image and internal hero banner.

## [1.3.100] - 2026-03-02

### Added
- **Top Creators API Endpoint**: Added a new `/api/v1/users/top-creators` route to fetch users and dynamically aggregate their statistics (likes, stories, views).
- **Creators Page UI Overhaul**: Reworked `/community/creators` with a premium, sleek dark mode theme matching the platform's new aesthetic. Synced the page entirely with the new backend endpoint, replacing all mock data.
- **Improved Contact Page**: Completely migrated the `/contact` page to a new professional layout and dark-mode premium look.
- **Home Page Enhancements**: Updated specific links in the footer, implemented the required "Start Creating" hero navigation, and added a hero image to the "publish to the world" section.
- **Gallery Upload Pipeline**: Added an interactive `/upload` page supporting 50MB PDF, DOCX, TXT, and MD files.
- **Synoptic AI Agent**: Integrated Groq AI to automatically parse uploaded files and generate rich, 2-3 sentence synopses.
- **Real-Time Archive Gallery**: Created a modern `/gallery` page to replace the old `/nft-gallery`, now perfectly synced with un-minted community works.
- **Format Typings**: Authors can classify their uploads as 'Storybook' or 'Comic Book'.
- **Blog Platform**: Created a premium `/blog` page containing the DEV.to article, built with custom typography and scroll progress indicators.

### Fixed
- **Floating Buttons**: Aligned the "Help Bot" and "Scroll to Top" floating action buttons horizontally on the screen.

### Removed
- **NFT Gallery**: The old static mock-data `/nft-gallery` was entirely removed and replaced with the real-time `/gallery`.

## [1.3.9] - Unreleased

### Bug Fixes
- **Cloudflare Pages Deployment Fix (Asset Validation)**: Fixed an issue where the Cloudflare Pages asset validation process would crash and timeout over 15 minutes due to an invalid C-style block comment (`/* ... */`) in `public/_headers`. Cloudflare treats `/*` as a path matcher for all routes, causing the subsequent comment text to be parsed as invalid HTTP headers. Replaced with valid `#` comments.
- **Cloudflare Pages Deployment Fix (Actions)**: Fixed GitHub Action workflow `deployment.yml` to trigger on branches other than `main` and dynamically deploy to the current branch instead of hardcoding `main`. Also removed the restrictive repository name check.

### Story Creation Reversion & Enhancements

- **Create Story Reversion** (`app/create/page.tsx`): Reverted to the classic UI with manual input fields (title, description, genre, content, cover image) instead of the AI-generation layout.
- **Enforced Authentication** (`app/create/page.tsx`): Restricted access to story creation; users must now have an active Supabase session (or admin override) to access the page and upload content.
- **Supabase Schema Update** (Supabase Database): Added `description` and `cover_image` columns to the `stories` table to appropriately store the classic story form fields.
- **API Form Processing** (`server/routes/stories.js`): Updated POST `/api/v1/stories/create` to capture and insert `description` and `cover_image` directly into Supabase.
- **Real-time Feed Sync** (`server/routes/feed.js`): Feed now serves the `description` and `cover_image` for stories, allowing the frontend to display newly created manual stories properly.

### Major: Full Supabase Backend Migration

Migrated the entire backend database layer from MongoDB/Mongoose to **Supabase PostgreSQL**. This resolves all 500 errors caused by MongoDB not being connected on Render and fixes the auth token mismatch between the frontend (Supabase tokens) and backend (custom JWT).

### Added
- **`server/config/supabase.js`** — Supabase client configuration with admin client, per-user client factory, and health check function
- **`server/config/supabase-schema.sql`** — Complete SQL schema with 4 tables (`profiles`, `stories`, `drafts`, `user_settings`), RLS policies, auto-profile creation trigger, and `updated_at` triggers
- **`@supabase/supabase-js`** dependency added to `server/package.json`

### Changed
- **Auth Middleware** (`server/middleware/auth.js`) — Now verifies Supabase JWT tokens via `supabase.auth.getUser()` instead of custom JWT verification
- **Auth Routes** (`server/routes/auth.js`) — Signup uses `supabase.auth.admin.createUser()`, login uses `supabase.auth.signInWithPassword()`
- **Users Routes** (`server/routes/users.js`) — All queries use Supabase `profiles` + `stories` tables; auto-creates profile on first access; fixed Swagger docs (added proper parameters)
- **Stories Routes** (`server/routes/stories.js`) — CRUD operations against Supabase `stories` table with author profile joins; removed CF D1 sync
- **Feed Route** (`server/routes/feed.js`) — Queries Supabase directly instead of proxying through Cloudflare Worker; includes author profiles and content truncation
- **Drafts Routes** (`server/routes/drafts.js`) — Full CRUD with version history via Supabase `drafts` table using JSONB
- **Settings/Profile** (`server/routes/settings/profile.js`) — Uses Supabase `profiles` table; removed MongoDB and CF Worker sync
- **Settings/Notifications** (`server/routes/settings/notifications.js`) — Uses Supabase `user_settings` table
- **Settings/Privacy** (`server/routes/settings/privacy.js`) — Uses Supabase `user_settings` table
- **Settings/Wallet** (`server/routes/settings/wallet.js`) — Uses Supabase `profiles` wallet fields
- **Health Checks** (`server/backend.js`) — Shows Supabase connection status instead of MongoDB; server starts immediately without blocking on DB connection
- **Root Endpoint** (`server/backend.js`) — Updated feed description from "Cloudflare D1" to "Supabase"
- **Sign-In Page** (`app/sign-in/page.tsx`) — CRM-style UI overhaul, removed emojis, added strong validation, and password show/hide toggle.
- **Sign-Up Page** (`app/sign-up/page.tsx`) — CRM-style UI overhaul, multi-step layout modernized, added password strength validation, and password show/hide toggle.

### Fixed
- **Cloudflare Build Error** — Fixed incorrect Supabase client import path in `app/create/page.tsx` (`@/utils/supabase/client` to `@/lib/supabase/client`) that was causing the build to fail on Cloudflare Pages.
- **Render 429 Health Check Errors** — Moved `/api/health` routes above the global rate limiter in `server/backend.js` to prevent health check failures during instance deployment and monitoring.
- **500 errors on all data endpoints** — Caused by MongoDB not being connected on Render
- **401 errors on authenticated endpoints** — Frontend sends Supabase tokens but backend was verifying with custom JWT
- **Missing Swagger parameters** — `/api/v1/users/profile` GET now shows auth parameters
- **Profile dashboard not loading** — Profile data now served from Supabase, matching the frontend's auth flow

### Core Infrastructure

- Implement core application structure, API routes, UI components, and Cloudflare Worker for GroqTales.

### Backend Integration & Production Config

#### Backend API Wiring
- **`lib/api-client.ts`** [NEW]: Centralized `apiFetch()` and `authHeaders()` helpers for consistent API base URL usage across all frontend components.
- **`.env.example`**: Added `NEXT_PUBLIC_API_URL`, `PROD_URL`, `CORS_ORIGIN` environment variables.
- **`scripts/check-env.js`**: Added `NEXT_PUBLIC_API_URL` to required environment variables validation.

#### Production Config Fix — Localhost Removal
- **`server/backend.js`**: Swagger server URL changed from `process.env.URL || 'http://localhost:PORT'` → `process.env.PROD_URL || 'https://groqtales-backend-api.onrender.com/api'` with "Production" description. CORS origin default changed from `localhost:3000` → `https://groqtales.xyz`. Health check startup logs now use `PROD_URL`.
- **`server/sdk-server.js`**: CORS origin default changed from `localhost:3000` → `https://groqtales.xyz`.

#### Health Endpoints
- **`server/backend.js`**: Added `GET /api/health/db` (database connectivity) and `GET /api/health/bot` (help bot availability) endpoints.
- **`hooks/use-system-health.ts`** [NEW]: Frontend hook that polls backend health endpoints, used to show/hide the "System Offline" banner.
- **`components/footer.tsx`**: Fixed health check parsing — was checking for `'ok'` status but backend returns `'healthy'`.

### RBAC — Role-Based Access Control

- **`lib/rbac.ts`** [NEW]: Role helper functions (`getUserRoles()`, `isAdmin()`, `isModerator()`, `isModOrAdmin()`, `getPrimaryRole()`) reading from Supabase `user_metadata.roles`. Includes `roleBadgeStyles` config for Admin (red), Moderator (amber), User (emerald) badges.
- **`hooks/use-user-role.ts`** [NEW]: React hook reading Supabase session roles with `localStorage`-based view-switching so admins/mods can preview the UI as a regular user.
- **`components/user-nav.tsx`**: Added RBAC-aware dropdown items — role badge next to "User Controls", conditional "Admin Panel" (admin only), "Moderation" (admin + mod), "Settings", "Notifications" (all users), and "Switch to User/Admin View" toggle (admin + mod).

### MADHAVA Help Bot — Express Backend

- **`server/routes/helpbot.js`** [NEW]: `POST /api/helpbot/chat` endpoint integrating with Groq LLM API. Includes system prompt with GroqTales knowledge base and fallback message when `GROQ_API_KEY` is not configured.
- **`server/backend.js`**: Mounted helpbot route at `/api/helpbot`.

### Profile Refactor — Username-Based URLs

- **`server/routes/users.js`**: Added `GET /api/v1/users/profile/username/:username` route for fetching profiles by username.
- **`app/profile/[slug]/page.tsx`** [NEW]: Server component for username-based profile routing.
- **`app/profile/[slug]/client.tsx`** [NEW]: Full profile client component — handles `/profile/me` (authenticated) and `/profile/:username` (public), displays moderation status badges, user stats, story list, and "Mint NFT" button for owned approved stories.
- **`app/profile/page.tsx`**: Now redirects to `/profile/me`.
- **`app/profile/[id]/`** [DELETED]: Removed old ObjectId-based profile pages.

### Story Moderation System

- **`server/models/Story.js`**: Added `moderationStatus` (`pending`/`approved`/`rejected`), `moderatorId`, and `moderationNotes` fields to the Story schema.
- **`server/routes/stories.js`**: `GET /` now filters by `moderationStatus` (defaults to `approved`, accepts `?status=` query param). `POST /create` sets new stories to `pending`. Added `PATCH /:id/moderate` for admin approval/rejection.
- **`app/admin/moderation/page.tsx`** [NEW]: Admin-only moderation queue page with approve/reject UI for pending stories.

### Real Data Integration

- **`scripts/seed.js`**: Rewritten with 10 users (including admin) and 10 diverse stories (8 approved, 2 pending) for development and testing.
- **`components/story-feed.tsx`**: Replaced hardcoded mock data with live fetch from `/api/v1/stories?limit=6`. Added loading skeleton placeholders and empty state.
- **`components/community-feed.tsx`**: Fixed broken API URL (was `\${}` escaped template literal + non-existent `/api/feed` endpoint → now properly interpolates `NEXT_PUBLIC_API_URL` and fetches from `/api/v1/stories`).

### Cloudflare Worker — D1 Feeds (Trending & Notifications)

- **`cf-worker/schema.sql`**: Added `trending_stories` table (`story_id`, `score`, `period`, indexed by `period + score DESC`) and `notifications` table (`id`, `user_id`, `type`, `title`, `body`, `read`, `metadata`, indexed by `user_id + read + created_at`).
- **`cf-worker/src/routes/feeds.ts`** [NEW]: Hono route group — `GET /api/feeds/trending`, `GET /api/feeds/notifications/:userId`, `POST /api/feeds/notifications/:id/read`, `POST /api/feeds/notifications/mark-all-read`.
- **`cf-worker/src/index.ts`**: Imported and mounted feeds route at `/api/feeds`.
- **`lib/feeds-client.ts`** [NEW]: Frontend helper — `fetchTrending()`, `fetchNotifications()`, `markNotificationRead()`, `markAllNotificationsRead()`. Tries CF Worker URL first (`NEXT_PUBLIC_CF_WORKER_URL`), falls back to Express backend.

### New Pages

- **`app/notifications/page.tsx`** [NEW]: Notifications list page with type-aware icons, unread count badge, mark-as-read, and mark-all-read functionality. Fetches from CF Worker D1 feeds endpoint.

### Bug Fixes — 2026-03-01

- **Broken Logger Imports**: Fixed `Cannot find module '../lib/logger'` crash in `server/routes/helpbot.js`, `server/routes/feed.js`, and `server/routes/settings/profile.js`. All three files referenced `../lib/logger` (or `../../lib/logger`) but the module lives at `server/utils/logger.js`. Updated import paths accordingly.
- **Feed Route Error Handling**: Improved `server/routes/feed.js` — added 10s timeout to the CF Worker proxy call, fixed error logging that was printing `undefined` instead of the actual error message, and changed response status from 500 to 502 (Bad Gateway) for upstream failures.
- **Dead Romance Genre Image**: Replaced `escapetoromance.com` image URL (timing out / unreachable) with a working Unsplash image in `app/page.tsx` and `app/genres/page.tsx`. Removed `escapetoromance.com` from `next.config.js` `remotePatterns`.
- **Hydration Mismatch Fix**: Fixed React hydration error ("Text content does not match server-rendered HTML") caused by `MadhavaHelpBot` rendering `new Date().toLocaleTimeString()` at module level during SSR. The timestamp was baked into server HTML then differed on the client (e.g. "02:48 PM" vs "02:49 PM"). Fixed by deferring timestamp rendering to client-only with an `isMounted` pattern and `suppressHydrationWarning`. This also resolved the cascading CSS MIME type error that occurred when hydration crashed.

### Swagger API Documentation Overhaul

- **Comprehensive Swagger Coverage**: Added `@swagger` JSDoc annotations to **10 route files** covering **30+ endpoints** that were previously undocumented in the Swagger UI at `/api/docs`.
  - `server/routes/ai.js` — AI generate and analyze endpoints
  - `server/routes/feed.js` — Public story feed proxy endpoint
  - `server/routes/helpbot.js` — MADHAVA AI helpbot chat endpoint
  - `server/routes/users.js` — 4 user profile endpoints (self, by ID, by wallet, update)
  - `server/routes/sdk.js` — SDK health and docs endpoints
  - `server/routes/settings/profile.js` — Profile get/update settings
  - `server/routes/settings/notifications.js` — Notification preferences get/update
  - `server/routes/settings/privacy.js` — Privacy settings get/update
  - `server/routes/settings/wallet.js` — Wallet connection get/update
- **Expanded Swagger Config** (`server/backend.js`): Added 11 tag groups (Health, Authentication, Stories, AI, Users, Feed, Helpbot, Settings, NFT, Comics, SDK), reusable `Error` and `Pagination` schemas, API contact/license info, and expanded `apis` glob to `['./routes/*.js', './routes/**/*.js', './backend.js']` to include nested `settings/` routes.

### Health Endpoint Improvements

- **Smart No-DB Mode**: Health endpoint (`/api/health`) now reports `healthy` when `MONGODB_URI` is not configured instead of falsely reporting `degraded`. Only shows `degraded` when the DB is configured but the connection failed.
- **Rich Diagnostics**: Health response now includes uptime, memory usage (RSS, heap), service statuses (API, database, helpbot), and descriptive notes explaining connection state.
- **Swagger Annotations**: Added `@swagger` JSDoc to `/api/health`, `/api/health/db`, and `/api/health/bot` endpoints.

### Backend & API Routing Fixes

- **Backend Versioning**: Bumped the Render backend API package version to `1.2.0`.
- **Feed API Endpoint [NEW]**: Added `server/routes/feed.js` to securely proxy requests to the Cloudflare D1 database, resolving persistent `/api/feed` 404 errors on the frontend.
- **MADHAVA Bot API Proxy [NEW]**: Added `server/routes/helpbot.js` to the Render backend to pass `GROQ_API_KEY` authenticated requests to the Cloudflare Worker, fixing the `/api/helpbot/chat` 405 error. 
- **DB Health Endpoint Fix**: Fixed `/api/health/db` route resolution resolving a frontend 404.
- **Bot Health API Endpoint [NEW]**: Implemented `/api/health/bot` on the Render backend to specifically test Groq AI Bot availability.
- **Cloudflare Story Sync**: Modified `server/routes/stories.js` to automatically proxy new MongoDB story creation payloads to the Cloudflare Worker via `axios.post`, keeping D1 fully synced in real-time.

### Frontend UI & State Enhancements

- **Discover Worlds Fix**: Removed the duplicate mapping block that was causing genres to appear twice in the grid layout.
- **Trending Stories Error State**: Suppressed the scary "Something Went Wrong: 404" block for empty feed arrays. It now correctly shows a friendly "No Stories Yet" CTA until stories are created. Real 5xx errors still trigger the error block.
- **Dynamic AI Health Status**: The Footer "Groq AI" label and MADHAVA Help Bot now check real backend health routes before displaying "System Operational" or "System Offline," preventing false marketing claims when services are down.
- **Create Story CTA Redirect**: Updated the "Start Creating" buttons to navigate directly to `/create/ai-story` (the active creator form) instead of the empty layout wrapper at `/create`.
- **Profile D1 Sync**: Enhanced `profile-form.tsx` to push essential profile fields (Avatar, Username) to the Cloudflare Worker (`/api/profiles`) immediately after saving to Supabase. This ensures feed items sourced from Cloudflare D1 reflect real-time profile data.
- **Dual DB Profile Sync**: Upgraded `profile-form.tsx` to explicitly upsert profile changes into the Supabase PostgREST `profiles` table in addition to Auth and Cloudflare, ensuring comprehensive global consistency.
- **Navigation UX**: Moved the "Top Creators" link from the Main Navigation Header to the Footer section under Explore.
- **Bot Health UI Polling**: Updated the frontend Helpbot (`components/madhava-helpbot.tsx`) to poll the specific bot health route.
- **Service Worker Patch**: Created a minimal `public/sw.js` to intercept frontend PWA registration attempts gracefully, preventing browser console 404 logs.

#### Deleted — Unnecessary Files & Directories

- **`GroqTales/`**: Removed duplicate nested project scaffold (had its own `package.json`, `next.config.js`, etc.) — never imported by root project.
- **`path/to/your/`**: Removed accidental placeholder directory containing `file.css` and `file.html`.
- **`deployment/`**: Removed empty directory (contents were deleted during Cloudflare migration).
- **`temp.md`**: Removed scratch PR template file.
- **`app/test-buttons/`**: Removed dev-only test page (`layout.tsx` + `page.tsx`).
- **`components/nft-purchase.tsx`**: Removed empty 0-byte placeholder file.
- **`components/ui/tooltip.tsx.backup`**: Removed backup file.
- **`.zap/`**: Removed ZAP security scan artifact (`rules.tsv`).
- **`.npm-cache/`**: Removed local npm cache directory.
- **`.DS_Store`**: Removed macOS filesystem artifact.
- **Docker files**: Removed `Dockerfile`, `docker-compose.yml`, `.env.docker`, `.dockerignore` — project fully migrated to Cloudflare Pages + Render.

#### Changed — Config Consolidation

- **Merged `tailwind.config.ts` into `tailwind.config.js`**: Moved comic `fontFamily`, `boxShadow`, `borderWidth`, `spin-slow` keyframes, and `shimmer` keyframes/animations into the primary `.js` config. Added `./src/**/*.{js,ts,jsx,tsx,mdx}` to content paths. Deleted the duplicate `tailwind.config.ts`.
- **Removed `yarn` from `dependencies`**: The project uses npm; `yarn@^1.22.22` was incorrectly listed as a production dependency.
- **Updated `.gitignore`**: Added `GroqTales/` and `path/` to prevent re-creation of accidental nested dirs. Removed duplicate `.DS_Store` entry.

#### Files Deleted
`GroqTales/`, `path/`, `deployment/`, `temp.md`, `.zap/`, `.npm-cache/`, `.DS_Store`, `app/test-buttons/`, `components/nft-purchase.tsx`, `components/ui/tooltip.tsx.backup`, `Dockerfile`, `docker-compose.yml`, `.env.docker`, `.dockerignore`, `tailwind.config.ts`

#### Files Modified
`tailwind.config.js`, `package.json`, `.gitignore`, `CHANGELOG.md`, `VERSION`

### New Feature — MADHAVA Help Bot (Cloudflare Workers AI)

- **AI Help Bot**: Introduced **MADHAVA**, a floating AI-powered help bot available on every page of the GroqTales platform.
  - Uses the `@cf/fblgit/una-cybertron-7b-v2-bf16` model via **Cloudflare Workers AI**.
  - Contains a comprehensive knowledge base covering every aspect of GroqTales: features, story creation, NFT minting, wallet setup, troubleshooting, project structure, deployment, contributing, security, and more.
  - Supports multi-turn conversations (last 10 turns retained for context).
  - Input validation and rate limiting (max 2000 characters per message).
- **Backend**: Added `ai` binding to `cf-worker/wrangler.jsonc`. Created `cf-worker/src/routes/helpbot.ts` with Hono route at `/api/helpbot/chat`. Updated `cf-worker/src/index.ts` with `AI` binding and helpbot route.
- **Frontend**: Created `components/madhava-helpbot.tsx` — premium glassmorphic floating chat widget with pulsing FAB, slide-in panel, typing indicator, auto-scroll, and responsive design. Added ~390 lines of styles to `app/globals.css`. Mounted globally in `app/layout.tsx`.

### Code Quality Sweep

- Fixed escaped template literals (`\${}` → `${}`) in **10 components** (20 fetch calls) so `NEXT_PUBLIC_API_URL` interpolates correctly at runtime: `footer.tsx`, `trending-stories.tsx`, `story-generator.tsx`, `user-nav.tsx`, `web3-provider.tsx`, `notifications-settings.tsx`, `privacy-settings.tsx`, `profile-form.tsx`, `story-comments-dialog.tsx`, `create/page.tsx`.
- **`app/auth/callback/page.tsx`**: Removed duplicate `mt-4` Tailwind class (only `mt-8` remains).
- **`components/user-nav.tsx`**: Fixed hash function no-op `hash = hash & hash` → `hash |= 0` for proper 32-bit integer coercion.
- **`cf-worker/src/routes/stories.ts`**: Story IDs are now generated server-side via `crypto.randomUUID()` instead of trusting client-provided `body.id`.
- **`components/settings/profile-form.tsx`**: Updated from `/api/settings/profile` to `/api/v1/settings/profile`. Added Bearer token auth from Supabase session.
- **`docs/PIPELINES.md`**: Updated admin auth references from `x-admin-id` header to `Authorization: Bearer <token>`.

### SEO

- **`public/sitemap.xml`** [NEW]: Comprehensive XML sitemap covering 19 URLs with appropriate change frequencies and priorities.
- **`public/robots.txt`** [NEW]: Proper robots.txt allowing public page crawling, disallowing API/auth/private routes, referencing the sitemap, and blocking AI scrapers.
- **`.gitignore`**: Removed `sitemap*.xml`, `robots.txt`, and `temp.md` from ignore list so these files are tracked in version control.

### Bug Fixes & Infrastructure

- **Exhaustive Security Sweep**: Addressed 10 critical security findings across the repository: secured unprotected Cloudflare KV routes with Admin secrets, overhauled the `cf-worker` Admin middleware to use Bearer tokens instead of trusted headers with row-level affect checks, secured Profile/Story/Marketplace mutation endpoints with JWT authorization, enforced server-side UUID generation for marketplace listings, fixed a dead fallback `baseUrl` injected into the frontend, removed leaked MongoDB credentials from `wrangler.toml`, and alphabetized `.env.example` configurations.
- **Supabase OAuth Callback Recovery**: Restored the missing `app/auth/callback/page.tsx` required for Supabase OAuth login. Rewrote the OAuth PKCE exchange logic into a pure client component (`'use client'`) using `@supabase/ssr` to ensure full authentication compatibility with Cloudflare Pages edge deployments. Removed the `rm -rf app/auth/callback` destructive command from the `cf-build` script.
- **Dynamic API Routing Fix**: Mass-injected `process.env.NEXT_PUBLIC_API_URL` prefix into all 16 client-side `fetch('/api/...)` calls across the `app/` and `components/` directories. This prevents 404 errors on Cloudflare Pages static exports by ensuring fetches route to the external Render/Cloudflare Worker backend instead of the static frontend host.
- **ServiceWorker Registration Fix**: Created a minimal, pass-through `public/sw.js` file to intercept Next.js PWA background registration attempts, silencing persistent 404 Not Found console errors on Cloudflare Pages.
- **Cloudflare Pages Static Export Fix**: Resolved `output: 'export'` build failure caused by missing `generateStaticParams()` on dynamic routes. Next.js static export requires every `[param]` route to explicitly return at least one path (e.g. `[{ id: 'default' }]`) or the build fails with a generic missing error.
  - **`app/nft-marketplace/comic-stories/[id]/page.tsx`**: Added default static params and `dynamicParams = false`.
  - **`app/nft-marketplace/text-stories/[id]/page.tsx`**: Added default static params and `dynamicParams = false`.
  - **`app/profile/[username]/page.tsx`**: Added default static params and `dynamicParams = false`.
  - **`app/stories/[id]/page.tsx`**: Added `dynamicParams = false`.
  - **`app/genres/[slug]/page.tsx`**: Added `dynamicParams = false`.
- **Static Prerender Fix (Lucide Icons)**: Fixed `TypeError: u is not a function` occurring during static generation for `/genres/[slug]`. This was caused by importing icons from the `lucide-react` barrel file inside a data object (`genres` array) used across Server and Client boundaries. Replaced with simple inline SVGs.
- **Static Prerender Fix (Cookies API)**: Fixed `NEXT_STATIC_GEN_BAILOUT` occurring in `app/settings/page.tsx`. `output: export` does not support dynamic Server Components that read cookies using the Supabase client because cookies only exist per-request on a live server. Removed the server-side logic and simplified it to just return `<SettingsClient />` to handle auth purely on the client.

- **Database Plan Migration**: Updated the PostgreSQL database plan in `render.yaml` from the legacy `starter` tier to the currently supported `free` tier to resolve dynamic deployment issues on Render.
- **Cloudflare Pages Build Fix**: Resolved `cross-env: not found` error that caused all Cloudflare Pages deployments to fail with exit code 127. `cross-env` was listed in `devDependencies` but Cloudflare's build environment sets `NODE_ENV=production` before `npm install`, skipping devDep installation. Replaced `cross-env NEXT_PUBLIC_BUILD_MODE=true` with POSIX inline syntax (`NEXT_PUBLIC_BUILD_MODE=true next build`) in both `build` and `cf-build` scripts — `wrangler.toml` already injects this variable for preview/production environments, making `cross-env` redundant.
- **Cloudflare Build Dependencies Fix**: Moved `tailwindcss`, `autoprefixer`, `postcss`, `typescript`, `@cloudflare/next-on-pages`, `@types/react`, `@types/react-dom`, `@types/node`, and `eslint-config-next` from `devDependencies` to `dependencies` so they are installed when Cloudflare Pages runs `npm install` with `NODE_ENV=production`.
- **Static Export for Cloudflare Pages**: Replaced `@cloudflare/next-on-pages` adapter with Next.js static export (`output: 'export'`). The adapter required all routes to use Edge Runtime, which is incompatible with Node.js API routes (MongoDB/Mongoose). Since API routes run on Render, Cloudflare only serves the static frontend. Updated `wrangler.toml` output dir to `out/`, updated `cf-build` script to remove the `app/api` directory before building (to prevent Next.js trying to build Node.js API routes), conditionally disabled headers/redirects/rewrites (unsupported with static export), and added `public/_redirects` for SPA fallback routing.
- **Typewriter Animation Fix**: Resolved a timing bug in the `useTypewriter` hook within the Hero section (`app/page.tsx`). The animation now properly dynamically adjusts speed between the typing and deleting phases by utilizing recursive `setTimeout` logic instead of a fixed-interval `setInterval`, creating a smoother, more realistic typing effect.
- **PR CI Workflow**: Added `.github/workflows/pr-ci.yml` — automated GitHub Actions workflow that runs lint, unit tests, and a full Cloudflare Pages build check (without deploying) on every PR targeting `main`.
- **CI Workflow Fixes**: Fixed all failing GitHub Actions workflows across 7 files — replaced `npm ci` with `npm install --legacy-peer-deps` (3 workflows), removed `cache: 'npm'` that requires a `package-lock.json` committed to the repo (all workflows), and replaced `node-version-file: '.nvmrc'` with explicit `node-version: '20'`.
- **Preview Comment Fix**: Fixed `cloudflare-preview.yml` PR comment — SHA `.slice(0,7)` was rendering as literal text instead of executing as JS; branch name from `github.head_ref` was injected unsanitized. Both values now computed as proper JS variables via `process.env` with markdown-dangerous characters stripped.

### Infrastructure — Migration from Vercel/Netlify to Cloudflare Pages

#### Removed

- **`vercel.json`**: Vercel deployment config file deleted — Cloudflare Pages is now the primary hosting platform.
- **`netlify.toml`**: Netlify deployment config file deleted — no longer required.
- **`deployment/vercel/`**: Entire Vercel-specific deployment directory removed.
- **`scripts/prepare-vercel.js`**: Vercel pre-build hook script deleted.
- **`@vercel/analytics`**: Removed from `dependencies` — Vercel-only analytics package stripped.
- **`@vercel/speed-insights`**: Removed from `dependencies` — Vercel-only performance monitoring stripped.
- **`<SpeedInsights />`** and **`<Analytics />`** JSX components removed from `app/layout.tsx`.

#### Changed

- **`package.json`**: Version bumped to `1.3.8`; `vercel-build` script replaced with `cf-build` (maps to `npm run build`); `prepare-vercel` script removed.
- **`app/layout.tsx`**: `VERCEL_URL` environment variable fallbacks replaced with `CF_PAGES_URL` (Cloudflare Pages runtime variable); default image/splash URLs point to `groqtales.xyz`.
- **`VERSION`**: Updated to `1.3.8`.
- **`README.md`**: Tech Stack updated (`Hosting: Cloudflare Pages`); Vercel/Netlify references removed.
- **`docs/`** and **`wiki/`**: All deployment references updated to Cloudflare Pages.

#### Added

- **`wrangler.toml`**: Cloudflare Pages/Workers project configuration added.
- **`MIGRATION-TO-CLOUDFLARE.md`**: Migration guide documenting how to deploy to Cloudflare Pages, configure env vars, set up the custom domain `groqtales.xyz`, and troubleshoot common issues.

### Bug Fixes / Behavioral Notes

- Analytics and speed monitoring are no longer injected — the removed Vercel packages were no-ops outside of Vercel infrastructure. Cloudflare Web Analytics can be enabled from the Cloudflare dashboard without any code changes.
- `NEXT_PUBLIC_URL` and related image URL defaults now fall back to `groqtales.xyz` instead of the old `groqtales.com` placeholder.

### Bug Fix — Version Always Displayed as 1.0.0 in Deployed Builds

**Problem:** The deployed app always showed `1.0.0` in the footer and anywhere `appVersion` was consumed, regardless of what the `VERSION` file contained.

**Root Cause:** `app/layout.tsx` was calling `getAppVersion()` which used `fs.readFileSync(path.join(process.cwd(), 'VERSION'), 'utf8')` at **runtime**. Cloud deployment platforms (Cloudflare Pages, etc.) do not guarantee that arbitrary source files are present in the filesystem at runtime — only the compiled `.next/` bundle is deployed. When the read failed, the function returned the hard-coded fallback `'1.0.0'`. Additionally, the `defaultEnvVars` block in the same file also defaulted `NEXT_PUBLIC_VERSION` to `'1.0.0'`.

**Fix:**
- `next.config.js`: Added a `resolveAppVersion()` function that reads the `VERSION` file and falls back to `package.json.version` **at build time** (Node.js has full filesystem access during the build). The resolved version is exposed as `env.NEXT_PUBLIC_VERSION` which Next.js inlines into the compiled bundle as a constant — behaves like a compile-time `#define`.
- `app/layout.tsx`: Removed the `getAppVersion()` runtime function entirely. `appVersion` is now `process.env.NEXT_PUBLIC_VERSION ?? '?.?.?'`. The sentinel `'?.?.?'` is intentionally ugly so a misconfigured build is immediately visible rather than silently defaulting to an old version string.
- Removed the stale `NEXT_PUBLIC_VERSION: '1.0.0'` default from the `defaultEnvVars` block.

**How to keep versions in sync going forward:**
1. Update the `VERSION` file (single source of truth)
2. Update `package.json` `"version"` to match
3. Add a `CHANGELOG.md` entry
4. Run `npm run build` — the build log will print `[next.config.js] Resolved app version: X.Y.Z`
5. The footer and all other version references will automatically show the correct version in the deployed bundle

### Bug Fix — Cloudflare Pages Deployment Showing "Page Does Not Exist"

**Problem:** Cloudflare Pages deployed successfully but served a blank "page does not exist" error. The Cloudflare build log reported: *"A Wrangler configuration file was found but it does not appear to be valid… make sure the file is valid and contains the `pages_build_output_dir` property."*

**Root Causes (3):**
1. `wrangler.toml` used the Workers `[build]` table, which is **invalid for Pages**. Cloudflare Pages ignores it.
2. `wrangler.toml` was missing `pages_build_output_dir` — the mandatory property for Cloudflare Pages. Without it the build step is skipped entirely and Cloudflare serves from `/` (empty).
3. The `@cloudflare/next-on-pages` adapter was referenced in comments but not installed or invoked — it's required to transform Next.js App Router output into a Cloudflare-compatible format.

**Fix:**
- `wrangler.toml`: Removed the invalid `[build]` table; added `pages_build_output_dir = ".vercel/output/static"` at the top level (the adapter's output directory).
- `package.json`: Updated `cf-build` script to `NEXT_PUBLIC_BUILD_MODE=true next build && npx @cloudflare/next-on-pages@1` (POSIX inline env assignment). Added `@cloudflare/next-on-pages@^1.13.12` to dependencies.
- `next.config.js`: Added `setupDevPlatform()` call (guarded to `NODE_ENV === 'development'`) so Cloudflare bindings are available during local dev with `wrangler pages dev`.
- `public/_headers`: Created Cloudflare Pages `_headers` file for edge-level security headers and static asset caching (mirrors the security headers in `next.config.js`).

**Cloudflare Pages dashboard settings (must be set manually):**

| Setting | Value |
|---|---|
| Build command | `npm run cf-build` |
| Build output directory | `.vercel/output/static` |
| Root directory | `/` (repo root) |
| Node.js version | `20` |

### GitHub Actions — Workflows Updated for Cloudflare Pages

#### `deployment.yml` — Full Rewrite
- Removed all Vercel CLI steps (`vercel pull`, `vercel build`, `vercel deploy`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `VERCEL_TOKEN` secrets)
- Now uses `cloudflare/wrangler-action@v3` to deploy `.vercel/output/static` to Cloudflare Pages production
- Build step runs `npm run cf-build` (Next.js build + `@cloudflare/next-on-pages` adapter)
- Required GitHub secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` (see setup steps below)

#### `cloudflare-preview.yml` — New Workflow
- Deploys a unique Cloudflare Pages preview URL for every PR targeting `main`
- Preview URL posted as a PR comment (updates in place on re-push, never duplicates)
- Cleans up the preview branch deployment when PR is closed

#### `lighthouse-ci.yml` — Fixed Hardcoded Version
- Removed hardcoded `NEXT_PUBLIC_VERSION: '1.0.0'` from both build and run `env` blocks
- Added a step to read the canonical version from the `VERSION` file: `APP_VERSION=$(cat VERSION)` → `$GITHUB_ENV`

#### Required GitHub Secrets to Add
Go to **GitHub → IndieHub25/GroqTales → Settings → Secrets and variables → Actions**:

| Secret Name | Value |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token with Pages edit permission |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID (from Cloudflare dashboard) |
| `NEXT_PUBLIC_API_URL` | `https://groqtales-backend-api.onrender.com` |
| `GROQ_API_KEY` | Your Groq API key |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` | WalletConnect project ID |

> **How to create a Cloudflare API token:**  
> Cloudflare dashboard → My Profile → API Tokens → Create Token → use the "Edit Cloudflare Pages" template → scope to your account → copy the token.

---

## [1.3.7] - 2026-02-24

### Bug Fixes & Documentation

- **Merge Conflicts Resolved**: Resolved UI and structural conflicts in `app/dashboard/page.tsx`, `app/nft-gallery/page.tsx`, `app/stories/[id]/page.tsx`, `components/ai-story-generator.tsx`, `components/community-feed.tsx`, and `components/header.tsx` by adopting the latest local cinematic UI redesigns over `origin/main`.
- **README Modernization**: Replaced top deployment badges with a clean GroqTales logo-centered layout, added "Built by Indie Hub" credit, and integrated a GitHub stargazers request to improve premium branding.
- **Wiki Standardization**: Injected the GroqTales logo header systematically across all Markdown files in the `wiki/` directory for visual consistency.

### Major Features - Cinematic Page Overhauls & Auth Flow

- **Authentication Shift**: Migrated explicit "Connect Wallet" main navigation interaction to a comprehensive, dedicated Auth flow using Supabase.
- **New Auth Pages**: Created highly aesthetic, CRM-style animated `/sign-in` and `/sign-up` pages via Framer Motion matching the comic/GenZ theme.
- **Multi-modal Login**: Integrated Email/Password, Google OAuth (Gmail), and Web3 Wallet connect options directly within the new Auth interface.
- **Story Creation**: Refactored `/create/ai-story` into a cinematic glassmorphic interface with clear step-by-step visual indicators and advanced customization accordions. Corrected parser syntax error in tabs.
- **Story Detail & NFT View**: Redesigned `/stories/[id]` to feature a 3D rotating NFT hero section and an immersive, distraction-free "Reading Mode".
- **NFT Gallery**: Revamped `/nft-gallery` with a live activity ticker, masonry layout, and fluid hover animations matching the cinematic aesthetic.
- **Community Feed**: Overhauled `/community` with an integrated XP tracker, "Showcase" section for favorite NFTs, and modern timeline feed. Connected feed to real-time Supabase Database, removing mock data.
- **Clean Animations**: Integrated `framer-motion` layout animations and unified interaction micro-animations across all reconstructed pages.
- **Header Responsiveness Fix**: Lowered the breakpoint threshold for the Navigation menu collapse from `xl` to `lg` so that Mac/Standard laptop screens see the full row of navigation items instead of the mobile hamburger menu.

### Security, Loading & Access Control Enhancements

- **Aesthetic Loading Screen**: Added `<GlobalLoadingWrapper>` dynamically inside root layout to transition seamlessly across pages. Elevated the global loading visual with orbital rings.
- **Next Config Image Security**: Expanded `remotePatterns` in `next.config.js` to whitelist numerous external CDNs.
- **Access Rules & Steppers**: Added an 'Access Control & Security' card to the Creator Dashboard outlining specific Off-Chain roles (Reader vs Creator) and On-Chain requirements (Minting, AI tools).
- **Security Notes & Last Login**: Integrated a security warning message on the dashboard and implemented a 'Last Login' timestamp indicator in the User Nav dropdown.
- **Global Emote Removal**: Stripped all emojis and non-cinematic UI elements from the homepage, auth flows, footer, and genres explorer for a consistent premium aesthetic.
- **Security Documentation**: Updated `SECURITY.md` to reflect version 1.3.7 as the latest, mapping Supabase Auth changes and new UI rules standard.

## [1.3.5] - 2026-02-21

### Major Architecture Change: Supabase Migration

- **Database Engine**: Fully migrated from MongoDB to PostgreSQL via Supabase.
- **Authentication**: Replaced NextAuth.js with Supabase Auth (SSR clients + middleware).
- **Core Models Refactored**:
  - `stories` & `user_interactions` mapped correctly for the feed.
  - `royalty_configs`, `creator_earnings`, and `royalty_transactions` fully off-chain tracked via Supabase.
- **Legacy Removal**: Safely commented out `Mongoose` schemas and active connections to prevent build collisions while keeping types intact.
- **Improved Data Integrity**: Shifted to explicit Row Level Security (RLS) rules and robust primary/foreign key mappings (UUID).
- **Dependency Fixes**: Fixed broken 404 package dependencies (e.g. `concat-stream` github link) preventing fresh installations.

### Fixed

- **Vercel Deployment Crash (npm ci)**: Switched Vercel install command from `npm ci` to `npm install --legacy-peer-deps` permanently due to persistent ERESOLVE and missing dependency errors in lockfile synchronization within the Vercel build environment.
- **Vercel Deployment Crash (Spline 3D)**: Added `transpilePackages` for `@splinetool/react-spline` and `@splinetool/runtime` in `next.config.js` so Next.js properly compiles Spline's class inheritance chain through its SWC pipeline instead of treating them as pre-compiled externals
- **Resilient Spline Loading**: Added `.catch()` fallback to the Spline dynamic import in `app/page.tsx` — if the 3D model fails to load in any environment, the page gracefully degrades to the gradient background instead of crashing
- **Featured Creators Validation**: `components/featured-creators.tsx` now validates creator-shaped objects (requires `username`/`followersCount`/`profileImage`) instead of fabricating metadata; non-matching items are filtered out
- **Footer Health Indicator**: Wired the static "Online" indicator in `components/footer.tsx` to the real `/api/health/db` endpoint — now dynamically shows Online/Degraded/Offline/Checking state
- **Trending Stories Error Handling**: `components/trending-stories.tsx` now surfaces the actual error message (instead of hiding it behind "No Stories Yet") and provides a Retry button
- **Spline Guide Markdown**: Added `text` language identifiers to unlabeled fenced code blocks in `docs/SPLINE_GUIDE.md` (markdownlint MD040)
- **Changelog Deduplication**: Merged duplicate `## [1.3.5]` headers into a single section
- **Feed API Static Render Fix**: Added `export const dynamic = 'force-dynamic'` to `app/api/feed/route.ts` — route uses `request.url` for query params, which requires dynamic rendering
- **Missing 404 Page**: Created `app/not-found.tsx` with comic-style 404 page matching the site theme
- **ServiceWorker 404**: Created `public/sw.js` minimal stub to prevent registration failure
- **Dialog Accessibility**: Added hidden `DialogDescription` to `components/ui/dialog.tsx` to satisfy Radix `aria-describedby` requirement
- **Hero Background**: Replaced Spline 3D with `background.jpeg` for the hero section — works in both light and dark modes with overlay
- **Global Loading Screen**: Created `app/loading.tsx` using the existing `LoadingScreen` component for consistent loading across all pages
- **Scroll Indicator Accessibility**: Added `aria-hidden="true"` to the decorative scroll indicator in `app/page.tsx`
- **Trending Stories HTTP Errors**: `components/trending-stories.tsx` now surfaces 4xx/5xx responses as errors instead of silently showing empty state
- **Trending Stories AbortController**: Added `AbortController` cleanup to prevent state updates on unmounted components
- **Featured Creators HTML Validity**: Used `Button asChild` pattern in `components/featured-creators.tsx` to avoid invalid `<a><button>` nesting
- **Animated Genre Marquee**: Replaced the 6-genre icon grid with a 12-genre animated marquee using real genre images, infinite right-to-left scrolling, hover-pause, edge fade masks, and `prefers-reduced-motion` support
- **Adventure Image Fix**: Replaced broken europeanstudios.com hotlink with working Unsplash adventure image
- **Genre Page Overhaul**: Rewrote `app/genres/page.tsx` — genre cards now have real images, expand/collapse famous works, "Write a Story" CTAs, and an interactive "Finding Your Genre" quiz (4 questions, emoji, progress bar, results)
- **Documentation Page Overhaul**: Rewrote `app/docs/page.tsx` — step cards with numbered badges, quick links grid, expandable FAQ accordion with emojis, wallet setup guide, minting flow, and community CTA banner
- **Duplicate Trending Header**: Removed redundant "Trending Stories" heading from `components/trending-stories.tsx` since the home page already provides its own "Trending Now" header
- **Community Loading Screen**: Updated Community Hub page to use full-screen loading with `fullScreen` and `size="lg"` props, consistent with the global loading screen

### Documentation & Professional Standards

- **Created Professional Pull Request Template (`temp.md`)**: Implemented a standardized, professional PR template for Indie Hub Org members.
- **Indie Hub Org Alignment**: Added mandatory acknowledgement for official membership and professional work line.
- **Clean Documentation**: High-quality, emoji-free, and streamlined template for internal project contributions.

### Homepage & Footer UI Refinements — Readability, Layout, and Spline Background

#### Changed
- **Spline 3D Background**: Transitioned from hero-only to a `fixed` full-page background, visible through semi-transparent sections.
- **CTA Section**: Removed gradient background, simplified to `bg-background/90` with backdrop-blur.
- **CTA Button**: Removed sparkle icon, enforced pure comic-style theme with Bangers font.
- **Neon Sign**: Optimized glow radii and colors for significantly improved readability.
- **Footer Brand**: Replaced logo image/container with bold italic "GroqTales" branded text.
- **Footer Layout**: Moved copyright and status info below the neon sign for a more balanced design.

### Security Policy Refresh — 2026-02-21

- **Updated `SECURITY.md`** to reflect current version matrix (1.3.5 latest, 1.3.0 previous, 1.1.0 maintenance, < 1.1.0 EoSS)
- Removed duplicate severity classification tables — consolidated into single authoritative table
- Added **Response Timeline SLA** table (acknowledgement → fix → disclosure)
- Added **"What to Include in a Report"** guidance section
- Documented actual security stack: Helmet, `express-rate-limit`, Zod, `express-validator`, SIWE
- Added **Current Technology Stack** table with versions for Node.js, Next.js, Express, MongoDB, TypeScript, and more
- Expanded **Protecting Your Data** section with HTTPS, JWT, MongoDB encryption, and SIWE details
- Increased coordinated disclosure window from 30 → 90 days for complex High/Critical issues
- Added **Sensitive Information Disclosure** to AI Security Scope (OWASP LLM top 10)

### Documentation & DevOps Refresh — 2026-02-21

- **Merged `README.Docker.md` into `README.md`**: Consolidated all Docker setup, service maps, and deployment guides into the main readme for better visibility
- **Created `docs/SPLINE_GUIDE.md`**: Detailed contributor guide for working with Spline 3D models, including model protection policies, performance rules, and technical implementation details
- **Linked Spline Guide in README**: Added a dedicated section and Table of Contents entry for the Spline 3D Guide
- **Updated README Version**: Bounded project version badge to v1.3.5 in documentation
- **Deleted `README.Docker.md`**: Removed redundant file after merging content into main README

### Professional Website Redesign — Premium Theme, Neon Branding, Centered 3D Hero

#### Added
- **Neon "GROQTALES" Footer Branding**: Large Bangers-font branded heading at the bottom of the footer with a custom `neon-flicker` CSS animation that simulates a faulty neon sign — random blinks, flickers, and steady glow intervals
- **`.neon-sign` CSS utility**: Theme-aware neon glow effect (warm red/orange glow in light mode, cyan/pink bloom in dark mode)
- **`@keyframes neon-flicker`**: Multi-step opacity animation with 30+ keyframe stops for realistic neon sign behavior
- **Header Wordmark**: "GROQTALES" text in Bangers font displayed next to the logo in the header
- **IntersectionObserver for Spline**: Tracks hero section visibility to control Spline model opacity in lower sections
- **Dark Premium Background**: Sitewide `dark-premium-bg` class applied to main layout wrapper — elegant radial gradients on deep navy
- **Feed API Fallback**: `/api/feed/route.ts` now returns 6 high-quality fallback stories when MongoDB is unavailable, ensuring trending stories section always renders
- **Full-width Neon Sign**: GROQTALES neon branding now spans the entire screen width on all devices (phone, tablet, laptop, TV) using `w-screen -ml-[50vw]` breakout technique
- **Fixed Spline 3D**: Model is now `position: fixed` at viewport center — stays in place permanently while content scrolls over it
- **Spline Color Fix**: Removed heavy gradient overlay that was washing out 3D model colors; replaced with thin bottom-only fade
- **Content Layering**: All sections below hero use `bg-background/95 backdrop-blur-sm` for frosted glass effect over the fixed Spline
- **Deferred Spline Loading**: 3D model now loads 1.5s after page paint, fades in smoothly via `onLoad` callback — page content renders instantly
- **Hero Gradient**: Instant animated gradient background (`hero-gradient` CSS class) shows while Spline lazy-loads
- **Removed Badge**: Removed "⚡ AI-Powered Web3 Storytelling" badge from hero section

#### Changed
- **`app/page.tsx`**: Complete hero section redesign — Spline 3D model now centered as full-width background with overlay text (Create/Mint/Share), removed halftone overlay, speech bubble, and star decorations
- **`components/header.tsx`**: Removed circular container (`rounded-full`, `bg-white/10`, `border-2 border-white/20`) from logo — direct placement with `drop-shadow-lg` and clean sizing
- **`components/footer.tsx`**: Added neon "GROQTALES" branding section at the bottom of the footer
- **`app/globals.css`**: Added neon-flicker animation, `.neon-sign` utility class, consolidated `.dark-premium-bg` styles
- **`app/layout.tsx`**: Added `dark:dark-premium-bg` class to main wrapper for sitewide dark theme upgrade, updated favicon to `logo.png`

#### Removed
- Circular logo container in header (rounded-full border styling)
- Halftone dot overlay from home page  
- Speech bubble ("BOOM! 💥") and decorative Star from hero section
- Star icon import from home page
- Old multi-size favicon references replaced with single `logo.png`

#### Files Modified
- `app/page.tsx` — Complete hero section rewrite
- `app/globals.css` — Neon animation and premium background utilities
- `app/layout.tsx` — Dark premium background and favicon
- `components/header.tsx` — Clean logo placement
- `components/footer.tsx` — Neon branding element
- `VERSION` — 1.3.5
- `CHANGELOG.md` — This entry

---

## [1.3.0] - 2026-02-21

### Major Home Page Redesign — Professional Comic Style with Spline 3D

#### Added
- **Spline 3D Hero**: Integrated `@splinetool/react-spline` to load the storybook 3D model from `public/storybook.spline` in the hero section
- **Bangers Display Font**: Added Google Fonts 'Bangers' for comic display headings via `--font-display` CSS variable
- **Stats Bar Section**: Live platform statistics fetched from `/api/health/db` with animated counters and graceful fallback defaults
- **How It Works Section**: Three-step visual flow (Create → Mint → Share) with comic panel styling
- **Why GroqTales Section**: Feature showcase with Lightning-Fast AI, True Ownership, and Vibrant Community cards
- **Explore Genres Grid**: Six genre cards (Sci-Fi, Fantasy, Mystery, Romance, Horror, Adventure) linking to genre pages
- **Gradient CTA Section**: Full-width call-to-action with `var(--gradient-cta)` background
- **New CSS Utilities**: `halftone-overlay`, `speed-lines`, `comic-panel`, `scribble-underline`, `ink-splatter`, `comic-display`, `animate-float`, `animate-wiggle`
- **`spin-slow` animation**: 8-second infinite rotation in `tailwind.config.ts`
- **Comic color palette**: `--comic-yellow`, `--comic-red`, `--comic-blue`, `--comic-purple`, `--comic-green`, `--comic-orange`, `--comic-pink`, `--comic-cyan` CSS custom properties

#### Changed
- **`globals.css`**: Complete rewrite — removed duplicate CSS variable blocks (were overriding the comic theme with generic shadcn defaults), unified color system for light (warm cream #fef9ef) and dark (deep navy #0a0e1a) themes, fixed dark mode `--shadow-color` from white (#f8fafc) to dark rgba value
- **`app/page.tsx`**: Complete rewrite with Spline 3D hero, 6 content sections, all data fetched from real API endpoints
- **`trending-stories.tsx`**: Replaced `getMockTrendingStories()` with real `fetch('/api/feed?limit=6')` call; maps API response to StoryCard props with graceful empty state
- **`featured-creators.tsx`**: Replaced `getMockCreators()` with real API fetch; hides section gracefully when no creators found
- **`app/layout.tsx`**: Removed `comic-dots-animation.js` script tag (replaced by Spline 3D)
- **`tailwind.config.ts`**: Added `spin-slow` keyframes and animation

#### Removed
- `comic-dots-animation.js` script reference from layout (file still exists in public/)
- All hardcoded mock data from `trending-stories.tsx` and `featured-creators.tsx`
- Duplicate `:root` and `.dark` CSS variable blocks from `globals.css`

#### Dependencies
- Added `@splinetool/react-spline` and `@splinetool/runtime` (installed with `--legacy-peer-deps`)

#### Files Modified
- `app/globals.css` — Complete CSS theme rewrite
- `app/page.tsx` — Complete home page rewrite
- `app/layout.tsx` — Removed comic-dots-animation script
- `components/trending-stories.tsx` — API-connected, no mock data
- `components/featured-creators.tsx` — API-connected, no mock data
- `tailwind.config.ts` — Added spin-slow animation
- `package.json` — Version 1.3.0, new dependencies
- `VERSION` — 1.3.0

---

### Off-Chain Royalty Tracking & Creator Revenue Dashboard (Issue #334)

#### Added
- **Database Models**: `RoyaltyConfig`, `RoyaltyTransaction`, `CreatorEarnings` Mongoose schemas in `models/`
- **Service Layer**: `lib/royalty-service.ts` with business logic for configuring, recording, and querying royalties
- **API Endpoints**: 4 new routes under `app/api/royalties/` (configure, earnings, transactions, record)
- **React Hook**: `hooks/use-royalties.ts` with `useCreatorEarnings`, `useCreatorTransactions`, `useRoyaltyConfig`, `useConfigureRoyalty`
- **Dashboard Components**: `components/royalty/` — EarningsOverview, RevenueChart, TransactionHistory, RoyaltyConfigForm
- **Creator Revenue Dashboard**: Full page at `/dashboard/royalties` with wallet-gated access
- **Type Definitions**: `types/royalty.ts` with centralized TypeScript types for all royalty entities
- **Documentation**: `docs/royalty-tracking.md` with architecture, API reference, and usage guide

#### Changed
- **NFT Model** (`server/models/Nft.js`): Added `royaltyPercentage`, `royaltyRecipient`, `royaltyConfigId` fields
- **NFT Mint Flow** (`server/routes/nft.js`): Automatically creates `RoyaltyConfig` on mint with default 5%
- **NFT Buy Flow** (`server/routes/nft.js`): Records royalty transaction and updates creator earnings on purchase
- **Main Dashboard** (`app/dashboard/page.tsx`): Replaced hardcoded earnings with real data from `useCreatorEarnings`
- **NFT Gallery** (`components/nft-gallery.tsx`): Added royalty percentage badge on NFT cards
- **Header Navigation** (`components/header.tsx`): Added "Earnings" link (visible when wallet connected)

#### Files Created
- `models/RoyaltyConfig.ts`
- `models/RoyaltyTransaction.ts`
- `models/CreatorEarnings.ts`
- `lib/royalty-service.ts`
- `app/api/royalties/configure/route.ts`
- `app/api/royalties/earnings/[wallet]/route.ts`
- `app/api/royalties/transactions/[wallet]/route.ts`
- `app/api/royalties/record/route.ts`
- `hooks/use-royalties.ts`
- `components/royalty/earnings-overview.tsx`
- `components/royalty/revenue-chart.tsx`
- `components/royalty/transaction-history.tsx`
- `components/royalty/royalty-config-form.tsx`
- `app/dashboard/royalties/page.tsx`
- `types/royalty.ts`
- `docs/royalty-tracking.md`

#### Files Modified
- `server/models/Nft.js`
- `server/routes/nft.js`
- `app/dashboard/page.tsx`
- `components/nft-gallery.tsx`
- `components/header.tsx`

---

###  Accessibility Improvements - WCAG 2.1 AA Compliance

#### Keyboard Navigation & Focus Management
- **Skip Link**: Added keyboard-accessible skip link to jump to main content
  - Becomes visible on focus for screen readers and keyboard users
  - Located in `app/layout.tsx`
- **Focus Indicators**: Implemented visible focus outlines (3px solid) on all interactive elements
  - Applied to links, buttons, inputs, selects, and textareas
  - Meets WCAG 2.1 AA contrast requirements
  - Added to `app/globals.css`

#### ARIA Labels & Semantic HTML
- **Header Navigation** (`components/header.tsx`):
  - Added `role="navigation"` and descriptive `aria-label` attributes
  - Implemented `aria-current="page"` for active navigation state
  - Added `aria-haspopup` for dropdown menus
  - Logo link and Create button have descriptive labels
- **Footer** (`components/footer.tsx`):
  - Added `role="contentinfo"` to footer
  - Wrapped navigation sections in semantic `<nav>` elements with labels
  - Social media links grouped with `role="group"`
- **Interactive Components**:
  - Mode Toggle: `aria-label="Toggle theme"`
  - User Navigation: Menu trigger and login button labeled
  - Wallet Connect: State-aware labels for connection status
  - Create Story Dialog: Descriptive labels, `aria-pressed` states, and `aria-describedby`
  - Back to Top: Conditional `aria-hidden` when not visible

#### Image Accessibility
- **Avatar Images**: Added descriptive alt text across all components
  - User avatars: `"${username}'s avatar"`
  - Profile pictures: `"${name}'s profile picture"`
  - Wallet identicons: Includes truncated address
- **Content Images**: Story covers and NFT images include titles
- **Decorative Elements**: Marked with `aria-hidden="true"`

#### Files Modified
- Core: `app/layout.tsx`, `app/globals.css`
- Components: `header.tsx`, `footer.tsx`, `mode-toggle.tsx`, `user-nav.tsx`, `wallet-connect.tsx`, `create-story-dialog.tsx`, `back-to-top.tsx`, `story-card.tsx`
- Pages: `app/community/creators/page.tsx`, `app/stories/[id]/page.tsx`, `app/nft-marketplace/comic-stories/page.tsx`

#### Documentation
- Created comprehensive `docs/ACCESSIBILITY.md` documenting:
  - All implemented changes
  - WCAG 2.1 AA compliance checklist
  - Testing recommendations (automated and manual)
  - Impact and benefits
  - Resources for developers

#### Benefits
- ✅ Platform accessible to users with visual, motor, and cognitive impairments
- ✅ Improved SEO through better semantic HTML and alt text
- ✅ Legal compliance with WCAG 2.1 AA standards
- ✅ Enhanced UX for all users with clear focus indicators and logical navigation

_See `docs/ACCESSIBILITY.md` for complete details._

---

## [1.2.9] - 2025-11-24

### Bug Fixes
- **Deployment Fix**: Resolved `npm ci` ERESOLVE error caused by `react-native` peer dependency conflict
  - Added `overrides` in `package.json` to pin `react-native` to `^0.76.0`
  - Added `overrides` for `@noble/curves` to `^1.9.7` to resolve lockfile synchronization issues
  - Ensures compatibility with React 18 and prevents transitive dependencies from pulling in React 19
  - Regenerated `package-lock.json` to reflect the overrides
  - Verified successful `npm ci` and build locally

### Files Modified
- `package.json` - Added `overrides` section
- `package-lock.json` - Regenerated with locked versions

## [1.2.8] - 2025-11-24

### Technical Improvements
- **Concurrent Server Launch**: Configured `npm start` and `npm run dev` to launch both frontend and backend servers together
  - Added `nodemon@^3.0.2` to devDependencies for backend auto-restart during development
  - Verified `concurrently@^9.2.1` package for running multiple processes simultaneously
  - Frontend (Next.js) runs on `http://localhost:3000`
  - Backend (Express.js API) runs on `http://localhost:3001`
  - Both servers start with a single command for improved developer experience

### Bug Fixes
- **ESLint TypeScript Resolver**: Fixed "typescript with invalid interface loaded as resolver" warnings
  - Installed `eslint-import-resolver-typescript` package to properly resolve TypeScript imports
  - Resolved all ESLint import resolution warnings across the codebase
  - ESLint now correctly validates import paths and module resolution
- **Hydration Error Fix**: Resolved "Expected server HTML to contain a matching <button> in <html>" error
  - Moved `<BackToTop />` component inside the `<body>` tag in `app/layout.tsx`
  - Fixed invalid HTML structure that caused hydration failures
- **Footer Styling**: Updated footer logo aesthetics
  - Changed logo background to Charcoal (`bg-neutral-900`)
  - Increased logo size to `w-48 h-48` (192px)

### Developer Experience
- Simplified development workflow - no need to run frontend and backend in separate terminals
- Backend auto-restarts on file changes during development (via nodemon)
- Frontend hot-reloads during development (via Next.js dev server)
- Health check endpoint verified at `http://localhost:3001/api/health`
- Clarified difference between `npm run dev` (development) and `npm start` (production)
- Added comprehensive troubleshooting guide for common issues

### Files Modified
- `package.json` - Added nodemon and eslint-import-resolver-typescript to devDependencies

## [1.2.7] - 2025-11-22


### Bug Fixes
- **Deployment Fix**: Resolved `npm ci` error "Missing: @standard-schema/spec@1.0.0 from lock file"
  - Regenerated `package-lock.json` to properly sync with `package.json`
  - Fixed version mismatch where lock file had `1.0.0-beta.4` but deployment expected `1.0.0`
  - Ensures successful deployment on Vercel and other CI/CD platforms

### Technical Improvements
- Improved package-lock.json integrity and consistency
- Eliminated deployment blocking errors related to dependency resolution

### Files Modified
- `package.json` - Updated version to 1.2.7
- `package-lock.json` - Regenerated to fix dependency version mismatches

## [1.2.6] - 2025-11-22

### Bug Fixes
- **Vercel Deployment Fix**: Resolved `npm ci` package-lock.json sync error that prevented deployment
  - Updated Node.js engine specification from exact version `20.18.0` to `>=20.0.0`
  - Regenerated `package-lock.json` to sync with `package.json` dependencies
  - Fixed missing dependencies: `uploadthing@7.7.4`, `effect@3.17.7`, `@standard-schema/spec@1.0.0`
  - Eliminated Vercel build warnings about unsupported engine version format

### Technical Improvements
- Changed Node.js version constraint to allow flexible minor/patch versions
- Improved compatibility with Vercel's Node.js version selection system
- Ensured package-lock.json stays in sync with package.json

### Files Modified
- `package.json` - Updated engines.node from `20.18.0` to `>=20.0.0`
- `package-lock.json` - Regenerated to sync with package.json

## [1.2.5] - 2025-11-22

### UI/UX Improvements

- **Dropdown Styling Enhancement**: Fixed dropdown menus to have solid light backgrounds with blur effect
  - Changed from transparent to white/95% opacity with backdrop blur
  - Added comic book style border (2px black) and shadow
  - Improved readability and visual consistency
  - Applied to all Select components across the application

### Files Modified

- `components/ui/select.tsx` - Updated SelectContent styling

## [1.2.4] - 2025-11-22

### Major Features - Complete Customization Suite

- **70+ Total Customization Parameters**: Completed the full implementation of all planned story customization options
  - **Character Background**: Added textarea for detailed character backstory
  - **Social Commentary**: Toggle with topic field for thematic social commentary
  - **Mature Content Warning**: Toggle for stories with mature themes
  - **Advanced Story Options**: New accordion section with:
    - Chapter/Section count selection (1, 3, 5, 10 chapters)
    - Foreshadowing level (None, Subtle, Obvious)
    - Symbolism level (None, Subtle, Prominent)
    - Multiple POVs toggle with character count (2-5 POVs)
  - **Inspiration & References**: New accordion section with:
    - "Similar To" field for comparative descriptions
    - "Inspired By" field for author/work references
    - Tropes to Avoid (5 common tropes: Chosen One, Love Triangle, Deus Ex Machina, Amnesia Plot, Evil Twin)
    - Tropes to Include (5 popular tropes: Hero Journey, Mentor Figure, Found Family, Redemption Arc, Underdog Story)
  - **Technical Parameters**: New accordion section with:
    - AI Creativity slider (Temperature: 0.1-1.0)
    - Model Selection (Default, Creative, Precise, Fast)

### UI/UX Enhancements

- Added 3 new collapsible accordion sections with color-coded icons
- Implemented interactive trope selection with visual feedback
- Added conditional fields that appear based on toggle states
- Enhanced form organization with 9 total customization categories
- Maintained comic book aesthetic across all new sections

### Technical Improvements

- Complete state management for all 70+ parameters
- Optimized component structure for large form handling
- Prepared comprehensive parameter collection for AI API integration
- All fields remain optional except the core prompt

### Files Modified

- `components/ai-story-generator.tsx` - Added 300+ lines of new UI components and state management

## [1.2.3] - 2025-11-22

### Major Features

- **Extensive Story Customization**: Completely redesigned AI story generator with 50+ optional parameters
  - Added 6 collapsible customization sections: Characters, Plot & Structure, Setting & World, Writing Style & Tone, Themes & Messages, Content Controls
  - Only prompt field is required - all other fields are optional with smart defaults
  - Character customization: name, count, traits, age, protagonist type
  - Plot controls: type, conflict, arc, pacing, ending, plot twists
  - Setting options: time period, location, world-building depth, atmosphere
  - Writing style: narrative voice, tone, style, reading level, mood, dialogue percentage, description detail
  - Theme selection: primary and secondary themes, moral complexity
  - Content controls: violence level, romance level, language level

### UI/UX Improvements

- Implemented clean accordion-based interface for advanced options
- Added visual indicators and icons for each customization category
- Improved form organization with collapsible sections
- Enhanced user experience with progressive disclosure pattern
- Maintained comic book aesthetic throughout new interface

### Technical Improvements

- Comprehensive state management for all customization parameters
- Built parameter collection system for API integration
- Prepared for future AI model integration with detailed prompt building
- Maintained backward compatibility with existing story generation

### Files Modified

- `components/ai-story-generator.tsx` - Complete rewrite with extensive customization options

## [1.2.2] - 2025-11-22

### Bug Fixes

- **Critical Build Fix**: Resolved 500 Internal Server Error caused by syntax errors in `hooks/use-monad.ts`
  - Fixed nested block comments that prevented TypeScript parser from processing the file
  - Uncommented and restored full functionality of the `useMonad` hook
  - Fixed type mismatch in chainId comparison (string vs number)
  - Applied Prettier formatting to resolve all formatting errors
- **Build Stability**: Application now builds successfully and dev server runs without errors

### Technical Improvements

- Restored complete functionality of Monad blockchain integration hook
- Added proper type handling for chainId comparison across different formats
- Improved code quality with consistent formatting

### Files Affected

- `hooks/use-monad.ts` - Fixed syntax errors, type mismatches, and formatting issues

## [1.2.1] - 2025-11-22

### UI/UX Improvements

- Updated main application logo to `public/logo.png` in header and metadata.
- Enhanced brand consistency across the platform.

## [1.2.0] - 2025-09-05

## [1.1.2] - 2025-08-08

### Patch Summary

Codebase integrity restoration and build stabilization after widespread comment / syntax corruption in multiple UI, hook, and blockchain agent files.

### Technical Improvements (1.1.2)

- Fixed malformed block comments that broke TypeScript parsing across many files (hooks, libs, UI components, onchain agent files)
- Repaired corrupted hook/function declarations (`useChart`, `Skeleton`, `useAgent`, `useMonad`, pagination, chart, logger, API utilities)
- Cleaned duplicated / stray exports and invalid JSX remnants in `stories/page.tsx`
- Normalized JSDoc formatting to prevent future `*/ expected` compiler errors
- Consolidated duplicate exports in chart & pagination components
- Rewrote corrupted `route.ts` for onchain agent (added clean `POST` handler) and created safe temporary replacement

### Bug Fixes (1.1.2)

- Resolved 116 TypeScript build errors (unclosed comments, unterminated regex, unexpected tokens)
- Eliminated invalid mixed hook declarations appended after context creation lines
- Removed duplicated React imports and rogue inline hook definitions inside variable declarations
- Fixed metadata + client component conflict on Stories page
- Ensured all updated files pass `tsc --noEmit`

### Developer Experience (1.1.2)

- Consistent comment style reduces likelihood of parser breakage
- Removed confusing placeholder / duplicated blocks to simplify future diffs
- Introduced safer server/client separation in stories page wrapper

### Files Affected (Representative)

`components/ui/{chart.tsx,pagination.tsx,skeleton.tsx,calendar.tsx,carousel.tsx}`
`hooks/{use-groq.ts,use-monad.ts,use-story-analysis.ts,use-story-summary.ts}`
`src/blockchain/onchain-agent/app/hooks/useAgent.ts`
`lib/{api-utils.ts,constants.ts,transaction-components.ts}`
`app/stories/page.tsx`
`src/blockchain/onchain-agent/app/api/agent/{route.new.ts,create-agent.ts,prepare-agentkit.ts}`

### Notes

- No public API surface changes intended; all changes are internal quality / build health.

---

## [1.1.1] - 2025-08-05

### Major Changes (1.1.1)

- **Production Deployment Focus**: Removed all blockchain/Web3 functionality to focus on core AI storytelling features
- **GROQ-Only Integration**: Eliminated LLAMA support, maintaining only GROQ API for story generation
- **Clean Architecture**: Commented out all onchain scripts and wallet mockups for streamlined deployment

### Technical Improvements (1.1.1)

- **Build Stability**: Fixed all `GROQ_MODELS.LLAMA_3_70B` compilation errors
  - Updated API routes to use existing GROQ models (`STORY_GENERATION`, `RECOMMENDATIONS`, `STORY_ANALYSIS`)
  - Added `generateContentCustom()` function for flexible GROQ API calls
- **TypeScript Fixes**: Resolved parsing errors in dialog components
  - Fixed malformed interface definitions in `story-comments-dialog.tsx` and `story-details-dialog.tsx`
  - Eliminated build-blocking syntax errors

### Blockchain/Web3 Functionality - Temporarily Disabled

- **NFT Minting**: Disabled `app/api/monad/mint/route.ts` - returns 503 status with "temporarily disabled" message
- **Wallet Integration**: Replaced `components/connect-wallet-button.tsx` with placeholder showing "Wallet (Coming Soon)"
- **NFT Marketplace**: Commented out `components/nft-marketplace.tsx` and `components/nft-purchase.tsx`
- **Web3 Provider**: Replaced `components/providers/web3-provider.tsx` with stub implementation
- **Blockchain Services**: Disabled `lib/monad-service.ts` with preserved original code in comments
- **Web3 Hooks**: Removed `hooks/use-web3-auth.ts` completely

### File Changes

- **Removed Files**:
  - `hooks/use-web3-auth.ts` - Web3 authentication hook (completely removed)
- **Modified Files**:
  - `app/api/monad/mint/route.ts` - NFT minting endpoint (disabled)
  - `components/connect-wallet-button.tsx` - Wallet connection (placeholder)
  - `components/nft-marketplace.tsx` - NFT marketplace (disabled)
  - `components/nft-purchase.tsx` - NFT purchasing (disabled)
  - `components/providers/web3-provider.tsx` - Web3 context (stub implementation)
  - `lib/monad-service.ts` - Blockchain service (disabled)
  - `lib/groq-service.ts` - Enhanced with generateContentCustom function
  - `app/layout.tsx` - Uses disabled Web3Provider

### Bug Fixes (1.1.1)

- **API Routes**: Fixed story generation endpoints using undefined GROQ models
- **Component Imports**: Updated all Web3-related component imports to use disabled versions
- **Interface Definitions**: Fixed broken TypeScript interfaces causing parsing errors

### Developer Experience (1.1.1)

- **Code Preservation**: All original blockchain functionality preserved in comments for future restoration
- **Clean Separation**: Blockchain features cleanly disabled without affecting core AI functionality
- **Build Process**: Resolved all compilation errors for successful production deployment

### Deployment (1.1.1)

- **Production Ready**: Application now builds successfully without Web3 dependencies
- **Simplified Stack**: Focus on core AI storytelling features using GROQ API
- **Public Deployment**: Ready for deployment without blockchain complexity

### Migration Notes (1.1.1)

- **Blockchain Features**: All Web3/blockchain functionality is temporarily disabled but preserved in code comments
- **API Changes**: Story generation now exclusively uses GROQ API models
- **Component Behavior**: Wallet and NFT components show "disabled" or "coming soon" messages
- **Future Restoration**: Original blockchain code can be easily restored by uncommenting preserved implementations

---

## [1.1.0] - 2025-08-02

### Major Changes (1.1.0)

- **Codebase Reorganization**: Complete restructuring of project files into organized directories
- **SSR/Deployment Fix**: Resolved critical "document is not defined" errors affecting Vercel deployment
- **Enhanced Security**: Updated security policies and best practices documentation

### New Features (1.1.0)

- **Organized Directory Structure**:
  - Created `src/blockchain/` for Web3 and blockchain-related files
  - Created `src/ai/` for AI model training and processing scripts
  - Created `src/data/` for datasets and training configurations
  - Created `src/tools/` for utility and development scripts
  - Created `deployment/` for deployment configurations
- **Version Management**: Added VERSION file and comprehensive changelog tracking
- **Architecture Documentation**: Enhanced with Mermaid flowcharts and improved organization

### Technical Improvements (1.1.0)

- **SSR Compatibility**: Fixed all server-side rendering issues in React components
  - Protected `window`, `document`, `navigator`, and `localStorage` access with proper guards
  - Added SSR-safe patterns for browser API access
  - Implemented proper client-side hydration patterns
- **Component Stability**: Enhanced reliability of core components:
  - `galaxy-background.tsx`: Fixed animation coordinate calculations for SSR
  - `header.tsx`: Protected scroll event listeners and localStorage access
  - `ai-story-generator.tsx`: Fixed URL parameters, clipboard, and download functionality
  - `admin-login-modal.tsx`: Protected all storage APIs and document access
  - `wallet-connect.tsx`: Fixed clipboard API access patterns

### Bug Fixes (1.1.0)

- **Deployment Errors**: Resolved ReferenceError during static page generation
- **Browser API Access**: Added proper feature detection for all browser-specific APIs
- **Storage Operations**: Protected localStorage and sessionStorage operations
- **Navigation**: Fixed client-side navigation and URL manipulation

### File Organization (1.1.0)

- **Moved Files**:
  - `blockchain_data_fetch.js` → `src/blockchain/`
  - `nft_data_fetch.js` → `src/blockchain/`
  - `clients.ts` → `src/blockchain/`
  - `main.py` → `src/ai/`
  - `train_groq_model.py` → `src/ai/`
  - `requirements.txt` → `src/ai/`
  - Training datasets → `src/data/`
  - Utility scripts → `src/tools/`

### Security Updates (1.1.0)

- **Enhanced Security Policies**: Updated SECURITY.md with current best practices
- **Secure Session Management**: Improved admin authentication with proper token handling
- **Protected API Access**: Added security checks for browser API access

### Documentation (1.1.0)

- **README Enhancement**: Added architecture links and improved navigation
- **Architecture Documentation**: Enhanced with detailed Mermaid diagrams
- **Wiki Integration**: Improved cross-referencing between documentation sections

### Developer Experience (1.1.0)

- **Build Process**: Improved build reliability and error handling
- **Code Organization**: Better separation of concerns and maintainability
- **Development Workflow**: Enhanced with proper file structure and conventions

### Deployment (1.1.0)

- **Vercel Compatibility**: Fixed all deployment blocking issues
- **SSR/SSG Support**: Proper Next.js rendering patterns implemented
- **Production Ready**: Stable deployment configuration established

### Performance (1.1.0)

- **Bundle Optimization**: Improved code splitting and loading patterns
- **Rendering Performance**: Enhanced SSR/client hydration efficiency
- **Resource Loading**: Optimized browser API access patterns

### Migration Notes (1.1.0)

- **File Paths**: Updated import paths to reflect new directory structure
- **Configuration**: Updated build and deployment configurations
- **Dependencies**: Maintained all existing functionality while improving organization

---

## [1.0.0] - 2025-02-04

### Initial Release

- Core GroqTales platform functionality
- AI-powered story generation
- NFT marketplace integration
- Web3 wallet connectivity
- Community features and user profiles
- Admin dashboard and management tools

---

### Version Format

- **Major.Minor.Patch** (e.g., 1.1.0)
- **Major**: Breaking changes or significant new features
- **Minor**: New features, backwards compatible
- **Patch**: Bug fixes and small improvements

### Categories

- **Major Changes**: Significant new features or breaking changes
- **New Features**: New functionality added
- **Technical Improvements**: Code quality and architecture improvements
- **Bug Fixes**: Issues resolved
- **File Organization**: Structure and organization changes
- **Security Updates**: Security-related improvements
- **Documentation**: Documentation improvements
- **Developer Experience**: Development workflow improvements
- **Deployment**: Deployment and infrastructure changes
- **Performance**: Performance optimizations
- **Migration Notes**: Important notes for updating
