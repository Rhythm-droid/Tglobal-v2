import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import Problem from "@/components/Problem";
import HowItWorks from "@/components/HowItWorks";
import Services from "@/components/Services";
import Clients from "@/components/Clients";
import Footer from "@/components/Footer";
import IdlePrefetch from "@/components/primitives/IdlePrefetch";

/**
 * Code-splitting strategy — target: smooth scroll, low TBT.
 *
 * The previous strategy wrapped every below-fold client component in
 * `dynamic()` to minimise initial JS. That trade-off worked for
 * first-paint metrics but introduced a different problem: each
 * `dynamic()` boundary the user scrolls past costs ~50–200 ms of
 * main-thread time (chunk fetch + parse + hydrate). With six dynamic
 * boundaries down the homepage, users felt the scroll "stuck" or
 * "stuttering" at section seams — exactly when scrolling should feel
 * the smoothest.
 *
 * Revised strategy: STATIC for sections users hit during normal
 * scroll (top of fold through the pinned scroll sections), DYNAMIC
 * for sections deep below the fold (Capabilities, FAQ, CTA). Idle
 * prefetch warms the dynamic chunks during browser idle time so they
 * resolve synchronously by the time the user reaches them.
 *
 * STATIC (no `dynamic()`): user reaches these as part of the
 * primary scroll path; we want zero hydration latency at section
 * boundaries.
 *   • Navbar (above fold)
 *   • Hero, Stats, Clients, Footer (server components — already free)
 *   • Problem (~425 lines, GSAP ScrollTrigger)
 *   • HowItWorks (~339 lines, GSAP pinned horizontal scroll)
 *   • Services (~197 lines, GSAP pinned horizontal scroll)
 *
 * DYNAMIC + idle-prefetched: deeper below the fold; the JS is fetched
 * during browser idle so it's already in the module cache by the time
 * the user scrolls to them.
 *   • Capabilities (~400 lines, framer-motion + 3 illustrations)
 *   • Faq (framer-motion accordion)
 *   • CTA (~400 lines, chat surface + form)
 *
 * Trade-off:
 *   Initial JS grows by ~30–50 KB (the static-imported sections).
 *   Initial paint time is unaffected because the HTML is server-
 *   rendered identically. INP and scroll smoothness improve because
 *   the main thread no longer has to fetch, parse, and hydrate a new
 *   chunk every time the user crosses a section boundary.
 */
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
      {/* Mounts client-only after first paint, prefetches the chunks
          for the three remaining dynamic sections on idle. Renders
          nothing — pure side-effect component. */}
      <IdlePrefetch />
    </>
  );
}
