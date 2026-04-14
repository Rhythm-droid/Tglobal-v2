"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

const STEPS = [
  {
    n: "Step 1",
    title: "Product Discovery",
    description:
      "We turn rough ideas into a clear build path by reviewing workflows, goals, dependencies, and the fastest route to a shippable MVP.",
    footer: "Discovery Completed within",
    hours: "24 hours",
    suffix: "of contact.",
  },
  {
    n: "Step 2",
    title: "Demo Prototype",
    description:
      "We turn rough ideas into a clear build path by reviewing workflows, goals, dependencies, and the fastest route to a shippable MVP.",
    footer: "Demo of the product is sent to you in next",
    hours: "36 hours",
    suffix: "",
  },
  {
    n: "Step 3",
    title: "PRD Creation",
    description:
      "We translate product vision into a scoped PRD, prioritised release plan, and the exact decisions the build team needs next.",
    footer: "PRD ready and shared in",
    hours: "48 hours",
    suffix: "",
  },
  {
    n: "Step 4",
    title: "Task Creation",
    description:
      "Granular tickets, owner mapping, and acceptance criteria — every task ready for engineering to pick up and run.",
    footer: "Backlog cut and assigned within",
    hours: "24 hours",
    suffix: "",
  },
  {
    n: "Step 5",
    title: "AI-Assisted Engineering",
    description:
      "Our engineers ship in tandem with AI accelerators — full features moving from blank repo to staging in days, not months.",
    footer: "First feature live within",
    hours: "5 days",
    suffix: "",
  },
  {
    n: "Step 6",
    title: "QA Testing",
    description:
      "Automated and manual QA in lockstep with development. Every release is regression-tested across devices before it ships.",
    footer: "Coverage report delivered within",
    hours: "12 hours",
    suffix: "of cut.",
  },
  {
    n: "Step 7",
    title: "DevOps & Scale",
    description:
      "Production-grade CI/CD, observability, and scaling baked in from day one. Launch confident, scale effortlessly.",
    footer: "Production deploy live in",
    hours: "24 hours",
    suffix: "",
  },
];

function CardIllustration({ idx }: { idx: number }) {
  const seed = idx % 4;
  return (
    <div
      className="relative mt-6 h-[180px] rounded-2xl overflow-hidden flex items-center justify-center"
      style={{
        background:
          "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(189,112,246,0.22) 0%, rgba(244,225,252,0.5) 45%, rgba(255,255,255,0) 80%)",
      }}
    >
      <svg viewBox="0 0 220 150" className="w-full h-full">
        <rect x="34" y="26" width="152" height="98" rx="12" fill="#ffffff" stroke="#e1e2e6" strokeWidth="1" />
        <circle cx="110" cy="74" r={20 + seed * 3} fill="#f4e1fc" stroke="#bd70f6" strokeWidth="1.2" />
        <rect x="52" y="104" width="46" height="5" rx="2" fill="#e1e2e6" />
        <rect x="52" y="114" width="30" height="3" rx="1.5" fill="#e1e2e6" />
        <rect x="120" y="104" width="42" height="14" rx="7" fill="#4b28ff" />
      </svg>
    </div>
  );
}

export default function Services() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      const viewport = viewportRef.current;
      const track = trackRef.current;
      if (!viewport || !track) return;

      const prefersReduced =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReduced) return;

      const getDistance = () =>
        Math.max(0, track.scrollWidth - viewport.clientWidth);

      const tween = gsap.to(track, {
        x: () => -getDistance(),
        ease: "none",
        scrollTrigger: {
          trigger: viewport,
          start: "top top",
          end: () => `+=${getDistance()}`,
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="services"
      className="relative bg-background"
      aria-label="Quickly Build Impactful Softwares"
    >
      <div
        ref={viewportRef}
        className="relative h-screen w-full overflow-hidden"
      >
        {/* Pinned header row */}
        <div className="absolute top-0 left-0 right-0 z-10 pt-16 md:pt-24 pb-8 bg-gradient-to-b from-background via-background/95 to-background/0">
          <div className="site-shell">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <h2 className="display-lg max-w-[640px]">
                Quickly Build<br />
                Impactful Softwares.
              </h2>
              <p className="body-lg max-w-[420px]">
                This is Agile development driven by AI agents augment elite engineers to develop at super-fast speeds. Strategy no longer waits for execution. It becomes execution.
              </p>
            </div>
          </div>
        </div>

        {/* Horizontal track, vertically centered below the header */}
        <div className="absolute inset-0 flex items-center">
          <div
            ref={trackRef}
            className="flex h-auto items-stretch gap-6 pl-[max((100%-1440px)/2,24px)] pr-[12vw] will-change-transform"
          >
            {STEPS.map((step, idx) => (
              <article
                key={step.title}
                className="shrink-0 w-[min(360px,82vw)] rounded-[28px] bg-surface border border-border p-7 flex flex-col"
              >
                <p className="text-[12px] font-medium text-muted">{step.n}</p>
                <h3 className="mt-1.5 text-[20px] font-semibold text-foreground tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-3 text-[13px] leading-[1.6] text-muted min-h-[92px]">
                  {step.description}
                </p>
                <CardIllustration idx={idx} />
                <p className="mt-6 text-[12px] leading-[1.5] text-muted">
                  {step.footer}{" "}
                  <span className="font-semibold text-foreground">{step.hours}</span>
                  {step.suffix ? ` ${step.suffix}` : ""}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
