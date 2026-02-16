# Performance Baseline Audit - GroqTales

**Audit Date:** 2026-02-11
**Auditor:** Performance Budget Implementation (Issue #335)
**Framework:** Next.js 14.1.0 (App Router)
**Deployment:** Vercel

---

## 1. Component Structure Analysis

### Story Reader Page (`app/stories/[id]/page.tsx`)
- **Type:** Client Component (`'use client'`)
- **Dependencies:** framer-motion, lucide-react, next/image, web3-provider, multiple UI components
- **Key Issues:**
  - Entire page is a client component despite having static-renderable sections
  - 5 separate `motion.div` wrappers with staggered animations (delays 0.1-0.3s)
  - AnimatePresence used for comments list (re-renders on every comment change)
  - `whileHover` on each related story card (4 cards = 4 hover listeners)
  - Imports `StoryCard` component which itself imports framer-motion

### Gallery Page (`app/nft-gallery/page.tsx`)
- **Type:** Client Component (`'use client'`)
- **Dependencies:** framer-motion, lucide-react, web3-provider, multiple UI components
- **Key Issues:**
  - Entire page (~916 lines) is a single client component
  - 13 NFT items each wrapped in `motion.div` with entry animations
  - `AnimatePresence` wraps entire grid (expensive re-renders on filter/sort)
  - 3 `<img>` tags not using Next.js `<Image>` (lines 330, 355, 457)
  - `NFTDetailModal` renders on every parent state change
  - `generateAdditionalNFTs()` called inside `useEffect` but could be static

### Root Layout (`app/layout.tsx`)
- **Type:** Server Component (correct)
- **Issues:**
  - Reads `quick-boot.js` from filesystem via `fs.readFileSync` on every request
  - Inlines script via `dangerouslySetInnerHTML`
  - 4 external scripts loaded (`theme-fix.js`, `comic-dots-animation.js`, `performance-fix.js`, `scroll-optimization.js`)
  - `force-dynamic` export disables all static optimization

---

## 2. Identified Issues

### HIGH Impact

| # | File | Issue | Impact |
|---|------|-------|--------|
| 1 | `app/nft-gallery/page.tsx:330,355,457` | Uses `<img>` instead of `<Image>` for cover images and avatars | High - No image optimization, no lazy loading, no WebP/AVIF, increases LCP |
| 2 | `components/story-card.tsx:96` | Uses `<img>` for cover images in card grid | High - Repeated across many cards, no lazy loading |
| 3 | `components/nft-gallery.tsx:69` | Uses `<img>` for story images | High - No optimization |
| 4 | `components/galaxy-background.tsx` | 200 animated stars + 12 meteors + 3 large meteors + planets, all using framer-motion | High - ~220+ simultaneous motion.div animations, severe TBT impact |
| 5 | `app/nft-gallery/page.tsx` | Entire 916-line page is `'use client'` | High - Ships all code as client JS, increases bundle size |
| 6 | `app/stories/[id]/page.tsx` | Entire page is `'use client'` with 5+ motion wrappers | High - Prevents server rendering of static content |
| 7 | `components/story-card.tsx:189` | `whileHover` with scale + y transform + boxShadow on every card | High - Triggers layout recalculation on hover |

### MEDIUM Impact

| # | File | Issue | Impact |
|---|------|-------|--------|
| 8 | `components/footer.tsx:70` | Uses `<img>` for logo | Medium - Footer logo not optimized |
| 9 | `components/home-creator-card.tsx:39` | Uses `<img>` for creator avatars | Medium - Avatar images not optimized |
| 10 | `components/story-details-dialog.tsx:73` | Uses `<img>` for story images | Medium - Dialog images not optimized |
| 11 | `components/splash-screen.tsx` | 2.5s blocking splash screen with motion animations | Medium - Delays FCP and LCP |
| 12 | `components/loading-screen.tsx` | Complex orbiting animation with 4 animated dots | Medium - Unnecessary animation complexity for a loader |
| 13 | `app/nft-gallery/page.tsx:883` | `AnimatePresence` wrapping entire NFT grid | Medium - Forces re-animation on filter/sort |
| 14 | `components/layout/animated-layout.tsx` | `'use client'` but contains no client-side logic | Medium - Unnecessary client boundary |
| 15 | `app/stories/StoriesClient.tsx` | `'use client'` for a simple page with only window.location | Medium - Could use `<Link>` and be server component |

### LOW Impact

| # | File | Issue | Impact |
|---|------|-------|--------|
| 16 | `app/layout.tsx` | `force-dynamic` disables static optimization globally | Low - Necessary for current architecture but limits caching |
| 17 | `app/layout.tsx` | 4 external scripts loaded in head | Low - `afterInteractive` strategy mitigates blocking |
| 18 | `package.json` | Large dependency tree (ethers, wagmi, recharts, etc.) | Low - Tree-shaking handles most, but some are large |
| 19 | `app/nft-gallery/page.tsx:427` | `console.log` statements left in production code | Low - Minor overhead, clutters console |

---

## 3. Framer Motion Usage Summary

| File | Animation Type | Element Count | Severity |
|------|---------------|---------------|----------|
| `galaxy-background.tsx` | Infinite loops (stars, meteors, planets) | ~220+ | Critical |
| `nft-gallery/page.tsx` | Entry animations, AnimatePresence grid | 13+ per render | High |
| `stories/[id]/page.tsx` | Page transitions, comment animations | 5-10 | Medium |
| `story-card.tsx` | whileHover scale/translate | Per card instance | Medium |
| `splash-screen.tsx` | Logo pulse, overlay fade | 2 | Low |
| `loading-screen.tsx` | Orbiting dots, pulsing icon | 5 | Low |
| `header.tsx` | Menu animations | Variable | Low |

---

## 4. Unoptimized Images Summary

| File | Line | Element | Source Type |
|------|------|---------|-------------|
| `app/nft-gallery/page.tsx` | 330 | `<img>` cover image | Remote (unsplash) |
| `app/nft-gallery/page.tsx` | 355 | `<img>` author avatar | Remote (dicebear) |
| `app/nft-gallery/page.tsx` | 457 | `<img>` modal cover image | Remote (unsplash) |
| `components/story-card.tsx` | 96 | `<img>` cover image | Remote |
| `components/nft-gallery.tsx` | 69 | `<img>` story image | Remote |
| `components/footer.tsx` | 70 | `<img>` logo | Local (/logo.png) |
| `components/home-creator-card.tsx` | 39 | `<img>` creator avatar | Remote |
| `components/story-details-dialog.tsx` | 73 | `<img>` story image | Remote |
| `app/profile/page.tsx` | 106 | `<img>` profile image | Remote |
| `app/create/page.tsx` | 779 | `<img>` story preview | Remote |

---

## 5. Recommended Fixes

1. **Replace all `<img>` with `<Image>`** - Use Next.js Image component with proper width/height, loading="lazy", and format optimization
2. **Add `React.memo()` to NFTCard** - Receives stable props, re-renders unnecessarily on parent state changes
3. **Lazy load GalaxyBackground** - Use `next/dynamic` with `ssr: false` since it's purely decorative
4. **Simplify GalaxyBackground for mobile** - Reduce star count and disable meteors on mobile
5. **Replace AnimatePresence grid** - Use CSS transitions for simple fade-in effects instead
6. **Convert AnimatedLayout to server component** - Remove unnecessary `'use client'`
7. **Add `prefers-reduced-motion` support** - Disable animations when user prefers reduced motion
8. **Split NFTCard and NFTDetailModal** - Separate components to prevent unnecessary re-renders
9. **Optimize next.config.js** - Add more packages to `optimizePackageImports`
10. **Add bundle size monitoring** - Create Lighthouse CI workflow for continuous monitoring
