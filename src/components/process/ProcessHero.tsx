"use client";

import { useEffect, useRef, useState } from "react";

import { ArrowRight, Workflow } from "lucide-react";

import MagneticPill from "@/components/primitives/MagneticPill";
import { useMounted } from "@/lib/useMounted";

/* ProcessHero — sprint-terminal aesthetic.
   ─────────────────────────────────────────────────────────────
   Departs entirely from AboutHero's lavender shader stage. This
   hero is a live engineering surface:

     • LEFT — a monospaced terminal stream that types out a
       `git log` of the current sprint as the page loads. Each
       commit line lands with a typed-character reveal, ending
       on a "demos trump decks" commit message.
     • RIGHT — a live sprint clock: day counter (1 → 10),
       countdown to next Friday demo, % complete arc.
     • BELOW the fold — three principles stack as "rules" cards
       (no scramble swap, no rail) so the document reads as a
       README, not a manifesto.

   Visual vocabulary: dark ink background, mono typography, lime
   "ok" indicators, brand purple cursor blink. Same palette tokens
   as /about (primary #4b28ff) but applied to a totally different
   primitive set (terminal, clock, arc) — so this hero feels
   native to a software process, not a copy of the about page. */

const COMMITS: readonly { hash: string; ts: string; subject: string }[] = [
  { hash: "a47e2c1", ts: "Mon 09:14", subject: "feat(scope): one-page SOW locked, fixed cost agreed" },
  { hash: "b91f3d4", ts: "Tue 11:02", subject: "chore(infra): CI/CD pipeline + observability live" },
  { hash: "c2d8a59", ts: "Wed 16:38", subject: "feat(slice): first vertical slice end-to-end" },
  { hash: "e5fa1c0", ts: "Thu 10:21", subject: "test(e2e): integration green, async update sent" },
  { hash: "f3b07e2", ts: "Fri 14:42", subject: "release(staging): Friday demo recorded, all hands" },
  { hash: "a18d4ff", ts: "Mon 09:00", subject: "perf: telemetry hooks added, p95 trending down" },
  { hash: "b4c9e23", ts: "Wed 17:11", subject: "docs(runbook): updated, bug bash complete" },
  { hash: "d77ee0a", ts: "Thu 16:55", subject: "deploy: prod behind feature flag, ramp 15%" },
  { hash: "e6f2bb1", ts: "Fri 13:30", subject: "ship: demos trump decks. live in production." },
];

const SPRINT_DAY = 10; // we land on Fri W2 — the climax day
const TOTAL_DAYS = 10;

