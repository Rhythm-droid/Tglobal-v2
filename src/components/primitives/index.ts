/**
 * Primitives barrel export.
 *
 * Centralizes the public API of the animation primitive library so
 * pages can import multiple primitives in one line:
 *
 *   import { WordReveal, NumberTicker, MagicCard } from "@/components/primitives";
 *
 * vs. the verbose alternative:
 *
 *   import WordReveal from "@/components/primitives/WordReveal";
 *   import NumberTicker from "@/components/primitives/NumberTicker";
 *   import MagicCard from "@/components/primitives/MagicCard";
 *
 * Trade-off: barrel files can hurt tree-shaking in webpack/turbopack
 * if NOT every primitive is used on every page. Next.js 16's Turbopack
 * tree-shakes ESM re-exports correctly, so this is safe — verified
 * via the build output.
 *
 * Each export here has its own file with detailed docs at the top —
 * read the source for usage notes per primitive.
 */

// Animation building blocks
export { default as PageTransition } from "./PageTransition";
export { default as WordReveal } from "./WordReveal";
export { default as NumberTicker } from "./NumberTicker";
export { default as ScrambleText } from "./ScrambleText";

// Surface treatments
export { default as MagicCard } from "./MagicCard";
export { default as BorderBeam } from "./BorderBeam";
export { default as Spotlight } from "./Spotlight";

// Layout primitives
export { BentoGrid, BentoTile } from "./BentoGrid";

// UI affordances
export { default as ScrollProgress } from "./ScrollProgress";

// Existing primitives (already in the codebase)
export { default as AnimateIn } from "./AnimateIn";
export { default as AccentTypewriter } from "./AccentTypewriter";
export { default as MagneticPill } from "./MagneticPill";
export { default as LogoMark } from "./LogoMark";
export { default as MotionProvider } from "./MotionProvider";
export { default as SmoothScrollProvider } from "./SmoothScrollProvider";
export { default as SectionShell } from "./SectionShell";
export { default as HorizontalPin } from "./HorizontalPin";
export { default as CountryPicker } from "./CountryPicker";
