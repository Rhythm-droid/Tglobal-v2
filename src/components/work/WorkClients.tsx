"use client";

import Link from "next/link";
import { useState } from "react";

import { AnimateIn, ScrambleSwap } from "@/components/primitives";
import { ALL_CLIENTS } from "@/app/work/data";
import { cn } from "@/lib/cn";

/**
 * WorkClients — the pill grid trust signal.
 *
 * Renders all ten clients as oversized pills below the metrics strip.
 * Linked pills (all ten currently have detail pages) scramble their
 * text from the client name → their industry on hover, using the
 * existing `ScrambleSwap` primitive. The scramble re-runs every time
 * `text` changes, so the hover-in and hover-out both feel kinetic.
 *
 * Non-linked pills (none in v1, but the data shape supports them)
 * stay static — we don't promise a page that doesn't exist.
 *
 * Layout: 2 cols mobile → 3 cols tablet → 5 cols desktop, matching
 * the spec's "5 col desktop" instruction.
 */
export default function WorkClients() {
  return (
    <section
      aria-labelledby="clients-heading"
      className="bg-background border-t border-border"
    >
      <div className="mx-auto w-full max-w-[1440px] px-6 sm:px-8 lg:px-14 xl:px-20 py-20 sm:py-24 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-baseline">
          <div className="lg:col-span-5">
            <p
              className="font-mono text-[11px] sm:text-xs uppercase tracking-[0.22em] text-muted"
              style={{ fontFamily: "var(--font-mono), 'JetBrains Mono', monospace" }}
            >
              N° 08 — Clients
            </p>
            <h2
              id="clients-heading"
              className="mt-5 font-medium text-foreground leading-[1.02]"
              style={{
                fontSize: "clamp(38px, 5.6vw, 80px)",
                letterSpacing: "-0.05em",
              }}
            >
              Teams who let us touch the{" "}
              <span
                className="italic text-primary"
                style={{
                  fontFamily: "var(--font-instrument-serif), Georgia, serif",
                  fontWeight: 400,
                }}
              >
                codebase.
              </span>
            </h2>
          </div>
          <div className="lg:col-span-7 lg:pt-3">
            <p className="text-base sm:text-lg leading-relaxed text-foreground/75 max-w-prose">
              Hover any pill to see the industry behind the name. Click through
              for the full engagement — what was broken, what we shipped, how
              long it took.
            </p>
          </div>
        </div>

        <ul className="mt-12 sm:mt-16 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {ALL_CLIENTS.map((client, idx) => (
            <AnimateIn
              key={client.name}
              as="li"
              delay={0.04 * idx}
              y={10}
              duration={0.55}
            >
              <ClientPill client={client} />
            </AnimateIn>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ─── ClientPill ──────────────────────────────────────────────────
   Hover toggles the ScrambleSwap target between the client name and
   their industry. The scramble runs every time `text` changes, so
   mouseenter and mouseleave both feel mechanical. When the pill has a
   `slug`, the whole surface wraps in a Link with a focus-ring; non-
   linked pills render the same surface as a static span. */
function ClientPill({
  client,
}: {
  client: (typeof ALL_CLIENTS)[number];
}) {
  const [hover, setHover] = useState(false);
  const text = hover ? client.industry : client.name;
  const inner = (
    <span
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      className={cn(
        "block rounded-2xl border border-border bg-surface px-5 py-6 text-center text-base sm:text-lg font-medium tracking-[-0.02em]",
        "transition-all duration-300",
        "hover:border-primary hover:bg-soft-lavender hover:-translate-y-0.5",
      )}
    >
      <ScrambleSwap
        text={text}
        duration={600}
        randomRefreshMs={55}
        className="block text-foreground"
      />
    </span>
  );

  if (client.slug) {
    return (
      <Link
        href={`/work/${client.slug}`}
        aria-label={`See the ${client.name} case study (${client.industry})`}
        className="block focus-ring rounded-2xl"
      >
        {inner}
      </Link>
    );
  }
  return inner;
}
