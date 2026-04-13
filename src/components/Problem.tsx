"use client";

import AnimateIn from "./primitives/AnimateIn";

const topCards = [
  {
    title: "Too many tools, not enough clarity",
    description:
      "Building software today means stitching together dozens of tools — design, development, testing, deployment.",
    type: "logos",
  },
  {
    title: "Development cycles take months",
    description:
      "From writing code to testing and deployment, most of the process is still manual.",
    type: "progress",
  },
] as const;

const bottomCards = [
  {
    title: "Scaling introduces complexity",
    description: "As systems evolve, they become harder to maintain.",
    type: "scaling",
  },
  {
    title: "Enters TGlobal",
    description: "4x >>>>>",
    type: "tglobal",
  },
] as const;

const logoItems = ["OpenAI", "Angular", "Node", "AWS", "Google", ""] as const;

const statusRows = [{ label: "Live" }, { label: "Live" }] as const;

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3zM19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14zM5 14l.6 1.8L7.4 16l-1.8.6L5 18l-.6-1.8L2.6 16l1.8-.6L5 14z"
        fill="currentColor"
      />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function CloudIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M17.5 19a4.5 4.5 0 100-9h-1.26a7 7 0 10-12.23 6" />
      <path d="M4 15.5a3.5 3.5 0 003.5 3.5H17" />
    </svg>
  );
}

function MousePointerIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M4 3l6.5 16L12 12l7-1.5L4 3z" />
    </svg>
  );
}

function TimelineConnector() {
  return (
    <div className="flex items-center gap-2.5 self-stretch">
      <div className="h-[21px] w-[21px] rounded-full border border-[#dfe1e7] bg-white shadow-[0px_1px_2px_#0d0d120a,0px_1px_3px_#0d0d120d]" />
      <div className="h-px flex-1 bg-[#dfe1e7]" />
      <div className="h-[21px] w-[21px] rounded-full border border-[#dfe1e7] bg-white shadow-[0px_1px_2px_#0d0d120a,0px_1px_3px_#0d0d120d]" />
      <div className="h-px flex-1 bg-[#dfe1e7]" />
      <div className="h-[21px] w-[21px] rounded-full border border-[#dfe1e7] bg-white shadow-[0px_1px_2px_#0d0d120a,0px_1px_3px_#0d0d120d]" />
    </div>
  );
}

function VerticalRail() {
  return <div className="w-px self-stretch bg-[#dfe1e7]" />;
}

function PaginationLine() {
  return <div className="h-px w-full bg-[#dfe1e7]" />;
}

function LogoBadge({ label }: { label: string }) {
  const commonClass =
    "flex h-11 w-11 items-center justify-center rounded-full bg-[#f5f5f5] text-sm font-medium text-[#6b677d]";

  if (label === "OpenAI") {
    return (
      <div className={commonClass} aria-label="OpenAI">
        <SparklesIcon className="h-5 w-5 text-[#5f5a6f]" />
      </div>
    );
  }

  if (label === "Angular") {
    return (
      <div className={commonClass} aria-label="Angular">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#e45a4f] text-[15px] font-bold text-white">
          A
        </div>
      </div>
    );
  }

  if (label === "Node") {
    return (
      <div className={commonClass} aria-label="Node">
        <span className="text-[11px] font-semibold tracking-tight text-[#6b8f5b]">
          node
        </span>
      </div>
    );
  }

  if (label === "AWS") {
    return (
      <div className={commonClass} aria-label="AWS">
        <div className="flex flex-col items-center leading-none">
          <span className="text-[14px] font-semibold text-[#6d6d6d]">aws</span>
          <span className="mt-0.5 h-[2px] w-6 rounded-full bg-[#f6a623]" />
        </div>
      </div>
    );
  }

  if (label === "Google") {
    return (
      <div className={commonClass} aria-label="Google">
        <span className="text-xl font-bold">
          <span className="text-[#4285f4]">G</span>
          <span className="text-[#ea4335]">o</span>
          <span className="text-[#fbbc05]">o</span>
          <span className="text-[#4285f4]">g</span>
          <span className="text-[#34a853]">l</span>
          <span className="text-[#ea4335]">e</span>
        </span>
      </div>
    );
  }

  return <div className={commonClass} aria-hidden="true" />;
}

