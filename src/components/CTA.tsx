"use client";

import { AnimatePresence, motion, type Variants } from "framer-motion";
import { useState } from "react";

/* ─── Web3Forms backend ──────────────────────────────────────────
 * Submissions POST to https://api.web3forms.com/submit and email
 * the configured inbox for this access key — same endpoint used by
 * the previous tglobal.in site, so submissions land in the same
 * place without any new wiring. To rotate the destination, replace
 * the access key in the Web3Forms dashboard rather than touching
 * code. */
const ACCESS_KEY = "8ca5ba96-be53-4698-bbc8-89b92c007835";
const ENDPOINT = "https://api.web3forms.com/submit";

const BUDGET_OPTIONS = [
  { value: "", label: "Select a budget range" },
  { value: "<25k", label: "Less than $25,000" },
  { value: "25-100k", label: "$25,000 – $100,000" },
  { value: "100k+", label: "$100,000+" },
  { value: "exploring", label: "Just exploring" },
] as const;

const DETAILS_MAX = 300;
const EASE = [0.22, 1, 0.36, 1] as const;

interface FormState {
  name: string;
  email: string;
  company: string;
  role: string;
  budget: string;
  details: string;
}

const INITIAL_FORM: FormState = {
  name: "",
  email: "",
  company: "",
  role: "",
  budget: "",
  details: "",
};

type FieldKey = keyof FormState;
type SubmitStatus = "idle" | "submitting" | "success";

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

/* ─── Framer-motion variants for staggered field entrance ──────
 * Triggered once when the form card enters the viewport. The card
 * wrapper handles its own scale-in; this variant set drives the
 * fields' rhythm so they arrive sequentially rather than all at
 * once, matching the Capabilities and Hero entrance feel. */
const fieldGroup: Variants = {
  hidden: { opacity: 1 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.055, delayChildren: 0.18 },
  },
};

const fieldItem: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: EASE },
  },
};

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

/* Animated stroke draw — pathLength is framer-motion's idiomatic
   way of doing the SVG dash-offset trick without the manual
   stroke-dasharray dance. */
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

/* ─── Field wrapper ──────────────────────────────────────────── */
const inputBase =
  "w-full rounded-2xl border border-border bg-white/95 px-5 py-4 text-[16px] text-foreground placeholder:text-tertiary outline-none transition-[border-color,background-color,box-shadow] duration-200 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10";
const inputError =
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

  const validate = (): boolean => {
    const next: Partial<Record<FieldKey, string>> = {};
    if (!form.name.trim()) next.name = "Your name is required";
    if (!form.email.trim()) next.email = "Email is required";
    else if (!isValidEmail(form.email)) next.email = "Please enter a valid email";
    if (!form.company.trim()) next.company = "Company name is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "submitting") return;
    if (!validate()) {
      const firstInvalid = (Object.keys(errors)[0] || "name") as FieldKey;
      document.getElementById(`ct-${firstInvalid}`)?.focus();
      return;
    }

    setStatus("submitting");
    setSubmitError("");

    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: ACCESS_KEY,
          from_name: "TGlobal Website",
          subject: `Project inquiry — ${form.name} (${form.company})`,
          name: form.name,
          email: form.email,
          company: form.company,
          role: form.role || "—",
          budget: form.budget || "—",
          details: form.details || "—",
          botcheck: "",
        }),
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

  return (
    <section
      id="talk-to-us"
      aria-labelledby="talk-to-us-heading"
      className="relative w-full overflow-hidden pt-12 pb-20 sm:pt-16 sm:pb-28 lg:pt-20 lg:pb-32"
    >
      {/* Lavender wash backdrop — preserved but with a slightly cooler
          radial centre so the form card feels like it's resting on a
          warm spotlight rather than a flat tint. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 65% 55% at 50% 48%, rgba(189,112,246,0.20) 0%, rgba(75,40,255,0.07) 38%, transparent 72%), linear-gradient(180deg, #ffffff 0%, #f8f4ff 60%, #f3edff 100%)",
        }}
      />
      {/* Two stacked glow blobs for depth. The lower one is brighter
          and offset right; the upper one is dimmer and offset left.
          md:block keeps them off mobile where the wash already does
          enough. */}
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
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.55, delay: 0.1, ease: EASE }}
            className="body-lg mx-auto mt-5 max-w-[560px]"
          >
            Share what you&apos;re building and we&apos;ll come back with a focused next step — usually within a business day.
          </motion.p>
        </div>

        {/* ─── Form card ─── */}
        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.75, ease: EASE }}
          className="relative mx-auto mt-8 w-full max-w-[720px] px-6 sm:mt-10 sm:px-8"
        >
          {/* Gradient stroke wrapper — 1px purple→lavender→transparent
              ring around the white card. The wrapping div paints the
              gradient; the inner div sits 1px inset to expose only the
              border. Cheaper than ::before/mask hacks and avoids extra
              CSS layers. */}
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
                    key="form"
                    onSubmit={handleSubmit}
                    variants={fieldGroup}
                    initial="hidden"
                    whileInView="show"
                    exit={{ opacity: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    className="space-y-5"
                    noValidate
                  >
                    {/* Honeypot — hidden from humans, common bot trap. */}
                    <input
                      type="text"
                      name="botcheck"
                      tabIndex={-1}
                      autoComplete="off"
                      className="hidden"
                      aria-hidden="true"
                    />

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
                          className={`${inputBase} ${errors.name ? inputError : ""}`}
                        />
                      </Field>
                      <Field
                        id="ct-email"
                        label="Work email"
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
                          placeholder="you@company.com"
                          className={`${inputBase} ${errors.email ? inputError : ""}`}
                        />
                      </Field>
                    </div>

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
                          placeholder="Your company"
                          className={`${inputBase} ${errors.company ? inputError : ""}`}
                        />
                      </Field>
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
                    </div>

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

                    <motion.div variants={fieldItem} className="flex flex-col gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={status === "submitting"}
                        className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-primary px-7 py-[18px] text-[15px] font-semibold text-white shadow-[0_12px_30px_-12px_rgba(75,40,255,0.65)] transition-all duration-300 hover:shadow-[0_16px_38px_-10px_rgba(75,40,255,0.75)] active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {/* Shine sweep on hover — pure CSS, GPU-cheap */}
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
                            <span className="relative">Talk to our team</span>
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
        </motion.div>
      </div>
    </section>
  );
}
