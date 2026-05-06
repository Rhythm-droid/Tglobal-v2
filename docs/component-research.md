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

- **Batch 1** (this document): C1 AI prompt marketplaces + C2 copy-paste libraries (10 entries)
- **Batch 2** (pending): C3 NPM-installable React libraries (~10 entries)
- **Batch 3** (pending): C4 animation-specific libraries (~6 entries)
- **Batch 4** (pending): C5 generators + C8 3D / WebGL (~6 entries)
- **Batch 5** (pending): C6 icons + C7 typography + C9 pattern references (~6 entries)
- **Batch 6** (pending): synthesis — top 10 components to borrow this week + anti-list

---

## Errata (Batch 1 corrections vs Browser Claude's first pass)

Three concrete corrections were applied below. Listed up here so we don't repeat them.

| Entry | Field | Original (incorrect) | Corrected |
|---|---|---|---|
| #8 Preline UI | Component count | "840+ free components" | **640+ Components + 220+ Examples** (per preline.co homepage). Some third-party catalogs list 300+ which appears to be a previous-generation figure. |
| #8 Preline UI | License | Implied "MIT" | **Dual-license: MIT + Preline UI Fair Use License** (per TailAwesome listing). Matters for paid commercial use. |
| #8 Preline UI | Tailwind v4 | "v4.1.0 banner referenced on homepage — verified" | **No v4.1.0 banner on the homepage at time of fetch.** What IS true: Preline 3.0.0 supports Tailwind v4 (per official changelog + community confirmation). The specific version banner claim was unverified. |
| #7 Float UI | Tagline | "Best shadcn/ui blocks and components for your next project." | **"Build and ship fast with Tailwind CSS UI components"** is Float UI's actual tagline. The original quote was a sponsored banner running on Float UI's site, NOT Float UI's self-description. |
| #7 Float UI | Built on shadcn? | "Built on shadcn/ui" | **Not built on shadcn**. Separate Tailwind library. The shadcn reference was the same sponsor banner. |
| #9 Tailark | Pricing | "Pro paywall hides ~60%" (vague) | **Concrete: Essentials $249 / Complete $299 / Team $499.** Free tier is real but slim. For commercial use, plan on at least Essentials. |

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

---

# Pending batches

## Batch 2 — C3 NPM-installable React libraries
*To be appended after Claude in Browser produces the next batch.*

Categories to cover (~10 entries):
- shadcn/ui (the canonical baseline)
- Base UI (`@base-ui-components/react` — successor to Radix Primitives by the Material UI team)
- Hero UI (`@heroui/react` — formerly NextUI)
- Mantine (`@mantine/core`)
- Park UI (built on Ark UI; multi-framework)
- Origin UI (relatively new)
- React Aria Components (`react-aria-components`)
- Radix Themes (the styled layer over Radix Primitives)
- Untitled UI React (premium baseline reference)
- Tremor (specific to dashboards / data viz)

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
