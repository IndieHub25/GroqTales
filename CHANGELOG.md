# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Supported Versions

Active full support: 1.3.5 (latest), 1.3.0 (previous). Security maintenance (critical fixes only): 1.1.0. All versions < 1.1.0 are End of Security Support (EoSS). See `SECURITY.md` for the evolving support policy.

## [1.3.5] - 2026-02-21

### Fixed

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
`components/story-summary-backup.tsx`
`hooks/{use-groq.ts,use-monad.ts,use-story-analysis.ts,use-story-summary.ts}`
`src/blockchain/onchain-agent/app/hooks/useAgent.ts`
`lib/{api-utils.ts,constants.ts,logger-broken.ts,mock-data-backup.ts,transaction-components.ts}`
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
