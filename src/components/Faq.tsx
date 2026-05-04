"use client";

/* ─── FAQ section ────────────────────────────────────────────────
 *
 * Pre-CTA buyer-question handler. Sits between Clients and CTA so a
 * visitor's last objections get addressed before the contact form.
 * Anchor `#faq` is used by the Footer support-links column so this
 * section must keep that id stable.
 *
 * Behaviour:
 *   • Single-expand accordion — opening one closes the others. The
 *     boss explicitly asked for "one at a time" so we DON'T use the
 *     all-expanded reference-image layout, even though that's how
 *     the screenshot reads.
 *   • First item opens by default — gives the page visual content
 *     immediately rather than a stack of empty rows, and shows the
 *     answer typography so users learn what's behind the others.
 *   • Click anywhere on the row toggles. Hit-target spans the full
 *     row (not just the icon) per touch-target-size rule.
 *
 * Layout:
 *   • No card wrapper — the section is bordered rows separated by
 *     border-t, per the anti-card design rule. The visual chrome is
 *     spacing + dividers, not chips.
 *   • Heading aligned left (NOT centered like the CTA heading) to
 *     match the editorial register the reference image suggests.
 *   • Icon: a single SVG plus that rotates 45deg into an ✕ when the
 *     row is open. Cleaner than swapping two icons; framer-motion
 *     handles the rotation interpolation natively.
 *
 * Animation:
 *   • framer-motion AnimatePresence around the answer panel, with
 *     `height: "auto"` morph. Works because the panel content has
 *     known intrinsic height and isn't deeply nested.
 *   • prefers-reduced-motion shortens the animation duration to 0
 *     and turns off rotation easing — content still toggles, but no
 *     visible motion.
 *
 * Accessibility:
 *   • Each question is wrapped in an <h3> for proper heading
 *     hierarchy (Hero h1 → section h2s → faq question h3s).
 *   • The clickable trigger is a real <button> with aria-expanded
 *     and aria-controls pointing at the panel's id.
 *   • Answer panel has role="region" and aria-labelledby on the
 *     trigger button so screen readers announce the question when
 *     focus enters the answer text. */

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

/* ─── Content ────────────────────────────────────────────────────
 *
 * Questions adapted from the reference image but rewritten for
 * TGlobal's actual business. The reference assumes a retail-only
 * studio; TGlobal works across healthcare, supply chain, fintech,
 * and consumer marketplaces, so the "Do you only work with retail
 * companies?" question becomes a broader "What kinds of teams do
 * you work with?". Copy stays in the founder's voice — concrete,
 * unhedged, no filler. */
const FAQ_ITEMS: ReadonlyArray<{
  question: string;
  answer: string;
}> = [
  {
    question: "How are you different from a traditional dev agency?",
    answer:
      "Two things. First, we don't bill engineering time. We commit to outcomes per sprint, and we eat the overruns if they happen. Second, our agent stack lets a small team deliver what a much bigger team usually does. The combination is why teams trust us with go-live deadlines they wouldn't give a traditional vendor.",
  },
  {
    question: "What does an engagement cost?",
    answer:
      "We quote a fixed cost per sprint after a discovery week, once we understand the scope. We don't publish rate cards because we're not selling rates, we're selling shipped systems. If we quote a number before we understand your business, that number is a guess.",
  },
  {
    question: "What if we want to stop after one sprint?",
    answer:
      "You can. Two weeks' notice between sprints, no cancellation penalty. The code, docs, and infrastructure are yours from day one. There's nothing locking you in. The contract is built so the cost of leaving is the same as the cost of staying.",
  },
  {
    question: "Where does AI sit in your delivery?",
    answer:
      "Each engineer is paired with an internal agent stack: spec, build, test, deploy. The agents handle the work that doesn't need human judgment; humans own architecture, trade-offs, and the relationship with your team. We never ship code an agent wrote alone, and we mark every AI-assisted commit so your team knows what they're reviewing.",
  },
  {
    question: "Do you work with our existing engineering team?",
    answer:
      "Yes. About half our work is alongside in-house teams: we deliver a module, your team owns the rest. Code lives in your repo, runs on your CI, follows your standards. A structured handoff phase is built into every sprint so there's no \"black box\" once we leave.",
  },
  {
    question: "What kinds of teams do you work with?",
    answer:
      "Founders, scaleups, and enterprise teams who care about ship-velocity. We've shipped for healthcare, supply chain, fintech, and consumer marketplaces. If you have real users waiting for software and a deadline that's already slipped once, we're a fit.",
  },
];

