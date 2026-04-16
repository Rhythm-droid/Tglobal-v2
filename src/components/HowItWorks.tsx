"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef, useState } from "react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

const STEPS = [
  {
    title: "Define Your Idea",
    description:
      "Start with intent, not complexity. Describe what you want to build — from features to workflows — and Tglobal translates it into a structured product blueprint.",
    visual: "idea",
  },
  {
    title: "Our team + AI Builds the System",
    description:
      "Tglobal generates architecture, code, and core logic in one continuous flow — eliminating manual setup and reducing development time drastically.",
    visual: "build",
  },
  {
    title: "Launch and Evolve",
    description:
      "Deploy instantly and iterate continuously. Your product adapts, improves, and scales with AI-driven updates.",
    visual: "launch",
  },
] as const;

function IdeaVisual() {
  const dots = [
    "top-[178px] left-[28px]",
    "top-[151px] left-[81px]",
    "top-[173px] left-[279px]",
    "top-[150px] left-[227px]",
  ];

  return (
    <div className="relative h-[336px] w-[336px] overflow-hidden rounded-[24px] bg-[#f6f6f6]">
      <div className="absolute inset-x-[31px] top-[154px] h-[82px] rounded-[50%] border border-[#e7d9f6]" />
      <div className="absolute inset-x-[48px] top-[168px] h-[58px] rounded-[50%] border border-[#eadcf7]" />
      <div className="absolute inset-x-[66px] top-[181px] h-[33px] rounded-[50%] border border-[#eedff8]" />
      <div className="absolute left-1/2 top-[120px] h-[150px] w-[150px] -translate-x-1/2 rounded-[50%] border border-[#ecdff6]" />
      <div className="absolute left-1/2 top-[120px] h-[150px] w-[150px] -translate-x-1/2 scale-x-[1.65] rounded-[50%] border border-[#eadcf7]" />
      <div className="absolute left-1/2 top-[120px] h-[150px] w-[150px] -translate-x-1/2 scale-x-[2.45] rounded-[50%] border border-[#e9dcf6]" />
      <div className="absolute left-1/2 top-[147px] h-[120px] w-px -translate-x-1/2 bg-[#e4c9f4]" />
      <div className="absolute left-1/2 top-[147px] h-[120px] w-px -translate-x-1/2 rotate-[22deg] bg-[#ecdff7]" />
      <div className="absolute left-1/2 top-[147px] h-[120px] w-px -translate-x-1/2 -rotate-[22deg] bg-[#ecdff7]" />
      <div className="absolute left-1/2 top-[147px] h-[120px] w-px -translate-x-1/2 rotate-[42deg] bg-[#f0e6f8]" />
      <div className="absolute left-1/2 top-[147px] h-[120px] w-px -translate-x-1/2 -rotate-[42deg] bg-[#f0e6f8]" />
      {dots.map((position, index) => (
        <span
          key={position}
          className={`absolute h-1.5 w-1.5 rounded-full bg-[#77727f] ${position} ${index > 1 ? "bg-[#7a7483]" : ""}`}
        />
      ))}

      <div className="absolute left-1/2 top-[141px] h-[34px] w-[34px] -translate-x-1/2 rounded-full bg-white shadow-[0_12px_18px_rgba(0,0,0,0.18)]">
        <div className="absolute inset-[9px] rounded-full bg-[#f4f0f8]" />
      </div>
      <div className="absolute left-1/2 top-[98px] h-[18px] w-[18px] -translate-x-1/2 rounded-full bg-white shadow-[0_10px_16px_rgba(0,0,0,0.14)]" />
      <div className="absolute left-[143px] top-[63px] h-[28px] w-[28px] rounded-full bg-white shadow-[0_10px_18px_rgba(0,0,0,0.16)]">
        <div className="absolute left-[8px] top-[8px] h-2 w-2 rounded-full bg-[#cdc0ff]" />
        <div className="absolute left-[13px] top-[8px] h-2 w-2 rounded-full bg-[#d7c8ff]" />
        <div className="absolute left-[10px] top-[13px] h-2 w-2 rounded-full bg-[#a78bfa]" />
      </div>
      <div className="absolute left-[113px] top-[12px] h-[34px] w-[34px] rounded-full bg-white shadow-[0_12px_18px_rgba(0,0,0,0.14)]">
        <div className="absolute left-[14px] top-[8px] h-[12px] w-px rotate-[35deg] bg-[#e9d5ff]" />
      </div>
      <div className="absolute left-[171px] top-[34px] h-[34px] w-[34px] rounded-full bg-white shadow-[0_12px_18px_rgba(0,0,0,0.14)]">
        <div className="absolute left-[15px] top-[10px] h-[10px] w-px -rotate-[35deg] bg-[#e9d5ff]" />
      </div>
      <div className="absolute left-[157px] top-[110px] h-[18px] w-[18px] rounded-full bg-white shadow-[0_10px_16px_rgba(0,0,0,0.14)]">
        <div className="absolute left-[4px] top-[5px] h-2 w-2 rounded-full bg-[#c4b5fd]" />
      </div>
      <div className="absolute left-[169px] top-[110px] h-[18px] w-[18px] rounded-full bg-white shadow-[0_10px_16px_rgba(0,0,0,0.14)]">
        <div className="absolute left-[4px] top-[5px] h-2 w-2 rounded-full bg-[#f0abfc]" />
      </div>
      <div className="absolute left-[181px] top-[110px] h-[18px] w-[18px] rounded-full bg-white shadow-[0_10px_16px_rgba(0,0,0,0.14)]">
        <div className="absolute left-[4px] top-[5px] h-2 w-2 rounded-full bg-[#93c5fd]" />
      </div>
      <div className="absolute left-[155px] top-[219px] h-[117px] w-[53px]">
        <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-[#e3baf6]" />
        <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 rotate-[15deg] bg-[#edd7fa]" />
        <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 -rotate-[15deg] bg-[#edd7fa]" />
      </div>
    </div>
  );
}

function BuildVisual() {
  const sparkDots = [
    "top-[102px] left-[47px] h-1.5 w-1.5 rounded-[3.05px]",
    "top-[134px] left-[27px] h-[3px] w-[3px] rounded-[1.53px]",
    "top-[145px] left-[312px] h-[3px] w-[3px] rounded-[1.53px]",
    "top-[188px] left-[296px] h-1.5 w-1.5 rounded-[3.05px]",
    "top-24 left-[263px] h-3 w-3 rounded-[6.11px]",
    "top-[202px] left-[49px] h-3 w-3 rounded-[6.11px]",
  ];

  return (
    <div className="relative h-[336px] w-[336px] overflow-hidden rounded-[24.44px] bg-[#f6f6f6]">
      <div className="absolute left-1/2 top-[-14px] h-[84px] w-[150px] -translate-x-1/2 rounded-[13.75px] border border-white/20 bg-white/20 backdrop-blur-[12.22px]" />
      <div className="absolute bottom-[-14px] left-1/2 h-[84px] w-[150px] -translate-x-1/2 rounded-[13.75px] border border-white/20 bg-white/20 backdrop-blur-[12.22px]" />
      <div className="absolute left-[-46px] top-1/2 h-[91px] w-[183px] -translate-y-1/2 rotate-90 rounded-[13.75px] border border-white/20 bg-white/20 backdrop-blur-[12.22px]" />
      <div className="absolute right-[-46px] top-1/2 h-[91px] w-[183px] -translate-y-1/2 rotate-90 rounded-[13.75px] border border-white/20 bg-white/20 backdrop-blur-[12.22px]" />
      <div className="absolute left-[13px] top-[13px] h-[310px] w-[310px] rounded-[10.69px] border border-dashed border-[#e4e4e4]" />
      {sparkDots.map((position) => (
        <div
          key={position}
          className={`absolute bg-[linear-gradient(203deg,rgba(245,245,245,1)_0%,rgba(206,206,206,1)_100%)] ${position}`}
        />
      ))}

      <div className="absolute left-1/2 top-[76px] h-[183px] w-[150px] -translate-x-1/2">
        <div className="absolute left-[6px] top-[124px] h-[72px] w-[137px] rounded-[12.22px] bg-black/15 blur-[24.44px]" />
        <div className="absolute inset-0 rounded-[21.38px] border border-white/40 bg-[linear-gradient(180deg,rgba(253,253,253,0.23)_0%,rgba(253,253,253,0.75)_100%)] backdrop-blur-[12.22px]" />
        <div className="absolute left-0 top-0 h-[183px] w-[67px] rounded-[21.38px] backdrop-blur-[12.22px]" />
        <div className="absolute left-[6px] top-[6px] h-[137px] w-[137px] rounded-[15.27px] border border-[#ececec] bg-white shadow-[0px_3.82px_1.15px_-3.05px_#0808080d,0px_4.58px_3.05px_-3.05px_#0808080d,0px_4.58px_9.93px_#08080808,0px_18.33px_18.33px_-12.22px_#0808080a,0px_1.64px_0.38px_-1.53px_#00000040,0px_24.44px_48.87px_-9.16px_#00000013]">
          <div className="absolute right-[6px] top-[6px] h-[6px] w-[6px] rounded-full bg-[#d3d3d3]" />
          <div className="absolute left-[6px] top-[6px] h-[7px] w-[7px] rounded-full bg-[#d3d3d3]" />
          <div className="absolute right-[6px] top-[124px] h-[6px] w-[6px] rounded-full bg-[#d3d3d3]" />
          <div className="absolute left-[6px] top-[124px] h-[7px] w-[7px] rounded-full bg-[#d3d3d3]" />
          <div className="absolute left-[8px] top-[8px] h-[122px] w-[122px] rounded-full border border-[#ececec]/10 bg-[linear-gradient(180deg,rgba(235,235,235,1)_0%,rgba(196,196,196,1)_100%)]">
            <div className="absolute left-1/2 top-1/2 h-[98px] w-[98px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#ececec] bg-white shadow-[0px_3.82px_1.15px_-3.05px_#0808080d,0px_4.58px_3.05px_-3.05px_#0808080d,0px_4.58px_9.93px_#08080808,0px_18.33px_18.33px_-12.22px_#0808080a,0px_1.64px_0.38px_-1.53px_#00000040,0px_24.44px_48.87px_-9.16px_#00000013]" />
            <div className="absolute left-1/2 top-1/2 h-[94px] w-[94px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[4.58px] border-dashed border-[#e4e4e4]" />
            <div className="absolute left-1/2 top-1/2 h-[119px] w-[119px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#f0f0f0]" />
            <div className="absolute left-1/2 top-[12px] h-[78px] w-[42px] -translate-x-1/2 overflow-hidden">
              <div className="absolute left-1/2 top-0 h-full w-full -translate-x-1/2 rounded-t-full border-l border-r border-t border-[#b8d4ff]" />
            </div>
          </div>
        </div>
        <div className="absolute left-[12px] top-[155px] [font-family:var(--font-albert-sans),Helvetica] text-[8px] font-medium leading-4 text-neutral-700">
          Timeline
        </div>
        <div className="absolute left-[83px] top-[153px] flex w-[55px] items-center justify-center rounded-[20px] bg-[#e5bbf7] px-2.5 py-[5px]">
          <span className="[font-family:var(--font-albert-sans),Helvetica] text-[8px] font-semibold leading-[10px] text-[#010101]">
            6 Months
          </span>
        </div>
      </div>
      <div className="absolute left-[158px] top-[122px] h-10 w-[41px] rounded-full bg-white/80 shadow-[0_8px_12px_rgba(0,0,0,0.08)]" />
    </div>
  );
}

function LaunchVisual() {
  const checklist = [0, 1, 2];

  return (
    <div className="relative h-[336px] w-[336px] rounded-[24.44px] bg-[#f6f6f6]">
      <div className="absolute left-1/2 top-[57px] h-[221px] w-[231px] -translate-x-1/2">
        <div className="absolute left-1/2 top-0 h-[37px] w-[183px] -translate-x-1/2 rounded-[9.16px] border border-[#ececec] bg-white shadow-[0px_3.82px_1.15px_-3.05px_#0808080d,0px_4.58px_3.05px_-3.05px_#0808080d,0px_4.58px_9.93px_#08080808,0px_18.33px_18.33px_-12.22px_#0808080a,0px_1.64px_0.38px_-1.53px_#00000040,0px_24.44px_48.87px_-9.16px_#00000013]" />
        <div className="absolute left-1/2 top-[145px] h-[37px] w-[183px] -translate-x-1/2 rounded-[9.16px] border border-[#ececec] bg-white shadow-[0px_3.82px_1.15px_-3.05px_#0808080d,0px_4.58px_3.05px_-3.05px_#0808080d,0px_4.58px_9.93px_#08080808,0px_18.33px_18.33px_-12.22px_#0808080a,0px_1.64px_0.38px_-1.53px_#00000040,0px_24.44px_48.87px_-9.16px_#00000013]" />
        <div className="absolute left-0 top-3 h-[157px] w-[231px] rounded-[15.27px] border border-[#ececec] bg-white shadow-[0px_3.82px_1.15px_-3.05px_#0808080d,0px_4.58px_3.05px_-3.05px_#0808080d,0px_4.58px_9.93px_#08080808]">
          <div className="absolute left-0 top-0 h-[29px] w-full rounded-t-[15.27px] bg-[linear-gradient(180deg,rgba(245,245,245,1)_0%,rgba(237,237,237,1)_100%)]" />
          <div className="absolute left-1/2 top-[48px] h-[67px] w-[67px] -translate-x-1/2 rounded-[18px] bg-[linear-gradient(180deg,#f7f7f7_0%,#ececec_100%)] shadow-[0_12px_18px_rgba(0,0,0,0.08)]">
            <div className="absolute inset-[18px] rounded-full bg-[#c4b5fd]" />
          </div>
        </div>
        <div className="absolute left-[18px] top-[78px] h-[143px] w-[115px] rounded-[12.22px] bg-black/15 blur-[24.44px]" />
        <div className="absolute left-3 top-[53px] h-[147px] w-32 rounded-[21.38px] border border-white/40 bg-[linear-gradient(180deg,rgba(253,253,253,0.23)_0%,rgba(253,253,253,0.75)_100%)] backdrop-blur-[12.22px]">
          <div className="absolute left-1/2 top-1/2 h-[131px] w-[115px] -translate-x-1/2 -translate-y-1/2 rounded-[15.27px] border border-[#ececec] bg-white shadow-[0px_3.82px_1.15px_-3.05px_#0808080d,0px_4.58px_3.05px_-3.05px_#0808080d,0px_4.58px_9.93px_#08080808,0px_18.33px_18.33px_-12.22px_#0808080a,0px_1.64px_0.38px_-1.53px_#00000040,0px_24.44px_48.87px_-9.16px_#00000013]" />
          <div className="absolute left-[15px] top-6 flex w-[61px] flex-col gap-[9.16px]">
            <div className="flex w-[42.76px] flex-col gap-[3.05px]">
              <div className="h-[3.05px] w-[24.44px] rounded-[1.53px] bg-[#010101] opacity-15" />
              <div className="h-[3.05px] w-full rounded-[1.53px] bg-[#767676] opacity-10" />
            </div>
            <div className="flex flex-col gap-[3.05px]">
              {checklist.map((item) => (
                <div key={item} className="flex items-center gap-[3.05px]">
                  <div className="flex h-[12.22px] w-[12.22px] items-center justify-center rounded-full bg-[#ececec]">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#b8b8b8]" />
                  </div>
                  <div className="flex w-[42.76px] flex-col gap-[3.05px]">
                    <div className="h-[3.05px] w-[24.44px] rounded-[1.53px] bg-[#010101] opacity-15" />
                    <div className="h-[3.05px] w-full rounded-[1.53px] bg-[#767676] opacity-10" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute left-[83px] top-[14px] h-[21px] w-[21px] rounded-full border border-[#ececec]/10 bg-[linear-gradient(180deg,rgba(235,235,235,1)_0%,rgba(196,196,196,1)_100%)]">
            <div className="absolute left-1/2 top-1/2 h-[8px] w-[8px] -translate-x-1/2 -translate-y-1/2 rounded-[4.28px] bg-[#909090]" />
          </div>
          <div className="absolute left-[15px] top-[108px] h-[21px] w-[97px] rounded-full border border-[#ececec]/10 bg-[linear-gradient(180deg,rgba(235,235,235,1)_0%,rgba(196,196,196,1)_100%)]" />
        </div>
      </div>
      <div className="absolute left-[-40px] top-[108px] h-[79px] w-[158px] -rotate-90 rounded-[18.33px] border border-white/20 bg-[#fdfdfd40] backdrop-blur-[12.22px]" />
      <div className="absolute right-[-72px] top-[115px] h-[66px] w-[158px] -rotate-90 rounded-[18.33px] border border-white/20 bg-[#fdfdfd40] backdrop-blur-[12.22px]" />
      <div className="absolute left-1/2 top-0 h-[29px] w-px -translate-x-1/2 bg-[#d8d8d8]" />
      <div className="absolute left-1/2 top-[28px] h-px w-3 -translate-x-1/2 bg-[#d8d8d8]" />
    </div>
  );
}

function StepVisual({ visual }: { visual: (typeof STEPS)[number]["visual"] }) {
  if (visual === "idea") return <IdeaVisual />;
  if (visual === "build") return <BuildVisual />;
  return <LaunchVisual />;
}

const cardClassName =
  "w-[420px] min-w-[420px] shrink-0 rounded-[32px] border border-[#f5f6f8] bg-white/95 p-5 shadow-[0px_14px_31px_#f0d8fb1a,0px_57px_57px_#f0d8fb17,0px_129px_77px_#f0d8fb0d,0px_229px_92px_#f0d8fb03,0px_358px_100px_transparent,inset_0_1px_0_rgba(255,255,255,0.40),inset_1px_0_0_rgba(255,255,255,0.32),inset_0_-1px_21px_rgba(0,0,0,0.20),inset_-1px_0_21px_rgba(0,0,0,0.16)] backdrop-blur-[32.5px]";

export default function HowItWorks() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(0);

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
          onUpdate: (self) => {
            const idx = Math.min(
              STEPS.length - 1,
              Math.round(self.progress * (STEPS.length - 1))
            );
            setActive(idx);
          },
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
      id="how-it-works"
      ref={sectionRef}
      aria-label="How TGlobal Works"
      className="relative w-full overflow-hidden bg-[#f3f3f3]"
    >
      <div
        ref={viewportRef}
        className="relative h-screen min-h-screen w-full overflow-hidden"
      >
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center">
          <div className="pointer-events-auto mx-auto grid w-full max-w-[1440px] grid-cols-[minmax(0,520px)_1fr] px-14 lg:px-20">
            <div className="pr-8">
              <p className="[font-family:var(--font-albert-sans),Helvetica] text-[32px] font-normal leading-none tracking-[-1.92px] text-neutral-700">
                How TGlobal Works
              </p>
              <h2 className="mt-4 [font-family:var(--font-albert-sans),Helvetica] text-[64px] font-medium leading-[0.92] tracking-[-3.84px] text-black">
                From Idea to
                <br />
                Production —
                <br />
                Instantly
              </h2>
              <p className="mt-6 max-w-[420px] [font-family:var(--font-albert-sans),Helvetica] text-2xl font-normal leading-[1.15] tracking-[-1.44px] text-neutral-700">
                We utilise AI models and combine them with your ideas to build
                scalable products.
              </p>
              <nav
                aria-label="Carousel pagination"
                className="mt-10 flex items-center gap-1"
              >
                {STEPS.map((step, index) => (
                  <span
                    key={step.title}
                    aria-current={index === active ? "true" : "false"}
                    className={`h-[7px] rounded-full transition-all duration-500 ${
                      index === active ? "w-8 bg-[#4b28ff]" : "w-5 bg-[#e4e4e4]"
                    }`}
                  />
                ))}
              </nav>
            </div>
          </div>
        </div>

        <div
          ref={trackRef}
          className="flex h-full items-center gap-5 pr-[12vw] will-change-transform"
          style={{
            paddingLeft:
              "calc(min(1440px, 100%) * 0.42 + max((100% - 1440px) / 2, 24px))",
          }}
        >
          {STEPS.map((step) => (
            <article key={step.title} className={cardClassName}>
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-center rounded-2xl bg-[#f6f6f6] p-5">
                  <StepVisual visual={step.visual} />
                </div>
                <section className="flex w-[361px] flex-col items-start gap-4">
                  <h3
                    className={`[font-family:var(--font-albert-sans),Helvetica] text-2xl font-medium leading-none tracking-[-1.44px] text-[#010101] ${
                      step.title === "Our team + AI Builds the System"
                        ? "whitespace-nowrap"
                        : ""
                    }`}
                  >
                    {step.title}
                  </h3>
                  <p className="[font-family:var(--font-albert-sans),Helvetica] text-sm font-normal leading-normal tracking-[-0.84px] text-[#909090]">
                    {step.description}
                  </p>
                </section>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
