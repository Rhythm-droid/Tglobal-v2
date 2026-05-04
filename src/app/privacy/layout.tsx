import type { Metadata } from "next";

/* Server-component layout wrapper for /privacy. Exists solely to
 * own the `metadata` export — page.tsx is a client component (uses
 * IntersectionObserver + framer-motion) and Next.js disallows
 * exporting metadata from "use client" files. The layout passes
 * children straight through; no extra DOM. */

export const metadata: Metadata = {
  title: "Privacy Policy — TGlobal",
  description:
    "What we collect, and why. How TGlobal handles personal data submitted through our contact forms, who we share it with, and the rights you have over it.",
  /* Privacy pages should be indexable for transparency, but they
   * shouldn't carry rich Open Graph imagery — they're not what we
   * want surfacing in social shares. Plain title + description is
   * enough; the root layout already supplies a sensible fallback OG
   * image if a crawler insists on one. */
  openGraph: {
    title: "Privacy Policy — TGlobal",
    description:
      "What we collect, and why. How TGlobal handles personal data.",
  },
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
