/* About-page shader palette — single source of truth.
   ─────────────────────────────────────────────────────────────
   `HERO_COLORS` is used by BOTH the opening hero and the closing
   CTA so the page bookends on identical shader stops. Drifting
   either definition would silently break that bookend — defining
   once here makes it impossible.

   Each entry is the same hex Figma sampled from the ink → lavender
   ramp. Order matters: paper-shaders interpolates BETWEEN adjacent
   stops, so the dark→light progression is what produces the deep-
   to-luminous gradient flow the hero is famous for. */
export const HERO_COLORS = [
  "#ffffff",  // white
  "#f6f1ff",  // very pale lavender
  "#ede4ff",  // soft lavender
  "#dcd1ff",  // slightly deeper lavender (mid blend)
  "#c5baff",  // lavender light (deepest in this palette)
] as const;
