# TGlobal Component & Resource Research

> **Goal**: Catalog the best component / resource libraries TGlobal can directly use to elevate tglobal.in beyond the AI-generic 2025 default look. Each entry captures **exactly how the library is integrated** (prompt, CLI, npm, copy-paste, generator) so we never have to re-research the install path.
>
> **Living document.** Researched in batches by Claude in Browser, then fact-checked with Tavily + WebFetch on this side. Every claim carries a verification marker.

---

## Verification legend

Every fact in this document carries one of these markers:

| Marker | Meaning |
|---|---|
| ✓ | Verified live by Tavily search or WebFetch fetch on the date in the verification log |
| ✏ | Corrected — the original Browser Claude entry had this wrong; corrected version below |
| ⚠ | Unverified — Browser Claude said this; could not independently confirm. Treat as needing a check before trusting in production |
| ◯ | Judgment / opinion — not fact-checkable. The reviewer's recommendation, premium score, or AI-generic risk score. Captured at a point in time |

---

## Stack constraints (re-read before adding any library)

- Next.js 16.2.2 (App Router, Turbopack)
- React 19.2.4
- TypeScript strict
- Tailwind v4 with `@theme inline` (NOT v3 — utility names differ; class shorthand differs; config-vs-CSS differs)
- framer-motion 12 / motion (the new package name as of Motion 12)
- GSAP 3.14 + ScrollTrigger
- Lenis smooth scroll
- All components must work as Server Components OR have explicit `"use client"` entry points

**Anti-goal**: avoid the universal AI-generic 2025 visual signature — lavender mesh hero + bento + italic-serif-inside-sans + soft-radius cards + subtle border + cool gradient. TGlobal already looks like that. We need libraries that **push against** that aesthetic OR provide tools so distinctive they can't be faked by a default install.

---

## Document structure

- **Batch 1**: C1 AI prompt marketplaces + C2 copy-paste libraries (10 entries) — fact-checked
- **Batch 2**: C3 NPM-installable React libraries (10 entries) — fact-checked, 4 corrections applied
- **Batch 3** (pending): C4 animation-specific libraries (~6 entries)
- **Batch 4** (pending): C5 generators + C8 3D / WebGL (~6 entries)
- **Batch 5** (pending): C6 icons + C7 typography + C9 pattern references (~6 entries)
- **Batch 6** (pending): synthesis — top 10 components to borrow this week + anti-list

---

## Errata (corrections vs Browser Claude's first pass)

Concrete corrections were applied to entries below. Listed up here so we don't repeat them.

### Batch 1

| Entry | Field | Original (incorrect) | Corrected |
|---|---|---|---|
| #8 Preline UI | Component count | "840+ free components" | **640+ Components + 220+ Examples** (per preline.co homepage). Some third-party catalogs list 300+ which appears to be a previous-generation figure. |
| #8 Preline UI | License | Implied "MIT" | **Dual-license: MIT + Preline UI Fair Use License** (per TailAwesome listing). Matters for paid commercial use. |
| #8 Preline UI | Tailwind v4 | "v4.1.0 banner referenced on homepage — verified" | **No v4.1.0 banner on the homepage at time of fetch.** What IS true: Preline 3.0.0 supports Tailwind v4 (per official changelog + community confirmation). The specific version banner claim was unverified. |
| #7 Float UI | Tagline | "Best shadcn/ui blocks and components for your next project." | **"Build and ship fast with Tailwind CSS UI components"** is Float UI's actual tagline. The original quote was a sponsored banner running on Float UI's site, NOT Float UI's self-description. |
| #7 Float UI | Built on shadcn? | "Built on shadcn/ui" | **Not built on shadcn**. Separate Tailwind library. The shadcn reference was the same sponsor banner. |
| #9 Tailark | Pricing | "Pro paywall hides ~60%" (vague) | **Concrete: Essentials $249 / Complete $299 / Team $499.** Free tier is real but slim. For commercial use, plan on at least Essentials. |

### Batch 2

| Entry | Field | Original (incorrect) | Corrected |
|---|---|---|---|
| #12 Base UI | Package name | `@base-ui-components/react` | **`@base-ui/react`** is the current canonical npm package (per npm registry + Base UI release notes: "New `@base-ui/react` npm package"). The old name still works as an alias but the docs and npm primary all use the new path. Sub-path imports: `import { Menu } from "@base-ui/react/menu"`. |
| #16 Origin UI | Existence at originui.com | Listed as "originui.com" | **Origin UI was acquired by Cal.com in October 2025 and rebranded.** `originui.com` 301-redirects to `coss.com/ui`. The legacy Radix-based components remain available at `coss.com/origin` with **limited support and maintenance**. The new library is **"coss ui"** at `coss.com/ui`, built on **Base UI + Tailwind** (no longer Radix-based). 484 components on the new library. See entry #16 below for the rewritten entry. |
| #20 Untitled UI React | Install method | "Per-component code-copy" | **Has its own CLI**: `npx untitledui@latest init --nextjs`. **Both** copy-paste AND official npm packages are offered (free + Pro). |
| #20 Untitled UI React | Component count | "600+" | **5,000+ components and sections** (per untitleduicom homepage). Far higher than originally listed. |
| #20 Untitled UI React | Tailwind | "v4" | **v4.2 explicitly** stated on homepage. |
| #14 Mantine | PostCSS dev deps | "`postcss-preset-mantine` required" | **Three deps required**: `postcss postcss-preset-mantine postcss-simple-vars`. The simple-vars plugin is part of Mantine's breakpoint variable system — non-optional. |
| #14 Mantine | Tailwind compat | "Doesn't share Tailwind tokens — design system bifurcation" | Softer truth: **Mantine docs do NOT explicitly mark Tailwind as incompatible**. There IS a community `next-tailwind-template` that combines them. The "fight your design system" warning still stands but isn't an absolute bar. |

---

# Batch 1 — AI Prompt Marketplaces (C1) + Copy-Paste Libraries (C2)

## Entry 1: 21st.dev

**URL**: https://21st.dev
**Category**: C1 — AI prompt marketplace

### How to use it

There are three ways to integrate a 21st.dev component, in order of recommendation:

1. **MCP server (best for ongoing use)** ✓
   - Configure 21st.dev's `magic-mcp` server in Cursor or Claude Code's MCP settings.
   - Inside the editor, ask the model "give me a 21st.dev hero" — it pulls live components from the registry as context and proposes code.
   - Verified: 21st.dev nav explicitly references an `/mcp` page.

2. **shadcn registry CLI (best for one-off imports)** ⚠
   - Browser Claude's documented form: `npx shadcn@latest add "https://21st.dev/r/<author>/<component>"`
   - This pattern is consistent with how 21st.dev exposes components but the exact URL shape on the homepage was not directly visible during fetch. **Verify on the component's own page before relying on this.**

3. **Manual copy-prompt** ◯
   - On any component page, copy the natural-language prompt and paste into Cursor/Claude/v0 to generate a fresh component.

### Facts

