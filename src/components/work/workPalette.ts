/* Work-page shader palette — single source of truth.
   ─────────────────────────────────────────────────────────────
   Used by WorkHero (top of /work) and shared with WorkCTA so the
   page bookends on identical shader stops. Defining once here makes
   accidental drift impossible.

   Stops are ordered DARK → DEEP VIOLET → ACCENT VIOLET → DARK so the
   mesh interpolation produces a moody "ink-and-aurora" wash rather
   than a flat color field. Distortion + swirl in the consumer
   component animates the stops slowly around the canvas. */
export const WORK_HERO_COLORS = [
  "#03020B", // foreground ink
  "#0E0A1E", // deep ink with hint of purple
  "#2A1455", // moody violet midtone
  "#4B28FF", // primary brand purple
  "#BD70F6", // accent violet bloom
  "#0E0A1E", // back to deep ink (closes the loop)
] as const;
