"use client";

import { AnimatePresence, motion, type Variants } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import CountryPicker from "@/components/primitives/CountryPicker";
import {
  DEFAULT_COUNTRY_ISO2,
  digitsOnly,
  findCountry,
  formatPhone,
  isValidPhoneForCountry,
} from "@/lib/countries";

/* ─── Web3Forms backend ──────────────────────────────────────────
 * Both modes (Project / Startup) POST to the same access key. The
 * `subject` field is prefixed differently so the inbox can filter
 * the two streams (e.g. a Gmail filter on "[Startup]"). Same
 * endpoint as the previous tglobal.in site, so submissions land in
 * the same inbox with no new wiring.
 *
 * Key now lives in NEXT_PUBLIC_WEB3FORMS_KEY (.env.local). Web3Forms
 * keys are public-by-design (anyone with the key can post to it), but
 * env-driven means rotation is a one-line config change instead of a
 * source edit + rebuild. The ?? fallback is the original key so the
 * form keeps working if the env var is missing during a misconfigured
 * deploy — preferable to a silent submit failure for end users. */
const ACCESS_KEY =
  process.env.NEXT_PUBLIC_WEB3FORMS_KEY ?? "8ca5ba96-be53-4698-bbc8-89b92c007835";
const ENDPOINT = "https://api.web3forms.com/submit";

const NOTES_MAX = 200;
const EASE = [0.22, 1, 0.36, 1] as const;

type FormMode = "project" | "startup";

/* ─── Selects ──────────────────────────────────────────────────
 * Field schemas match the Heizen reference forms verbatim — labels,
 * options, and option order have been transcribed from the design
 * the boss circulated. Don't paraphrase; the wording is the brief.
 *
 * Project = "Not a startup" form.
 *   Field: Company Revenue (₹ Cr)
 *   Anchored in INR crore because the form is India-first.
 *
 * Startup = the sprint-plan form.
 *   Field: Company Stage
 *   Five canonical stages from "Just an idea" → "Scaling". Wording
 *   is verbatim from the design — preserve the em dash and the
 *   short clarifier after it ("Just an idea, no code yet" etc.). */
const REVENUE_OPTIONS = [
  { value: "", label: "Select" },
  { value: "<100", label: "< 100 Cr" },
  { value: "100-1000", label: "100–1,000 Cr" },
  { value: "1000-10000", label: "1,000–10,000 Cr" },
  { value: "10000+", label: "10,000+ Cr" },
] as const;

const STAGE_OPTIONS = [
  { value: "", label: "Select Stage" },
  { value: "idea", label: "Just an idea, no code yet" },
  { value: "mvp", label: "Building MVP, currently in development" },
  { value: "pilot", label: "In pilot or beta, testing with real users" },
  { value: "live", label: "Product live, in production" },
  { value: "scaling", label: "Scaling, post product-market fit" },
] as const;

/* Single state shape covers both modes. Common fields (name, email,
 * company, role, linkedin) carry over when the user toggles between
 * modes so they don't retype if they change their mind mid-fill.
 * Mode-specific fields stay separate and are simply not validated /
 * not sent in payloads when the other mode is active. */
interface FormState {
  // Shared
  name: string;
  email: string;
  company: string;
  role: string;
  linkedin: string;
  // Project-only
  revenue: string;
  notes: string;
  // Startup-only — phone stored as bare digits + ISO so we can
  // re-format on country switch and validate length per-country
  // without parsing back out of a display string.
  countryIso: string;
  phone: string;
  stage: string;
}

const INITIAL_FORM: FormState = {
  name: "",
  email: "",
  company: "",
  role: "",
  linkedin: "",
  revenue: "",
  notes: "",
  countryIso: DEFAULT_COUNTRY_ISO2,
  phone: "",
  stage: "",
};

type FieldKey = keyof FormState;
type SubmitStatus = "idle" | "submitting" | "success";

const SUBTITLE = "This helps us prepare for a focused strategy call.";

const SUBMIT_LABELS: Record<FormMode, string> = {
  project: "Talk to an expert",
  startup: "Request My Sprint Plan",
};

const TOGGLE_PROMPT: Record<FormMode, { lead: string; cta: string }> = {
  project: {
    lead: "Are you a StartUp? ",
    cta: "Start here",
  },
  startup: {
    lead: "Not a StartUp? ",
    cta: "Click Here",
  },
};

