import type { MetadataRoute } from "next";

/**
 * Web app manifest — emitted by Next.js as /manifest.webmanifest.
 *
 * Provides:
 *   • App name + short_name for browser "Add to home screen" / install
 *     prompts on Chrome (desktop + Android) and Edge.
 *   • theme_color for the address bar tint on Chrome Android (and the
 *     Edge browser frame).
 *   • Icon set fallback chain — SVG first (sharp at every size), then
 *     PNG fallback for Safari iOS which doesn't render SVG as the
 *     standalone app icon.
 *
 * When `app/apple-icon.png` and `app/favicon.ico` are added, Next.js
 * auto-emits the corresponding <link> tags into <head>. No manual
 * head wiring is needed — the file-based convention handles it.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TGlobal",
    short_name: "TGlobal",
    description:
      "AI-native engineering. Outcomes per sprint, not hours per week.",
    start_url: "/",
    display: "standalone",
    background_color: "#fbf8f1",
    theme_color: "#4b28ff",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