function StatusPill() {
  return (
    <div className="inline-flex items-center justify-center gap-[1.7px] rounded-[2.27px] border border-[#2eb79f] bg-[#f4fcf7] px-[4.55px] py-[3.41px]">
      <span className="[font-family:var(--font-albert-sans),Helvetica] text-[6.8px] font-medium leading-[9.4px] tracking-[0.14px] text-[#2eb79f]">
        Live
      </span>
      <span className="h-[3.61px] w-[3.61px] rounded-full bg-[#32d583] shadow-[0px_0px_1.8px_0.9px_#32d5834c]" />
    </div>
  );
}

function ProgressCardBody() {
  return (
    <div className="relative mt-auto flex w-full flex-col gap-2">
      <div className="flex items-end gap-2 rounded-xl border border-[#f2f2f2] bg-white px-4 py-[7px]">
        <div className="relative h-[39.41px] w-[57.74px] shrink-0 bg-white">
          <div className="[font-family:var(--font-albert-sans),Helvetica] absolute left-0 top-0 text-[10px] font-normal leading-[13px] text-[#010101]">
            Completion
          </div>
          <div className="[font-family:var(--font-albert-sans),Helvetica] absolute left-0 top-5 text-base font-bold leading-[20.8px] text-[#010101]">
            60%
          </div>
        </div>
        <div className="flex h-[30.6px] flex-1 flex-col justify-center gap-1 py-0.5">
          <div className="h-2 w-[193px] rounded-[100px] bg-[linear-gradient(90deg,rgba(255,255,255,1)_0%,rgba(117,123,255,1)_100%)]" />
          <div className="h-2 w-[121px] rounded-[100px] bg-[linear-gradient(90deg,rgba(255,255,255,1)_0%,rgba(241,179,179,1)_100%)]" />
        </div>
        <div className="h-1.5 w-[73px] shrink-0 rounded-[100px] bg-[#e8bff7]" />
      </div>
      <div className="rounded-xl border border-[#f2f2f2] bg-white px-4 py-[7px]">
        <div className="flex h-[30.6px] flex-col justify-center gap-1 py-0.5 blur-[2px]">
          <div className="h-2 w-[296px] rounded-[100px] bg-[linear-gradient(90deg,rgba(255,255,255,1)_0%,rgba(117,123,255,1)_100%)]" />
          <div className="h-2 w-[121px] rounded-[100px] bg-[linear-gradient(90deg,rgba(255,255,255,1)_0%,rgba(241,179,179,1)_100%)]" />
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-[-24px] bottom-0 h-[35px] bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(255,255,255,1)_100%)]" />
    </div>
  );
}

