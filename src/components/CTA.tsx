"use client";

import { AnimatePresence, motion, type Variants } from "framer-motion";
import { useState } from "react";

/* ─── Web3Forms backend ──────────────────────────────────────────
 * Both modes (Project / Startup) POST to the same access key. The
 * `subject` field is prefixed differently so the inbox can filter
 * the two streams (e.g. a Gmail filter on "[Startup]"). Same
 * endpoint as the previous tglobal.in site, so submissions land in
 * the same inbox with no new wiring. */
const ACCESS_KEY = "8ca5ba96-be53-4698-bbc8-89b92c007835";
const ENDPOINT = "https://api.web3forms.com/submit";

const DETAILS_MAX = 300;
const EASE = [0.22, 1, 0.36, 1] as const;

type FormMode = "project" | "startup";

/* ─── Selects ────────────────────────────────────────────────── */
const BUDGET_OPTIONS = [
  { value: "", label: "Select a budget range" },
  { value: "<25k", label: "Less than $25,000" },
  { value: "25-100k", label: "$25,000 – $100,000" },
  { value: "100k+", label: "$100,000+" },
  { value: "exploring", label: "Just exploring" },
] as const;

const STAGE_OPTIONS = [
  { value: "", label: "Select your stage" },
  { value: "pre-seed", label: "Pre-seed / Idea" },
  { value: "seed", label: "Seed" },
  { value: "series-a", label: "Series A" },
  { value: "series-b+", label: "Series B+" },
  { value: "bootstrapped", label: "Bootstrapped / Profitable" },
] as const;

const COUNTRY_CODES = [
  { value: "+91", label: "+91" },
  { value: "+1", label: "+1" },
  { value: "+44", label: "+44" },
  { value: "+61", label: "+61" },
  { value: "+971", label: "+971" },
  { value: "+49", label: "+49" },
  { value: "+33", label: "+33" },
  { value: "+81", label: "+81" },
  { value: "+86", label: "+86" },
] as const;

/* ─── Single state shape covers both modes.
 * Common fields (name, email, company, role) carry over when the
 * user toggles between modes so they don't retype if they change
 * their mind mid-fill. Mode-specific fields stay separate. */
interface FormState {
  // Shared
  name: string;
  email: string;
  company: string;
  role: string;
  // Project-only
  budget: string;
  details: string;
  // Startup-only
  countryCode: string;
  phone: string;
  stage: string;
  linkedin: string;
}

const INITIAL_FORM: FormState = {
  name: "",
  email: "",
  company: "",
  role: "",
  budget: "",
  details: "",
  countryCode: "+91",
  phone: "",
  stage: "",
  linkedin: "",
};

type FieldKey = keyof FormState;
type SubmitStatus = "idle" | "submitting" | "success";

const SUBTITLES: Record<FormMode, string> = {
  project:
    "Share what you're building and we'll come back with a focused next step — usually within a business day.",
  startup:
    "Tell us your stage and we'll route you to a sprint planner who's shipped MVPs in your space.",
};

const SUBMIT_LABELS: Record<FormMode, string> = {
  project: "Talk to our team",
  startup: "Request my Sprint Plan",
};

const TOGGLE_PROMPT: Record<FormMode, { lead: string; cta: string }> = {
  project: {
    lead: "Building an early-stage startup? ",
    cta: "Try Sprint Planning",
  },
  startup: {
    lead: "Not a startup? ",
    cta: "Talk to our team",
  },
};

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function isValidPhone(value: string): boolean {
  // Permissive: 7+ digits, allows spaces/dashes/dots — server-side can normalise.
  const digits = value.replace(/[^\d]/g, "");
  return digits.length >= 7 && digits.length <= 15;
}

/* ─── Icons ──────────────────────────────────────────────────── */
function ArrowRight({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function ChevronDown({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function Spinner({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className="animate-spin"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M12 3a9 9 0 1 1-9 9" opacity="0.85" />
    </svg>
  );
}

function AnimatedCheck({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <motion.polyline
        points="20 6 9 17 4 12"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.55, ease: EASE, delay: 0.15 }}
      />
    </svg>
  );
}

/* ─── Animation variants ─────────────────────────────────────── */
const fieldGroup: Variants = {
  hidden: { opacity: 1 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.045, delayChildren: 0.08 },
  },
};

const fieldItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE },
  },
};

