import type { MetadataRoute } from "next";

/**
 * sitemap.xml — auto-generated from the route list below.
 *
 * Why we hand-maintain the list rather than crawling app/:
 *   Next 16 doesn't expose a "list all routes" API, and crawling the
 *   filesystem at build time is brittle (catches client-only files,
 *   misses dynamic params, has to skip `_components`, etc.). For a
 *   small marketing site the route list is short and stable, so a
 *   plain typed array is the most reliable source of truth.
 *
 * Update rule: when a route is added or removed in src/app/, mirror
 * the change here. Route slugs that change frequency or priority can
 * be tweaked per-entry.
 *
 * Staging environments are excluded from indexing entirely via
 * robots.ts (NEXT_PUBLIC_ENV=staging → disallow:/). The sitemap is
 * still generated on staging — robots.txt is the gate, not the sitemap.
 */

const BASE_URL = "https://tglobal.in";

interface RouteEntry {
  /** Path relative to BASE_URL, e.g. "/" or "/work" */
  readonly path: string;
  /**
   * `priority` — Google's hint, 0.0–1.0. Use 1.0 for the homepage,
   * 0.8 for top-level marketing pages, 0.6 for case studies, 0.3
   * for legal/utility. The crawler treats this as relative within
   * THIS site; it doesn't compare against other sites.
   */
  readonly priority: number;
  /**
   * `changeFrequency` — also a hint. We pick the truthful value:
   * marketing pages change "monthly" or less often once shipped;
   * case studies are "yearly" once published; legal is "yearly".
   */
  readonly changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
}

/* Phase 1 routes. Case study slugs ([client-1..4]) are placeholder
   names; once the four featured clients are confirmed (Wed AM), update
   each entry's path with the real slug, e.g. "/work/skyline". */
const ROUTES: readonly RouteEntry[] = [
  { path: "/",        priority: 1.0, changeFrequency: "monthly" },
  { path: "/work",    priority: 0.9, changeFrequency: "monthly" },
  { path: "/about",   priority: 0.8, changeFrequency: "monthly" },
  { path: "/services", priority: 0.8, changeFrequency: "monthly" },
  { path: "/process", priority: 0.7, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.8, changeFrequency: "yearly" },
  { path: "/careers", priority: 0.5, changeFrequency: "monthly" },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/terms",   priority: 0.3, changeFrequency: "yearly" },
  /* Case study detail pages — uncomment + rename slugs once confirmed.
     Leaving the comment so the next dev knows where to add them.
  { path: "/work/skyline",    priority: 0.6, changeFrequency: "yearly" },
  { path: "/work/medcollect", priority: 0.6, changeFrequency: "yearly" },
  { path: "/work/jijibai",    priority: 0.6, changeFrequency: "yearly" },
  { path: "/work/turpai",     priority: 0.6, changeFrequency: "yearly" },
  */
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  /* `lastModified: new Date()` updates on every build. For SEO this is
     fine on a marketing site (signals "still active"); a content-heavy
     site might want per-page modification dates from a CMS. */
  const lastModified = new Date();

  return ROUTES.map((entry) => ({
    url: `${BASE_URL}${entry.path}`,
    lastModified,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));
}
