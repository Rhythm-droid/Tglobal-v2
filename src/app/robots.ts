import type { MetadataRoute } from "next";

/**
 * Environment-aware robots.txt.
 *
 * Staging (NEXT_PUBLIC_ENV=staging): disallow all crawlers to avoid
 * duplicate-content SEO penalty on the production tglobal.in domain.
 *
 * Production (NEXT_PUBLIC_ENV unset or anything else):
 *   • Search engines (Googlebot, Bingbot, etc.) and the default
 *     `*` user-agent are allowed on the launched pages (incl. the
 *     /work index) but explicitly disallowed from the case-study
 *     detail pages under /work/ — those aren't launch-ready (no
 *     client sign-off), so we don't want them indexed or surfaced
 *     in AI search.
 *   • AI training / answer-engine crawlers (GPTBot, ChatGPT-User,
 *     ClaudeBot, anthropic-ai, PerplexityBot, Google-Extended,
 *     CCBot) are blocked from the unfinished paths the same way.
 *     We keep them allowed on the launched pages so the brand still
 *     shows up in AI search results for the live content.
 *
 * Update rule: when a new route ships and is ready for public
 * consumption, REMOVE it from the disallow list below AND add it
 * to sitemap.ts. The two files are the launch gate.
 */

/* Paths that should NOT be crawled/indexed yet. The /work INDEX is now
   live, so only the case-study DETAIL pages under /work/ stay gated
   (placeholder copy, no client sign-off). The trailing slash is load-
   bearing: "/work/" blocks /work/<slug> but leaves the /work index
   crawlable. Mirror this pattern for any new section that isn't ready. */
const UNFINISHED_ROUTES = ["/work/"] as const;

export default function robots(): MetadataRoute.Robots {
  const isStaging = process.env.NEXT_PUBLIC_ENV === "staging";

  if (isStaging) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: [
      /* Default crawl rule for every user-agent that doesn't match a
         more specific rule below. Allows the launched pages and
         disallows the unfinished /work paths. */
      {
        userAgent: "*",
        allow: "/",
        disallow: [...UNFINISHED_ROUTES],
      },
      /* AI training / answer-engine crawlers. Same disallow set as
         the default rule — we don't want unfinished pages summarised
         in ChatGPT or Perplexity answers, but we DO want the
         launched marketing pages indexed for AI search visibility.
         If we later want to opt OUT of AI training entirely, change
         allow to "" and add disallow: "/" for these agents. */
      {
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "ClaudeBot",
          "anthropic-ai",
          "PerplexityBot",
          "Google-Extended",
          "CCBot",
          "Applebot-Extended",
        ],
        allow: "/",
        disallow: [...UNFINISHED_ROUTES],
      },
    ],
    sitemap: "https://tglobal.in/sitemap.xml",
  };
}