function ScalingPreview() {
  return (
    <div className="relative mt-1 h-[150px] w-full">
      <div className="absolute left-[108px] top-[-2px] h-[35px] w-[35px] rounded-[4.92px] border-[1.48px] border-[#ffffffd9] bg-[radial-gradient(50%_50%_at_49%_50%,rgba(117,123,255,1)_0%,rgba(255,255,255,1)_100%)] shadow-[0px_-2.33px_5.87px_-1.16px_#7ab4f761]" />
      <div className="absolute left-[77px] top-[43px] h-[18px] w-[84px] rounded-full border border-[#d9ddff]" />
      <div className="absolute left-[160px] top-[43px] h-[18px] w-[72px] rounded-full border border-[#d9ddff]" />
      <div className="absolute left-[145px] top-[45px] h-[30px] w-px bg-[#d9ddff]" />
      <div className="absolute left-[112px] top-[43px] h-[30px] w-px bg-[#d9ddff]" />
      <div className="absolute left-[196px] top-[43px] h-[30px] w-px bg-[#d9ddff]" />
      <div className="absolute left-[117px] top-[17px] flex h-[30px] w-[30px] items-center justify-center rounded-[2.45px] bg-[#ffffff4c] shadow-[0px_0.47px_1.9px_#b5b5b540] backdrop-blur-[0.24px]">
        <div className="relative flex h-[23.24px] w-[23.24px] items-center justify-center overflow-hidden rounded-[4.29px] border border-[#f5f5f5] bg-[#f5f5f5]">
          <div className="absolute left-0 top-[11px] h-[13px] w-[23px] bg-[linear-gradient(180deg,rgba(255,255,255,0.1)_0%,rgba(255,255,255,0.07)_100%)]" />
          <CloudIcon className="relative z-10 h-[19px] w-[19px] text-[#757bff]" />
        </div>
      </div>
      <div className="absolute left-[37px] top-[52px] flex h-5 w-5 items-center justify-center rounded bg-[#757bff] text-white shadow-sm">
        <span className="text-[9px] font-semibold">↘</span>
      </div>
      <div className="absolute left-[218px] top-[52px] flex h-5 w-5 items-center justify-center rounded bg-[#757bff] text-white shadow-sm">
        <span className="text-[9px] font-semibold">↙</span>
      </div>
      <div className="absolute bottom-0 left-[34px] w-[182px] rounded-md border border-[#ececf3] bg-white p-1 shadow-[0px_1.16px_11.63px_#00000014]">
        <div className="mb-1 h-[22px] rounded-[3px] border border-[#f0f0f4] bg-white px-2 py-1">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#d8d8df]" />
            <span className="h-1.5 w-1.5 rounded-full bg-[#d8d8df]" />
            <span className="h-1.5 w-1.5 rounded-full bg-[#d8d8df]" />
          </div>
        </div>
        <div className="space-y-1">
          {statusRows.map((row, index) => (
            <div
              key={`${row.label}-${index}`}
              className="flex items-center justify-between rounded-[2.47px] bg-neutral-50 p-[3.92px]"
            >
              <div className="flex h-2.5 w-2.5 items-center justify-center rounded-[2px] bg-[#757bff]">
                <CheckIcon className="h-[87.5%] w-[87.5%] text-white" />
              </div>
              <div className="w-[41.86px]" />
              <StatusPill />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TGlobalPreview() {
  return (
    <div className="relative mt-auto min-h-[120px] w-full">
      <div className="absolute left-0 top-0 [font-family:var(--font-albert-sans),Helvetica] text-[58px] font-semibold leading-[58px] tracking-[-1.16px] text-white sm:text-[80px] sm:leading-[80px] sm:tracking-[-1.6px]">
        4x &gt;&gt;&gt;&gt;&gt;
      </div>
      <div className="absolute right-0 top-[-16px] h-[170px] w-[200px]">
        <div className="absolute right-[22px] top-[10px] rounded-full bg-[linear-gradient(90deg,#7f6fff_0%,#8c7cff_48%,#9d87ff_100%)] px-3 py-1 text-[10px] font-medium text-white shadow-[0px_9px_20px_#1f1b4333]">
          40% Faster
        </div>
        <div className="absolute right-[52px] top-[26px] h-[36px] w-[52px] rounded-full bg-[#00000033] blur-[10px]" />
        <div className="absolute right-[31px] top-[35px]">
          <MousePointerIcon className="h-[15px] w-[15px] text-white" />
        </div>
        <div className="absolute right-[95px] top-[65px] h-1 w-1 rounded-full bg-[#f3e9ff]" />
        <div className="absolute right-[42px] top-[65px] h-1 w-1 rounded-full bg-[#f3e9ff]" />
        <div className="absolute right-[98px] top-[91px] h-1 w-1 rounded-full bg-[#f3e9ff]" />
        <div className="absolute right-[42px] top-[91px] h-1 w-1 rounded-full bg-[#f3e9ff]" />
        <div className="absolute right-[99px] top-[117px] h-1 w-1 rounded-full bg-[#f3e9ff]" />
        <div className="absolute right-[42px] top-[117px] h-1 w-1 rounded-full bg-[#f3e9ff]" />
        <div className="absolute right-[86px] top-[77px] h-[42px] w-px bg-[#cdbdff]" />
        <div className="absolute right-[30px] top-[77px] h-[42px] w-px bg-[#cdbdff]" />
        <div className="absolute right-[86px] top-[96px] h-px w-[56px] bg-[#cdbdff]" />
        <div className="absolute right-[142px] top-[96px] h-px w-[28px] bg-[#cdbdff]" />
        <div className="absolute right-[130px] top-[90px] text-white">
          <SparklesIcon className="h-4 w-4 text-white" />
        </div>
      </div>
    </div>
  );
}

function TopCard({ title, description, type }: (typeof topCards)[number]) {
  return (
    <article className="relative flex h-[261px] flex-col overflow-hidden rounded-xl bg-white p-6">
      <div className="flex flex-col gap-4">
        <h2 className="[font-family:var(--font-albert-sans),Helvetica] text-xl font-medium leading-[26px] text-[#2f2b43]">
          {title}
        </h2>
        <p className="[font-family:var(--font-albert-sans),Helvetica] text-base font-normal leading-[20.8px] text-[#2f2b43b2]">
          {description}
        </p>
      </div>
      {type === "logos" ? (
        <>
          <div className="mt-auto flex items-center gap-4">
            {logoItems.map((item, index) => (
              <LogoBadge key={`${item}-${index}`} label={item} />
            ))}
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[74px] bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(255,255,255,1)_58%,rgba(255,255,255,1)_100%)]" />
        </>
      ) : (
        <ProgressCardBody />
      )}
    </article>
  );
}

function BottomCard({
  title,
  type,
  description,
}: (typeof bottomCards)[number]) {
  if (type === "tglobal") {
    return (
      <article className="relative flex h-[261px] flex-col overflow-hidden rounded-xl bg-[radial-gradient(50%_50%_at_49%_50%,rgba(117,123,255,1)_0%,rgba(255,255,255,1)_100%)] p-6">
        <div className="flex flex-col gap-4">
          <h2 className="[font-family:var(--font-albert-sans),Helvetica] text-[32px] font-bold leading-[41.6px] text-white">
            {title}
          </h2>
        </div>
        <TGlobalPreview />
      </article>
    );
  }

  return (
    <article className="relative flex h-[261px] flex-col overflow-hidden rounded-xl bg-white p-6">
      <div className="flex max-w-[220px] flex-col gap-4">
        <h2 className="[font-family:var(--font-albert-sans),Helvetica] text-xl font-normal leading-[26px] text-[#2f2b43]">
          {title}
        </h2>
        <p className="[font-family:var(--font-albert-sans),Helvetica] text-base font-normal leading-[20.8px] text-[#2f2b43b2]">
          {description}
        </p>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[38px] bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(255,255,255,1)_58%,rgba(255,255,255,1)_100%)]" />
      <div className="absolute right-[18px] top-[30px] w-[259px] max-w-[58%]">
        <ScalingPreview />
      </div>
    </article>
  );
}

export default function Problem() {
  return (
    <section
      id="problem"
      className="flex min-h-screen w-full items-center justify-center bg-[#f7f9ff]"
    >
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-12 px-6 py-16 sm:px-10 lg:px-[120px] lg:py-20">
        <AnimateIn>
          <header className="flex flex-col gap-4">
            <p className="[font-family:var(--font-albert-sans),Helvetica] text-xl font-normal leading-7 text-[#2f2b43b2]">
              Problem with Development Currently
            </p>
            <div className="grid items-end gap-8 lg:grid-cols-[minmax(0,526px)_minmax(0,1fr)] lg:gap-10">
              <h1 className="[font-family:var(--font-albert-sans),Helvetica] max-w-[526px] text-[42px] font-medium leading-[52px] tracking-[-0.84px] text-[#010101] sm:text-[54px] sm:leading-[68px] sm:tracking-[-1.08px]">
                Building Software Is Still Too Slow
              </h1>
              <p className="[font-family:var(--font-albert-sans),Helvetica] max-w-[606px] pb-1 text-xl font-normal leading-7 text-[#2f2b43b2]">
                Despite better tools, teams still struggle to ship fast and
                scale efficiently.
              </p>
            </div>
          </header>
        </AnimateIn>

        <div className="flex flex-col">
          <div className="flex flex-col items-center gap-2.5">
            <TimelineConnector />
            <div className="grid w-full grid-cols-[20px_minmax(0,1fr)_20px_minmax(0,1fr)_20px] items-stretch">
              <div className="flex justify-center">
                <VerticalRail />
              </div>
              <div className="p-6">
                <TopCard {...topCards[0]} />
              </div>
              <div className="flex justify-center py-2.5">
                <VerticalRail />
              </div>
              <div className="p-6">
                <TopCard {...topCards[1]} />
              </div>
              <div className="flex justify-center">
                <VerticalRail />
              </div>
            </div>
            <PaginationLine />
          </div>
          <div className="flex flex-col items-center gap-2.5">
            <div className="grid w-full grid-cols-[20px_minmax(0,1fr)_20px_minmax(0,1fr)_20px] items-stretch">
              <div className="flex justify-center">
                <VerticalRail />
              </div>
              <div className="p-6">
                <BottomCard {...bottomCards[0]} />
              </div>
              <div className="flex justify-center py-2.5">
                <VerticalRail />
              </div>
              <div className="p-6">
                <BottomCard {...bottomCards[1]} />
              </div>
              <div className="flex justify-center">
                <VerticalRail />
              </div>
            </div>
            <TimelineConnector />
          </div>
        </div>
      </div>
    </section>
  );
}
