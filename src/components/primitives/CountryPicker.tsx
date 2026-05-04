"use client";

/* ─── CountryPicker ───────────────────────────────────────────────
 *
 * Custom country dropdown for the phone-number field on the startup
 * form. Native <select> can't render flag images alongside the
 * options (only emoji, which Windows doesn't render reliably for
 * regional indicators), so this is a hand-rolled listbox built on
 * the WAI-ARIA combobox pattern.
 *
 * Why custom rather than a library:
 *   • Zero new deps (project is already on a tight bundle budget).
 *   • Matches the form's visual style exactly without override hacks.
 *   • Controls focus management precisely so keyboard users can
 *     pick a country in 2 keystrokes (Tab, Down, Enter).
 *
 * ARIA shape:
 *   • Trigger: <button role="combobox" aria-haspopup="listbox"
 *     aria-expanded aria-controls=listId>
 *   • Panel:   <ul role="listbox">
 *   • Option:  <li role="option" aria-selected>
 *
 * Keyboard:
 *   • Trigger: Enter/Space/Down → open + focus active option
 *   • Listbox: ArrowUp/Down → move active option (no select-on-move,
 *     to avoid noisy state churn during navigation)
 *               Enter → commit + close
 *               Escape → close, restore focus to trigger
 *               A–Z → jump to first country whose name starts with key
 *   • Click outside → close.
 *
 * The active option (the one keyboard arrows are pointing at) is
 * tracked separately from the SELECTED option so users can preview
 * with arrow keys before committing with Enter, which is the
 * expected listbox behaviour for screen-reader users. */

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { COUNTRIES, findCountry, flagUrl } from "@/lib/countries";

interface CountryPickerProps {
  /** Currently selected ISO 3166 alpha-2 code (lowercase). */
  value: string;
  /** Called when the user commits a new selection. */
  onChange: (iso2: string) => void;
  /** Visual error state (e.g. when the linked phone field has an
   *  error — caller passes its own error flag through). */
  invalid?: boolean;
  /** Disables the trigger entirely. */
  disabled?: boolean;
  /** Override the trigger's accessible name (defaults to "Country"). */
  ariaLabel?: string;
}

