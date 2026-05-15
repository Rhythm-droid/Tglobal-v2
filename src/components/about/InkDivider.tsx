/* InkDivider — animated SVG section divider.
   ─────────────────────────────────────────────────────────────
   A single horizontal line that draws itself L→R as it enters
   the viewport. Animation driven by CSS `animation-timeline: view()`
   — zero JS, runs on the GPU compositor.

   Falls back to a static line if scroll-driven animations aren't
   supported. Use between sections that need visual breathing room. */

export default function InkDivider() {
  return (
    <div className="mx-auto w-full max-w-[1440px] px-6 sm:px-8 lg:px-14 xl:px-20">
      <svg
        aria-hidden
        className="ink-divider"
        viewBox="0 0 1400 1"
        preserveAspectRatio="none"
      >
        <line x1="0" y1="0.5" x2="1400" y2="0.5" pathLength="1" />
      </svg>
    </div>
  );
}
