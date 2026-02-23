# 🎨 Spline 3D — Contributor Guide

> This document covers everything contributors need to know about the **Spline 3D** integration in
> GroqTales. Read this in full before touching any Spline-related code or assets.

---

## Table of Contents

- [Overview](#overview)
- [Registered 3D Models](#registered-3d-models)
- [⚠️ Model Protection Policy](#️-model-protection-policy)
- [Package Stack](#package-stack)
- [How Spline Is Loaded](#how-spline-is-loaded)
- [Where Spline Lives in the Codebase](#where-spline-lives-in-the-codebase)
- [Performance Considerations](#performance-considerations)
- [Design & Styling Rules](#design--styling-rules)
- [Testing Spline Changes](#testing-spline-changes)
- [Troubleshooting](#troubleshooting)
- [FAQ](#faq)

---

## Overview

GroqTales uses [Spline](https://spline.design/) for interactive 3D elements on the website. The
primary use case is the **hero section** on the homepage, where a fixed-position 3D storybook model
serves as the immersive full-page background while content scrolls over it with a frosted-glass
effect.

---

## Registered 3D Models

The following `.spline` files are the **only** approved 3D models in this repository:

| Model File             | Location                    | Used In                | Purpose                              |
| ---------------------- | --------------------------- | ---------------------- | ------------------------------------ |
| `storybook.spline`     | `public/storybook.spline`   | `app/page.tsx` (Hero)  | Full-page 3D hero background         |
| `neon_sign.spline`     | `public/neon_sign.spline`   | Reserved / Experimental | Neon sign effect (future branding)   |

> [!CAUTION]
> These model files are **binary assets** curated and approved by the maintainers. They contain
> custom materials, lighting, camera angles, and color palettes (green + blue theme) that define the
> GroqTales visual identity. **Replacing, re-exporting, or modifying them will break the site's
> design language.**

---

## ⚠️ Model Protection Policy

> [!IMPORTANT]
> **Do NOT replace, re-export, rename, resize, or delete any `.spline` model file** in a Pull
> Request without **explicit written permission** from a project maintainer.

### Rules

1. **No model swaps.** PRs that replace `storybook.spline` or `neon_sign.spline` with different
   models will be **rejected immediately** without review.
2. **No re-exports.** Do not open the model in Spline, make changes, and re-export it. Even
   "identical" re-exports can change internal IDs, lighting, or camera presets.
3. **No new models** may be added to `public/` without prior approval in an issue or discussion.
4. **Color palette is locked.** The storybook model uses a specific green + blue color scheme. Do
   not apply overlays, filters, or CSS that wash out or alter the model's colors.
5. **To propose a model change**, open a **GitHub Issue** with:
   - A screenshot or video of the proposed change
   - Justification for why the current model is insufficient
   - The exact Spline project URL (if applicable)
   - Wait for maintainer approval before implementing

### Allowed Changes (Without Permission)

- Adjusting CSS around the Spline `<div>` (opacity, z-index, transitions)
- Changing the deferred-load delay timer
- Improving the fallback gradient
- Adding `aria-hidden` or accessibility attributes to the container

---

## Package Stack

| Package                      | Version   | Purpose                        |
| ---------------------------- | --------- | ------------------------------ |
| `@splinetool/react-spline`   | `^2.2.6`  | React wrapper for Spline scenes |
| `@splinetool/runtime`        | `^1.9.27` | Core Spline rendering engine    |

Both were installed with `--legacy-peer-deps` due to React 18 peer dependency constraints. **Do not
upgrade these packages** without verifying full compatibility with Next.js 14.1.0 and React 18.

---

## How Spline Is Loaded

Spline is **not** imported at the top level. It uses Next.js `dynamic()` with `ssr: false` to avoid
server-side rendering issues (Spline requires browser APIs like `canvas` and `WebGL`).

### Loading Flow

```text
Page paint (instant)
  └─ Hero gradient background renders immediately
  └─ 1500ms timer starts
      └─ Timer fires → showSpline = true → <Spline> mounts
          └─ Spline fetches + parses .spline binary
              └─ onLoad callback → splineReady = true
                  └─ opacity: 0 → 1 (CSS transition, 1s duration)
                      └─ Fallback gradient disappears
```

### Code Location

```tsx
// app/page.tsx — Lines 23-27
const Spline = dynamic(
  () => import('@splinetool/react-spline').then((mod) => mod.default || mod),
  { ssr: false, loading: () => null }
);
```

```tsx
// app/page.tsx — Lines 126-138
{showSpline && (
  <div
    className="fixed inset-0 z-0 transition-opacity duration-1000"
    style={{ opacity: splineReady ? 1 : 0 }}
  >
    <Suspense fallback={null}>
      <Spline
        scene="/storybook.spline"
        onLoad={() => setSplineReady(true)}
      />
    </Suspense>
  </div>
)}
```

### Key Points

- **Deferred loading**: 1.5-second delay ensures page content paints first (Core Web Vitals)
- **Fixed positioning**: `position: fixed; inset: 0` keeps the model centered as a background
- **Frosted overlay**: Content sections use `bg-background/90 backdrop-blur-sm` to float over Spline
- **Fallback gradient**: A CSS `hero-gradient` class shows while Spline loads

---

## Where Spline Lives in the Codebase

```text
GroqTales/
├── public/
│   ├── storybook.spline          ← Primary 3D model (DO NOT MODIFY)
│   └── neon_sign.spline          ← Reserved model   (DO NOT MODIFY)
├── app/
│   └── page.tsx                  ← Spline integration (hero section)
├── app/
│   └── globals.css               ← .hero-gradient fallback class
└── package.json                  ← @splinetool/* dependencies
```

---

## Performance Considerations

Spline files are **large binary assets** (~2–10 MB). Follow these guidelines:

1. **Never add more than one Spline scene per page.** Multiple scenes tank performance.
2. **Always use deferred loading** via `dynamic()` + `ssr: false` + a delay timer.
3. **Always provide a fallback** (gradient or skeleton) while Spline loads.
4. **Test on mobile.** If a scene drops below 30 FPS on a mid-range phone, it should not ship.
5. **Monitor bundle size.** `@splinetool/runtime` is ~500 KB gzipped. Do not add alternative 3D
   libraries (Three.js, Babylon.js) alongside it.
6. **WebGL requirement.** Spline requires WebGL. Ensure graceful degradation for browsers without
   WebGL support.

---

## Design & Styling Rules

- The Spline container uses `z-0` (background layer); all content uses `z-[1]` or higher.
- **Do not** add heavy gradient overlays on top of the Spline model — this was deliberately removed
  in v1.3.5 to preserve the model's green/blue colors.
- Only a thin bottom fade is allowed for content readability.
- Content sections must use `bg-background/90 backdrop-blur-sm` to maintain the frosted glass
  effect.
- The hero section itself has no opaque background — the Spline model shows through.
- The `.hero-gradient` class (in `globals.css`) provides the animated gradient while Spline loads.

---

## Testing Spline Changes

Before submitting a PR that touches Spline-related code:

1. **Dev server**: Run `npm run dev` and verify the hero section loads smoothly.
2. **Production build**: Run `npm run build && npm start` to confirm Spline works in production mode.
3. **Check load sequence**:
   - Page text should appear instantly
   - Gradient background should show first
   - 3D model should fade in ~1.5s later
4. **Mobile test**: Open on a phone or use Chrome DevTools mobile emulation. Verify no crashes, no
   blank screens, and acceptable frame rate.
5. **Dark mode + Light mode**: Toggle themes and confirm model colors look correct in both.
6. **Accessibility**: Ensure the Spline `<div>` does not trap keyboard focus or interfere with
   screen readers.

---

## Troubleshooting

| Issue                              | Cause                                   | Fix                                               |
| ---------------------------------- | --------------------------------------- | ------------------------------------------------- |
| Blank hero section                 | Spline file missing from `public/`      | Ensure `storybook.spline` exists in `public/`     |
| "document is not defined" error    | SSR attempting to load Spline           | Confirm `dynamic()` uses `{ ssr: false }`         |
| Model colors look washed out       | CSS overlay with high opacity           | Remove or reduce gradient overlays                |
| Very slow initial load             | Large `.spline` file                    | Expected — ensure fallback gradient is visible    |
| Build fails with peer dep warning  | React version conflict                  | Install with `--legacy-peer-deps`                 |
| Model doesn't appear after deploy  | Static asset not included in build      | Verify `public/` files are copied in `Dockerfile` |

---

## FAQ

**Q: Can I use a Spline URL instead of a local file?**
A: We intentionally self-host `.spline` files in `public/` for reliability, offline dev, and to
avoid rate limits from Spline's CDN. Do not switch to URL-based loading.

**Q: Can I add Three.js or another 3D library?**
A: No. We use Spline exclusively. Adding a second runtime would bloat the bundle significantly.

**Q: How do I get the model file if I need to inspect it?**
A: The `.spline` files are committed to the repo. You can open them in the
[Spline Desktop App](https://spline.design/), but **do not re-export** them.

**Q: Who do I contact about model changes?**
A: Open a GitHub Issue with the `3d-models` or `spline` label and tag a maintainer.

---

_Last updated: 2026-02-21 — GroqTales v1.3.5_
