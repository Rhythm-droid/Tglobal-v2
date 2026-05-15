/**
 * `cn()` — conditional className composer.
 *
 * Combines `clsx` (conditional class joining) with `tailwind-merge`
 * (resolves conflicting Tailwind utilities by keeping the last one).
 *
 * Why both:
 *   • `clsx("p-2", isActive && "bg-primary")` handles conditionals.
 *   • `twMerge("p-2 p-4")` returns `"p-4"` — without it, Tailwind
 *     class conflicts silently keep BOTH classes and the cascade picks
 *     a winner unpredictably across builds.
 *
 * Use this in every component that takes a `className` prop so callers
 * can override defaults without specificity wars:
 *
 *   <Card className={cn("p-4 bg-surface", className)} />
 *
 * If a caller passes `className="p-8"`, the result is `"bg-surface p-8"` —
 * no leftover `p-4` to fight with.
 */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ReadonlyArray<ClassValue>): string {
  return twMerge(clsx(inputs));
}
