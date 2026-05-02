import type { Metadata } from "next";
import { Albert_Sans, Instrument_Serif } from "next/font/google";
import MotionProvider from "@/components/primitives/MotionProvider";
import SmoothScrollProvider from "@/components/primitives/SmoothScrollProvider";
import "lenis/dist/lenis.css";
import "./globals.css";

const albertSans = Albert_Sans({
  variable: "--font-albert-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

/* Editorial accent serif for the highlighted word in the hero
   headline ("Friction"). Loaded only in italic — that's the only
   variant we use; pulling in `normal` would add bytes the page never
   exercises. Exposed as `--font-instrument-serif` so any future
   accent text can opt-in via `font-family: var(--font-instrument-serif)`. */
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: "italic",
  display: "swap",
});

const isStaging = process.env.NEXT_PUBLIC_ENV === "staging";

export const metadata: Metadata = {
  title: "TGlobal — Software, Without the Friction",
  description:
    "A new way to build — where ideas turn into systems, and systems turn into products. AI-driven engineering that ships 4× faster.",
  metadataBase: new URL("https://tglobal.in"),
  robots: isStaging
    ? {
        index: false,
        follow: false,
        googleBot: { index: false, follow: false },
      }
    : { index: true, follow: true },
  openGraph: {
    title: "TGlobal — Software, Without the Friction",
    description:
      "A new way to build — where ideas turn into systems, and systems turn into products.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${albertSans.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body
        id="top"
        className="min-h-full flex flex-col bg-background text-foreground font-sans"
      >
        <SmoothScrollProvider>
          <MotionProvider>{children}</MotionProvider>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