export default function ProcessHero() {
  const mounted = useMounted();
  const [streamedCount, setStreamedCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!mounted) return;
    intervalRef.current = setInterval(() => {
      setStreamedCount((c) => {
        if (c >= COMMITS.length) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return c;
        }
        return c + 1;
      });
    }, 260);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [mounted]);

  const progress = (SPRINT_DAY / TOTAL_DAYS) * 100;

  return (
    <section
      id="process-hero"
      aria-labelledby="process-hero-heading"
      className="relative isolate w-full overflow-hidden"
      style={{
        background: "#0e0a1e",
        minHeight: "100svh",
      }}
    >
      {/* Background — concentric grid + radial bloom. No mesh shader, no lavender wash. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(75, 40, 255, 0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(75, 40, 255, 0.06) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 30% 35%, rgba(75, 40, 255, 0.22) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 70%, rgba(189, 112, 246, 0.16) 0%, transparent 65%)",
        }}
      />
      {/* Top scanline */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 right-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(189, 112, 246, 0.5) 50%, transparent 100%)",
        }}
      />

      <div className="relative z-[1] mx-auto flex min-h-[100svh] w-full max-w-[1440px] flex-col px-6 pb-16 pt-32 sm:px-8 sm:pt-40 lg:px-14 lg:pt-48 xl:px-20">
        {/* TOP — eyebrow row */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p
            className="flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.22em] text-white/70"
            style={{
              fontFamily:
                "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, monospace",
            }}
          >
            <span
              aria-hidden
              className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-400"
            />
            <span>live · sprint 04</span>
            <span aria-hidden className="h-px w-8 bg-white/20" />
            <span>No decks, real code</span>
          </p>
          <p
            className="text-[11px] font-medium uppercase tracking-[0.22em] text-white/60"
            style={{
              fontFamily:
                "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, monospace",
            }}
          >
            ./process · 01/08
          </p>
        </div>

        {/* MAIN — split layout */}
        <div className="mt-16 grid flex-1 grid-cols-1 gap-12 lg:mt-20 lg:grid-cols-12 lg:gap-14">
          {/* LEFT — terminal stream + headline */}
          <div className="lg:col-span-7">
            <h1
              id="process-hero-heading"
              className="font-medium leading-[0.95] text-white"
              style={{
                fontSize: "clamp(44px, 7.2vw, 124px)",
                letterSpacing: "-0.045em",
              }}
            >
              Demos trump{" "}
              <span
                className="italic text-[#bd70f6]"
                style={{
                  fontFamily:
                    "var(--font-instrument-serif), Georgia, serif",
                  letterSpacing: "-0.04em",
                }}
              >
                decks.
              </span>
            </h1>

            <p className="mt-8 max-w-[58ch] text-base leading-[1.6] text-white/65 sm:text-lg">
              No discoveries that don&apos;t deploy. No prototypes
              that never make production. Two weeks. One vertical
              slice. Live software you can click, push on, argue
              with. The artifact is the conversation.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <MagneticPill
                href="/#talk-to-us"
                variant="primary"
                cursorText="let's go"
              >
                Start a sprint <ArrowRight aria-hidden size={18} />
              </MagneticPill>
              <MagneticPill
                href="/work"
                variant="ghost"
                cursorText="proof"
              >
                See past sprints <Workflow aria-hidden size={18} />
              </MagneticPill>
            </div>
          </div>

          {/* RIGHT — terminal + sprint clock.
              <div> not <aside>: the terminal/clock pair is
              supplementary content for the hero, but <aside> nested
              inside <main> triggers axe
              landmark-complementary-is-top-level. The complementary
              role only makes sense as a top-level sibling of <main>. */}
          <div className="flex flex-col gap-4 lg:col-span-5">
            {/* Terminal stream — git log of the current sprint.
                aria-hidden because the simulated commits aren't
                real content for AT; the headline + body to the
                left of this card already carry the section's
                accessible meaning. group/log enables hover-dim
                on sibling commit rows (Warp / GitHub blame trick). */}
            <div
              aria-hidden
              className="group/log relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-5 shadow-[0_24px_60px_-24px_rgba(75,40,255,0.45)] backdrop-blur-md"
              style={{
                fontFamily:
                  "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, monospace",
              }}
            >
              {/* Ambient dot field — extremely faint, sits behind the
                  terminal content. Resend / Vercel use this trick to
                  imply "live processing" without distracting motion.
                  pointer-events-none so it never blocks interaction. */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-[0.08]"
                style={{
                  backgroundImage:
                    "radial-gradient(circle, #bd70f6 1px, transparent 1px)",
                  backgroundSize: "18px 18px",
                }}
              />

              <div className="relative flex items-center gap-2 border-b border-white/10 pb-3">
                <span
                  aria-hidden
                  className="inline-block h-2.5 w-2.5 rounded-full bg-rose-500/70"
                />
                <span
                  aria-hidden
                  className="inline-block h-2.5 w-2.5 rounded-full bg-amber-400/70"
                />
                <span
                  aria-hidden
                  className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-400/70"
                />
                <span className="ml-3 text-[10px] uppercase tracking-[0.18em] text-white/60">
                  ~/tglobal · git log --since=&apos;2 weeks ago&apos;
                </span>
              </div>

              {/* Box-drawing prompt row — Warp signature.
                  Establishes the "this is a real shell" feel before
                  the commit stream starts rendering. Box chars
                  brightened from emerald-400 → emerald-300 since
                  the dark ink background swallows the 400 weight. */}
              <div className="relative mt-3 flex items-center gap-2 text-[12px] leading-relaxed text-white/55">
                <span className="text-emerald-300">┌─</span>
                <span className="text-white/70">~/tglobal</span>
                <span className="text-white/55">on</span>
                <span className="text-[#bd70f6]">sprint/04-loyalty</span>
              </div>
              <div className="relative flex items-baseline gap-2 text-[12px] leading-relaxed text-white/55">
                <span className="text-emerald-300">└─❯</span>
                <span className="text-white/85">git log --oneline</span>
              </div>

              {/* Commit stream — text size drops to 11px on narrow
                  viewports so all three columns (hash + ts + subject)
                  fit one line. Timestamp column is hidden under sm
                  to avoid squeezing the subject; the subject IS the
                  storytelling, the timestamp is decorative ambience. */}
              <div className="relative mt-2 max-h-[280px] space-y-[6px] overflow-hidden text-[11px] leading-relaxed sm:text-[13px]">
                {COMMITS.slice(0, streamedCount).map((c, i) => {
                  const isLatest = i === streamedCount - 1;
                  return (
                    <div
                      key={c.hash}
                      className="flex items-baseline gap-3 text-white/85 transition-opacity duration-200 group-hover/log:opacity-30 hover:!opacity-100"
                      style={{
                        animation: isLatest
                          ? "process-commit-in 380ms cubic-bezier(0.22, 1, 0.36, 1) both"
                          : undefined,
                      }}
                    >
                      <span className="shrink-0 text-[#bd70f6]">
                        {c.hash}
                      </span>
                      <span className="hidden shrink-0 text-white/55 sm:inline">
                        {c.ts}
                      </span>
                      <span className="truncate">{c.subject}</span>
                    </div>
                  );
                })}
                {streamedCount < COMMITS.length ? (
                  <div className="flex items-baseline gap-3 text-white/65">
                    <span className="shrink-0">$</span>
                    <span
                      aria-hidden
                      className="inline-block h-[14px] w-[8px] animate-pulse bg-[#bd70f6]"
                    />
                  </div>
                ) : (
                  /* Stream complete — cursor stops blinking, replaced
                     with a status line. Subtle signal that the
                     animation is done so the eye stops being pulled
                     back to the corner. */
                  <div className="flex items-baseline gap-3 pt-1 text-white/55">
                    <span className="shrink-0 text-emerald-400">✓</span>
                    <span className="text-[11px] uppercase tracking-[0.18em]">
                      9 commits · sprint complete
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Sprint clock — day counter + progress arc */}
            <div
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-md"
              style={{
                fontFamily:
                  "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, monospace",
              }}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/65">
                    Sprint day
                  </p>
                  <p
                    className="mt-1 font-medium tabular-nums leading-none text-white"
                    style={{
                      fontSize: "clamp(36px, 4.4vw, 56px)",
                      letterSpacing: "-0.05em",
                    }}
                  >
                    {SPRINT_DAY}
                    <span className="text-white/50">/{TOTAL_DAYS}</span>
                  </p>
                  <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-emerald-400">
                    shipping today
                  </p>
                </div>
                {/* Progress arc — pure CSS conic gradient ring */}
                <div className="relative h-24 w-24 shrink-0 sm:h-28 sm:w-28">
                  <div
                    aria-hidden
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: `conic-gradient(#4b28ff ${progress * 3.6}deg, rgba(255,255,255,0.08) 0deg)`,
                    }}
                  />
                  <div className="absolute inset-[6px] flex items-center justify-center rounded-full bg-[#0e0a1e]">
                    <span
                      className="text-base font-semibold tabular-nums text-white sm:text-lg"
                      style={{ letterSpacing: "-0.02em" }}
                    >
                      {progress.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3 border-t border-white/10 pt-4">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.18em] text-white/60">
                    Scope
                  </p>
                  <p className="mt-1 text-xs font-medium text-white">
                    Locked
                  </p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-[0.18em] text-white/60">
                    Demo
                  </p>
                  <p className="mt-1 text-xs font-medium text-white">
                    14:00
                  </p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-[0.18em] text-white/60">
                    Deploy
                  </p>
                  <p className="mt-1 text-xs font-medium text-emerald-400">
                    live
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM — three rules cards (replaces three-principle scramble). */}
        <div className="mt-16 grid grid-cols-1 gap-4 sm:mt-20 sm:grid-cols-3">
          <RuleCard
            index="01"
            title="Shipped matters. Promised doesn't."
            callout="Demos teach. Decks reassure."
          />
          <RuleCard
            index="02"
            title="Taste competes with cost."
            callout="Taste does not autocomplete."
          />
          <RuleCard
            index="03"
            title="Own the whole stack."
            callout="The runbook is yours."
          />
        </div>
      </div>
    </section>
  );
}