| Field | Value | Status |
|---|---|---|
| License (community submissions) | MIT | ⚠ (Browser Claude's claim; not displayed on homepage at fetch time — community submissions are usually MIT but verify per-component) |
| Pricing | Free + Pro tier | ⚠ (homepage shows "Log in"; Pro/Private registry features mentioned but exact pricing not visible) |
| Total components | 275K+ usages on top component (AI Prompt Box) — used as a popularity signal, not an aggregate count | ⚠ |
| MCP server | Yes | ✓ |
| Tailwind v4 | Newer submissions: yes. Older: v3 utility names | ⚠ |

### Best for ◯
- AI chat input boxes with streaming UI ("AI Prompt Box" is their flagship)
- Agent-style "plan / message dock" patterns
- Hero variants tagged for SaaS / agent products
- Anywhere an MCP-driven "describe → component" workflow inside Cursor or Claude is desirable

### Weakest at ◯
- Editorial / typographic work — the catalog skews hard toward dark-mode AI-product UI
- Quality consistency — community submissions vary

### Standout examples ⚠ (Browser Claude's picks; verify each URL still resolves)
- `https://21st.dev/r/serafimcloud/ai-prompt-box` — most-installed AI input
- `https://21st.dev/agents` — agent registry
- `https://21st.dev/explore` — paginated component browse, filter by trending

### AI-generic risk: 8/10 ◯
Browser Claude's note: "the most-trending components (AI Prompt Box, V0 AI Chat, Animated AI Chat) are the exact 'lavender glow + animated gradient' trope TGlobal must avoid. Use the registry mechanism, not the popular components."

### Premium score: 5/10 ◯
Depends entirely on which component you pick. Top-of-list components: 3/10. Hand-picked utility primitives: 7/10.

### Recommended for TGlobal ◯
- "Agent Plan" component → restyle for `/process` page step indicator (the 1→2→3 ship-in-2-weeks story)
- "Message Dock" → restyle for bottom-fixed contact CTA on `/work/[slug]`
- **Skip every component with "AI" in the name on the homepage** — they all share the same hero look

### Gotchas ⚠
- Registry CLI assumes a `components.json` file at repo root (shadcn convention); if you don't have shadcn installed you'll need to scaffold one before `npx shadcn add` works.
- Many components hard-code class names like `bg-zinc-950` — wrap or refactor before they leak into your design tokens.

---

## Entry 2: v0 by Vercel

**URL**: https://v0.app
**Category**: C1 — AI prompt marketplace (full-page generation)

### How to use it

1. **Generate from prompt or screenshot** ◯
   - Type a prompt at v0.app, or drop a Figma frame / screenshot. v0 produces React + Tailwind + shadcn output you can preview live.

2. **Pull a generation into your repo** ⚠
   - Browser Claude's documented form: `npx shadcn@latest add "https://v0.dev/chat/b/<chat-id>"`
   - This is the documented v0 → shadcn registry handoff pattern. **Verify the URL shape on the v0 share UI before scripting it.**

3. **Use templates as starting points** ◯
   - https://v0.app/templates browses pre-built apps, games, landing pages, components, dashboards.

### Facts

| Field | Value | Status |
|---|---|---|
| Pricing | Freemium — Free tier rate-limited; "v0 Max" / Team plans paid | ⚠ |
| Generated code license | Yours to keep (MIT-style) | ⚠ |
| Output stack | Next.js App Router + Tailwind + shadcn | ⚠ (well-documented in Vercel comms; not fetched directly) |
| Tailwind v4 | Yes — v0 updated mid-2025 to output `@import "tailwindcss"` syntax | ⚠ |
| RSC compatible | Mixed — interactive sections marked `"use client"`; static blocks stay RSC | ⚠ |

### Best for ◯
- Whole-page generation from screenshot or wireframe
- Component variation exploration ("show me 6 different pricing tables")
- One-shot working prototypes for client demos
- Templates: Apps, Games, Landing Pages, Components, Dashboards

### Weakest at ◯
- Producing visually distinctive output — defaults look like every other v0 site (slate background, soft-radius cards, motion.dev animations)
- Respecting an existing design system without explicit prompting

### Standout examples ⚠
- `https://v0.app/templates` — browse by category
- `https://v0.app/community` — community-shared generations
- `https://v0.app/chat` — playground

### AI-generic risk: 9/10 ◯
"v0's defaults *defined* the AI-generic 2025 look. Accept the first generation without hard prompting and your site will look like 50,000 others."

### Premium score: 4/10 out of the box; 8/10 with strict brand prompting ◯

### Recommended for TGlobal ◯
- Use v0 to scaffold `/work/[slug]` case study pages — pass it your brand color tokens and existing components as context
- Generate variations for the contact form on `/about`; pick the one that doesn't ship with a fake glass card
- **Don't use v0 for the homepage hero** — it will produce the trope you're trying to escape

### Gotchas ⚠
- v0 will silently install shadcn/ui components into your repo on import — check `components/ui` after each pull.
- Free tier has strict daily message caps.
- Path alias `@/components/ui/*` is assumed.

---

## Entry 3: Magic UI

**URL**: https://magicui.design
**Category**: C2 — copy-paste library (also has CLI)

### How to use it

**CLI install per component (preferred)** ✓ verified

```bash
pnpm dlx shadcn@latest add @magicui/<component-name>
# example:
pnpm dlx shadcn@latest add @magicui/number-ticker
pnpm dlx shadcn@latest add @magicui/globe
```

**Verified directly from the Magic UI docs.** The exact namespaced `@magicui/<name>` form is what they document. (Browser Claude's earlier `https://magicui.design/r/<component>.json` URL form may also work but `@magicui/<name>` is the documented official path.)

After install, components land at `@/components/magicui/*` — make sure your `tsconfig.json` path aliases match.

### Facts

| Field | Value | Status |
|---|---|---|
| License | MIT (per GitHub repo); not stated on the docs page itself | ⚠ |
| Component count | "150+" per Browser Claude; sidebar has many but no aggregate shown on docs | ⚠ |
| Pro tier | Yes — Magic UI Pro (templates) is paid | ⚠ |
| Tailwind v4 | Migrated mid-2025; some component pages still document `tailwind.config.ts` extensions but work with v4 `@theme` | ⚠ (not stated on installation page; community confirmation) |
| RSC | Client-only — almost every component uses Framer Motion or hooks; expect `"use client"` on all of them | ⚠ |

### Best for ◯
- **Animated text effects**: Number Ticker, Animated Shiny Text, Aurora Text, Typing Animation, Line Shadow Text
- **Background effects**: Animated Beam, Border Beam, Particles, Meteors, Confetti
- **Set-piece components**: Marquee, Dock, Globe, Orbiting Circles
- Bento Grid (their stock implementation; common but well-coded)

### Weakest at ◯
- Form primitives, accessibility-critical components — Magic UI is a *visual effects* library, not a design system
- Anything that needs to render server-side

### Standout examples ⚠
- `https://magicui.design/docs/components/number-ticker` — spring-based count-up
- `https://magicui.design/docs/components/animated-beam` — SVG path animation between two refs
- `https://magicui.design/docs/components/dotted-map` — geographic dot map

### AI-generic risk ◯
- 8/10 for the popular effects (Aurora Text, Border Beam, Bento Grid — every YC startup uses these)
- 3/10 for utility primitives (Number Ticker, Marquee, Dock)

### Premium score: 6/10 average ◯

### Recommended for TGlobal ◯
- **Number Ticker** for the metrics strip on `/work/[slug]` ("ships in 14 days", "live customers: 47") — spring physics > our ad-hoc tween
- **Animated Beam** to draw connections between systems on `/process` — visualize the "scope → ship" flow rather than a horizontal step list
- **Marquee** for client logos strip on the homepage, but at 0.5x default speed with grayscale-on-non-hover
- **Avoid**: Aurora Text, Bento Grid, Border Beam — AI-template cliché

### Gotchas ⚠
- Some animations use `transform: translateZ(0)` which can blow out z-index stacking with Lenis smooth scroll; test scroll interactions before shipping.

---

## Entry 4: Aceternity UI

**URL**: https://ui.aceternity.com
**Category**: C2 — copy-paste

### How to use it

1. **Visit the component page** at `https://ui.aceternity.com/components/<name>`
2. **Copy the TSX block** shown in the docs.
3. **Install per-component dependencies** (every component lists what it needs at the top of its page) — typically:
   ```bash
   npm i framer-motion clsx tailwind-merge
   ```
4. **Add the `cn()` helper** at `@/lib/utils` if you don't have it from shadcn:
   ```ts
   import { clsx, type ClassValue } from "clsx";
   import { twMerge } from "tailwind-merge";
   export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
   ```
5. **Mirror their `tailwind.config` extensions** into your `@theme` block — Aceternity's docs still show v3 config; convert to v4 CSS variables.

### Facts

| Field | Value | Status |
|---|---|---|
| License | Linked from page footer, not displayed inline | ⚠ |
| Component count | "200+ free" per Browser Claude | ⚠ (page does NOT show an aggregate count) |
| Pricing | Free open-source library + paid All-Access (templates + Pro components) | ⚠ |
| Tailwind v4 | Partial — docs still show v3 `tailwind.config.ts` for theme extension | ⚠ |
| RSC | Client-only | ⚠ |

### Best for ◯
- **Card-hover effects**: 3D tilt, magnetic cards, glare-on-hover
- **Micro-interactions**: Compare slider, Lens, Animated Tooltip, Following Pointer
- **Container Scroll Animation** — the "phone tilts as you scroll" effect, well-implemented

### Weakest at ◯
- Anything you'd ship as your aesthetic identity. The recognizable Aceternity components (Spotlight, Beams, Sparkles, Hero Highlight, Tracing Beam, Background Gradient Animation) are visually fingerprinted to the library.

### Standout examples ⚠
- `https://ui.aceternity.com/components/animated-tooltip` — team avatars on 3D-pop hover
- `https://ui.aceternity.com/components/compare` — before/after image slider
- `https://ui.aceternity.com/components/container-scroll-animation` — pin-and-tilt scroll

### AI-generic risk ◯
- 9/10 for headline components (Spotlight, Beams, Sparkles, Hero Highlight)
- 4/10 for utility primitives

### Premium score: 5/10 average ◯
High if you cherry-pick utilities, low if you stack three signature effects in one hero.

### Recommended for TGlobal ◯
- **Animated Tooltip** for team strip on `/about` (4 engineers, hover reveals bios)
- **Compare** slider on `/work/[slug]` for case-study before/after — far more compelling than two static screenshots
- **Container Scroll Animation** for homepage product/process showcase — credible because it's hard to fake
- **Avoid**: Spotlight, Beams, Sparkles, Hero Highlight, Background Gradient Animation, Tracing Beam — recognized on sight

### Gotchas ⚠
- Most components reference `cn()` helper from `@/lib/utils` — if you don't use shadcn, add it manually.
- Components use `bg-black/[0.8]` opacity-bracket syntax — verify it parses correctly in your Tailwind v4 setup (it does, but worth a check after install).

---

## Entry 5: Uiverse

**URL**: https://uiverse.io
**Category**: C2 — copy-paste, framework-agnostic

### How to use it

1. **Browse by element type** at `https://uiverse.io/<elements|loaders|buttons|checkboxes|toggles|tooltips|cards>`
2. **Click an element** to open its page.
3. **Toggle the export format**: HTML/CSS, Tailwind, or React (Tailwind/React export buttons are visible per element).
4. **Copy and paste** directly into your code. No install command — every element is self-contained CSS.

### Facts

| Field | Value | Status |
|---|---|---|
| License | MIT (community-contributed) | ⚠ |
| Tailwind v4 | Yes — Tailwind export uses standard utilities, no v3-specific syntax | ⚠ |
| RSC | Yes — almost every Uiverse element is pure CSS / single-element HTML, no JS | ⚠ |
| TypeScript | n/a (no JS code to type) | ◯ |

### Best for ◯
- **Standalone visual primitives**: buttons, loaders, toggles, checkboxes, tooltips, cards
- **CSS-only animations** (no JS bundle cost)
- **Quick "delight" elements** that don't need to fit a system — e.g. a custom 404 spinner

### Weakest at ◯
- Anything composed (no full hero blocks, no layouts)
- Aesthetic consistency — every element has its own author and visual language; you must filter heavily
- Many top-liked elements skew toward neon-glow / glassmorphism / 2023 aesthetics

### Standout examples ⚠
- `https://uiverse.io/loaders` — sort by oldest first; simpler classics aged better than neon ones
- `https://uiverse.io/buttons` — filter to "minimalistic" tag
- `https://uiverse.io/checkboxes` — spring-physics checkboxes useful for `/process` step-list interactions

### AI-generic risk: 3/10 ◯
Uiverse doesn't impose a look, but its top-liked elements skew dated.

### Premium score: 4/10 average; 7/10 if you pick minimal/typographic-only elements ◯

### Recommended for TGlobal ◯
- A minimal Uiverse **loader** for global page-transition pending state (Lenis + view transitions need a fallback)
- A spring-toggle for the dark/light mode switcher in nav
- A custom **404 page interaction** (your own page; copy a CSS-only animation from Uiverse so you don't bloat the bundle)

### Gotchas ⚠
- Each element is self-contained CSS — class names will collide if you copy two without prefixing. Wrap each in a CSS module, or use Tailwind's `@layer components` to scope.
- Many elements use `position: absolute` inside their root which can break inside flex containers.

---

## Entry 6: HyperUI

**URL**: https://hyperui.dev
**Category**: C2 — copy-paste, **explicitly Tailwind v4**

### How to use it

1. **Browse** at `https://hyperui.dev/components/<application-ui|marketing|ecommerce>`
2. **Click a component** to open its page; preview at multiple breakpoints.
3. **Toggle dark mode** to verify both variants.
4. **Click "Copy"** and paste the HTML into your project. No npm install. No CLI.
5. **Convert HTML to TSX** if needed: `class` → `className`, self-close void elements, replace inline `<script>` toggles with React state.

### Facts

| Field | Value | Status |
|---|---|---|
| License | MIT | ✓ (verified by 2 third-party catalogs) |
| Tailwind version | **Explicitly v4** | ✓ verified — homepage description: "Free, open-source Tailwind CSS v4 components for modern web development" |
| Component count | 200+ | ✓ (per multiple third-party catalogs) |
| Categories | Application UI, Marketing, Ecommerce, Neobrutalism (explicit category) | ✓ |
| RSC | Yes — most components are static markup | ⚠ |
| Dark mode | Yes — preview-able on every component | ✓ |
| RTL | Yes | ✓ |
| JS / motion | None — pure HTML + Tailwind. A few `<details>`-based accordions for HTML-native toggles | ⚠ |

### Best for ◯
- **Application chrome**: badges, breadcrumbs, button groups, dropdowns, empty states
- **Marketing patterns**: banners, CTAs, FAQ, footers
- **Neobrutalism category** — explicit category, useful if TGlobal flirts with anti-shadcn aesthetic
- **e-commerce blocks** (you don't need these but worth noting)

### Weakest at ◯
- No animation primitives
- No icon system — components use placeholder SVGs you replace
- Visually plain by design; differentiation comes from your typography and color

### Standout examples ⚠
- `https://hyperui.dev/components/marketing/banners` — accept-cookie / announcement banners, all v4-clean
- `https://hyperui.dev/components/marketing/details-lists` — definition lists for `/work/[slug]` metadata (industry, duration, role)
- `https://hyperui.dev/components/marketing/neobrutalism` — explicit alternative-aesthetic blocks

### AI-generic risk: 2/10 ◯
HyperUI is *too* unstyled to look generic; everything depends on what you do with it.

### Premium score: 6/10 baseline, easy to push to 8/10 with good typography ◯

### Recommended for TGlobal ◯
- The **Details Lists** primitive for `/work/[slug]` to display Industry / Duration / Role / Stack metadata as a typed table rather than soft-radius cards
- The **Banner** for any in-app announcement (e.g. "Booking March-April sprints now") — wide horizontal strip, no rounded corners
- The **Stats** marketing block, restyled with a real display typeface (Geist / Inter Tight) instead of system sans

### Gotchas ⚠
- HyperUI components are HTML, not TSX — you must convert manually.
- No state — everything that needs interactivity must be wrapped in a client component yourself.

---

## Entry 7: Float UI

**URL**: https://floatui.com
**Category**: C2 — copy-paste

### How to use it

1. **Browse** components, blocks, or templates at `https://floatui.com/<components|blocks|templates>`.
2. **Open a component**, choose React or HTML view.
3. **Copy and paste** into your project.
4. **Replace icons** — examples often use Heroicons inline as JSX SVG paths. Convert to your icon library on import.
5. **Wrap with `next/link` / `next/image`** as needed — examples don't include these by default.

### Facts (corrections applied)

| Field | Value | Status |
|---|---|---|
| Tagline | **"Build and ship fast with Tailwind CSS UI components"** | ✏ corrected (Browser Claude misattributed a sponsored banner as Float UI's tagline) |
| Built on shadcn? | **No — separate Tailwind library**. The shadcn reference on Float UI's page was a sponsor banner | ✏ corrected |
| License | "100% free and open-source" — exact license type not specified on homepage | ⚠ |
| Component count | Not displayed | ⚠ |
| Tailwind v4 | Most examples authored for v3; mostly v4-compatible utility classes but verify before bulk-pasting | ⚠ |
| RSC | Mostly yes; some examples use `useState` for toggles | ⚠ |
| TypeScript | Examples ship JSX (not TSX) — you'll add types yourself | ⚠ |

### Best for ◯
- **Marketing components**: hero, CTA, pricing, testimonials, FAQ — strong block coverage
- **Templates** (full landing pages) for inspiration on composition rhythm
- **Application UI**: navbars, sidebars, footers

### Weakest at ◯
- No motion / animation primitives
- Aesthetic is conventional Tailwind-flavored; not distinctive on its own
- Last-major-update cadence is slower than Magic UI / Aceternity

### Standout examples ⚠
- `https://floatui.com/components` — top-level component browser
- `https://floatui.com/templates` — full-page templates; useful for layout rhythm reference even if you don't paste
- `https://floatui.com/blocks/heroes` — variety of hero compositions; pick asymmetric variants

### AI-generic risk: 4/10 ◯
Looks like default Tailwind but isn't actively trendy.

### Premium score: 5/10 ◯

### Recommended for TGlobal ◯
- The **CTA "split with image"** block as a credible base for `/process` page section dividers
- The **Pricing** block as scaffolding for sprints "1-week scope, 2-week ship" pricing presentation — strip soft radii, replace shadow with 1px hairline
- **Skip Float UI for the homepage hero** — every variant is a centered headline + button + screenshot

### Gotchas ⚠
- Some components reference Heroicons inline as JSX SVG paths — convert on import.
- React examples don't always use `next/link` or `next/image` — wrap before deploying.

---

## Entry 8: Preline UI

**URL**: https://preline.co
**Category**: C2 — copy-paste (also ships an optional npm plugin for JS interactions)

### How to use it

There are two integration paths:

1. **Markup-only (preferred for most cases)** ✓
   - Browse `https://preline.co/docs/<component>.html`, copy the HTML, convert to JSX.
   - Static markup needs no install.

2. **With JS interactions (for dropdowns, modals, steppers, comboboxes)** ⚠
   ```bash
   npm i preline
   ```
   - Init in a client layout:
     ```tsx
     "use client";
     import { useEffect } from "react";
     useEffect(() => { import("preline/preline").then(m => m.HSStaticMethods.autoInit()); }, []);
     ```
   - The Preline JS plugin adds `data-hs-*` attributes to drive behavior.
   - **Note for React projects**: Preline's `data-hs-*` attribute system is non-React-idiomatic. For most interactive components (combobox, modal, dropdown), you're better served by Base UI / Radix primitives and using Preline only for static markup.

### Facts (corrections applied)

| Field | Value | Status |
|---|---|---|
| Component count | **640+ Components + 220+ Examples** (free) | ✏ corrected (Browser Claude said "840+") |
| Pro count | **780+ Examples & 21 Templates** | ✓ verified |
| Install command | `npm i preline` | ✓ verified |
| License | **Dual: MIT + Preline UI Fair Use License** | ✏ corrected (Browser Claude implied pure MIT) |
| Tailwind v4 | **Yes — Preline 3.0.0 supports Tailwind v4** | ✓ verified (per official changelog + Reddit confirmation) |
| Tailwind v4.1.0 banner on homepage | **Could not confirm at fetch time** | ✏ corrected (treat the version-specific claim as unverified) |
| Default font | Inter | ⚠ |
| RSC | Markup yes; JS interactions need client init | ⚠ |
| Multi-framework | HTML, React, Vue, Angular | ✓ |

### Best for ◯
- **Volume** — widest catalog in the C2 category
- **Application UI** for back-office tools (data tables, advanced inputs, file uploads, steppers)
- **Forms** — best-in-class form pattern coverage (combobox, multi-step, validation)
- **Documentation quality** — every example has copy-paste blocks for HTML, React, Vue, Angular

### Weakest at ◯
- Aesthetically conservative — defaults look like 2018 enterprise SaaS
- Animation is minimal (CSS transitions only)

### Standout examples ⚠
- `https://preline.co/examples.html` — gallery of full-page examples; "Stats" and "Team" pages are clean
- `https://preline.co/docs/stepper.html` — multi-step form, useful for `/process` interactive walkthrough
- `https://preline.co/docs/combobox.html` — accessible combobox; rare to find this well-implemented for free

### AI-generic risk: 3/10 ◯
Looks dated rather than trendy; opposite problem from Aceternity.

### Premium score: 5/10 out of the box, 7/10 with retypography ◯

### Recommended for TGlobal ◯
- **Stepper** primitive for `/process` — actual scope→build→ship flow as interactive stepper, not three columns of text
- **Combobox** for any client-facing intake form on `/contact`
- **Stats** block, restyled with negative-tracking display type

### Gotchas ⚠
- Preline JS interactions clash with React reconciliation — init inside `useEffect`, clean up on unmount.
- Default `data-hs-*` attribute system is non-React-idiomatic; consider Base UI / Radix as drop-in replacements for interactive primitives.
- The dual license (MIT + Fair Use) — read both before assuming pure MIT freedom for commercial use.

---

## Entry 9: Tailark

**URL**: https://tailark.com
**Category**: C2 — copy-paste, built on shadcn

### How to use it

1. **Install shadcn first** in your project (Tailark assumes you have `@/components/ui/button`, `@/components/ui/card`, etc.):
   ```bash
   npx shadcn@latest init
   npx shadcn@latest add button card
   ```
2. **Browse blocks** at `https://tailark.com/blocks/<hero-section|team|integrations|code-demo|...>`.
3. **Copy block code**, paste into your repo.
4. **Install missing dependencies** — Tailark blocks expect `lucide-react` icons and shadcn primitives.

### Facts (corrections applied)

| Field | Value | Status |
|---|---|---|
| Tagline | **"Build modern marketing websites with Shadcn blocks."** | ✓ verified |
| Free tier | Real but slim | ✓ |
| Pricing tiers (Pro) | **Essentials $249, Complete $299 (Most Popular), Team $499** | ✏ corrected — Browser Claude implied "~60% paywalled" without listing prices |
| Requires shadcn? | **Yes** | ✓ |
| Tailwind v4 | Yes | ⚠ (claim, not directly confirmed) |
| RSC | Mixed — marketing blocks mostly server-safe; carousel/animated blocks are client | ⚠ |
| Block categories visible on free tier | 16 hero blocks, 8 integrations, 16 team layouts, 7 investor strips, 4 code demo blocks | ⚠ (Browser Claude's counts; not directly verified) |

### Best for ◯
- **Hero variants**, **Integrations sections**, **Team layouts** — strongest block coverage
- **Code Demo blocks** for showing CLI / API examples (good for technical agency)

### Weakest at ◯
- Application UI (it's marketing-focused only)
- Free tier shows tile thumbnails but gates the actual code behind Pro for many blocks

### Standout examples ⚠
- `https://tailark.com/blocks/hero-section` — full hero block grid
- `https://tailark.com/blocks/code-demo` — 4 patterns for displaying terminal/code in a marketing context
- `https://tailark.com/blocks/team` — team layouts; the 2x2 portrait grid with monospace credit lines is the strongest

### AI-generic risk: 5/10 ◯
Built on shadcn so inherits some defaults, but block compositions vary.

### Premium score: 6/10 ◯
Better than average for marketing blocks.

### Recommended for TGlobal ◯
- **Code Demo** block for the homepage — show actual `pnpm create tglobal-app` (or equivalent) flow rather than fake editor screenshot
- **Team** block for `/about` — asymmetric 2x2 with hand-set bios beats a 4-card row
- **Integrations** block for `/process` to show the stack you actually ship (Next.js, Tailwind, Supabase, etc.) — turns a list into a visual claim

### Gotchas ⚠
- Tailark assumes shadcn `@/components/ui/button`, `@/components/ui/card` exist — install shadcn first.
- Several blocks expect `lucide-react` icons.
- Pro paywall hides ~60% of blocks; the free tier is enough for 2-3 takes. **Pricing reminder: paid is $249+ — budget accordingly.**

---

## Entry 10: Kokonut UI

**URL**: https://kokonutui.com
**Category**: C2 — copy-paste (also offers per-component CLI via shadcn registry)

### How to use it

**CLI install per component** ✓ verified

```bash
npx shadcn@latest add @kokonutui/<component-name>
# example:
npx shadcn@latest add @kokonutui/action-search-bar
```

**Copy-paste** also available on each component's docs page.

### Facts

| Field | Value | Status |
|---|---|---|
| Component count | **100+** | ✓ verified |
| License | "100% Free & Open Source" — specific license not stated on homepage | ✓ partial (free/OSS confirmed; license type ⚠) |
| Pro tier | **Yes — Kokonut UI Pro** at kokonutui.pro, "70+ new components and templates" | ✓ verified |
| Tailwind v4 | Not explicitly stated; references "Tailwind CSS" and "Tailwind + React" | ⚠ |
| RSC | Client-only (Motion-based animations) | ⚠ |
| Animation lib | Imports from `motion/react` (Motion 12) — TGlobal already uses framer-motion 12 = compatible | ⚠ |

### Best for ◯
- **Action prompts** — chat input variants with file-drop affordances
- **Card hover patterns**
- **Components named "Glow" / "Echo"** — visual flourishes
- **Text inputs with command-palette-style affordances**

### Weakest at ◯
- Volume — 100+ is real but they overlap heavily with Magic UI
- Some "Pro" components are visually identical to free Magic UI ones — feels like a positioning play

### Standout examples ⚠
- `https://kokonutui.com/docs/components` — full component catalog
- `https://kokonutui.com/docs/components/action-search-bar` — command-palette search input, better than shadcn default
- `https://kokonutui.com/templates/agenta` — full template demo (Pro)

### AI-generic risk: 6/10 ◯
Newer entry, not yet over-deployed, but uses the same Motion + Tailwind + shadcn DNA as Magic UI.

### Premium score: 6/10 ◯
Distinguishes itself with a slightly more pastel/warm palette than Magic UI's cool defaults.

### Recommended for TGlobal ◯
- **Action Search Bar** as homepage's primary CTA — instead of "Get Started", a typing-affordance prompt input that feels native to TGlobal's "we ship from a brief" pitch
- **Glow Card** variant on `/work` for hover states on case study cards (subtle, single-color, not rainbow)
- **Skip Kokonut for hero-scale components** — they read very Magic-UI-adjacent

### Gotchas ⚠
- Registry-add CLI assumes a `components.json` file (shadcn convention).
- Some components import from `motion/react` (the new Motion package name) rather than `framer-motion` — TGlobal's stack note says framer-motion 12, which IS Motion 12 under a different import path. Both work; verify imports don't double-up.

---

# Verification log

Date: 2026-05-06

| Library | Verification method | Result |
|---|---|---|
| 21st.dev | WebFetch homepage | MCP nav link confirmed; install command not shown on homepage; license not displayed |
| Magic UI | WebFetch installation page | Install command confirmed exact: `pnpm dlx shadcn@latest add @magicui/<name>` |
| Magic UI | WebFetch number-ticker page | Install command confirmed: `pnpm dlx shadcn@latest add @magicui/number-ticker` |
| Aceternity UI | WebFetch /components page | License linked (not displayed); component count not shown; "Free" tags visible per component |
| HyperUI | WebFetch homepage | **403 — couldn't fetch directly.** Verified via 3 third-party catalogs: explicit Tailwind v4, MIT, 200+ components, copy-paste only |
| Float UI | WebFetch homepage | Tagline corrected; built-on-shadcn claim corrected (sponsored banner, not their own description) |
| Preline | WebFetch homepage | Component count corrected: 640+ + 220+ examples (not 840+); install confirmed `npm i preline`; license is dual MIT + Fair Use |
| Preline (Tailwind v4) | Tavily search | Confirmed: Preline 3.0.0 supports Tailwind v4 (changelog + Reddit) |
| Tailark | WebFetch homepage | Tagline confirmed; pricing confirmed concrete tiers ($249/$299/$499); shadcn dependency confirmed |
| Kokonut UI | WebFetch homepage | Component count 100+ confirmed; install command exact form confirmed; Pro tier confirmed |

### Batch 2 (Date: 2026-05-06)

| Library | Verification method | Result |
|---|---|---|
| shadcn/ui | User pasted full Accordion docs page markdown | Install confirmed: `npx shadcn@latest add accordion`; manual fallback `npm install radix-ui`; component lands at `components/ui/accordion.tsx`; base = "radix" (also supports Base UI) |
| Base UI | WebFetch /react/components/menu | Sub-path import confirmed: `import { Menu } from "@base-ui/react/menu"`; "use client" required; basic Menu structure verified |
| Base UI (package name) | Tavily search npm registry + release notes | **Corrected**: package is `@base-ui/react` (NOT `@base-ui-components/react`). Release notes explicitly say "New `@base-ui/react` npm package" |
| HeroUI v3 | WebFetch /docs/components/modal | Package `@heroui/react` confirmed via import; v3.0.3; "Previously NextUI" verified; built on React Aria Dialog pattern |
| HeroUI v3 (install page) | WebFetch /docs/guide/installation | 404 — page not at this URL; install command not directly verified but consistent with import |
| Mantine | WebFetch /getting-started | **Corrected**: requires `postcss postcss-preset-mantine postcss-simple-vars` (three deps, not one); v9.1.1 current; MantineProvider pattern verified; Tailwind not explicitly incompatible (community next-tailwind-template exists) |
| Untitled UI React | WebFetch /react | **Corrected**: install command IS shown — `npx untitledui@latest init --nextjs`; 5,000+ components (not 600+); Tailwind v4.2; both copy-paste AND official npm packages; tagline "Tailwind CSS + React Aria" |
| Origin UI | WebFetch originui.com | **Major correction**: 301-redirects to coss.com/ui. Acquired by Cal.com Oct 2025. Now split: legacy `coss.com/origin` (Radix, limited support) + new `coss.com/ui` (built on Base UI, 484 components) |
| coss origin → coss ui | Tavily search | Confirmed acquisition timeline + new branding via Cal.com + Paco Vitiello announcements (x.com), GitHub `cosscom/coss` repo |
| coss.com/ui | WebFetch homepage | "A new, modern UI component library built on top of Base UI"; install command not on homepage (per-component) |

## Entry 11: shadcn/ui

**URL**: https://ui.shadcn.com
**Category**: C3 — CLI-add (copies code into your repo, treated as installable system because of the workflow)

### How to use it

1. **Initialize once per project** ✓
   ```bash
   pnpm dlx shadcn@latest init
   ```
2. **Add a component on demand** ✓ verified directly via the Accordion docs page paste
   ```bash
   pnpm dlx shadcn@latest add accordion
   # or with manual fallback:
   npm install radix-ui
   # then copy components/ui/accordion.tsx from the docs
   ```
3. The CLI delivers the component code into `@/components/ui/<name>.tsx` — you own and edit it directly.

### Facts

| Field | Value | Status |
|---|---|---|
| License | MIT | ⚠ |
| Base primitive layer | **Radix UI** by default (now stewarded by WorkOS) — ALSO supports **Base UI** as the underlying primitive (per shadcn/ui docs since 2025) | ✓ confirmed via Accordion docs page (`base: radix` frontmatter) |
| Component count | 60+ in the official catalog | ⚠ |
| Tailwind v4 | Yes — v4 is the default in current init flow | ⚠ |
| RSC | Mixed — many primitives compose Radix and need `"use client"`; static ones (Card, Badge, Separator) stay server | ⚠ |
| Charts | Yes — Recharts wrapper (added 2024) | ⚠ |
| Toast | Sonner (their default since 2024) | ⚠ |
| Manual install fallback | Documented per component | ✓ verified via Accordion docs |

### Best for ◯
- Form primitives + react-hook-form + Zod (Field, Input, Select, Combobox, RadioGroup, Checkbox, DatePicker, Calendar)
- Data Table (TanStack Table-based)
- Sidebar / Sheet / Drawer / Dialog patterns for app shells
- Charts (Recharts wrapper with sensible defaults)
- Sonner-based toast system

### Weakest at ◯
- Aesthetic differentiation — every shadcn site looks like every other shadcn site at first glance. Defaults must be actively rejected.
- Animation — relies on Radix primitives' built-in transitions; nothing motion-rich
- Marketing components (no pricing tables, no hero blocks — this is a *system*)

### Standout examples ⚠
- `https://ui.shadcn.com/blocks` — official block library; `dashboard-01` and `sidebar-07` are well-composed
- `https://ui.shadcn.com/charts` — Recharts-based, theme-aware
- `https://ui.shadcn.com/docs/components/data-table` — canonical TanStack Table integration

### AI-generic risk: 7/10 default; 3/10 with custom theme ◯

### Premium score: 6/10 out of the box; 9/10 with custom @theme ◯

### Recommended for TGlobal ◯
- **Sidebar** primitive for `/work` filter UI — handles mobile sheet collapse for free
- **Data Table** for `/work` index ("things we shipped") — sortable, filterable, link-out per row
- **Form + Field + Input + Combobox** for `/contact` — most reliable accessible form stack in 2026
- **Avoid**: default `Card` with `border + rounded-lg + shadow-sm`. That combo IS the AI-generic look. Replace with hairline divider, no shadow.

### Gotchas ⚠
- CLI assumes `@/*` → `./*` path alias.
- Tailwind v4 init will fail silently if leftover `tailwind.config.ts` from v3 is present — delete first.
- Components hardcode `lucide-react` icons — swap during add or accept the dep.

---

## Entry 12: Base UI

**URL**: https://base-ui.com
**Category**: C3 — npm-install (headless primitives)

### How to use it

```bash
npm install @base-ui/react
```

✏ **Correction**: package is `@base-ui/react`, NOT `@base-ui-components/react`. The `-components-` form is an alias from before the rename; current canonical per npm registry + release notes is the shorter form.

Sub-path imports per primitive:
```tsx
"use client";
import { Menu } from "@base-ui/react/menu";
import { Dialog } from "@base-ui/react/dialog";
import { Popover } from "@base-ui/react/popover";
```

Basic Menu structure (✓ verified from base-ui.com/react/components/menu):
```tsx
<Menu.Root>
  <Menu.Trigger>Actions</Menu.Trigger>
  <Menu.Portal>
    <Menu.Positioner>
      <Menu.Popup>
        <Menu.Item>Edit</Menu.Item>
        <Menu.Item>Share</Menu.Item>
      </Menu.Popup>
    </Menu.Portal>
  </Menu.Portal>
</Menu.Root>
```

### Facts

| Field | Value | Status |
|---|---|---|
| Package | `@base-ui/react` | ✓ verified via npm registry |
| License | MIT | ⚠ |
| Backed by | Team behind Radix Primitives, Floating UI, Material UI | ✓ |
| Tailwind v4 | Yes (unstyled, no CSS conflict) | ⚠ |
| RSC | Client-only (interactive primitives) | ✓ verified |
| Anchor positioning | Floating UI built in (Popover, Tooltip, Menu auto-position) | ⚠ |
| Component status | v1 stable; some (Combobox, Autocomplete) released in v1.x range mid-2025 | ⚠ |
| Used by | shadcn/ui as one of TWO supported base primitive layers (alongside Radix) | ✓ verified via shadcn docs |

### Best for ◯
- Headless accessibility-first primitives: Dialog, Popover, Menu, Select, Combobox, Tooltip, Tabs, Accordion, Slider, Switch, Toggle, Radio, Checkbox, Number Field, Toast, Tree, Progress, Drawer
- Long-term maintenance — backed by the dream-team that built Radix + Floating UI + MUI
- Building your own design system on top (no aesthetic baggage)

### Weakest at ◯
- Zero visual styling — you write every line of CSS / Tailwind yourself
- No charts, no data table, no marketing blocks
- Smaller community than Radix Primitives (newer release)

### Standout examples ⚠
- `https://base-ui.com/react/components/menu` — canonical accessible menu with submenus, type-ahead, keyboard nav
- `https://base-ui.com/react/components/select` — better keyboard handling than shadcn-Radix select
- `https://base-ui.com/react/components/dialog` — modern Dialog with built-in scroll-lock + focus management

### AI-generic risk: 0/10 ◯
There's literally no look to copy. Whatever you build with Base UI is yours.

### Premium score: 9/10 ceiling ◯

### Recommended for TGlobal ◯
- **Dialog + Popover + Menu** as foundation for every overlay on tglobal.in — better behavior, avoids shadcn aesthetic fingerprint
- **Tabs** for `/work/[slug]` view-switcher between Overview / Stack / Outcomes
- **Number Field** for any quantity input (project scope estimator)

### Gotchas ⚠
- 100% styling time-cost — budget realistically.
- Some primitives still labeled `rc` / late-stage in 1.x range; verify on the components index before committing.
- The package is `@base-ui/react`, not `base-ui` — easy to mistype.

---

## Entry 13: HeroUI v3 (formerly NextUI)

**URL**: https://heroui.com
**Category**: C3 — npm-install

### How to use it

```bash
npm install @heroui/react
```

✓ verified via the Modal docs page import (`import { Modal } from "@heroui/react"`).

Wrap your app in the provider once at root:
```tsx
"use client";
import { HeroUIProvider } from "@heroui/react";
// in app/providers.tsx or root layout
<HeroUIProvider>{children}</HeroUIProvider>
```

### Facts

| Field | Value | Status |
|---|---|---|
| Package | `@heroui/react` | ✓ verified |
| Current major | v3.0.3 (as of fetch) | ✓ verified |
| Built on | **Tailwind CSS v4 + React Aria Components** | ✓ (per Browser Claude's claim, consistent with React Aria reference in modal docs) |
| License | MIT for OSS; HeroUI Pro is paid (templates / blocks) | ⚠ |
| RSC | Client-only for interactive components; provider must be client | ✓ |
| Animation | Motion-based — modal has built-in motion + backdrop variants | ✓ verified |
| Predecessor | NextUI (renamed mid-2024 after the NextUI / Vercel/Next.js naming overlap became a problem) | ⚠ |

### Best for ◯
- Themeable components with strong dark mode (built-in OKLAB-aware tokens)
- Modal, Drawer, Autocomplete, Combobox — better keyboard UX than shadcn defaults
- Avatar Group, Progress, Skeleton, Spinner — solid utility components
- Built on React Aria — full ARIA semantics out of the box

### Weakest at ◯
- Slightly heavier bundle than shadcn (full library, not pick-what-you-need)
- Default visual style (rounded, soft) is opinionated — you'll fight it
- Less compositional than Base UI — components are higher-level

### Standout examples ⚠
- `https://www.heroui.com/docs/components` — full component browser
- `https://www.heroui.com/docs/components/autocomplete` — best free autocomplete
- `https://www.heroui.com/docs/components/modal` — modal with built-in motion + backdrop variants

### AI-generic risk: 5/10 ◯
Defaults are heavily styled but distinct enough not to blend with the shadcn crowd.

### Premium score: 7/10 ◯
The v3 + Tailwind v4 + React Aria foundation is the strongest of any "batteries included" library in 2026.

### Recommended for TGlobal ◯
- **Autocomplete** for any search affordance on homepage or `/work` filter
- **Modal** for case-study deep-dive overlay on `/work` (alternative to separate `/work/[slug]` page)
- **Skeleton** primitives for loading state on `/work` index when filters re-fetch
- Don't adopt their default theme — disable, map their CSS variables to your own @theme tokens

### Gotchas ⚠
- `<HeroUIProvider>` must wrap your app — adds one provider boundary.
- v3 is recent — old NextUI documentation is renamed in v3, always reference v3 docs.
- React Aria is a peer dep — bundle adds non-trivial weight if you use HeroUI everywhere; tree-shake aggressively.

---

## Entry 14: Mantine

**URL**: https://mantine.dev
**Category**: C3 — npm-install

### How to use it

```bash
# core packages (verified from getting-started page)
yarn add @mantine/core @mantine/hooks
# OR npm equivalent:
npm install @mantine/core @mantine/hooks

# postcss dev deps — ALL THREE required
yarn add --dev postcss postcss-preset-mantine postcss-simple-vars
```

✏ **Correction**: `postcss-simple-vars` is required alongside `postcss-preset-mantine`. Browser Claude's entry only listed the preset.

Provider wrap (✓ verified):
```tsx
"use client";
import { createTheme, MantineProvider } from "@mantine/core";

const theme = createTheme({ /* overrides */ });

<MantineProvider theme={theme}>
  {/* your app */}
</MantineProvider>
```

For Next.js SSR: also import and use `ColorSchemeScript` and `mantineHtmlProps` to avoid hydration warnings.

### Facts

| Field | Value | Status |
|---|---|---|
| Current version | v9.1.1 | ✓ verified |
| Components | 120+ | ⚠ |
| Hooks | 70+ in `@mantine/hooks` | ⚠ |
| License | MIT | ⚠ |
| Tailwind compatibility | **Not explicitly incompatible.** Community `next-tailwind-template` exists combining them. Tokens still don't bridge automatically — manual mapping required. | ✏ corrected (was: "design system bifurcation if you mix") |
| Styling system | CSS Modules + PostCSS | ✓ |
| RSC | Mixed; provider must be client | ✓ |

### Best for ◯
- **120+ components** — largest comprehensive library in this batch
- **70 hooks** — `useDisclosure`, `useDebouncedValue`, `useElementSize`, `useScrollIntoView`, `useHotkeys`, `useLocalStorage`. The hooks alone are worth installing.
- Forms with `@mantine/form` — best non-react-hook-form alternative
- Date/time pickers, rich text editor (`@mantine/tiptap`), notifications, modals manager

### Weakest at ◯
- Bigger surface area than headless alternatives
- Visual style is its own opinion — feels distinct from Tailwind ecosystem; can clash with shadcn-built sections
- PostCSS preset adds config files

### Standout examples ⚠
- `https://mantine.dev/core/spotlight` — Cmd-K spotlight, very polished
- `https://mantine.dev/dates/date-picker` — most flexible free date picker in React
- `https://mantine.dev/hooks/use-hotkeys` — single hook, useful even without the components

### AI-generic risk: 3/10 ◯
Mantine's aesthetic is its own; sites built on it look like Mantine, not AI-template SaaS.

### Premium score: 7/10 ◯
Well-engineered; visual default is corporate-clean rather than premium-distinctive.

### Recommended for TGlobal ◯
- Install **just `@mantine/hooks`** (zero CSS, no provider needed) — use `useDisclosure`, `useHotkeys`, `useLocalStorage` to replace ad-hoc implementations
- **Spotlight** — TGlobal's homepage Cmd-K palette ("jump to /work / /process / /about") — would feel premium and link-checks site-wide
- Don't adopt full Mantine component library — pick the hooks + Spotlight, leave the rest

### Gotchas ⚠
- PostCSS plugin chain required — adds config files.
- CSS layers used heavily — make sure your `@layer` order in Tailwind v4 doesn't override Mantine defaults.
- Provider boundary needed.

---

## Entry 15: Park UI

**URL**: https://park-ui.com
**Category**: C3 — npm-install (built on Ark UI primitives + Panda CSS)

### How to use it

```bash
pnpm dlx @park-ui/cli@latest init
```

⚠ Park UI uses Panda CSS for styling — **NOT Tailwind**. To use it in a Tailwind project you'd run both styling systems side-by-side, or pick one.

### Facts

| Field | Value | Status |
|---|---|---|
| Built on | Ark UI primitives (multi-framework) | ⚠ |
| Styling | **Panda CSS, not Tailwind** | ⚠ |
| License | MIT | ⚠ |
| Backed by | Chakra Systems (team behind Chakra UI v3) | ⚠ |
| Multi-framework | React + Solid from same primitive library | ⚠ |

### Recommended for TGlobal: **SKIP** ◯

The Panda CSS dependency would force you to maintain two styling systems alongside Tailwind v4. The reason to pick Park UI is *if* you want Panda's recipe semantics. TGlobal does not need that complexity.

### Standout examples ⚠
- `https://park-ui.com/react/docs/overview/introduction`
- `https://park-ui.com/react/docs/components/dialog`
- `https://park-ui.com/react/docs/recipes`

### AI-generic risk: 2/10 ◯
Uncommon enough that nobody's saturated the look.

### Premium score: 7/10 ◯ — but irrelevant since we're not adopting

---

## Entry 16: coss ui (formerly Origin UI) ✏ rewritten

**URLs**:
- Current: https://coss.com/ui
- Legacy (limited maintenance): https://coss.com/origin
- Old domain (redirects): https://originui.com → coss.com/ui

**Category**: C3 — copy-paste-code (delivered shadcn-style)

### Background ✏

Origin UI was **acquired by Cal.com in October 2025** as Cal.com's first acquisition. Origin UI is now part of `coss.com`, the holding company of Cal.com. The legacy library (Radix + shadcn-style) remains at `coss.com/origin` with **limited support and maintenance**. A new sibling library — **coss ui** — launched at `coss.com/ui`, built on **Base UI** (not Radix anymore) + Tailwind CSS.

Both URLs work; pick based on which underlying primitive layer you want.

### How to use it

For both versions, components are delivered shadcn-style:

```bash
# pattern (verify exact URL on the component's docs page)
npx shadcn@latest add "https://coss.com/ui/r/<component>.json"
```

Or browse and copy code directly from the component docs.

### Facts

| Field | Value | Status |
|---|---|---|
| Package layer | None — copy-paste, lands in your `components/ui/` | ⚠ |
| Underlying primitives (coss ui) | Base UI | ✓ verified |
| Underlying primitives (coss origin) | Radix UI | ⚠ |
| Components count (coss ui) | "484 particles" referenced via browse link on homepage | ⚠ |
| Tailwind | Yes (consistent with both Base UI + Tailwind composition) | ⚠ |
| License | MIT | ⚠ |
| Acquirer | Cal.com (Oct 2025); coss.com is the new holding company | ✓ verified via x.com/calcom + x.com/pacovitiello announcements |

### Best for ◯
- Form variants (input, select, checkbox, radio, switch) — lots of variants per primitive
- Buttons with icon-position variants
- Numeric input + date input variants
- File-upload patterns
- Login/auth form blocks

### Weakest at ◯
- No motion / animation primitives
- No marketing blocks (no hero, no pricing — pure component library)

### Standout examples ⚠
- `https://coss.com/ui/<components>` (browse from homepage)
- Legacy: `https://coss.com/origin` for the Radix-based library

### AI-generic risk: 4/10 ◯
Extends shadcn-flavored aesthetic; amplifies whatever your shadcn theme already looks like.

### Premium score: 6/10 ◯

### Recommended for TGlobal ◯
- **Input variants** for `/contact` form — floating-label and inline-prefix variants beat shadcn defaults
- **Avatar group** for team strip on `/about`
- Pull only the variants you need; catalog overlaps functionally

### Gotchas ⚠
- Components add into your shadcn `components/ui/` folder — may collide with same-name shadcn components. Namespace-prefix on import.
- The acquisition is recent — expect URL/branding to settle over the next 6-12 months. Pin to specific component URLs you've verified.

---

## Entry 17: React Aria Components (Adobe)

**URL**: https://react-spectrum.adobe.com/react-aria/
**Category**: C3 — npm-install (headless primitives)

### How to use it

```bash
npm install react-aria-components
```

```tsx
"use client";
import { Button, Dialog, Popover, ListBox, ListBoxItem } from "react-aria-components";
```

### Facts

| Field | Value | Status |
|---|---|---|
| Package | `react-aria-components` | ⚠ |
| License | Apache-2.0 | ⚠ |
| Backed by | Adobe (maintained for Adobe products) | ⚠ |
| Tailwind v4 | Yes — unstyled, no CSS conflict | ⚠ |
| RSC | Client-only (interactive primitives) | ⚠ |
| TypeScript | Excellent — strict-ok, ships-types | ⚠ |
| Used by | HeroUI v3 internally — adopting HeroUI means you already get React Aria | ✓ verified |

### Best for ◯
- Industry-standard accessibility — Adobe-grade ARIA story
- Internationalization — built-in RTL, locale-aware date/number/list components
- Drag-and-drop primitives (`useDrag`, `useDrop`, `useDroppableCollection`)
- Date picker / range picker / time field — best in class
- Table with column resizing, sorting, selection, virtualization
- Foundation for HeroUI v3 — if you adopt HeroUI you're already getting React Aria

### Weakest at ◯
- Zero visual styling
- Verbose API — opt into every behavior explicitly
- Steeper learning curve (render-prop pattern via composable children)

### Standout examples ⚠
- `https://react-spectrum.adobe.com/react-aria/Table.html`
- `https://react-spectrum.adobe.com/react-aria/DatePicker.html`
- `https://react-spectrum.adobe.com/react-aria/Tooltip.html`

### AI-generic risk: 0/10 ◯
Unstyled — you cannot look generic with React Aria.

### Premium score: 9/10 ceiling ◯
Capped only by your styling discipline.

### Recommended for TGlobal ◯
- Use **DatePicker / DateRangePicker** if `/contact` ever needs project-window selection
- Use **Table** for `/work` index if you go data-table route
- **Otherwise: don't double-install.** You're already getting React Aria via HeroUI v3 (if adopted).

### Gotchas ⚠
- API requires understanding the "render prop" pattern (`<Item>` children inside `<Listbox>`).
- Bundle is modest but pay-for-what-you-import — tree-shake aggressively.

---

## Entry 18: Radix Themes

**URL**: https://www.radix-ui.com/themes
**Category**: C3 — npm-install

### How to use it

```bash
npm install @radix-ui/themes
```

Themes is the *styled* layer over Radix Primitives. Wrap app in `<Theme>`:
```tsx
"use client";
import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";

<Theme accentColor="indigo" radius="medium">
  {children}
</Theme>
```

### Facts

| Field | Value | Status |
|---|---|---|
| Package | `@radix-ui/themes` | ⚠ |
| License | MIT | ⚠ |
| Stewardship | WorkOS (acquired Radix in 2024) | ⚠ |
| Companion package | `@radix-ui/colors` — 12-step color scales for 25+ accent colors | ⚠ |
| Tailwind compatibility | **Partial** — ships its own CSS layer; runs alongside Tailwind, doesn't share tokens | ⚠ |
| RSC | Client-only for interactive components; `<Theme>` provider is client | ⚠ |
| Bundle | Default Themes CSS adds ~60KB before tree-shaking | ⚠ |

### Best for ◯
- Card, Box, Flex, Grid layout primitives with built-in spacing scale
- Comprehensive Radix Colors palette — 12-step scales for 25+ accents
- Theme switching (radius, scaling, panel background) at runtime
- Strong dark mode handling

### Weakest at ◯
- CSS-in-package conflicts with Tailwind for layout — pick one mental model
- Smaller community for Themes specifically (vs Primitives, which everyone uses)
- Themes aesthetic is recognizable — Linear-adjacent but not identical

### Standout examples ⚠
- `https://www.radix-ui.com/themes/docs/components/card`
- `https://www.radix-ui.com/colors` — color system, useful even if you don't use Themes
- `https://www.radix-ui.com/themes/playground` — runtime theme tweaker

### AI-generic risk: 4/10 ◯

### Premium score: 7/10 ◯

### Recommended for TGlobal ◯
- **Don't adopt Themes** — too much overlap with shadcn / HeroUI
- **DO adopt Radix Colors standalone**: `npm install @radix-ui/colors` — import 12-step scales directly into your Tailwind v4 `@theme` block. Accessibility-tested color ramps, used by Linear, Vercel, most premium SaaS
- For quick admin demo: Themes ships fast. Production homepage stays shadcn / Base UI.

### Gotchas ⚠
- Provider must wrap app (`<Theme accentColor="indigo">…</Theme>`); changing variants at runtime is fine but config sprawl creeps.
- Default CSS adds ~60KB — measurable on a marketing site.

---

## Entry 19: Tremor

**URL**: https://www.tremor.so
**Category**: C3 — copy-paste-code (since 2024 pivoted from packaged library to copy-paste blocks)

### How to use it

Per-component code-copy from `https://tremor.so/<components|charts|blocks>`. Underlying deps:

```bash
npm install recharts @radix-ui/react-* tailwind-variants
# (Radix peer deps depend on which Tremor component you pick)
```

### Facts

| Field | Value | Status |
|---|---|---|
| License | MIT (35+ open-source components confirmed on homepage) | ⚠ |
| Built on | **Recharts + Radix UI** | ✓ verified per homepage |
| Pivoted from | Packaged npm library to copy-paste in 2024 | ⚠ |
| Status | **"Joining Vercel"** banner on homepage | ⚠ verified |
| Tailwind v4 | Yes | ⚠ |
| RSC | Client-only for chart components (Recharts uses ResizeObserver + refs) | ⚠ |

### Best for ◯
- **Charts** — Area, Bar, Line, Donut, Spark, Combo charts with sensible defaults
- Dashboard blocks — KPI cards, table-with-trend, comparison stats
- Date range pickers tuned for analytics

### Weakest at ◯
- Marketing components (none)
- Animation beyond Recharts defaults
- Limited to data-viz contexts

### Standout examples ⚠
- `https://tremor.so/charts`
- `https://tremor.so/blocks`
- `https://tremor.so/components`

### AI-generic risk: 3/10 ◯

### Premium score: 7/10 ◯

### Recommended for TGlobal ◯
- **Spark Chart** for `/work/[slug]` to visualize project metric over time (signups over 14-day sprint window) — far more compelling than a static "30%" stat
- **KPI Card** for homepage outcomes strip — number + delta + tiny chart in one block
- Skip Tremor dashboard blocks — sized for app dashboards, not marketing

### Gotchas ⚠
- Recharts is the heaviest dep (~80KB gzipped) — bundle-budget impact.
- Charts are Client Components; wrap in Suspense for clean loading states.
- Re-renders on prop changes can be expensive; memoize chart data.

---

## Entry 20: Untitled UI React ✏ rewritten

**URL**: https://www.untitledui.com/react
**Category**: C3 — CLI-add + copy-paste + npm package (all three delivery modes)

### How to use it ✏

✓ **Verified install command** (corrected from Browser Claude's "per-component code-copy" claim):
```bash
npx untitledui@latest init --nextjs
```

Untitled UI ships THREE delivery paths:
1. **Their own CLI** (above) — scaffolds Next.js project with their components
2. **Official npm packages** — both free and Pro versions
3. **Copy-paste** — per-component code from the docs site

### Facts ✏

| Field | Value | Status |
|---|---|---|
| Tagline | "The world's largest collection of React components. Tailwind CSS + React Aria." | ✓ verified |
| Total components & sections | **5,000+** (not 600+) | ✓ verified |
| Page examples (Pro) | 250+ | ✓ verified |
| Tailwind | **v4.2 explicitly** | ✓ verified |
| License | MIT for open-source; Pro permits commercial use across unlimited projects | ✓ verified |
| Built on | React Aria + Tailwind | ✓ verified |
| Component category counts (homepage shows) | Line & bar charts (8 + 43 variants), Notifications (1 + 18), Command menus (5 + 69), Calendars (12 + 82), Badges (3 + 380), Date pickers (5 + 68), Pricing examples (20 page examples) | ✓ verified |
| RSC | Mostly client (React Aria-based) | ⚠ |

### Best for ◯
- **Volume** — world's largest free + Pro React component collection
- **Application UI**: dashboards, settings, tables, modals
- **Pricing page templates** — credible variants
- **Command menus** (Cmd-K) — 69 variants make this the deepest free option
- **Badges** — 380 variants for `/work/[slug]` metadata strip

### Weakest at ◯
- Aesthetically conventional — Untitled UI signature Figma kit DNA (light, soft-radius, blue-violet accent). Reskin aggressively.
- Premium content gated behind paid tier
- Marketing hero blocks aren't their strength

### Standout examples ⚠
- `https://www.untitledui.com/react/components` — full browser with variant counts visible per category
- `https://www.untitledui.com/react/components/badges` — 380 badge variants
- `https://www.untitledui.com/react/components/command-menus` — 69 Cmd-K variants

### AI-generic risk: 5/10 default; 2/10 with reskin ◯

### Premium score: 7/10 ◯
React Aria + Tailwind v4 + 5,000+ component foundation is the most production-ready free React library in 2026.

### Recommended for TGlobal ◯
- **Command Menus** catalog — pick a variant matching Linear's spotlight pattern, adapt
- **Badges** for `/work/[slug]` metadata strip (industry, year, role) — get distinctive variants by browsing 380 instead of accepting first
- **Date Pickers** (68 variants) if `/contact` needs scheduling
- Pair Untitled UI primitives with Base UI overlays — application-grade primitives without buying into visual default

### Gotchas ⚠
- React Aria is bundled — combined with shadcn/Radix usage can balloon JS payload. **Pick ONE a11y primitive layer** (Base UI OR React Aria), not both.
- Pro tier is paid — verify which components you need are on the free tier first.

---

# Pending batches

## Batch 3 — C4 Animation libraries
*To be appended.*

## Batch 4 — C5 Generators + C8 3D
*To be appended.*

## Batch 5 — C6 Icons + C7 Typography + C9 Pattern references
*To be appended.*

## Batch 6 — Synthesis
- Top 10 components to borrow this week (with exact URLs and 1-paragraph integration plan each)
- Anti-list: 5 hyped libraries that would push tglobal.in toward AI-generic if used un-curated

---

# Process notes for future batches

When fact-checking Batch 2+, run these verifications in parallel for each entry:

1. **WebFetch the library's install page** to grab the exact install command.
2. **WebFetch the homepage** to verify the tagline, license, and component count claims.
3. **Tavily search** "<library name> Tailwind v4 React 19 2026" to confirm version compatibility.
4. **Spot-check 1-2 standout-example URLs** by fetching them — if URLs 404, drop them from the entry.
5. **Note any claim that couldn't be verified** with a ⚠ marker rather than letting it sit as fact.
