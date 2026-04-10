"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Global motion provider.
 * `reducedMotion="user"` makes framer-motion strip transform/scale/rotate
 * animations (keeping opacity) automatically for users who opted into
 * prefers-reduced-motion. Opting into this at the root is the only way to
 * avoid per-component SSR/client mismatches from useReducedMotion().
 */
export default function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
