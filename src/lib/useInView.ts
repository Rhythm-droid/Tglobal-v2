"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

/* useInView — IntersectionObserver hook scoped to a single element.
   ─────────────────────────────────────────────────────────────
   Why we need this:
     Paper-shaders (and our particle canvas) keep their requestAnimationFrame
     loop running at full tilt even when the section is scrolled out of
     view. With three shader sections + a particle canvas on /about, that
     burns GPU and feels laggy on mid-range hardware.

     Setting `speed={0}` on a paper-shaders component pauses its rAF loop
     entirely (per the @paper-design/shaders source). Combine this hook
     with a conditional speed prop and the shader only runs while it's
     on-screen.

   Defaults:
     • rootMargin "200px" — start animating slightly BEFORE the section
       enters so users never see a frozen-frame paint as the section
       comes into view.
     • threshold 0 — fire as soon as ANY pixel is visible.

   Returns a tuple [ref, inView] so the caller can attach the ref to
   any element and read the current visibility flag in render. */
export function useInView<T extends HTMLElement = HTMLDivElement>(
  options: IntersectionObserverInit = { rootMargin: "200px", threshold: 0 },
): [RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      const handle = requestAnimationFrame(() => setInView(true));
      return () => cancelAnimationFrame(handle);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) setInView(entry.isIntersecting);
      },
      options,
    );

    observer.observe(node);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.root, options.rootMargin, options.threshold]);

  return [ref, inView];
}
