interface LogoMarkProps {
  size?: number;
  showWord?: boolean;
  className?: string;
}

/**
 * TGlobal brand mark — exact SVG glyph from Figma plus the "tglobal" wordmark.
 * `currentColor` lets it recolor in dark sections (set parent `color`).
 * Gap `5.44px` matches Figma's Frame 2147223617 auto-layout spacing.
 */
export default function LogoMark({
  size = 40,
  showWord = true,
  className = "",
}: LogoMarkProps) {
  // Figma frame: 161.45×40. Wordmark hugs at 40px visual height, which for
  // Albert Sans Semibold with an ascender like "t" / "b" requires a
  // font-size roughly equal to the glyph box height.
  const wordSize = size;
  return (
    <span
      className={`inline-flex items-end text-foreground leading-none ${className}`}
      style={{ gap: "5.44px" }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        aria-hidden
      >
        <path
          d="M7.67969 0C7.85641 5.28913e-06 8 0.143585 8 0.320312V6.80371C8.14783 7.05535 8.31099 7.29724 8.48535 7.47852C8.66843 7.66878 8.91202 7.84328 9.16699 8H14.8789C15.1339 7.84327 15.3775 7.66878 15.5605 7.47852C15.7169 7.31599 15.8643 7.10485 16 6.88184V0.320312C16 0.143581 16.1436 0 16.3203 0H39.6797C39.8564 5.28913e-06 40 0.143585 40 0.320312V7.67969C40 7.85642 39.8564 7.99999 39.6797 8H16.8486C16.684 8.10626 16.5313 8.21542 16.4092 8.32715C16.2613 8.46245 16.1248 8.62834 16 8.80664V31.0596C16.1038 31.2149 16.2114 31.3602 16.3252 31.4785C16.5083 31.6688 16.7519 31.8433 17.0068 32H31.6797C31.8564 32 32 32.1436 32 32.3203V39.6797C32 39.8564 31.8564 40 31.6797 40H16.3203C16.1436 40 16 39.8564 16 39.6797V32.9824C15.8459 32.7386 15.6718 32.5058 15.4766 32.3271C15.3545 32.2154 15.2017 32.1062 15.0371 32H8.32031C8.14358 32 8 31.8564 8 31.6797V8.74121C7.8879 8.58778 7.76643 8.44586 7.63672 8.32715C7.51447 8.21531 7.36112 8.10635 7.19629 8H0.320312C0.143581 8 0 7.85642 0 7.67969V0.320312C0 0.143581 0.143581 0 0.320312 0H7.67969ZM39.6797 16C39.8564 16 40 16.1436 40 16.3203V23.6797C40 23.8564 39.8564 24 39.6797 24H32.3203C32.1436 24 32 23.8564 32 23.6797V16.3203C32 16.1436 32.1436 16 32.3203 16H39.6797Z"
          fill="currentColor"
        />
      </svg>
      {showWord && (
        <span
          className="font-semibold tracking-[-0.04em]"
          style={{ fontSize: wordSize, lineHeight: 1 }}
        >
          tglobal
        </span>
      )}
    </span>
  );
}
