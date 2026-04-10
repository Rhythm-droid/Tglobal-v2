"use client";

import { useRef, type MouseEvent, type ReactNode } from "react";

interface MagneticPillProps {
  href: string;
  variant?: "primary" | "soft";
  children: ReactNode;
  ariaLabel?: string;
  strength?: number;
}

/**
 * Magnetic pill — tracks the cursor on hover via direct DOM transform
 * (no SSR/client style mismatch, no framer-motion dependency). The
 * `.pill-magnetic` class supplies the smooth CSS return transition.
 */
export default function MagneticPill({
  href,
  variant = "primary",
  children,
  ariaLabel,
  strength = 0.18,
}: MagneticPillProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const rafRef = useRef<number | null>(null);

  const setTransform = (x: number, y: number, withTransition: boolean) => {
    if (!ref.current) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      if (!ref.current) return;
      // While tracking, remove transition for 1:1 cursor following.
      ref.current.style.transition = withTransition
        ? ""
        : "background-color 0.2s ease, color 0.2s ease, box-shadow 0.25s ease";
      ref.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });
  };

  const handleMove = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = Math.max(-8, Math.min(8, (e.clientX - cx) * strength));
    const dy = Math.max(-8, Math.min(8, (e.clientY - cy) * strength));
    setTransform(dx, dy, false);
  };

  const handleLeave = () => {
    setTransform(0, 0, true);
  };

  return (
    <a
      ref={ref}
      href={href}
      aria-label={ariaLabel}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={`pill pill-magnetic ${
        variant === "primary" ? "pill-primary" : "pill-soft"
      } focus-ring`}
    >
      {children}
    </a>
  );
}
