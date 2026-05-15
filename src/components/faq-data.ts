/* Single source of truth for FAQ content.
 *
 * Why split from Faq.tsx: Faq.tsx is a client component (uses framer-motion
 * + useState). The homepage needs the same items rendered as JSON-LD inside
 * a server <script type="application/ld+json"> tag so Google can parse the
 * structured data without executing JS. Sharing this typed array keeps the
 * rendered UI and the structured data in lock-step — if someone updates a
 * question here, the SEO schema updates with it automatically. */

export interface FaqItem {
  readonly question: string;
  readonly answer: string;
}

export const FAQ_ITEMS: ReadonlyArray<FaqItem> = [
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
] as const;

/**
 * Build the FAQPage JSON-LD schema from the FAQ items. Per schema.org spec:
 * https://schema.org/FAQPage — Google uses this to surface FAQ rich results
 * in search, where individual Q&As appear as expandable rows under the link.
 *
 * Important: only emit this schema on pages where the FAQ is actually
 * visible. Emitting FAQPage on a page that doesn't render the questions is
 * a structured-data violation that can demote the page in search.
 */
export function buildFaqJsonLd(items: ReadonlyArray<FaqItem> = FAQ_ITEMS) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  } as const;
}