/* ─── Section ────────────────────────────────────────────────── */
export default function Faq() {
  /* `null` means no item is open. Initialised to 0 so the first
   * item opens by default — gives the section visual weight on
   * first paint and teaches the user what an "open" state looks
   * like before they click anything. Single-expand means at most
   * one index is ever non-null. */
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="relative w-full overflow-hidden pt-16 pb-20 sm:pt-20 sm:pb-24 lg:pt-24 lg:pb-28"
    >
      {/* Soft lavender wash that ties the section to Hero/CTA without
          competing with the form section directly below it. Lower
          opacity than CTA's wash so the eye still lands on the form. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 18% 10%, rgba(189,112,246,0.10) 0%, transparent 60%), linear-gradient(180deg, #ffffff 0%, #fbf9ff 100%)",
        }}
      />

      <div className="mx-auto w-full max-w-[1100px] px-6 sm:px-10 lg:px-14">
        {/* ─── Heading row ─── */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="eyebrow m-0"
        >
          Frequently Asked
        </motion.p>
        <motion.h2
          id="faq-heading"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, delay: 0.05, ease: EASE }}
          className="display-lg mt-5 max-w-[20ch]"
        >
          Questions buyers ask{" "}
          <em
            className="not-italic text-primary"
            style={{
              fontFamily: "var(--font-instrument-serif), Georgia, serif",
              fontStyle: "italic",
            }}
          >
            before a call.
          </em>
        </motion.h2>

        {/* ─── Items list ─── */}
        <ul className="mt-12 list-none p-0 sm:mt-16">
          {FAQ_ITEMS.map((item, idx) => (
            <FaqRow
              key={idx}
              index={idx}
              question={item.question}
              answer={item.answer}
              isOpen={openIndex === idx}
              onToggle={() =>
                setOpenIndex((prev) => (prev === idx ? null : idx))
              }
            />
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ─── Row ────────────────────────────────────────────────────── */
interface FaqRowProps {
  index: number;
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}

function FaqRow({ index, question, answer, isOpen, onToggle }: FaqRowProps) {
  const reduceMotion = useReducedMotion();
  const triggerId = `faq-trigger-${index}`;
  const panelId = `faq-panel-${index}`;

  return (
    <motion.li
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: index * 0.04, ease: EASE }}
      /* `border-t` on every row gives the editorial-divider look the
       * design calls for. Last row needs a border-bottom so it
       * doesn't dangle visually after the final answer collapses. */
      className="border-t border-border/70 last:border-b"
    >
      <h3>
        <button
          id={triggerId}
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls={panelId}
          className="group flex w-full items-center justify-between gap-6 py-6 text-left transition-colors duration-200 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-4 focus-visible:ring-offset-white sm:py-7"
        >
          <span
            className={`text-[16px] font-semibold tracking-[-0.005em] transition-colors duration-200 sm:text-[17px] ${
              isOpen ? "text-foreground" : "text-foreground/90"
            }`}
          >
            {question}
          </span>
          <span
            aria-hidden
            className={`flex-shrink-0 text-primary transition-colors duration-200 ${
              isOpen ? "text-primary" : "text-primary/70 group-hover:text-primary"
            }`}
          >
            <PlusIcon open={isOpen} reduceMotion={!!reduceMotion} />
          </span>
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            id={panelId}
            role="region"
            aria-labelledby={triggerId}
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={{
              open: { opacity: 1, height: "auto" },
              collapsed: { opacity: 0, height: 0 },
            }}
            transition={{
              /* Discrete duration — content reveals in 360ms, exits
               * in 220ms. Exit is faster than enter per the motion
               * design rule (so dismissal feels responsive). */
              duration: reduceMotion ? 0 : 0.36,
              ease: EASE,
            }}
            style={{ overflow: "hidden" }}
          >
            <div className="pr-12 pb-7 text-[15.5px] leading-[1.65] text-muted sm:pb-8 sm:text-[16px]">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
}

/* Plus glyph that rotates 45° to become an × when open. Single SVG
 * with two lines — rotating the whole svg flips both lines together,
 * which is cheaper than swapping icons and avoids a layout flash on
 * toggle. With reduceMotion the rotation is instantaneous. */
function PlusIcon({
  open,
  reduceMotion,
}: {
  open: boolean;
  reduceMotion: boolean;
}) {
  return (
    <motion.svg
      width={22}
      height={22}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      animate={{ rotate: open ? 45 : 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.28, ease: EASE }}
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </motion.svg>
  );
}
