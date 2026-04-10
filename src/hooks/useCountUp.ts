"use client";

import { useEffect, useRef, useState } from "react";

interface UseCountUpOptions {
  end: number;
  duration?: number;
  start?: number;
  decimals?: number;
}

/**
 * Counts from `start` to `end` once the element scrolls into view.
 * Returns [ref, value] — attach `ref` to the element to observe.
 */
export function useCountUp<T extends HTMLElement = HTMLDivElement>({
  end,
  duration = 1800,
  start = 0,
  decimals = 0,
}: UseCountUpOptions): [React.RefObject<T | null>, number] {
  const ref = useRef<T | null>(null);
  const [value, setValue] = useState<number>(start);
  const hasRunRef = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || hasRunRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting || hasRunRef.current) return;
        hasRunRef.current = true;
        observer.disconnect();

        const startTs = performance.now();
        const factor = Math.pow(10, decimals);
        const tick = (now: number) => {
          const elapsed = now - startTs;
          const progress = Math.min(1, elapsed / duration);
          const eased = 1 - Math.pow(1 - progress, 3);
          const next = start + (end - start) * eased;
          setValue(Math.round(next * factor) / factor);
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.35 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [end, duration, start, decimals]);

  return [ref, value];
}
