/* Work-page shader palette — single source of truth.
   ─────────────────────────────────────────────────────────────
   Mirrors /about's HERO_COLORS so the two top-of-page bookends
   share the same visual identity across the site. Each entry is
   sampled from the same ink → lavender ramp Figma used for the
   /about hero; paper-shaders interpolates between adjacent stops
   to produce the soft-lavender → light-purple wash. */
export const WORK_HERO_COLORS = [
  "#ffffff",  // white
  "#f6f1ff",  // very pale lavender
  "#ede4ff",  // soft lavender
  "#dcd1ff",  // slightly deeper lavender (mid blend)
  "#c5baff",  // lavender light (deepest in this palette)
] as const;
