"use client";

import { useEffect, useRef, useState } from "react";

import { GitPullRequest, BookOpen, Sparkles, FileText, Rocket, Flag, AlertTriangle } from "lucide-react";

import { WordReveal } from "@/components/primitives";

/* ProcessArtifacts — live marquee of real-looking sprint artifacts.
   ─────────────────────────────────────────────────────────────
   Two-row infinite marquee. Each tile is one of: PR title,
   runbook entry, Friday demo, ADR, deploy, postmortem, feature
   flag, changelog. Tiles duplicate for seamless CSS loop. */

type ArtifactType =
  | "pr"
  | "runbook"
  | "demo"
  | "adr"
  | "deploy"
  | "postmortem"
  | "flag";

interface Artifact {
  readonly type: ArtifactType;
  readonly text: string;
}

const ARTIFACTS: readonly Artifact[] = [
  { type: "pr", text: "feat(checkout): rate limit Stripe webhook retries" },
  { type: "runbook", text: "Runbook: paging on p95 > 800ms" },
  { type: "demo", text: "Friday demo · sprint 03 · loyalty endpoints live" },
  { type: "adr", text: "ADR-022: gRPC for real-time sync (vs REST polling)" },
  { type: "deploy", text: "Deploy · 14:42 IST · staging-7821 → prod" },
  { type: "postmortem", text: "Postmortem: cache miss · 3m downtime · fix live" },
  { type: "demo", text: "Friday demo · sprint 04 · billing reconciliation shipped" },
  { type: "flag", text: "ff_loyalty_v2: 15% rollout, p95 +2ms" },
  { type: "adr", text: "ADR-014: Postgres over DynamoDB for billing" },
  { type: "pr", text: "refactor(ingest): batch writes, 40% faster" },
  { type: "runbook", text: "Runbook activated: DB failover (5min)" },
  { type: "deploy", text: "Prod deploy · 09:15 IST · rolled back (revert)" },
];

/* Accent colors hit WCAG AA on the surface background (#f6f6f6).
   Original 500/600 weights (amber-600 = #e17100, etc.) measured at
   2.96:1 vs the required 4.5:1. Bumped to 700-800 weights so the
   uppercase type label hits the contrast threshold while keeping
   per-type visual differentiation. Icons stay one notch lighter
   than the label since they're glyphs (≥3:1 graphical threshold). */
const TYPE_META: Record<
  ArtifactType,
  { label: string; icon: typeof GitPullRequest; labelClass: string; iconClass: string }
> = {
  pr: {
    label: "PR",
    icon: GitPullRequest,
    labelClass: "text-emerald-800",
    iconClass: "text-emerald-700",
  },
  runbook: {
    label: "Runbook",
    icon: BookOpen,
    labelClass: "text-amber-800",
    iconClass: "text-amber-700",
  },
  demo: {
    label: "Demo",
    icon: Sparkles,
    labelClass: "text-primary",
    iconClass: "text-primary",
  },
  adr: {
    label: "ADR",
    icon: FileText,
    labelClass: "text-blue-800",
    iconClass: "text-blue-700",
  },
  deploy: {
    label: "Deploy",
    icon: Rocket,
    labelClass: "text-fuchsia-800",
    iconClass: "text-fuchsia-700",
  },
  postmortem: {
    label: "Postmortem",
    icon: AlertTriangle,
    labelClass: "text-rose-800",
    iconClass: "text-rose-700",
  },
  flag: {
    label: "Flag",
    icon: Flag,
    labelClass: "text-orange-800",
    iconClass: "text-orange-700",
  },
};

/* Duplicate the list so the CSS marquee loop is seamless. The
   keyframe translates -50% in X — when the second copy fully
   enters the viewport, the first copy is at the same visual
   position and the cycle continues without a jump. */
const LOOP = [...ARTIFACTS, ...ARTIFACTS];

/* MarqueeStrip — small client wrapper that:
     • Pauses on hover (via .brand-marquee class hook in globals.css)
     • Pauses when off-viewport (IntersectionObserver) so we don't
       burn animation frames on a scrolled-past section. */
function MarqueeStrip() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          setInView(entry.isIntersecting);
        }
      },
      { rootMargin: "200px 0px 200px 0px", threshold: 0 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden
      className="brand-marquee relative mt-14 w-full overflow-hidden sm:mt-16"
    >
      {/* Fade masks left and right so tiles dissolve at the edges. */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-[2] w-24 bg-gradient-to-r from-background to-transparent sm:w-40"
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-[2] w-24 bg-gradient-to-l from-background to-transparent sm:w-40"
      />

      <ul
        role="list"
        className="marquee-track slow flex w-max list-none items-center gap-4 p-0"
        style={{
          animationPlayState: inView ? "running" : "paused",
        }}
      >
        {LOOP.map((artifact, idx) => {
          const meta = TYPE_META[artifact.type];
          const Icon = meta.icon;
          return (
            <li
              key={`${artifact.text}-${idx}`}
              className="flex shrink-0 items-center gap-3 rounded-full border border-border bg-surface px-5 py-3 shadow-[0_2px_12px_-4px_rgba(14,10,30,0.06)]"
            >
              <Icon
                className={`h-4 w-4 shrink-0 ${meta.iconClass}`}
                aria-hidden
              />
              <span
                className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${meta.labelClass}`}
                style={{
                  fontFamily:
                    "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, monospace",
                }}
              >
                {meta.label}
              </span>
              <span
                className="whitespace-nowrap text-sm text-foreground"
                style={{
                  fontFamily:
                    "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, monospace",
                }}
              >
                {artifact.text}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function ProcessArtifacts() {
  return (
    <section
      id="process-artifacts"
      aria-labelledby="process-artifacts-heading"
      className="relative w-full overflow-hidden bg-background py-24 sm:py-32"
    >
      <div className="mx-auto w-full max-w-[1440px] px-6 sm:px-8 lg:px-14 xl:px-20">
        {/* Eyebrow */}
        <p
          className="flex items-center gap-4 text-[11px] font-medium uppercase tracking-[0.22em] text-foreground-mid"
          style={{
            fontFamily:
              "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, monospace",
          }}
        >
          <span className="tabular-nums">№ 06</span>
          <span aria-hidden className="h-px w-8 bg-foreground-mid/40" />
          <span>What ships</span>
        </p>

        {/* Headline */}
        <h2
          id="process-artifacts-heading"
          className="mt-6 max-w-4xl font-medium leading-tight text-foreground"
          style={{
            fontSize: "clamp(32px, 5.4vw, 72px)",
            letterSpacing: "-0.045em",
          }}
        >
          What actually{" "}
          <span
            className="italic text-[#6b5ce7]"
            style={{
              fontFamily: "var(--font-instrument-serif), Georgia, serif",
            }}
          >
            ships
          </span>{" "}
          each sprint.
        </h2>

        <div className="mt-8 max-w-3xl">
          <WordReveal
            text="These artifacts ship multiple times per sprint. Slides never do."
            as="p"
            className="text-xl font-normal leading-relaxed text-foreground-mid sm:text-2xl"
            stagger={0.025}
          />
        </div>
      </div>

      {/* Marquee — full-bleed, breaks out of the section's max-width.
          MarqueeStrip is a client component that pauses on hover and
          when scrolled off-viewport (saves animation frames). */}
      <MarqueeStrip />
    </section>
  );
}
