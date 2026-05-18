"use client";

import { useEffect, useRef, useState } from "react";

/* ProcessTriptych — phase cards as build-system telemetry.
   ─────────────────────────────────────────────────────────────
   Three numbered phase cards (Foundation · Build · Ship) stacked
   in a wide editorial grid. Each card carries:
     • A circular progress arc that fills to 100% when the card
       enters the viewport (IntersectionObserver-driven).
     • Tool list with one-liner caption per tool.
     • Phase tagline in italic Instrument Serif.

   Departs from /about's pinned-particle Ship/Taste/Own triptych
   by trading the cinematic morph for a status-board feel — each
   phase reads like a CI job: NAME → ARC → "complete". The arc is
   pure CSS conic-gradient driven by a CSS custom property, no
   GSAP, no shader, no pin. */

interface Tool {
  readonly name: string;
  readonly caption: string;
}

interface Phase {
  readonly index: string;
  readonly word: string;
  readonly tagline: string;
  readonly status: string;
  readonly tools: readonly Tool[];
}

const PHASES: readonly Phase[] = [
  {
    index: "I",
    word: "Foundation",
    tagline: "Boring stacks scale. We chose wisely.",
    status: "stable",
    tools: [
      { name: "Postgres", caption: "The database your queries trust." },
      { name: "Node.js", caption: "One language. From browser to border." },
      { name: "TypeScript", caption: "Type safety. Ship faster." },
      { name: "Vercel", caption: "Deploy on git push. Watch it live." },
      {
        name: "OpenAI · Anthropic · Mistral",
        caption: "Three models. Different speeds. Same taste.",
      },
    ],
  },
  {
    index: "II",
    word: "Build",
    tagline: "Modern tools bought you speed. Your taste ships the product.",
    status: "in motion",
    tools: [
      { name: "Next.js", caption: "The framework that ships features." },
      { name: "React", caption: "The component model that won." },
      { name: "Tailwind CSS", caption: "Utility classes. Shipped in time." },
      {
        name: "Cursor + Claude Code",
        caption: "Your judgment, 10× faster.",
      },
      { name: "GitHub", caption: "The repository that shipped." },
    ],
  },
  {
    index: "III",
    word: "Ship",
    tagline:
      "Running a product is running ops. No margins without observability.",
    status: "live",
    tools: [
      { name: "Datadog", caption: "See everything. Respond faster." },
      { name: "Sentry", caption: "Errors surface before you ship." },
      {
        name: "LaunchDarkly",
        caption: "Feature flags. Rollout confidence. Owned.",
      },
      { name: "Neon", caption: "Postgres without the ops burden." },
      {
        name: "Vercel Observability",
        caption: "Deploy with visibility built in.",
      },
    ],
  },
];

/* PhaseCard — the arc fills from 0 → 100 when the card enters
   the viewport. After it reaches 100 we leave it pinned so the
   card reads "complete" on subsequent re-entries. */