export default function CountryPicker({
  value,
  onChange,
  invalid = false,
  disabled = false,
  ariaLabel = "Country",
}: CountryPickerProps) {
  const [open, setOpen] = useState(false);
  /* Active option = the option focus-ringed inside the listbox while
     the user navigates with arrow keys. Distinct from `value`, we
     don't write to `value` until the user hits Enter. */
  const [activeIso, setActiveIso] = useState(value);
  /* Type-to-search announcer.
     ──────────────────────────
     The listbox already exposes the active option to assistive tech
     via `aria-activedescendant` further down, which modern screen
     readers (NVDA, VoiceOver, JAWS) announce on change. As an extra
     safety net for older SR versions and for users with verbose-
     announcement preferences off, we mirror jump events into a
     dedicated `aria-live="polite"` span. The `key` is bumped on
     every jump (incrementing counter) so re-announcing the same
     country on a repeat letter press still triggers a change event
     in the live region. Only set on type-ahead jumps; arrow nav
     leaves it alone since aria-activedescendant handles those well. */
  const [announcement, setAnnouncement] = useState<{ text: string; n: number }>(
    { text: "", n: 0 },
  );

  const listboxId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<Map<string, HTMLLIElement>>(new Map());

  const selected = useMemo(() => findCountry(value), [value]);

  /* Keep activeIso in sync with value when the parent changes value
     externally (e.g. on form reset). Without this the next open
     would briefly highlight a stale country. */
  useEffect(() => {
    setActiveIso(value);
  }, [value]);

  /* Close on outside click. Listener is only attached while open so
     we don't pay for it on every interaction elsewhere. */
  useEffect(() => {
    if (!open) return;
    const handleDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        listboxRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    };
    document.addEventListener("mousedown", handleDown);
    return () => document.removeEventListener("mousedown", handleDown);
  }, [open]);

  /* When the panel opens, scroll the active option into view and
     focus the listbox so arrow keys land on it (otherwise focus
     stays on the trigger and arrow keys do nothing). */
  useEffect(() => {
    if (!open) return;
    const el = itemRefs.current.get(activeIso);
    el?.scrollIntoView({ block: "nearest" });
    listboxRef.current?.focus();
  }, [open, activeIso]);

  const commit = (iso: string) => {
    onChange(iso);
    setOpen(false);
    /* Restore focus to the trigger so subsequent Tab keystrokes
       continue to flow into the phone field. Without this the
       browser would put focus on body after the listbox unmounts. */
    queueMicrotask(() => triggerRef.current?.focus());
  };

  const handleTriggerKey = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (
      e.key === "Enter" ||
      e.key === " " ||
      e.key === "ArrowDown" ||
      e.key === "ArrowUp"
    ) {
      e.preventDefault();
      setActiveIso(value);
      setOpen(true);
    }
  };

  const moveActive = (delta: number) => {
    const idx = COUNTRIES.findIndex((c) => c.iso2 === activeIso);
    const safeIdx = idx === -1 ? 0 : idx;
    const next =
      (safeIdx + delta + COUNTRIES.length) % COUNTRIES.length;
    setActiveIso(COUNTRIES[next]!.iso2);
  };

  const handleListKey = (e: React.KeyboardEvent<HTMLUListElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      moveActive(1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      moveActive(-1);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      commit(activeIso);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      setActiveIso(COUNTRIES[0]!.iso2);
    } else if (e.key === "End") {
      e.preventDefault();
      setActiveIso(COUNTRIES[COUNTRIES.length - 1]!.iso2);
    } else if (/^[a-zA-Z]$/.test(e.key)) {
      /* Type-to-search: jump to the first country whose name starts
         with the typed letter. Doesn't accumulate (single-key
         search), matches typical native <select> behaviour. */
      const ch = e.key.toLowerCase();
      const start = COUNTRIES.findIndex((c) => c.iso2 === activeIso);
      const reordered = [
        ...COUNTRIES.slice(start + 1),
        ...COUNTRIES.slice(0, start + 1),
      ];
      const match = reordered.find((c) => c.name.toLowerCase().startsWith(ch));
      if (match) {
        setActiveIso(match.iso2);
        /* Mirror the jump into the aria-live region so older screen
           readers that don't watch aria-activedescendant changes
           still announce the new country. Bumped counter forces a
           remount so re-announcing the same country (e.g. typing
           "U" twice while only one country starts with U) still
           fires a change event. */
        setAnnouncement((prev) => ({
          text: `${match.name}, ${match.dial}`,
          n: prev.n + 1,
        }));
      }
    }
  };

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-label={ariaLabel}
        aria-invalid={invalid || undefined}
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          setActiveIso(value);
          setOpen((p) => !p);
        }}
        onKeyDown={handleTriggerKey}
        className={`flex h-full cursor-pointer items-center gap-2 border-0 bg-transparent py-4 pl-4 pr-3 text-[15px] text-foreground outline-none focus-visible:ring-0 ${
          disabled ? "cursor-not-allowed opacity-60" : ""
        }`}
      >
        <FlagImg iso2={selected.iso2} alt="" />
        <span className="font-medium">{selected.dial}</span>
        <Chevron open={open} />
      </button>

      {open && (
        /* `data-lenis-prevent` opts this scrollable container out of
           Lenis's global wheel/touch interception. Without it, wheel
           events inside the dropdown bubble up to Lenis (configured
           in SmoothScrollProvider), which scrolls the PAGE instead
           of the listbox — making the dropdown's own scroll feel
           broken. The data attribute is the documented Lenis escape
           hatch and only affects this specific element. */
        <ul
          ref={listboxRef}
          id={listboxId}
          role="listbox"
          aria-label={ariaLabel}
          aria-activedescendant={`${listboxId}-${activeIso}`}
          tabIndex={-1}
          onKeyDown={handleListKey}
          data-lenis-prevent
          className="absolute left-0 top-full z-30 mt-2 max-h-[280px] w-[280px] overflow-y-auto overscroll-contain rounded-2xl border border-border bg-white py-1.5 shadow-[0_18px_46px_-18px_rgba(15,15,30,0.28),0_4px_14px_-6px_rgba(15,15,30,0.10)] outline-none"
        >
          {COUNTRIES.map((c) => {
            const isSelected = c.iso2 === value;
            const isActive = c.iso2 === activeIso;
            return (
              <li
                key={c.iso2}
                ref={(el) => {
                  if (el) itemRefs.current.set(c.iso2, el);
                  else itemRefs.current.delete(c.iso2);
                }}
                id={`${listboxId}-${c.iso2}`}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setActiveIso(c.iso2)}
                onClick={() => commit(c.iso2)}
                className={`flex cursor-pointer items-center gap-3 px-3 py-2 text-[14px] ${
                  isActive ? "bg-primary/5" : ""
                }`}
              >
                <FlagImg iso2={c.iso2} alt="" />
                <span className="text-tertiary text-[12px] font-semibold uppercase tracking-wide">
                  {c.iso2}
                </span>
                <span className="flex-1 truncate text-foreground">{c.name}</span>
                <span className="text-muted">{c.dial}</span>
                {isSelected && <Check />}
              </li>
            );
          })}
        </ul>
      )}
      {/* Type-to-search aria-live announcer. Visually hidden via
          clip-path; always rendered in the DOM (rather than
          conditionally) so the live region is registered with the
          accessibility tree on first paint. The `key` swap on every
          jump (announcement.n) forces a remount so SRs re-fire even
          when the announced text is identical to the previous one. */}
      <span
        key={announcement.n}
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: "absolute",
          width: "1px",
          height: "1px",
          padding: 0,
          margin: "-1px",
          overflow: "hidden",
          clip: "rect(0, 0, 0, 0)",
          whiteSpace: "nowrap",
          border: 0,
        }}
      >
        {announcement.text}
      </span>
    </div>
  );
}

/* Flag rendered as <img> with width/height set to avoid CLS as the
 * SVG streams in. flagcdn.com is whitelisted in the CSP; if the
 * fetch fails (e.g. offline), the alt-text-less img collapses to
 * empty space rather than showing a broken-image icon — the dial
 * code next to it is enough to identify the country. */
function FlagImg({ iso2, alt }: { iso2: string; alt: string }) {
  return (
    /* Plain <img> intentional — Next.js Image would require remote-pattern
       config for flagcdn.com and SVG flags don't benefit from raster
       optimisation pipelines. The CSP already whitelists flagcdn.com. */
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={flagUrl(iso2)}
      alt={alt}
      aria-hidden={alt === "" ? true : undefined}
      width={20}
      height={14}
      loading="lazy"
      decoding="async"
      className="block h-[14px] w-[20px] flex-shrink-0 rounded-[2px] object-cover ring-1 ring-black/5"
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).style.visibility = "hidden";
      }}
    />
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function Check() {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="text-primary"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
