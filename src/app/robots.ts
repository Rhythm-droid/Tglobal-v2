import type { MetadataRoute } from "next";

/**
 * Environment-aware robots.txt.
 *
 * Staging (staging.tglobal.in): disallow all crawlers to avoid
 * duplicate-content SEO penalty on the production tglobal.in domain.
 *
 * Production (tglobal.in): allow all, link to sitemap.
 */
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
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://tglobal.in/sitemap.xml",
  };
}
