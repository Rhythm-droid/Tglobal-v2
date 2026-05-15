/* FilmGrain — global SVG feTurbulence noise overlay.
   ─────────────────────────────────────────────────────────────
   Fixed overlay across the entire viewport at near-invisible opacity.
   Gives the warm-paper sections a tactile, printed-on-paper feel.
   No JS — pure CSS class applied to a div.

   The feTurbulence filter generates organic fractal noise at a fine
   frequency (0.72) with 3 octaves for depth. The feColorMatrix strips
   color and controls alpha so it blends as a neutral texture.

   Mount once in the page layout. pointer-events: none ensures zero
   interaction cost. */

export default function FilmGrain() {
  return <div aria-hidden className="film-grain-overlay" />;
}
