"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

function BotIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 8V4H8" />
      <rect width="16" height="12" x="4" y="8" rx="2" />
      <path d="M2 14h2" />
      <path d="M20 14h2" />
      <path d="M15 13v2" />
      <path d="M9 13v2" />
    </svg>
  );
}

function SparklesIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063L6.5 13.5l2-.563A2 2 0 0 0 9.937 11.5L10.5 9.5l.563 2A2 2 0 0 0 12.5 12.937l2 .563-2 .563A2 2 0 0 0 11.063 15.5L10.5 17.5z" />
      <path d="M18 3v4" />
      <path d="M16 5h4" />
    </svg>
  );
}

function SendIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function ResetIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}

type ChatMessage = {
  id: number;
  role: "bot" | "user";
  text: string;
};

const MARQUEE_QUESTIONS = [
  "How much time to create a landing page?",
  "Do you build AI softwares?",
  "Can you integrate Stripe billing?",
  "What's the cost of a custom CRM?",
  "Do you provide ongoing support?",
  "How fast can you ship an MVP?",
  "Can you handle HIPAA compliance?",
  "Do you work with startups?",
  "What's your tech stack?",
  "Do you offer DevOps?",
];

const ROWS = [
  { questions: MARQUEE_QUESTIONS, reverse: false, speed: "" },
  { questions: [...MARQUEE_QUESTIONS].reverse(), reverse: true, speed: "slow" },
  { questions: MARQUEE_QUESTIONS, reverse: false, speed: "fast" },
  { questions: [...MARQUEE_QUESTIONS].reverse(), reverse: true, speed: "" },
  { questions: MARQUEE_QUESTIONS, reverse: false, speed: "slow" },
] as const;

const QUICK_ACTIONS = [
  "Scope an MVP",
  "Redesign UX",
  "Build internal tools",
  "Add AI workflow",
];

const STARTER_MESSAGES: ChatMessage[] = [
  {
    id: 1,
    role: "bot",
    text: "Hi, I'm the TGlobal assistant. Tell me what you want to launch and I'll help frame the fastest path from MVP to product build.",
  },
  {
    id: 2,
    role: "bot",
    text: "Ask about MVP scope, delivery timelines, UX redesigns, internal tools, healthcare workflows, or how we use AI to ship in weeks instead of months.",
  },
];

function createReply(query: string): string {
  const lower = query.toLowerCase();

  if (lower.includes("mvp") || lower.includes("launch")) {
    return "For an MVP, we lock the core workflow, required integrations, and launch constraints first. Then design and engineering move in parallel so the first release can happen in weeks, not months.";
  }

  if (lower.includes("design") || lower.includes("ux") || lower.includes("redesign")) {
    return "That sounds like a UX and systems cleanup problem. We normally review the current flow, remove friction, redesign the key screens, and carry the new UX straight into implementation so the work does not stall after design.";
  }

  if (lower.includes("health") || lower.includes("hipaa") || lower.includes("healthcare")) {
    return "Yes. We support regulated healthcare-oriented product work by defining workflow clarity, permissions, and implementation boundaries early so compliance and usability stay aligned during the build.";
  }

  if (lower.includes("ai") || lower.includes("chatbot") || lower.includes("automation")) {
    return "AI works best when it supports a real workflow. We use it to accelerate scoping, implementation, and QA, while senior product and engineering oversight keeps the product reliable and launch-ready.";
  }

  if (lower.includes("internal") || lower.includes("ops") || lower.includes("tool")) {
    return "For internal tools, the biggest wins come from tightening the workflow first, then building the smallest system that removes manual effort. That keeps the MVP practical and valuable from day one.";
  }

  return "That's a strong starting point. The next move is usually to define the core flow, scope the fastest useful MVP, and map how the same build can continue into the full product. If you want, continue by email and we'll take it further.";
}

function QuestionPill({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-white border border-border px-5 py-3 text-[14px] text-muted whitespace-nowrap">
      {text}
    </span>
  );
}

function MarqueeRow({
  questions,
  reverse,
  speed,
}: {
  questions: readonly string[];
  reverse: boolean;
  speed: string;
}) {
  const items = [...questions, ...questions];
  return (
    <div className="overflow-hidden">
      <div className={`marquee-track ${reverse ? "reverse" : ""} ${speed} gap-4`}>
        {items.map((q, i) => (
          <QuestionPill key={`${q}-${i}`} text={q} />
        ))}
      </div>
    </div>
  );
}

