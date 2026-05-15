"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Global motion provider.
 * `reducedMotion="never"` opts the whole app OUT of framer-motion's
 * automatic transform/scale/rotate stripping for users with
 * `prefers-reduced-motion: reduce` set. Brand decision: motion is
 * core to the identity and runs at full fidelity for every visitor
 * regardless of OS-level motion preferences.
 *
 * If accessibility compliance ever becomes a hard requirement (gov
 * contracts, EU EAA, ADA, Section 508), flip this back to "user" —
 * framer-motion will resume honoring the OS setting site-wide.
 */
export default function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="never">{children}</MotionConfig>;
}
