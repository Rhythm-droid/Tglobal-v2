# Tglobal — v2.0.0

Marketing site rebuild for Tglobal, built on Next.js 16 (App Router), React 19, TypeScript strict, and Tailwind v4.

## Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **UI:** React 19, Tailwind v4 (`@theme inline`)
- **Animation:** framer-motion + GSAP (ScrollTrigger for pinned/horizontal sections)
- **Types:** TypeScript strict mode
- **Fonts:** Albert Sans (headings and body)

## Sections

In scroll order: Navbar → Hero → Problem → How It Works → Services → Stats → Capabilities → Clients → CTA → Footer.

Each section lives in `src/components/<Section>.tsx`. Shared primitives (reveal-on-scroll, pinned rails, motion context) are under `src/components/primitives/`.

## Local dev

```bash
npm install
npm run dev         # http://localhost:3000
npm run build       # production build
npm run start       # run the built output
```

## Asset conventions

- Static, content-addressable assets under `public/<bucket>/` (brands, flags, integrations, footer). Cache-Control is set to `public, max-age=31536000, immutable` for these paths via `next.config.ts` — replace files by renaming, never by overwriting in place.
- Icon SVGs may contain a styled wrapper (rounded pill + stroke) around an embedded bitmap. Inspect before converting; do not strip the wrapper.

## Security

Production CSP, HSTS, frame-ancestors deny, Permissions-Policy lockdown, and `X-Powered-By` stripping are all configured in `next.config.ts`.

