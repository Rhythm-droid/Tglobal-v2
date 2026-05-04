/* ─── Privacy policy content ──────────────────────────────────────
 *
 * Single source of truth for the policy text rendered at `/privacy`.
 * Kept separate from the page layout so non-technical edits (a
 * lawyer reviewing copy, a marketing tweak) don't require touching
 * JSX. The page reads `SECTIONS` and renders them in order; the
 * sticky TOC also reads it to build navigation.
 *
 * ⚠️  IMPORTANT — this is a starting-point draft authored from the
 * site's actual data flows (contact form → web3forms.com, no
 * analytics, two-office US/IN structure). It is NOT a legal review.
 * Have counsel review before publishing, especially for:
 *   • India DPDP grievance officer naming + 7-day SLA
 *   • CCPA "Do Not Sell or Share" right (we don't, but the disclosure
 *     wording matters)
 *   • EU/UK GDPR lawful-basis claims and cross-border transfer
 *     mechanism (SCCs vs adequacy decision for India)
 *   • Children's age threshold (16 EU vs 13 US)
 *
 * Body content uses simple HTML inline tags (<strong>, <em>, <a>) —
 * the renderer parses them via dangerouslySetInnerHTML on a
 * controlled string list. Adding a heavier markdown parser would be
 * over-engineered for the scope. */

export interface PolicyParagraph {
  /** A single paragraph or list. `kind: "p"` is body text; `kind:
   *  "ul"` is a bulleted list whose items are the strings in `items`.
   *  `kind: "h3"` is an inline subheading (for region-aware Rights
   *  bullets, etc.). */
  kind: "p" | "ul" | "h3";
  /** For p/h3: the text. May contain <strong>, <em>, <a> inline. */
  text?: string;
  /** For ul: list items. May contain inline tags as above. */
  items?: string[];
}

export interface PolicySection {
  /** Slug used for the `id` attribute on the section heading and the
   *  hash in the TOC link. URL-safe, lowercase, kebab-case. */
  id: string;
  /** Section heading shown in the page and in the TOC. */
  title: string;
  /** Optional one-line description shown directly under the heading
   *  (lighter weight, slightly larger than body). Used to set a
   *  reading frame for longer sections. */
  lede?: string;
  /** Ordered paragraphs / lists / inline subheadings. */
  body: PolicyParagraph[];
}

/* Last-updated date is shown in the hero pill. Update this whenever
 * the policy changes. ISO 8601 string; the page renders it in the
 * user's locale. Keeping it in code (rather than auto-generating
 * from git) means previews and staging always show the same date as
 * production, which matters for legal traceability. */
export const POLICY_LAST_UPDATED = "2026-05-04";
export const POLICY_VERSION = "1.0";

/* TL;DR — 4 plain-English bullets at the top of the page. Lives
 * separately from the numbered sections because it gets a special
 * gradient-bordered card treatment (the only card on the page). */
export const TLDR: string[] = [
  "We only collect what you give us through the contact form: your name, email, phone, company, role, LinkedIn, and any notes you write.",
  "We use that information to reply to your inquiry. We don't sell it, rent it, or hand it to advertisers.",
  "Behind the scenes the form goes through Web3Forms (our email-delivery service) and our hosting provider. That's the full third-party list.",
  "You can ask us to access, correct, or delete your data at any time. Email <a href=\"mailto:growth@tglobal.in\">growth@tglobal.in</a> and we'll respond within 30 days.",
];