function RuleCard({
  index,
  title,
  callout,
}: {
  readonly index: string;
  readonly title: string;
  readonly callout: string;
}) {
  return (
    <article
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-md transition-all hover:border-[#bd70f6]/40 hover:bg-white/[0.06]"
    >
      <span
        aria-hidden
        className="absolute right-5 top-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60"
        style={{
          fontFamily:
            "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, monospace",
        }}
      >
        rule.{index}
      </span>
      <p
        className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#bd70f6]"
        style={{
          fontFamily:
            "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, monospace",
        }}
      >
        № {index}
      </p>
      {/* h2 not h3: the rules trio lives directly under the hero's
          h1 with no intermediate section, so jumping to h3 would
          break the heading ladder (axe heading-order). The /process
          section h2s below this hero are siblings of these. */}
      <h2
        className="mt-4 font-medium leading-tight text-white"
        style={{
          fontSize: "clamp(20px, 2.2vw, 28px)",
          letterSpacing: "-0.025em",
        }}
      >
        {title}
      </h2>
      <p
        className="mt-4 italic text-white/65"
        style={{
          fontFamily: "var(--font-instrument-serif), Georgia, serif",
          fontSize: "clamp(15px, 1.4vw, 18px)",
        }}
      >
        &ldquo;{callout}&rdquo;
      </p>
    </article>
  );
}
