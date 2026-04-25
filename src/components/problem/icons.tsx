/**
 * Inline icons shared by the Problem section cards.
 * Kept as pure SVGs (no runtime cost, no dependency) so each card stays
 * a simple server component.
 */

type IconProps = {
  readonly className?: string;
};

export function SparklesIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3zM19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14zM5 14l.6 1.8L7.4 16l-1.8.6L5 18l-.6-1.8L2.6 16l1.8-.6L5 14z"
        fill="currentColor"
      />
    </svg>
  );
}

export function CheckIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

export function CloudIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M17.5 19a4.5 4.5 0 100-9h-1.26a7 7 0 10-12.23 6" />
      <path d="M4 15.5a3.5 3.5 0 003.5 3.5H17" />
    </svg>
  );
}

export function MousePointerIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M4 3l6.5 16L12 12l7-1.5L4 3z" />
    </svg>
  );
}
