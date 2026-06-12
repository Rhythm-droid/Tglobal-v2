# /process Full-Page Redesign Plan

> Audit date: 2026-06-12 · Status: PLANNED, nothing built
> Method: full component audit + 2 deep research passes (award-tier process
> pages; conversion/content strategy for technical buyers) + taste profile
> (memory: tglobal-taste-profile)

---

## 1 · The governing idea: TIME MADE PHYSICAL

Every other page has one governing invention (pixelate morph, particle
words, flight corridor, light-flood, gallery of voices). /process's content
IS time — two weeks, Fridays, day-by-day cadence. So the whole page becomes
**one engagement you live through by scrolling**: the page is the sprint.

Connective tissue: a **sprint-day HUD** (fixed, desktop, sibling of the dot
rail) that tracks page progress as days — `MON W1 → FRI W2` — so the
entire page reads as one two-week journey. It lands on "MON — yours" at
the CTA.

This mechanic (scroll = calendar time) is NEW to the site — no section
anywhere uses time-as-space. It also obeys the corrected palette rule:
light shader bookends, dark only inside surfaces.

## 2 · Section audit (current 8 beats)

| # | Section | Verdict | Why |
|---|---------|---------|-----|
| 01 | Hero (dark "sprint terminal", typed git log + clock) | REPLACE | Only dark hero on the site (breaks light-bookend language); typing is time-based not scroll-driven; static after it finishes. Keep the TERMINAL VOICE as a garnish, not the stage. |
| 02 | Contrast (6-row table, line-through) | REDESIGN structurally | Flat editorial table = the pattern Rhyth always rejects; research says us-vs-them tables read defensive. The content is good. |
| 03 | Five Steps (numbered MagicCards on a line) | MERGE into the Sprint | Timeline-with-dots + cards = most generic block on the site. Research: collapse steps into the sprint anatomy. |
| 04 | Anatomy (10-day horizontal rail) | PROMOTE to centerpiece | The page's most concrete, quotable artifact — currently an overflow-x strip. Becomes the big pin. |
| 05 | Triptych (tooling frames) | CUT as a section | Research: tool lists read as vendor flex/filler for technical buyers. Tools get one quiet line inside relevant artifacts instead. |
| 06 | Artifacts (2-row marquee, rainbow labels) | REFRAME | Marquee repeats /work's motif; rainbow accents off-palette. Becomes "What you'll own" (ownership framing converts). |
| 07 | Q&A (3 pairs) | EXPAND + reframe | Has a copy BUG ("Contact us for pricing." mid-answer). Research: 5 named objections with concrete commitments convert 3-5×. |
| 08 | CTA (dark rounded card, blur(140px) glows) | REPLACE | Violates the light-bookend rule AND uses the Firefox-broken blur-blob recipe. Use the billboard close (AboutCTA/WorkCTA pattern). |
| — | HowTo JSON-LD | DELETE | Google removed HowTo rich results (2023). Dead weight (memory: reference_howto_faq_schema_deprecated). |
| — | WebPage + Breadcrumb schema | KEEP | Still active. |
| — | (new) Service schema | ADD | "Two-Week Fixed-Cost Product Development" — the 2026-relevant type; also chunk copy 120–180w per block for AI-answer citability. |
| — | ScrollProgress / dot rail / FilmGrain | KEEP | Site furniture; add the sprint-day HUD beside the dot rail. |

## 3 · The new page (6 beats + furniture)

### № 01 — THE FIRST MONDAY (hero)
Light shader stage (HERO_COLORS — bookend rule). New mechanic: **light as
time**. As you scroll the hero, the shader's light literally sweeps like a
day passing — dawn-cool → noon-bright — while the headline sets the
promise: "Spec Monday. **Live** in two Fridays." Terminal garnish kept
small: one mono line under the headline types the first commit
(`a47e2c1 · Mon 09:14 · one-page SOW locked`). The sprint-day HUD appears
here, reading MON W1.

### № 02 — THE FORK (contrast, made kinetic)
One project brief enters center-stage, then the screen **splits into two
parallel timelines scrolling at different speeds** — the metaphor IS the
mechanic. Left lane (typical agency): grey, slow parallax rate, artifacts
are decks and meeting invites, drifts out of focus into fog around "Week
6: discovery deck approved". Right lane (TGlobal): lit, faster rate,
artifacts are commits and demos, hits **LIVE** while the left lane is
still in meetings. The 6 contrast rows become moments along the lanes,
not table cells. (Research: "diverging timelines / the old way crumbles";
ours via differential scroll speed — new to the site.)

