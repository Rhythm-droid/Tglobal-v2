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

/* Phase 1 routes — ONLY include routes that actually return 200 in
   production AND are ready to be indexed.
   The /work INDEX is launch-ready and now included. The case-study
   DETAIL pages (/work/[slug]) remain EXCLUDED: they aren't ready for
   public consumption (placeholder copy, no real client artwork, no
   client sign-off). Listing them in the sitemap would advertise
   unfinished work to Google + AI crawlers, and the companion
   `robots.ts` `/work/` Disallow + per-page noindex block them from
   being crawled/indexed. Restore the CASE_STUDY_ROUTES block below
   once the detail pages are launch-ready.
   /services, /contact, /careers, /terms — uncomment each once the
   matching route exists at src/app/<slug>/page.tsx and returns 200. */
const ROUTES: readonly RouteEntry[] = [
  { path: "/",        priority: 1.0, changeFrequency: "monthly" },
  { path: "/about",   priority: 0.8, changeFrequency: "monthly" },
  { path: "/work",    priority: 0.9, changeFrequency: "monthly" },
  { path: "/process", priority: 0.7, changeFrequency: "monthly" },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
  // Pending route build / launch — uncomment as each ships:
  // { path: "/services", priority: 0.8, changeFrequency: "monthly" },
  // { path: "/contact",  priority: 0.8, changeFrequency: "yearly"  },
  // { path: "/careers",  priority: 0.5, changeFrequency: "monthly" },
  // { path: "/terms",    priority: 0.3, changeFrequency: "yearly"  },
] as const;

/* Case study detail routes — DISABLED for this launch. Restore the
   import + .map block below once /work is launch-ready:

     import { CASE_STUDIES } from "./work/data";
     const CASE_STUDY_ROUTES: readonly RouteEntry[] = CASE_STUDIES.map((cs) => ({
       path: `/work/${cs.slug}`,
       priority: 0.6,
       changeFrequency: "yearly" as const,
     }));
*/

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
