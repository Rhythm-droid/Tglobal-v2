import type { Metadata } from "next";
import { Albert_Sans } from "next/font/google";
import MotionProvider from "@/components/primitives/MotionProvider";
import "./globals.css";

const albertSans = Albert_Sans({
  variable: "--font-albert-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "TGlobal — Software, Without the Friction",
  description:
    "A new way to build — where ideas turn into systems, and systems turn into products. AI-driven engineering that ships 4× faster.",
  metadataBase: new URL("https://tglobal.ai"),
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
    <html lang="en" className={`${albertSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