### № 03 — TEN DAYS, ONE SCROLL (the centerpiece pin: anatomy + steps merged)
The big set-piece. A pinned stage where **each scroll beat is one day**:
a huge day ticker (MON W1 … FRI W2), the day's one-liner, and a structure
**assembling on stage** — each day adds a physical layer (foundation /
pipes / slices / flags / keys), so by day 10 the reader has watched the
product get BUILT. Construction/assembly is a new mechanic for the site.
The five steps (Scope It / Wire It Up / Ship in Cycles / Go Live / Own It)
become chapter markers along this same timeline — no separate card list.
Friday beats get a demo flash (spotlight + "DEMO · RECORDED" stamp);
day 10 is the climax: the structure ships. Snap-to-day stops, Lenis slowed
inside the pin (house pattern).

### № 04 — WHAT YOU'LL OWN (artifacts + tooling merged)
Ownership transfer made literal: a desk-level stack of real documents —
SOW, runbook, ADRs, dashboard, the repo itself — **dealt across the table
to the reader's side, one by one, on scroll**. Each artifact is a crafted
object (mono chrome, real-looking content, accent seal); tooling appears
as one quiet line inside the relevant artifact (Datadog inside the
dashboard, Postgres inside the ADR). Framing: "your post-launch assets",
not "our outputs". New mechanic: object transfer/dealing.

### № 05 — THE TERMS (Q&A → contract clauses)
Five objections (research-ranked: scope creep · quality/AI-code trust ·
team seniority/continuity · ownership · post-launch support), each
answered in two sentences ending on a concrete commitment that **stamps
itself** onto the page as a seal (48H RE-SCOPE · CODE IN YOUR REPO DAY
ONE · ON-CALL THROUGH RAMP …). Steals the audit-seal motif from /work's
metrics chrome. Fixes the "Contact us for pricing." bug; every answer
quotable in a buyer's internal email (research test).

### № 06 — YOUR MONDAY IS OPEN (CTA)
The billboard close on the same light shader as the hero (bookend):
centred № label, ink headline with italic accent ("Your **Monday** is
open."), body ("Send three things — goal, constraint, what 'shipped'
means. Plan back in 48 hours."), MagneticPill + demoted text link. The
sprint-day HUD lands on "MON — yours".

## 4 · Copy & SEO pass (run through every beat)
- Voice test for every line: "could a buyer paste this into an internal
  email as a reason to pick us?" Keep: short declaratives, named days,
  named numbers. Kill: philosophy, "we care", anything unverifiable.
- Chunk sections at 120–180 words, answer-first (AI-citability).
- Schema: delete HowTo; keep WebPage + Breadcrumb; add Service.
- Known copy bug: QA answer 2 ("Contact us for pricing.") — rewrite.

## 5 · Build order (each phase = prototype live → approve → build → sweep)
1. **Phase A** — Hero + sprint-day HUD + schema/copy fixes (sets the
   governing idea; small risk).
2. **Phase B** — № 03 Ten Days One Scroll (centerpiece; prototype 2
   variants live: "assembling structure" vs "day-ticker cinema").
3. **Phase C** — № 02 The Fork (prototype the dual-speed lanes live).
4. **Phase D** — № 04 What You'll Own (dealing mechanic).
5. **Phase E** — № 05 The Terms + № 06 CTA billboard.
6. **Phase F** — full-page coherence pass: pacing, HUD timing, mobile,
   parity sweeps, real-Firefox check, perf (one pin + one shader pair;
   no large CSS blurs anywhere).

## 6 · Hard constraints (from memory/site rules)
- Scroll-scrubbed/deterministic motion; per-frame work on refs, never
  React state; always-MotionValue styles (no number↔MV swaps).
- PageTransition opacity-only; pins via sticky + ScrollTrigger progress.
- No filter:blur glows (baked gradients); Firefox-identical.
- Reduced-motion parity (sweep on every phase: `npm run sweep -- /process`).
- Light bookends; dark only inside surfaces (terminal garnish, artifact
  objects OK).
- Never repeat an existing invention: no pixelate, particles, scramble,
  flight-corridor, light-flood, spoken-voices. New mechanics introduced
  here: light-as-time, dual-speed lanes, construction/assembly,
  object-dealing, live stamping.