export default function CTA() {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(STARTER_MESSAGES);
  const [isTyping, setIsTyping] = useState(false);
  const [messageId, setMessageId] = useState(3);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, [messages, isTyping]);

  const transcript = useMemo(
    () =>
      messages
        .map((m) => `${m.role === "bot" ? "TGlobal" : "You"}: ${m.text}`)
        .join("\n"),
    [messages]
  );

  const mailtoHref = useMemo(() => {
    const subject = encodeURIComponent("Project inquiry from website");
    const body = encodeURIComponent(
      `${transcript}\n\nLatest draft:\n${inputValue.trim() || "I would like to discuss a project."}`
    );
    return `mailto:hello@tglobal.ai?subject=${subject}&body=${body}`;
  }, [inputValue, transcript]);

  const queueReply = (content: string) => {
    const userMessageId = messageId;
    const botMessageId = messageId + 1;

    setMessages((current) => [
      ...current,
      { id: userMessageId, role: "user", text: content },
    ]);
    setMessageId(botMessageId + 1);
    setIsTyping(true);

    window.setTimeout(() => {
      setMessages((current) => [
        ...current,
        { id: botMessageId, role: "bot", text: createReply(content) },
      ]);
      setIsTyping(false);
    }, 520);
  };

  const sendMessage = (message?: string) => {
    if (isTyping) return;
    const content = (message ?? inputValue).trim();
    if (!content) return;
    queueReply(content);
    setInputValue("");
  };

  const resetChat = () => {
    setMessages(STARTER_MESSAGES);
    setInputValue("");
    setIsTyping(false);
    setMessageId(3);
  };

  return (
    <section id="talk-to-us" className="section-pad relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden">
      {/* Lavender wash backdrop */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(189,112,246,0.18) 0%, rgba(75,40,255,0.08) 40%, transparent 70%), linear-gradient(180deg, #ffffff 0%, #faf7ff 100%)",
        }}
      />

      <div className="relative">
        {/* Heading */}
        <div className="site-shell text-center">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="eyebrow"
          >
            Talk to us
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.7, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
            className="display-lg mt-3"
          >
            Ask Question. Get Instant Business Insights
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="body-lg mt-5 mx-auto max-w-[560px]"
          >
            Tell us what you&apos;re building, where execution is getting stuck, or what needs to launch next. The assistant will help shape the path.
          </motion.p>
        </div>

        {/* Marquee background + chat card */}
        <div className="relative mt-16">
          <div className="space-y-4 opacity-40">
            {ROWS.map((row, i) => (
              <MarqueeRow
                key={i}
                questions={row.questions}
                reverse={row.reverse}
                speed={row.speed}
              />
            ))}
          </div>

          {/* Foreground chat card */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-auto w-full max-w-[720px] mx-6 rounded-[32px] bg-white border border-border p-5 sm:p-6 shadow-[0_40px_100px_-40px_rgba(75,40,255,0.35)]"
            >
              {/* Assistant header */}
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-white shadow-[0_12px_28px_-8px_rgba(75,40,255,0.5)]">
                    <BotIcon size={18} />
                  </span>
                  <div>
                    <p className="text-[15px] font-semibold text-foreground">TGlobal Assistant</p>
                    <p className="text-xs text-muted">Online now</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
                  <SparklesIcon size={12} />
                  AI chat
                </span>
              </div>

              {/* Message list */}
              <div
                ref={chatContainerRef}
                className="mt-4 max-h-[300px] space-y-3 overflow-y-auto pr-1"
              >
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[88%] rounded-2xl px-4 py-3 text-[14px] leading-[1.6] ${
                        m.role === "user"
                          ? "bg-primary text-white"
                          : "bg-primary-soft/60 text-foreground"
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl bg-primary-soft/60 px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-primary/60" />
                        <span className="h-2 w-2 animate-pulse rounded-full bg-primary/60 [animation-delay:120ms]" />
                        <span className="h-2 w-2 animate-pulse rounded-full bg-primary/60 [animation-delay:240ms]" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="mt-5">
                <label
                  htmlFor="cta-query"
                  className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary"
                >
                  Your message
                </label>
                <textarea
                  id="cta-query"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="We need to redesign our platform and ship a new MVP in eight weeks..."
                  rows={3}
                  className="mt-2.5 w-full resize-none rounded-[20px] border border-border bg-transparent px-4 py-3 text-[15px] text-foreground outline-none placeholder:text-tertiary focus:border-primary/40"
                />

                {/* Quick actions + send */}
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap gap-2">
                    {QUICK_ACTIONS.map((action) => (
                      <button
                        key={action}
                        type="button"
                        onClick={() => sendMessage(action)}
                        disabled={isTyping}
                        className="rounded-full bg-primary-soft px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary transition hover:bg-primary-tint/40 disabled:opacity-55"
                      >
                        {action}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={resetChat}
                      className="inline-flex items-center justify-center gap-1.5 rounded-full border border-border px-4 py-2.5 text-[13px] font-medium text-muted transition hover:text-foreground hover:border-border-mid"
                      aria-label="Reset chat"
                    >
                      <ResetIcon size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => sendMessage()}
                      disabled={!inputValue.trim() || isTyping}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-55 shadow-[0_10px_28px_-12px_rgba(75,40,255,0.6)]"
                    >
                      Send
                      <SendIcon size={13} />
                    </button>
                  </div>
                </div>

                <div className="mt-3 text-center sm:text-right">
                  <a
                    href={mailtoHref}
                    className="text-[12px] font-medium text-muted hover:text-primary transition"
                  >
                    Continue by email →
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