export const SECTIONS: PolicySection[] = [
  {
    id: "who-we-are",
    title: "Who we are",
    body: [
      {
        kind: "p",
        text: "TGlobal is an AI-native engineering studio. We help founders and operators ship software faster by combining senior engineers with custom-built AI tooling. This privacy policy applies to the website you're reading and any inquiry forms it hosts.",
      },
      {
        kind: "p",
        text: "We operate from two offices: <strong>San Francisco, United States</strong> (2 Shaw Alley, SoMa) and <strong>Hyderabad, India</strong> (WeWork Rajapushpa Summit Financial District). The legal entity responsible for your data is TGlobal Digital Private Limited, registered in India. References to \"we\", \"us\", or \"our\" mean that entity.",
      },
    ],
  },
  {
    id: "what-we-collect",
    title: "Information we collect",
    lede: "Only what you give us. We don't run analytics scripts, advertising pixels, or third-party trackers on this site.",
    body: [
      {
        kind: "p",
        text: "When you fill out the <a href=\"/#talk-to-us\">contact form</a>, we collect the fields you submit. Depending on which form variant you use (project inquiry or sprint plan), that includes:",
      },
      {
        kind: "ul",
        items: [
          "<strong>Name</strong>: so we know who we're replying to.",
          "<strong>Email address</strong>: to send our reply.",
          "<strong>Phone number with country</strong> (sprint plan form only), if you'd prefer a call.",
          "<strong>Company name</strong>: context for the conversation.",
          "<strong>Company revenue band or stage</strong>: to route you to the right partner internally.",
          "<strong>Role / title</strong>: so we understand decision authority.",
          "<strong>LinkedIn profile</strong> (optional), context for who you are professionally.",
          "<strong>Free-text notes</strong> (optional), anything you choose to share about your project.",
        ],
      },
      {
        kind: "p",
        text: "We do not collect IP-address-based geolocation, device fingerprints, or browsing behavior. The site does not set advertising or analytics cookies. The only cookies present are short-lived session cookies that the hosting platform may set for caching and security; those expire when you close the tab.",
      },
    ],
  },
  {
    id: "how-we-use",
    title: "How we use your information",
    body: [
      {
        kind: "p",
        text: "We use what you submit for one purpose: <strong>to respond to your inquiry and, if it leads somewhere, to scope and deliver a project together</strong>. Specifically:",
      },
      {
        kind: "ul",
        items: [
          "Replying to you over email or scheduling a call.",
          "Internal triage. Which engineer or partner is the right person to take the conversation.",
          "Light record-keeping if our conversation continues into a paid engagement.",
        ],
      },
      {
        kind: "p",
        text: "We do not use your data to train AI models, to sell to other companies, to send unrelated marketing, or to add you to mailing lists you didn't ask to join. If we ever want to send you a broader update (a newsletter, an event invite), we'll ask first.",
      },
      {
        kind: "p",
        text: "<strong>Lawful basis (EU/UK GDPR users):</strong> We process your inquiry data on the basis of your consent (you submitted the form) and our legitimate interest in responding to a business inquiry. You can withdraw consent at any time by emailing us. See <a href=\"#your-rights\">Your rights</a> below.",
      },
    ],
  },
  {
    id: "who-we-share",
    title: "Who we share information with",
    lede: "Two third parties, both essential infrastructure, neither of them advertisers.",
    body: [
      {
        kind: "p",
        text: "When you submit the contact form, the data passes through:",
      },
      {
        kind: "ul",
        items: [
          "<strong>Web3Forms</strong> (web3forms.com), our form-to-email service. They forward your submission to our inbox and don't store it long-term beyond delivery. Their privacy policy: <a href=\"https://web3forms.com/privacy-policy\" target=\"_blank\" rel=\"noopener noreferrer\">web3forms.com/privacy-policy</a>.",
          "<strong>Our hosting provider</strong>: serves the site and routes the form submission. They process the data only as needed to operate the site (load balancing, TLS termination, anti-abuse).",
        ],
      },
      {
        kind: "p",
        text: "We may also share data if we're legally required to (subpoena, court order, government request) or to protect our rights. For example, if someone abuses the contact form. If a buyer ever acquires our business, your data would transfer as part of that sale; we'd notify you and give you a chance to opt out before that happens.",
      },
      {
        kind: "p",
        text: "Beyond those, no one else gets your data. We don't share with advertisers, data brokers, or affiliate networks.",
      },
    ],
  },
  {
    id: "retention",
    title: "How long we keep your data",
    body: [
      {
        kind: "p",
        text: "We keep contact-form submissions for as long as the conversation is alive, plus a buffer for record-keeping. Practically:",
      },
      {
        kind: "ul",
        items: [
          "<strong>Inquiries that don't progress</strong>: deleted within 12 months of the last reply.",
          "<strong>Inquiries that lead to engagements</strong>: kept for the duration of the engagement plus 24 months for legal and tax record-keeping.",
          "<strong>Anything you ask us to delete</strong>: removed within 30 days of your request, unless we have a specific legal obligation to retain it.",
        ],
      },
    ],
  },
  {
    id: "your-rights",
    title: "Your rights",
    lede: "Different jurisdictions give you different rights. We honor all of them globally. You don't need to prove residency to make a request.",
    body: [
      {
        kind: "p",
        text: "Across all users, you can ask us to:",
      },
      {
        kind: "ul",
        items: [
          "<strong>Access</strong> the personal data we hold about you.",
          "<strong>Correct</strong> anything that's wrong or out of date.",
          "<strong>Delete</strong> your data, subject to retention obligations.",
          "<strong>Port</strong> your data to another service in a structured, machine-readable format.",
        ],
      },
      {
        kind: "h3",
        text: "If you're in the EU, UK, or Switzerland (GDPR / UK GDPR)",
      },
      {
        kind: "p",
        text: "You also have the right to <strong>restrict processing</strong>, <strong>object to processing</strong> based on legitimate interests, and <strong>withdraw consent</strong> at any time. You can lodge a complaint with your local data protection authority. For the UK that's the ICO (ico.org.uk); in the EU it's the supervisory authority in your member state.",
      },
      {
        kind: "h3",
        text: "If you're in California (CCPA / CPRA)",
      },
      {
        kind: "p",
        text: "You have the right to <strong>know</strong> what personal information we collect, <strong>delete</strong> it, <strong>correct</strong> it, and <strong>opt out of sale or sharing</strong>. We do not sell or share your personal information for cross-context behavioral advertising. That line is firm. You also have the right to <strong>non-discrimination</strong>: we won't treat you worse for exercising any of these rights.",
      },
      {
        kind: "h3",
        text: "If you're in India (Digital Personal Data Protection Act)",
      },
      {
        kind: "p",
        text: "You have the right to <strong>access</strong>, <strong>correction</strong>, <strong>erasure</strong>, and <strong>grievance redressal</strong>. Our grievance officer is reachable at <a href=\"mailto:growth@tglobal.in\">growth@tglobal.in</a> and will respond within 7 days. If you're unsatisfied, you can escalate to the Data Protection Board of India.",
      },
      {
        kind: "p",
        text: "<strong>How to make a request:</strong> email <a href=\"mailto:growth@tglobal.in\">growth@tglobal.in</a> from the address you used to contact us. Include the request type and any details that help us find your record. We'll verify your identity (a follow-up email is usually enough) and respond within 30 days, or 7 days for India DPDP grievances.",
      },
    ],
  },
  {
    id: "cookies",
    title: "Cookies and similar technologies",
    body: [
      {
        kind: "p",
        text: "This site does not use advertising or analytics cookies. We don't run Google Analytics, Meta Pixel, LinkedIn Insight, or similar trackers. The only cookies present are short-lived session cookies the hosting platform may set for caching, anti-abuse, and HTTPS. They don't identify you and they expire when you close the tab.",
      },
      {
        kind: "p",
        text: "If we ever add analytics or marketing tools, we'll update this section before they go live and add a consent banner where the law requires one (EU/UK).",
      },
    ],
  },
  {
    id: "children",
    title: "Children's privacy",
    body: [
      {
        kind: "p",
        text: "TGlobal is a B2B service. We don't sell to or knowingly collect data from children under 16. If you believe a minor has submitted information through our forms, email <a href=\"mailto:growth@tglobal.in\">growth@tglobal.in</a> and we'll delete it promptly.",
      },
    ],
  },
  {
    id: "security",
    title: "How we protect your data",
    body: [
      {
        kind: "p",
        text: "We apply reasonable safeguards proportionate to the data we hold. The site is served over HTTPS only, with HSTS preloaded. Form submissions travel over TLS to Web3Forms and into our inbox. Internally, access to inquiry data is limited to the partners and engineers who need it for the conversation.",
      },
      {
        kind: "p",
        text: "No system is perfectly secure. If we ever experience a breach that puts your data at risk, we'll notify you and any required regulator within the timelines the law sets: 72 hours for GDPR, the equivalent under DPDP and US state laws.",
      },
    ],
  },
  {
    id: "transfers",
    title: "International data transfers",
    body: [
      {
        kind: "p",
        text: "Because our team is split between India and the United States, your data may be processed in either country regardless of where you submitted it from. Both transfers happen under contracts that include the EU's Standard Contractual Clauses (or the UK addendum) for users protected by GDPR / UK GDPR. If you'd like a copy of the relevant transfer mechanism, email <a href=\"mailto:growth@tglobal.in\">growth@tglobal.in</a>.",
      },
    ],
  },
  {
    id: "changes",
    title: "Changes to this policy",
    body: [
      {
        kind: "p",
        text: "If we change this policy, we'll update the version number and last-updated date at the top of the page. Material changes (anything that meaningfully expands what we collect, who we share with, or how we use it) will be flagged with a notice on the site for at least 30 days, and we'll email anyone with an active inquiry.",
      },
    ],
  },
  {
    id: "contact",
    title: "Contact us",
    lede: "One inbox for every privacy request, question, or concern.",
    body: [
      {
        kind: "p",
        text: "Email <a href=\"mailto:growth@tglobal.in\"><strong>growth@tglobal.in</strong></a>. A real person reads it.",
      },
      {
        kind: "p",
        text: "Postal addresses if you prefer paper:",
      },
      {
        kind: "ul",
        items: [
          "<strong>India</strong>: TGlobal Digital Private Limited, WeWork Rajapushpa Summit, Financial District, Hyderabad.",
          "<strong>United States</strong>: TGlobal, 2 Shaw Alley, SoMa, San Francisco, CA.",
        ],
      },
    ],
  },
];