function PhaseCard({
  phase,
  cardIndex,
}: {
  readonly phase: Phase;
  readonly cardIndex: number;
}) {
  const cardRef = useRef<HTMLElement | null>(null);
  const [progress, setProgress] = useState(0);
  const completedRef = useRef(false);

  useEffect(() => {
    const node = cardRef.current;
    if (!node) return;

    /* threshold lowered from 0.45 → 0.15 + negative bottom
       rootMargin so the trigger fires when the card is *entering*
       view rather than waiting for half of it to be visible.
       Previously, tall phase cards on mobile/laptop viewports
       never reached 45% intersection at once and the arcs stayed
       pinned at 0%. With these tuned values, cards II and III now
       fill on first scroll-into-view like card I. */
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !completedRef.current) {
            completedRef.current = true;
            const start = performance.now();
            const duration = 1200;
            const tick = (now: number) => {
              const t = Math.min(1, (now - start) / duration);
              const eased = 1 - Math.pow(1 - t, 3);
              setProgress(Math.round(eased * 100));
              if (t < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
    );

    io.observe(node);
    return () => io.disconnect();
  }, []);

  return (
    <article
      ref={cardRef}
      className="relative grid grid-cols-1 gap-10 rounded-3xl border border-border bg-background p-8 transition-all hover:border-primary/40 sm:p-10 lg:grid-cols-12 lg:gap-14 lg:p-12"
      style={{
        boxShadow:
          progress >= 100
            ? "0 30px 80px -36px rgba(75, 40, 255, 0.22)"
            : "0 12px 36px -22px rgba(14, 10, 30, 0.08)",
      }}
    >
      {/* LEFT — phase identity */}
      <div className="lg:col-span-5">
        <div className="flex items-baseline gap-5">
          {/* Phase index — small italic serif */}
          <span
            className="shrink-0 italic text-foreground/35"
            style={{
              fontFamily:
                "var(--font-instrument-serif), Georgia, serif",
              fontSize: "clamp(28px, 3.4vw, 56px)",
              letterSpacing: "-0.04em",
              lineHeight: 0.85,
            }}
          >
            {phase.index}
          </span>

          <h3
            className="font-medium leading-[0.95] text-foreground"
            style={{
              fontSize: "clamp(40px, 6vw, 88px)",
              letterSpacing: "-0.05em",
            }}
          >
            {phase.word}
          </h3>
        </div>

        <p
          className="mt-6 max-w-[42ch] italic text-foreground/80"
          style={{
            fontFamily: "var(--font-instrument-serif), Georgia, serif",
            fontSize: "clamp(18px, 1.8vw, 26px)",
            letterSpacing: "-0.02em",
            lineHeight: 1.35,
          }}
        >
          &ldquo;{phase.tagline}&rdquo;
        </p>

        {/* Phase status row — index numeral + filling arc + status label */}
        <div className="mt-10 flex items-center gap-6">
          <div className="relative h-20 w-20 shrink-0">
            <div
              aria-hidden
              className="absolute inset-0 rounded-full transition-[background] duration-300"
              style={{
                background: `conic-gradient(#4b28ff ${progress * 3.6}deg, rgba(75, 40, 255, 0.1) 0deg)`,
              }}
            />
            <div className="absolute inset-[5px] flex items-center justify-center rounded-full bg-background">
              <span
                className="text-base font-semibold tabular-nums text-foreground"
                style={{ letterSpacing: "-0.02em" }}
              >
                {progress}%
              </span>
            </div>
          </div>
          <div>
            <p
              className="text-[10px] font-medium uppercase tracking-[0.22em] text-foreground-mid"
              style={{
                fontFamily:
                  "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, monospace",
              }}
            >
              Phase {String(cardIndex + 1).padStart(2, "0")} of 03
            </p>
            <p
              className="mt-1 text-sm font-semibold uppercase tracking-[0.18em] text-primary"
              style={{
                fontFamily:
                  "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, monospace",
              }}
            >
              · {phase.status}
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT — tool list */}
      <div className="lg:col-span-7">
        <p
          className="text-[10px] font-medium uppercase tracking-[0.22em] text-foreground-mid"
          style={{
            fontFamily:
              "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, monospace",
          }}
        >
          Stack — {phase.tools.length} tools
        </p>
        <ul
          role="list"
          className="mt-4 list-none divide-y divide-border p-0"
        >
          {phase.tools.map((tool) => (
            <li
              key={tool.name}
              className="flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8"
            >
              <span
                className="text-base font-semibold tracking-[-0.02em] text-foreground sm:text-lg"
                style={{
                  fontFamily:
                    "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, monospace",
                }}
              >
                {tool.name}
              </span>
              <span className="text-sm leading-relaxed text-foreground-mid sm:text-base sm:text-right">
                {tool.caption}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

export default function ProcessTriptych() {
  return (
    <section
      id="process-triptych"
      aria-labelledby="process-triptych-heading"
      className="relative w-full bg-surface py-24 sm:py-32"
    >
      {/* Subtle grid background — engineering surface vibe, not lavender wash. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "linear-gradient(rgba(75, 40, 255, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(75, 40, 255, 0.04) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />

      <div className="relative mx-auto w-full max-w-[1440px] px-6 sm:px-8 lg:px-14 xl:px-20">
        <p
          className="flex items-center gap-4 text-[11px] font-medium uppercase tracking-[0.22em] text-foreground-mid"
          style={{
            fontFamily:
              "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, monospace",
          }}
        >
          <span className="tabular-nums">№ 05</span>
          <span aria-hidden className="h-px w-8 bg-foreground-mid/40" />
          <span>How we build</span>
        </p>

        <h2
          id="process-triptych-heading"
          className="mt-6 max-w-4xl font-medium leading-tight text-foreground"
          style={{
            fontSize: "clamp(32px, 5.4vw, 72px)",
            letterSpacing: "-0.045em",
          }}
        >
          Boring bones.{" "}
          <span
            className="italic text-[#6b5ce7]"
            style={{
              fontFamily: "var(--font-instrument-serif), Georgia, serif",
            }}
          >
            Modern edges.
          </span>{" "}
          Shipped.
        </h2>

        <div className="mt-16 space-y-8 sm:mt-20 sm:space-y-10">
          {PHASES.map((phase, idx) => (
            <PhaseCard key={phase.word} phase={phase} cardIndex={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}
