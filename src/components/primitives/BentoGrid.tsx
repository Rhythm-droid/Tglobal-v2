/**
 * BentoGrid — responsive variable-size tile grid.
 *
 * The "bento box" pattern (popularized by Apple's product pages and
 * Vercel's marketing site): a grid where individual tiles span
 * different numbers of columns/rows, creating a curated layout
 * instead of a uniform grid. Used on /work (case studies index),
 * /services (offerings), and /about (values).
 *
 * Implementation:
 *   • CSS Grid with auto-flow dense — fills gaps with smaller tiles
 *     so the grid looks intentional even with mixed-size content.
 *   • Tiles set their own col/row span via the `<BentoTile>` component.
 *   • Mobile-first: defaults to single-column stack; columns appear
 *     at the `sm` breakpoint and up.
 *
 * Why CSS Grid, not Flexbox or library:
 *   Grid is the only CSS layout that lets a child specify "I want
 *   to span 2 cols and 2 rows" without parent intervention. Flexbox
 *   needs explicit width/height per child. Libraries like react-grid-layout
 *   add 30+ KB for animation features we don't need on a static layout.
 *
 * Server component — no `"use client"`. Pure CSS layout.
 *
 * Usage:
 *   <BentoGrid columns={3}>
 *     <BentoTile colSpan={2}>Featured</BentoTile>
 *     <BentoTile>Standard</BentoTile>
 *     <BentoTile>Standard</BentoTile>
 *     <BentoTile colSpan={2} rowSpan={2}>Tall + wide</BentoTile>
 *   </BentoGrid>
 */

import { cn } from "@/lib/cn";

interface BentoGridProps {
  children: React.ReactNode;
  /** Number of columns at the lg+ breakpoint. Defaults to 3. */
  columns?: 2 | 3 | 4;
  /** Optional className for the grid wrapper (gap, padding, etc). */
  className?: string;
}

export function BentoGrid({
  children,
  columns = 3,
  className,
}: BentoGridProps) {
  /* Tailwind doesn't support fully dynamic class names (`grid-cols-${n}`
     gets purged). Map the prop to a static class so JIT picks it up. */
  const colsClass = {
    2: "lg:grid-cols-2",
    3: "lg:grid-cols-3",
    4: "lg:grid-cols-4",
  }[columns];

  return (
    <div
      className={cn(
        /* Mobile stacks; sm shows 2 cols; lg shows the requested count.
           `auto-rows-fr` gives each row equal height; can be overridden
           by tiles using rowSpan. `gap-4` is the visual rhythm. */
        "grid grid-cols-1 sm:grid-cols-2 gap-4 auto-rows-fr",
        colsClass,
        className,
      )}
      style={{ gridAutoFlow: "dense" }}
    >
      {children}
    </div>
  );
}

interface BentoTileProps {
  children: React.ReactNode;
  /** Column span (1-4). Defaults to 1. */
  colSpan?: 1 | 2 | 3 | 4;
  /** Row span (1-3). Defaults to 1. */
  rowSpan?: 1 | 2 | 3;
  /** Optional className passed through. Wrap with MagicCard for hover glow. */
  className?: string;
  /** Render `as` tag — defaults to "div". Use "article" for case studies. */
  as?: "div" | "article" | "section" | "li";
}

export function BentoTile({
  children,
  colSpan = 1,
  rowSpan = 1,
  className,
  as = "div",
}: BentoTileProps) {
  /* Same dynamic-class problem as columns — explicit map for JIT. */
  const colSpanClass = {
    1: "",
    2: "sm:col-span-2",
    3: "sm:col-span-2 lg:col-span-3",
    4: "sm:col-span-2 lg:col-span-4",
  }[colSpan];

  const rowSpanClass = {
    1: "",
    2: "sm:row-span-2",
    3: "sm:row-span-2 lg:row-span-3",
  }[rowSpan];

  const Tag = as as React.ElementType;

  return (
    <Tag className={cn(colSpanClass, rowSpanClass, className)}>{children}</Tag>
  );
}
