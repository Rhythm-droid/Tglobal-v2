import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import Clients from "@/components/Clients";
import Footer from "@/components/Footer";

/**
 * Code-splitting strategy — target: lower TBT / TTI.
 *
 * Next.js app-router already splits server components automatically,
 * so static imports of server components (Hero, Stats, Clients, Footer)
 * cost nothing in the client bundle. The JS cost comes from CLIENT
 * components — each one's hydration code lands in the initial route
 * chunk unless we dynamic-import it.
 *
 * Split (below-fold client components, dynamic + SSR preserved):
 *   • Problem       ~425 lines, GSAP ScrollTrigger
 *   • HowItWorks    ~339 lines, GSAP pinned horizontal scroll
 *   • Services      ~197 lines, GSAP scroll-linked timeline
 *   • Capabilities  ~400 lines, framer-motion + 3 illustrations
 *   • CTA           ~400 lines, chat surface
 *
 * Kept static (above-fold or must-be-interactive-immediately):
 *   • Navbar (client, above fold — must hydrate on first paint)
 *
 * `ssr:true` is the default; HTML still streams server-side so there's
 * no layout shift and no SEO hit — only the hydration JS is deferred.
 */
const Problem = dynamic(() => import("@/components/Problem"));
const HowItWorks = dynamic(() => import("@/components/HowItWorks"));
const Services = dynamic(() => import("@/components/Services"));
const Capabilities = dynamic(() => import("@/components/Capabilities"));
const Faq = dynamic(() => import("@/components/Faq"));
const CTA = dynamic(() => import("@/components/CTA"));

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Stats />
        <Problem />
        <HowItWorks />
        <Services />
        <Capabilities />
        <Clients />
        <CTA />
        <Faq />
      </main>
      <Footer />
    </>
  );
}