/* ─── Validators ─────────────────────────────────────────────── */
function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function isValidLinkedIn(value: string): boolean {
  /* Lenient — accept any URL-ish string that mentions linkedin.com,
   * with or without a protocol or `www.` prefix. We don't try to
   * validate the slug shape itself; the value goes to a human in
   * the inbox who can sanity-check on their end. */
  const v = value.trim().toLowerCase();
  if (!v) return true;
  return /(^|\/\/|www\.)linkedin\.com\//.test(v);
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

  const country = useMemo(() => findCountry(form.countryIso), [form.countryIso]);

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

  /* Phone-specific updater: digits-only storage + length cap per
   * country. Called both from the input's onChange (typing) and
   * from CountryPicker.onChange (so digits exceeding the new
   * country's max get trimmed instead of silently overflowing). */
  const updatePhoneFromInput = (raw: string) => {
    const digits = digitsOnly(raw).slice(0, country.maxDigits);
    update("phone", digits);
  };

  const handleCountryChange = (iso2: string) => {
    const next = findCountry(iso2);
    setForm((prev) => ({
      ...prev,
      countryIso: iso2,
      phone: prev.phone.slice(0, next.maxDigits),
    }));
    if (errors.phone) {
      setErrors((prev) => {
        const cleaned = { ...prev };
        delete cleaned.phone;
        return cleaned;
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
      const sharedKeys: FieldKey[] = [
        "name",
        "email",
        "company",
        "role",
        "linkedin",
      ];
      for (const k of sharedKeys) {
        if (prev[k]) carry[k] = prev[k];
      }
      return carry;
    });
    setSubmitError("");
    setMode(next);
  };

  /* Build and apply validation errors. Returns the errors map so the
   * caller can decide what to do (focus first invalid, abort submit,
   * etc.) without waiting for setState to flush. */
  const validate = (): Partial<Record<FieldKey, string>> => {
    const next: Partial<Record<FieldKey, string>> = {};
    if (!form.name.trim()) next.name = "Your name is required";
    if (!form.email.trim()) next.email = "Email is required";
    else if (!isValidEmail(form.email)) next.email = "Please enter a valid email";
    if (!form.company.trim()) next.company = "Company name is required";
    if (!form.role.trim()) next.role = "Role / Title is required";

    if (mode === "project") {
      if (!form.revenue) next.revenue = "Please select a revenue range";
    } else {
      if (!form.phone) {
        next.phone = "Phone number is required";
      } else if (!isValidPhoneForCountry(country, form.phone)) {
        next.phone =
          country.minDigits === country.maxDigits
            ? `Please enter a ${country.maxDigits}-digit ${country.name} number`
            : `Please enter a valid ${country.name} number (${country.minDigits}–${country.maxDigits} digits)`;
      }
      if (!form.stage) next.stage = "Please select your stage";
    }

    if (form.linkedin.trim() && !isValidLinkedIn(form.linkedin)) {
      next.linkedin = "Please enter a valid LinkedIn URL";
    }

    setErrors(next);
    return next;
  };

  /* On submit-failed-validation: focus the first invalid field so
   * keyboard / screen-reader users land somewhere actionable rather
   * than reading the error summary at the top and tabbing back. */
  const focusFirstInvalid = (errs: Partial<Record<FieldKey, string>>) => {
    const order: FieldKey[] =
      mode === "project"
        ? ["name", "email", "company", "revenue", "role", "linkedin", "notes"]
        : ["name", "email", "phone", "company", "stage", "role", "linkedin"];
    const idMap: Record<FieldKey, string> = {
      name: "ct-name",
      email: "ct-email",
      company: "ct-company",
      role: "ct-role",
      linkedin: "ct-linkedin",
      revenue: "ct-revenue",
      notes: "ct-notes",
      countryIso: "ct-phone",
      phone: "ct-phone",
      stage: "ct-stage",
    };
    const first = order.find((k) => errs[k]);
    if (first) {
      const id = idMap[first];
      requestAnimationFrame(() => document.getElementById(id)?.focus());
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "submitting") return;
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      focusFirstInvalid(errs);
      return;
    }

    setStatus("submitting");
    setSubmitError("");

    const subjectPrefix = mode === "startup" ? "Startup" : "Project";
    const fullPhone =
      mode === "startup"
        ? `${country.dial} ${formatPhone(country, form.phone)}`.trim()
        : "Not provided";
    const stageLabel =
      STAGE_OPTIONS.find((o) => o.value === form.stage)?.label ?? form.stage;
    const revenueLabel =
      REVENUE_OPTIONS.find((o) => o.value === form.revenue)?.label ??
      form.revenue;

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
            revenue: revenueLabel,
            role: form.role,
            linkedin: form.linkedin || "Not provided",
            notes: form.notes || "Not provided",
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
            country: country.name,
            company: form.company,
            stage: stageLabel,
            role: form.role,
            linkedin: form.linkedin || "Not provided",
            botcheck: "",
          };

    /* Web3Forms accepts JSON and FormData. We use FormData here because
       FormData is a CORS "simple request" — no preflight, no
       `Content-Type: application/json` header that would force one. The
       JSON endpoint's preflight response from `api.web3forms.com` is
       missing `Access-Control-Allow-Origin` for some origins (verified
       from localhost), which causes the browser to block the actual POST.
       FormData sidesteps that entirely and matches how the previous
       tglobal.in site posted to the same endpoint. */
    const fd = new FormData();
    for (const [k, v] of Object.entries(payload)) {
      fd.append(k, String(v));
    }

    try {
      const res = await fetch(ENDPOINT, { method: "POST", body: fd });
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

  /* Move focus to the success heading when the submission completes
   * so screen-reader / keyboard users get a clear signal that their
   * action succeeded — without this, focus stays on the (now-unmounted)
   * submit button and SR users may not realise the form was sent.
   * The h3 is given tabIndex={-1} so it can receive programmatic focus
   * without becoming a tab stop in normal navigation. */
  const successHeadingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (status !== "success") return;
    /* requestAnimationFrame defers until after AnimatePresence mounts
     * the success card (the framer-motion enter animation kicks off
     * one frame later); without it, focus targets a not-yet-rendered
     * heading. */
    const handle = requestAnimationFrame(() => {
      successHeadingRef.current?.focus();
    });
    return () => cancelAnimationFrame(handle);
  }, [status]);

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

          {/* Subtitle is now mode-agnostic — both forms ask for the
              same focused-call scoping. */}
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.55, delay: 0.1, ease: EASE }}
            className="body-lg mx-auto mt-5 max-w-[560px]"
          >
            {SUBTITLE}
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
                    /* role + aria-live so screen readers announce the
                     * success state automatically (in case focus
                     * management hasn't landed yet on slower clients).
                     * `tabIndex={-1}` on the heading inside lets us
                     * programmatically focus it from useEffect above. */
                    role="status"
                    aria-live="polite"
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
                    <h3
                      ref={successHeadingRef}
                      tabIndex={-1}
                      className="mt-6 text-[24px] font-semibold tracking-[-0.02em] text-foreground outline-none"
                    >
                      Thanks. We got it.
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
                    /* aria-busy lets screen readers know the form is
                     * mid-submission — combined with the disabled
                     * submit button (line below) and the live region
                     * on the success card, SR users get the full
                     * "submitting → submitted" narration. */
                    aria-busy={status === "submitting"}
                  >
                    {/* Honeypot — hidden field a real user never fills.
                        Web3Forms checks `botcheck` and rejects if non-empty. */}
                    <input
                      type="text"
                      name="botcheck"
                      tabIndex={-1}
                      autoComplete="off"
                      className="hidden"
                      aria-hidden="true"
                    />

                    {mode === "project" ? (
                      <ProjectFields
                        form={form}
                        errors={errors}
                        update={update}
                      />
                    ) : (
                      <StartupFields
                        form={form}
                        errors={errors}
                        update={update}
                        country={country}
                        onCountryChange={handleCountryChange}
                        onPhoneInputChange={updatePhoneFromInput}
                      />
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
              Heizen-style "Are you a startup? Start here" prompt.
              Swaps the form mode in place rather than navigating —
              shared field values carry across so a half-filled user
              doesn't lose their typing. Hidden in success state. */}
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

/* ─── Project (Not a Startup) field set ──────────────────────── */
interface FieldSetProps {
  form: FormState;
  errors: Partial<Record<FieldKey, string>>;
  update: <K extends FieldKey>(key: K, value: FormState[K]) => void;
}

function ProjectFields({ form, errors, update }: FieldSetProps) {
  return (
    <>
      {/* Row 1 — Name + Email */}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="ct-name"
          label="Full Name"
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
            placeholder="Enter Full Name"
            className={`${inputBase} ${errors.name ? inputErrorClass : ""}`}
          />
        </Field>
        <Field
          id="ct-email"
          label="Work Email"
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
            placeholder="Email id"
            className={`${inputBase} ${errors.email ? inputErrorClass : ""}`}
          />
        </Field>
      </div>

      {/* Row 2 — Company + Revenue */}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="ct-company"
          label="Company Name"
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
            placeholder="Your company name"
            className={`${inputBase} ${errors.company ? inputErrorClass : ""}`}
          />
        </Field>
        <Field
          id="ct-revenue"
          label="Company Revenue (₹ Cr)"
          required
          error={errors.revenue}
        >
          <div className="relative">
            <select
              id="ct-revenue"
              name="revenue"
              value={form.revenue}
              onChange={(e) => update("revenue", e.target.value)}
              aria-invalid={!!errors.revenue}
              aria-describedby={errors.revenue ? "ct-revenue-error" : undefined}
              className={`${inputBase} cursor-pointer appearance-none pr-12 ${
                form.revenue ? "" : "text-tertiary"
              } ${errors.revenue ? inputErrorClass : ""}`}
            >
              {REVENUE_OPTIONS.map((opt) => (
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
      </div>

      {/* Row 3 — Role */}
      <Field id="ct-role" label="Role / Title" required error={errors.role}>
        <input
          id="ct-role"
          name="role"
          type="text"
          autoComplete="organization-title"
          value={form.role}
          onChange={(e) => update("role", e.target.value)}
          aria-invalid={!!errors.role}
          aria-describedby={errors.role ? "ct-role-error" : undefined}
          placeholder="Founder, CTO, Product Manager…"
          className={`${inputBase} ${errors.role ? inputErrorClass : ""}`}
        />
      </Field>

      {/* Row 4 — LinkedIn */}
      <Field id="ct-linkedin" label="LinkedIn profile" error={errors.linkedin}>
        <input
          id="ct-linkedin"
          name="linkedin"
          type="url"
          autoComplete="url"
          value={form.linkedin}
          onChange={(e) => update("linkedin", e.target.value)}
          aria-invalid={!!errors.linkedin}
          aria-describedby={errors.linkedin ? "ct-linkedin-error" : undefined}
          placeholder="e.g. linkedin.com/in/yourprofile"
          className={`${inputBase} ${errors.linkedin ? inputErrorClass : ""}`}
        />
      </Field>

      {/* Row 5 — Notes (free-form, max 200 chars) */}
      <Field id="ct-notes" label="Anything we should know?">
        <textarea
          id="ct-notes"
          name="notes"
          value={form.notes}
          onChange={(e) =>
            update("notes", e.target.value.slice(0, NOTES_MAX))
          }
          placeholder="Share context that would make the call more useful"
          rows={4}
          maxLength={NOTES_MAX}
          className={`${inputBase} resize-none`}
        />
        <div className="mt-1.5 flex justify-end text-[11px] text-tertiary">
          <span aria-live="polite">
            {form.notes.length}/{NOTES_MAX} characters
          </span>
        </div>
      </Field>
    </>
  );
}

/* ─── Startup field set ──────────────────────────────────────── */
interface StartupFieldSetProps extends FieldSetProps {
  country: ReturnType<typeof findCountry>;
  onCountryChange: (iso2: string) => void;
  onPhoneInputChange: (raw: string) => void;
}

function StartupFields({
  form,
  errors,
  update,
  country,
  onCountryChange,
  onPhoneInputChange,
}: StartupFieldSetProps) {
  const phoneDisplay = formatPhone(country, form.phone);

  return (
    <>
      {/* Row 1 — Full Name (full-width per reference) */}
      <Field
        id="ct-name"
        label="Full Name"
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
          placeholder="Enter Full Name"
          className={`${inputBase} ${errors.name ? inputErrorClass : ""}`}
        />
      </Field>

      {/* Row 2 — Email + Phone */}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="ct-email"
          label="Email"
          required
          error={errors.email}
          hint={errors.email ? undefined : "We don't spam."}
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
            aria-describedby="ct-email-error"
            placeholder="work@company.com"
            className={`${inputBase} ${errors.email ? inputErrorClass : ""}`}
          />
        </Field>

        <Field
          id="ct-phone"
          label="Phone Number"
          required
          error={errors.phone}
        >
          {/* NOTE: deliberately NO `overflow-hidden` on this wrapper.
              The CountryPicker's listbox panel is positioned
              absolute inside this row, and overflow-hidden would
              clip it to the field's bounding box (which is exactly
              the bug the boss flagged — only one option visible
              with a vertical scrollbar). The wrapper background and
              border alone produce the rounded pill look; no child
              has a background that reaches the corners, so removing
              overflow-hidden is visually identical without the
              dropdown side-effect. */}
          <div
            className={`relative flex items-stretch rounded-2xl border bg-white/95 transition-[border-color,background-color,box-shadow] duration-200 focus-within:border-primary focus-within:bg-white focus-within:ring-4 focus-within:ring-primary/10 ${
              errors.phone
                ? "border-red-400 focus-within:border-red-500 focus-within:ring-red-100"
                : "border-border"
            }`}
          >
            <CountryPicker
              value={form.countryIso}
              onChange={onCountryChange}
              invalid={!!errors.phone}
              ariaLabel="Phone country code"
            />
            <span className="my-3 w-px bg-border" />
            <input
              id="ct-phone"
              name="phone"
              type="tel"
              autoComplete="tel-national"
              inputMode="tel"
              value={phoneDisplay}
              onChange={(e) => onPhoneInputChange(e.target.value)}
              aria-invalid={!!errors.phone}
              aria-describedby={errors.phone ? "ct-phone-error" : undefined}
              placeholder={country.placeholder}
              className="flex-1 border-0 bg-transparent px-4 py-4 text-[16px] text-foreground placeholder:text-tertiary focus:outline-none"
            />
          </div>
        </Field>
      </div>

      {/* Row 3 — Company + Stage */}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="ct-company"
          label="Company Name"
          required
          error={errors.company}
          hint={errors.company ? undefined : 'Even "Project X" works.'}
        >
          <input
            id="ct-company"
            name="company"
            type="text"
            autoComplete="organization"
            value={form.company}
            onChange={(e) => update("company", e.target.value)}
            aria-invalid={!!errors.company}
            aria-describedby="ct-company-error"
            placeholder="Your company name"
            className={`${inputBase} ${errors.company ? inputErrorClass : ""}`}
          />
        </Field>

        <Field
          id="ct-stage"
          label="Company Stage"
          required
          error={errors.stage}
          hint={errors.stage ? undefined : "Helps us understand urgency."}
        >
          <div className="relative">
            <select
              id="ct-stage"
              name="stage"
              value={form.stage}
              onChange={(e) => update("stage", e.target.value)}
              aria-invalid={!!errors.stage}
              aria-describedby="ct-stage-error"
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
      </div>

      {/* Row 4 — Role */}
      <Field id="ct-role" label="Role / Title" required error={errors.role}>
        <input
          id="ct-role"
          name="role"
          type="text"
          autoComplete="organization-title"
          value={form.role}
          onChange={(e) => update("role", e.target.value)}
          aria-invalid={!!errors.role}
          aria-describedby={errors.role ? "ct-role-error" : undefined}
          placeholder="Founder, CTO, Product Manager…"
          className={`${inputBase} ${errors.role ? inputErrorClass : ""}`}
        />
      </Field>

      {/* Row 5 — LinkedIn */}
      <Field id="ct-linkedin" label="LinkedIn profile" error={errors.linkedin}>
        <input
          id="ct-linkedin"
          name="linkedin"
          type="url"
          autoComplete="url"
          value={form.linkedin}
          onChange={(e) => update("linkedin", e.target.value)}
          aria-invalid={!!errors.linkedin}
          aria-describedby={errors.linkedin ? "ct-linkedin-error" : undefined}
          placeholder="e.g. linkedin.com/in/yourprofile"
          className={`${inputBase} ${errors.linkedin ? inputErrorClass : ""}`}
        />
      </Field>
    </>
  );
}
