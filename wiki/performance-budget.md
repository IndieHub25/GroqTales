# Performance Budget - GroqTales

**Created:** 2026-02-11
**Issue:** #335 - Performance Budget for Story Reader & Gallery Pages
**Status:** Active

---

## Core Web Vitals Targets

| Metric | Description | Mobile Target | Desktop Target |
|--------|-------------|---------------|----------------|
| **LCP** | Largest Contentful Paint | < 2.5s | < 2.0s |
| **TBT** | Total Blocking Time | < 200ms | < 100ms |
| **CLS** | Cumulative Layout Shift | < 0.1 | < 0.1 |
| **FCP** | First Contentful Paint | < 1.8s | < 1.5s |

---

## Route-Level JS Bundle Budgets

| Route | Description | JS Bundle Budget | Notes |
|-------|-------------|------------------|-------|
| `/nft-gallery` | NFT Gallery Page | < 150KB (gzipped) | Heaviest route due to grid + modals |
| `/stories/[id]` | Story Reader Page | < 100KB (gzipped) | Content-focused, should be lighter |
| `/` | Homepage | < 200KB (gzipped) | Landing with multiple sections |

---

## Lighthouse Score Targets

| Category | Minimum Score | CI Enforcement |
|----------|--------------|----------------|
| Performance | >= 80 | Fail build |
| Accessibility | >= 90 | Warn |
| Best Practices | >= 85 | Warn |
| SEO | >= 90 | Warn |

---

## Image Budgets

| Image Type | Max File Size | Format | Lazy Load |
|------------|---------------|--------|-----------|
| Hero/Cover images | < 200KB | WebP/AVIF | No (priority) |
| Card thumbnails | < 50KB | WebP/AVIF | Yes |
| Avatars | < 10KB | WebP/SVG | Yes |
| Icons/Logos | < 5KB | SVG/WebP | No |

---

## Animation Budgets

| Context | Max Simultaneous Animations | Animation Type |
|---------|----------------------------|----------------|
| Page transitions | 3 | CSS/Framer Motion |
| Card hover effects | 1 per card | CSS only |
| Loading states | 2 | CSS keyframes |
| Background effects | 50 elements max | CSS (no Framer on mobile) |

---

## Third-Party Script Budget

| Script Category | Max Count | Loading Strategy |
|----------------|-----------|-----------------|
| Analytics | 1 | afterInteractive |
| Theme/UI | 1 | beforeInteractive |
| Feature scripts | 2 | afterInteractive/lazyOnload |

---

## Monitoring & Enforcement

### CI/CD Checks (GitHub Actions)
- Lighthouse CI runs on every PR targeting `main`
- Performance score < 80 blocks merge
- LCP > 2.5s blocks merge
- CLS > 0.1 blocks merge
- TBT > 200ms blocks merge
- Reports uploaded as artifacts for review

### Manual Audits
- Monthly Lighthouse audit of all key routes
- Bundle analysis with `ANALYZE=true npm run build`
- Chrome DevTools Performance profiling for animation-heavy pages

---

## Optimization Strategies

1. **Image Optimization (Applied):** All images use Next.js `<Image>` with WebP/AVIF formats
2. **Code Splitting (Planned):** Heavy components to be loaded via `next/dynamic` with `ssr: false`
3. **Component Memoization (Applied):** `React.memo()` on frequently re-rendered components
4. **Animation Reduction (Applied):** CSS animations preferred over Framer Motion where possible
5. **Reduced Motion Support (Applied):** `prefers-reduced-motion` media query respected
6. **Bundle Optimization (Applied):** `optimizePackageImports` in next.config.js for tree-shaking
7. **Lazy Loading (Applied):** Non-critical images loaded lazily via `loading="lazy"`
