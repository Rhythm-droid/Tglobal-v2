import { ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";

import MagneticPill from "@/components/primitives/MagneticPill";

/* ProcessCTA — closing block.
   ─────────────────────────────────────────────────────────────
   Dark rounded-[32px] block with purple blur glow + dual pills.
   Same pattern family as AboutCTA but presented as a contained
   card rather than a full-bleed shader stage so the /process page
   reads as: "long editorial document" → "decisive close".
   The reader has seen 7 sections; this is permission, not
   persuasion. */

export default function ProcessCTA() {
  return (
    <section
      id="process-cta"
      aria-labelledby="process-cta-heading"
      className="relative w-full bg-background py-20 sm:py-28"
    >
      <div className="mx-auto w-full max-w-[1440px] px-6 sm:px-8 lg:px-14 xl:px-20">
        <div className="relative overflow-hidden rounded-[32px] bg-foreground px-8 py-16 text-background sm:px-16 sm:py-24 lg:min-h-[480px]">
          {/* Purple blur glow — top-right */}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary opacity-40"
            style={{ filter: "blur(140px)" }}
          />
          {/* Soft secondary glow — bottom-left for depth.
              opacity 0.25 → 0.35: at 0.25 + blur(120px) the lavender
              tint disappeared into the near-black ink, leaving the
              corner visually dead. 0.35 keeps the glow present
              without overpowering the primary top-right bloom. */}
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-40 -left-20 h-80 w-80 rounded-full opacity-35"
            style={{
              background:
                "radial-gradient(circle, rgba(189,112,246,0.5) 0%, transparent 70%)",
              filter: "blur(120px)",
            }}
          />

          <div className="relative max-w-3xl">
            {/* Eyebrow */}
            <p
              className="flex items-center gap-4 text-[11px] font-medium uppercase tracking-[0.22em] text-background/60"
              style={{
                fontFamily:
                  "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, monospace",
              }}
            >
              <span className="tabular-nums">№ 08</span>
              <span aria-hidden className="h-px w-8 bg-background/30" />
              <span>Owned, fixed-cost, shipped</span>
            </p>

            {/* Headline */}
            <h2
              id="process-cta-heading"
              className="mt-6 font-medium leading-[1.05] text-background"
              style={{
                fontSize: "clamp(32px, 5.4vw, 72px)",
                letterSpacing: "-0.045em",
              }}
            >
              We don&apos;t talk about it. We{" "}
              <span
                className="italic"
                style={{
                  fontFamily:
                    "var(--font-instrument-serif), Georgia, serif",
                  color: "#d4c5ff",
                }}
              >
                ship
              </span>{" "}
              it.
            </h2>

            {/* Ancillary line */}
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-background/75 sm:text-xl">
              Ship in 48. No scoping calls. No surprises.
            </p>

            {/* Buttons */}
            <div className="mt-10 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-6">
              <MagneticPill
                href="/#talk-to-us"
                variant="primary"
                cursorText="let's go"
              >
                Ship it now <ArrowRight aria-hidden size={18} />
              </MagneticPill>

              <Link
                href="/work"
                data-cursor-text="proof"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-background/70 transition-colors hover:text-background"
                style={{ letterSpacing: "-0.01em" }}
              >
                Proof in code <ArrowUpRight aria-hidden size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