/* ─── Shared input styling ───────────────────────────────────── */
const inputBase =
  "w-full rounded-2xl border border-border bg-white/95 px-5 py-4 text-[16px] text-foreground placeholder:text-tertiary outline-none transition-[border-color,background-color,box-shadow] duration-200 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10";
const inputErrorClass =
  "border-red-400 focus:border-red-500 focus:ring-red-100";

interface FieldProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}

function Field({ id, label, required, error, hint, children }: FieldProps) {
  return (
    <motion.div variants={fieldItem}>
      <label
        htmlFor={id}
        className="flex items-center gap-1 text-[13px] font-semibold tracking-[-0.005em] text-foreground"
      >
        {label}
        {required && (
          <span aria-hidden="true" className="text-primary">
            *
          </span>
        )}
        {required && <span className="sr-only">(required)</span>}
      </label>
      <div className="mt-2">{children}</div>
      {(error || hint) && (
        <p
          id={`${id}-error`}
          role={error ? "alert" : undefined}
          className={`mt-1.5 text-[12px] ${
            error ? "text-red-600" : "text-tertiary"
          }`}
        >
          {error || hint}
        </p>
      )}
    </motion.div>
  );
}

/* ─── Section ────────────────────────────────────────────────── */
export default function CTA() {
  const [mode, setMode] = useState<FormMode>("project");
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [submitError, setSubmitError] = useState<string>("");

  const update = <K extends FieldKey>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const switchMode = (next: FormMode) => {
    if (next === mode) return;
    /* Clear errors that were specific to the previous mode — keeping
       them would show "phone is required" after toggling away from
       the startup form, which is noisy. Common-field errors stay so
       a half-validated user doesn't lose feedback when toggling. */
    setErrors((prev) => {
      const carry: Partial<Record<FieldKey, string>> = {};
      const sharedKeys: FieldKey[] = ["name", "email", "company", "role"];
      for (const k of sharedKeys) {
        if (prev[k]) carry[k] = prev[k];
      }
      return carry;
    });
    setSubmitError("");
    setMode(next);
  };

  const validate = (): boolean => {
    const next: Partial<Record<FieldKey, string>> = {};
    if (!form.name.trim()) next.name = "Your name is required";
    if (!form.email.trim()) next.email = "Email is required";
    else if (!isValidEmail(form.email)) next.email = "Please enter a valid email";
    if (!form.company.trim()) next.company = "Company name is required";

    if (mode === "startup") {
      if (!form.phone.trim()) next.phone = "Phone number is required";
      else if (!isValidPhone(form.phone))
        next.phone = "Please enter a valid phone number";
      if (!form.stage.trim()) next.stage = "Please select your stage";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "submitting") return;
    if (!validate()) {
      const firstInvalid = Object.keys(errors)[0] as FieldKey | undefined;
      const idMap: Partial<Record<FieldKey, string>> = {
        name: "ct-name",
        email: "ct-email",
        company: "ct-company",
        role: "ct-role",
        budget: "ct-budget",
        details: "ct-details",
        phone: "ct-phone",
        stage: "ct-stage",
        linkedin: "ct-linkedin",
      };
      const id = idMap[firstInvalid ?? "name"] ?? "ct-name";
      document.getElementById(id)?.focus();
      return;
    }

    setStatus("submitting");
    setSubmitError("");

    const subjectPrefix = mode === "startup" ? "Startup" : "Project";
    const fullPhone =
      mode === "startup"
        ? `${form.countryCode} ${form.phone}`.trim()
        : "—";

    const payload =
      mode === "project"
        ? {
            access_key: ACCESS_KEY,
            from_name: "TGlobal Website",
            subject: `[${subjectPrefix}] inquiry — ${form.name} (${form.company})`,
            mode,
            name: form.name,
            email: form.email,
            company: form.company,
            role: form.role || "—",
            budget: form.budget || "—",
            details: form.details || "—",
            botcheck: "",
          }
        : {
            access_key: ACCESS_KEY,
            from_name: "TGlobal Website",
            subject: `[${subjectPrefix}] inquiry — ${form.name} (${form.company})`,
            mode,
            name: form.name,
            email: form.email,
            phone: fullPhone,
            company: form.company,
            stage: form.stage,
            role: form.role || "—",
            linkedin: form.linkedin || "—",
            botcheck: "",
          };

    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { success?: boolean; message?: string };
      if (data.success) {
        setStatus("success");
        return;
      }
      throw new Error(data.message || "Submission failed");
    } catch (err) {
      setStatus("idle");
      setSubmitError(
        err instanceof Error
          ? err.message
          : "We couldn't send your message. Please try again or email growth@tglobal.in.",
      );
    }
  };

  const otherMode: FormMode = mode === "project" ? "startup" : "project";
  const togglePrompt = TOGGLE_PROMPT[mode];

  return (
    <section
      id="talk-to-us"
      aria-labelledby="talk-to-us-heading"
      className="relative w-full overflow-hidden pt-12 pb-20 sm:pt-16 sm:pb-28 lg:pt-20 lg:pb-32"
    >
      {/* Lavender wash backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 65% 55% at 50% 48%, rgba(189,112,246,0.20) 0%, rgba(75,40,255,0.07) 38%, transparent 72%), linear-gradient(180deg, #ffffff 0%, #f8f4ff 60%, #f3edff 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-[55%] top-[60%] hidden h-[460px] w-[460px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#4B28FF] opacity-[0.14] blur-[160px] md:block"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-[42%] top-[28%] hidden h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#8B5CF6] opacity-[0.10] blur-[140px] md:block"
      />

      <div className="relative w-full">
        {/* ─── Heading ─── */}
        <div className="mx-auto w-full max-w-[1440px] px-6 text-center sm:px-8 lg:px-14 xl:px-20">
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.55, ease: EASE }}
            className="eyebrow"
          >
            Talk to us
          </motion.p>
          <motion.h2
            id="talk-to-us-heading"
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.7, delay: 0.05, ease: EASE }}
            className="display-lg mt-3"
          >
            Tell us about your project
          </motion.h2>

          {/* Subtitle swaps with mode — heading stays stable so the
              section's identity doesn't visibly shift. */}
          <div className="mx-auto mt-5 max-w-[560px] min-h-[3.5rem]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={mode}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: EASE }}
                className="body-lg"
              >
                {SUBTITLES[mode]}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        {/* ─── Form card ─── */}
        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.75, ease: EASE }}
          className="relative mx-auto mt-8 w-full max-w-[720px] px-6 sm:mt-10 sm:px-8"
        >
          <div
            className="rounded-[28px] p-px"
            style={{
              background:
                "linear-gradient(135deg, rgba(75,40,255,0.32) 0%, rgba(197,186,255,0.45) 35%, rgba(244,225,252,0.55) 65%, rgba(75,40,255,0.10) 100%)",
            }}
          >
            <div className="relative rounded-[27px] bg-white p-6 shadow-[0_36px_90px_-32px_rgba(75,40,255,0.30),0_8px_24px_-12px_rgba(75,40,255,0.10)] sm:p-8">
              <AnimatePresence mode="wait" initial={false}>
                {status === "success" ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -14 }}
                    transition={{ duration: 0.45, ease: EASE }}
                    className="flex flex-col items-center py-6 text-center sm:py-10"
                  >
                    <motion.span
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{
                        duration: 0.5,
                        ease: EASE,
                        type: "spring",
                        damping: 14,
                      }}
                      className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white shadow-[0_14px_30px_-8px_rgba(75,40,255,0.55)]"
                    >
                      <AnimatedCheck size={32} />
                    </motion.span>
                    <h3 className="mt-6 text-[24px] font-semibold tracking-[-0.02em] text-foreground">
                      Thanks — we got it.
                    </h3>
                    <p className="mt-3 max-w-[420px] text-[15px] text-muted">
                      {form.name.trim().split(/\s+/)[0]
                        ? `${form.name.trim().split(/\s+/)[0]}, `
                        : ""}
                      we&apos;ll review your details and come back within one business day.
                    </p>
                  </motion.div>
                ) : (
                  <motion.form
                    key={`form-${mode}`}
                    onSubmit={handleSubmit}
                    variants={fieldGroup}
                    initial="hidden"
                    animate="show"
                    exit={{ opacity: 0 }}
                    className="space-y-5"
                    noValidate
                  >
                    <input
                      type="text"
                      name="botcheck"
                      tabIndex={-1}
                      autoComplete="off"
                      className="hidden"
                      aria-hidden="true"
                    />

                    {/* Shared row 1 — Name + Email */}
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field
                        id="ct-name"
                        label="Full name"
                        required
                        error={errors.name}
                      >
                        <input
                          id="ct-name"
                          name="name"
                          type="text"
                          autoComplete="name"
                          value={form.name}
                          onChange={(e) => update("name", e.target.value)}
                          aria-invalid={!!errors.name}
                          aria-describedby={errors.name ? "ct-name-error" : undefined}
                          placeholder="Your full name"
                          className={`${inputBase} ${errors.name ? inputErrorClass : ""}`}
                        />
                      </Field>
                      <Field
                        id="ct-email"
                        label={mode === "startup" ? "Email" : "Work email"}
                        required
                        error={errors.email}
                      >
                        <input
                          id="ct-email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          inputMode="email"
                          value={form.email}
                          onChange={(e) => update("email", e.target.value)}
                          aria-invalid={!!errors.email}
                          aria-describedby={errors.email ? "ct-email-error" : undefined}
                          placeholder={mode === "startup" ? "you@startup.com" : "you@company.com"}
                          className={`${inputBase} ${errors.email ? inputErrorClass : ""}`}
                        />
                      </Field>
                    </div>

                    {/* Startup-only — Phone with country code (single visual
                        field with shared border, internal divider). */}
                    {mode === "startup" && (
                      <Field
                        id="ct-phone"
                        label="Phone number"
                        required
                        error={errors.phone}
                      >
                        <div
                          className={`flex items-stretch overflow-hidden rounded-2xl border bg-white/95 transition-[border-color,background-color,box-shadow] duration-200 focus-within:border-primary focus-within:bg-white focus-within:ring-4 focus-within:ring-primary/10 ${
                            errors.phone ? "border-red-400 focus-within:border-red-500 focus-within:ring-red-100" : "border-border"
                          }`}
                        >
                          <div className="relative">
                            <select
                              aria-label="Country code"
                              value={form.countryCode}
                              onChange={(e) => update("countryCode", e.target.value)}
                              className="h-full cursor-pointer appearance-none border-0 bg-transparent py-4 pl-5 pr-9 text-[16px] text-foreground focus:outline-none"
                            >
                              {COUNTRY_CODES.map((c) => (
                                <option key={c.value} value={c.value}>
                                  {c.label}
                                </option>
                              ))}
                            </select>
                            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted">
                              <ChevronDown size={14} />
                            </span>
                          </div>
                          <span className="my-3 w-px bg-border" />
                          <input
                            id="ct-phone"
                            name="phone"
                            type="tel"
                            autoComplete="tel-national"
                            inputMode="tel"
                            value={form.phone}
                            onChange={(e) => update("phone", e.target.value)}
                            aria-invalid={!!errors.phone}
                            aria-describedby={errors.phone ? "ct-phone-error" : undefined}
                            placeholder="98765 43210"
                            className="flex-1 border-0 bg-transparent px-4 py-4 text-[16px] text-foreground placeholder:text-tertiary focus:outline-none"
                          />
                        </div>
                      </Field>
                    )}

                    {/* Shared row 2 — Company + (Role | Stage) */}
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field
                        id="ct-company"
                        label="Company name"
                        required
                        error={errors.company}
                      >
                        <input
                          id="ct-company"
                          name="company"
                          type="text"
                          autoComplete="organization"
                          value={form.company}
                          onChange={(e) => update("company", e.target.value)}
                          aria-invalid={!!errors.company}
                          aria-describedby={errors.company ? "ct-company-error" : undefined}
                          placeholder={mode === "startup" ? 'Even "Project X" works' : "Your company"}
                          className={`${inputBase} ${errors.company ? inputErrorClass : ""}`}
                        />
                      </Field>

                      {mode === "startup" ? (
                        <Field
                          id="ct-stage"
                          label="Company stage"
                          required
                          error={errors.stage}
                        >
                          <div className="relative">
                            <select
                              id="ct-stage"
                              name="stage"
                              value={form.stage}
                              onChange={(e) => update("stage", e.target.value)}
                              aria-invalid={!!errors.stage}
                              aria-describedby={errors.stage ? "ct-stage-error" : undefined}
                              className={`${inputBase} cursor-pointer appearance-none pr-12 ${
                                form.stage ? "" : "text-tertiary"
                              } ${errors.stage ? inputErrorClass : ""}`}
                            >
                              {STAGE_OPTIONS.map((opt) => (
                                <option
                                  key={opt.value}
                                  value={opt.value}
                                  disabled={opt.value === ""}
                                  className="text-foreground"
                                >
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                            <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-muted">
                              <ChevronDown size={16} />
                            </span>
                          </div>
                        </Field>
                      ) : (
                        <Field id="ct-role" label="Role / Title">
                          <input
                            id="ct-role"
                            name="role"
                            type="text"
                            autoComplete="organization-title"
                            value={form.role}
                            onChange={(e) => update("role", e.target.value)}
                            placeholder="Founder, CTO, PM..."
                            className={inputBase}
                          />
                        </Field>
                      )}
                    </div>

                    {/* Mode-specific row(s) */}
                    {mode === "project" ? (
                      <>
                        <Field id="ct-budget" label="Project budget">
                          <div className="relative">
                            <select
                              id="ct-budget"
                              name="budget"
                              value={form.budget}
                              onChange={(e) => update("budget", e.target.value)}
                              className={`${inputBase} cursor-pointer appearance-none pr-12 ${
                                form.budget ? "" : "text-tertiary"
                              }`}
                            >
                              {BUDGET_OPTIONS.map((opt) => (
                                <option
                                  key={opt.value}
                                  value={opt.value}
                                  disabled={opt.value === ""}
                                  className="text-foreground"
                                >
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                            <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-muted">
                              <ChevronDown size={16} />
                            </span>
                          </div>
                        </Field>

                        <Field id="ct-details" label="Tell us about your project">
                          <textarea
                            id="ct-details"
                            name="details"
                            value={form.details}
                            onChange={(e) =>
                              update("details", e.target.value.slice(0, DETAILS_MAX))
                            }
                            placeholder="What are you building, and where are you stuck?"
                            rows={4}
                            maxLength={DETAILS_MAX}
                            className={`${inputBase} resize-none`}
                          />
                          <div className="mt-1.5 flex justify-end text-[11px] text-tertiary">
                            <span aria-live="polite">
                              {form.details.length}/{DETAILS_MAX}
                            </span>
                          </div>
                        </Field>
                      </>
                    ) : (
                      <div className="grid gap-5 sm:grid-cols-2">
                        <Field id="ct-role" label="Role / Title">
                          <input
                            id="ct-role"
                            name="role"
                            type="text"
                            autoComplete="organization-title"
                            value={form.role}
                            onChange={(e) => update("role", e.target.value)}
                            placeholder="Founder, CTO, PM..."
                            className={inputBase}
                          />
                        </Field>
                        <Field id="ct-linkedin" label="LinkedIn profile">
                          <input
                            id="ct-linkedin"
                            name="linkedin"
                            type="url"
                            autoComplete="url"
                            value={form.linkedin}
                            onChange={(e) => update("linkedin", e.target.value)}
                            placeholder="linkedin.com/in/yourprofile"
                            className={inputBase}
                          />
                        </Field>
                      </div>
                    )}

                    {submitError && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        role="alert"
                        className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700"
                      >
                        {submitError}
                      </motion.div>
                    )}

                    <motion.div
                      variants={fieldItem}
                      className="flex flex-col gap-3 pt-2"
                    >
                      <button
                        type="submit"
                        disabled={status === "submitting"}
                        className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-primary px-7 py-[18px] text-[15px] font-semibold text-white shadow-[0_12px_30px_-12px_rgba(75,40,255,0.65)] transition-all duration-300 hover:shadow-[0_16px_38px_-10px_rgba(75,40,255,0.75)] active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <span
                          aria-hidden
                          className="pointer-events-none absolute inset-0 translate-x-[-120%] bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[120%]"
                        />
                        {status === "submitting" ? (
                          <>
                            <Spinner size={16} />
                            <span>Sending…</span>
                          </>
                        ) : (
                          <>
                            <span className="relative">{SUBMIT_LABELS[mode]}</span>
                            <span className="relative inline-block transition-transform duration-300 ease-out group-hover:translate-x-1">
                              <ArrowRight size={16} />
                            </span>
                          </>
                        )}
                      </button>
                      <p className="text-center text-[12px] text-tertiary">
                        No spam — just a focused reply from a real human.
                      </p>
                    </motion.div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ─── Cross-link toggle below card ───────────────────
              Heizen-style "Are you a startup? Start here" prompt,
              but instead of navigating to /startups it swaps the
              form mode in place. Hidden when the user is already
              in the success state — they're done; switching back
              to a fresh empty form would be confusing. */}
          {status !== "success" && (
            <div className="mt-6 text-center text-[13px] text-muted">
              {togglePrompt.lead}
              <button
                type="button"
                onClick={() => switchMode(otherMode)}
                className="group inline-flex items-center gap-1 align-baseline font-medium text-primary underline decoration-primary/30 underline-offset-[3px] transition hover:text-primary-dark hover:decoration-primary/70"
              >
                {togglePrompt.cta}
                <span className="inline-block transition-transform duration-200 group-hover:translate-x-0.5">
                  →
                </span>
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
