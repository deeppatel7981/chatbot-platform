"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import InteractiveDemoChat from "@/components/marketing/InteractiveDemoChat";
import { APP_DISPLAY_NAME, CLIENT_BRAND_MARK } from "@/lib/branding";

const STORAGE_KEY = "onboarding-wizard-v1";

const STEPS = [
  { id: "business", title: "Business", hint: "Company basics" },
  { id: "use-cases", title: "Goals", hint: "What you want to achieve" },
  { id: "template", title: "Template", hint: "Industry starter" },
  { id: "channels", title: "Channels", hint: "Website & WhatsApp" },
  { id: "knowledge", title: "Knowledge", hint: "Train your assistant" },
  { id: "bot", title: "Bot", hint: "Tone & welcome" },
  { id: "team", title: "Team", hint: "Alerts" },
  { id: "go-live", title: "Go live", hint: "Review & finish" },
] as const;

const USE_CASE_OPTIONS = [
  "Capture leads",
  "Answer FAQs",
  "Book appointments",
  "Share brochures / catalog",
  "Qualify inquiries",
  "Support existing customers",
] as const;

const TEMPLATES = [
  { id: "real-estate", title: "Real estate", desc: "Property inquiries, visits, brochures" },
  { id: "clinic", title: "Clinic", desc: "Timings, appointments, common questions" },
  { id: "coaching", title: "Coaching", desc: "Admissions, fees, batch info" },
  { id: "export", title: "Export / B2B", desc: "MOQ, catalog, shipping basics" },
  { id: "d2c", title: "D2C", desc: "Orders, returns, product FAQs" },
  { id: "blank", title: "Start blank", desc: "Configure everything yourself" },
] as const;

type WizardState = {
  companyName: string;
  category: string;
  city: string;
  website: string;
  businessHours: string;
  primaryLanguage: string;
  useCases: string[];
  templateId: string;
  channelWeb: "later" | "ready";
  channelWa: "later" | "ready";
  botName: string;
  welcomeMessage: string;
  tone: string;
  notifyEmail: string;
  notifyPhone: string;
};

const defaultState = (): WizardState => ({
  companyName: "",
  category: "",
  city: "",
  website: "",
  businessHours: "9–6 Mon–Sat IST",
  primaryLanguage: "English",
  useCases: [],
  templateId: "real-estate",
  channelWeb: "later",
  channelWa: "later",
  botName: "Assistant",
  welcomeMessage: "Hi! How can we help you today?",
  tone: "professional",
  notifyEmail: "",
  notifyPhone: "",
});

export default function OnboardingWizard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [state, setState] = useState<WizardState>(defaultState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as { step?: number; state?: Partial<WizardState> };
          if (typeof parsed.step === "number") setStep(Math.min(Math.max(parsed.step, 0), STEPS.length - 1));
          if (parsed.state) setState((s) => ({ ...s, ...parsed.state }));
        }
      } catch {
        /* ignore */
      }
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ step, state }));
    } catch {
      /* ignore */
    }
  }, [step, state, hydrated]);

  const update = useCallback((patch: Partial<WizardState>) => {
    setState((prev) => ({ ...prev, ...patch }));
  }, []);

  const next = () => {
    setError(null);
    if (step === 0 && !state.companyName.trim()) {
      setError("Please enter your company name.");
      return;
    }
    if (step < STEPS.length - 1) setStep((s) => s + 1);
  };

  const back = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const toggleUseCase = (label: string) => {
    setState((prev) => {
      const has = prev.useCases.includes(label);
      const useCases = has ? prev.useCases.filter((x) => x !== label) : [...prev.useCases, label];
      return { ...prev, useCases };
    });
  };

  const finish = async () => {
    setLoading(true);
    setError(null);
    const industry =
      TEMPLATES.find((t) => t.id === state.templateId)?.title ??
      (state.category.trim() || "General");
    const businessName = state.companyName.trim() || "My business";
    const website = state.website.trim();
    const contactEmail = state.notifyEmail.trim() || session?.user?.email || "";

    try {
      const res = await fetch("/api/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          businessName,
          industry: `${industry}${state.city ? ` · ${state.city}` : ""}`,
          website,
          contactEmail: contactEmail || "owner@example.com",
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error || "Could not complete onboarding");
        setLoading(false);
        return;
      }
      sessionStorage.removeItem(STORAGE_KEY);
      const cid = typeof json.clientId === "string" ? json.clientId : "";
      const qs = cid ? `?onboarded=1&clientId=${encodeURIComponent(cid)}` : "?onboarded=1";
      router.push(`/dashboard${qs}`);
    } catch {
      setError("Network error");
    }
    setLoading(false);
  };

  if (!hydrated || status === "loading") {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-zinc-500 dark:text-zinc-400">Loading…</div>
    );
  }

  if (!session) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-950">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Sign in to continue onboarding.</p>
        <Link href="/login" className="mt-4 inline-block font-medium text-emerald-700 underline dark:text-emerald-400">
          Sign in
        </Link>
      </div>
    );
  }

  const progress = ((step + 1) / STEPS.length) * 100;
  const current = STEPS[step];

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 text-xs font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
            {CLIENT_BRAND_MARK}
          </span>
          {APP_DISPLAY_NAME}
        </Link>
        <Link href="/dashboard" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200">
          Exit to dashboard
        </Link>
      </div>

      <div className="mb-8">
        <div className="h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
          <div
            className="h-full rounded-full bg-emerald-600 transition-all duration-300 dark:bg-emerald-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          Step {step + 1} of {STEPS.length}: {current.title} — {current.hint}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[11rem_minmax(0,1fr)]">
        <nav className="hidden flex-col gap-1 lg:flex" aria-label="Steps">
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setStep(i)}
              className={[
                "rounded-lg px-3 py-2 text-left text-sm transition-colors",
                i === step
                  ? "bg-emerald-50 font-medium text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-100"
                  : i < step
                    ? "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
                    : "text-zinc-400 dark:text-zinc-500",
              ].join(" ")}
            >
              {i + 1}. {s.title}
            </button>
          ))}
        </nav>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-8">
          {error ? (
            <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">{error}</p>
          ) : null}

          {step === 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Tell us about your business</h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">This helps us recommend templates and wording — you can edit later.</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Company name</label>
                  <Input value={state.companyName} onChange={(e) => update({ companyName: e.target.value })} required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Category</label>
                  <Input value={state.category} onChange={(e) => update({ category: e.target.value })} placeholder="e.g. Real estate" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">City</label>
                  <Input value={state.city} onChange={(e) => update({ city: e.target.value })} placeholder="e.g. Mumbai" />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Website (optional)</label>
                  <Input type="url" value={state.website} onChange={(e) => update({ website: e.target.value })} placeholder="https://" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Business hours</label>
                  <Input value={state.businessHours} onChange={(e) => update({ businessHours: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Primary language</label>
                  <select
                    value={state.primaryLanguage}
                    onChange={(e) => update({ primaryLanguage: e.target.value })}
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                  >
                    <option>English</option>
                    <option>Hindi</option>
                    <option>Gujarati</option>
                    <option>English + Hindi</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">What do you want to achieve?</h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Select all that apply.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {USE_CASE_OPTIONS.map((opt) => {
                  const on = state.useCases.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleUseCase(opt)}
                      className={[
                        "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                        on
                          ? "border-emerald-600 bg-emerald-50 text-emerald-900 dark:border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-100"
                          : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300",
                      ].join(" ")}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Choose a starting template</h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">You can customize everything after setup.</p>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {TEMPLATES.map((t) => (
                  <li key={t.id}>
                    <button
                      type="button"
                      onClick={() => update({ templateId: t.id })}
                      className={[
                        "w-full rounded-xl border p-4 text-left transition-colors",
                        state.templateId === t.id
                          ? "border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-500/20 dark:border-emerald-600 dark:bg-emerald-950/40"
                          : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600",
                      ].join(" ")}
                    >
                      <p className="font-medium text-zinc-900 dark:text-zinc-50">{t.title}</p>
                      <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">{t.desc}</p>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Connect channels</h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Install from the dashboard anytime — mark what you plan to use first.</p>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-700">
                  <p className="font-medium text-zinc-900 dark:text-zinc-50">Website chat</p>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Embed one script on your site.</p>
                  <Link href="/dashboard/integrations" className="mt-3 inline-block text-sm font-medium text-emerald-700 underline dark:text-emerald-400">
                    Open integration guide →
                  </Link>
                </div>
                <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-700">
                  <p className="font-medium text-zinc-900 dark:text-zinc-50">WhatsApp Business</p>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Connect Meta Cloud API from settings when ready.</p>
                  <Link href="/dashboard/settings" className="mt-3 inline-block text-sm font-medium text-emerald-700 underline dark:text-emerald-400">
                    Workspace settings →
                  </Link>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Add business knowledge</h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">The assistant answers from what you upload — PDFs, FAQs, and more.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/dashboard/knowledge-base"
                  className="inline-flex rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
                >
                  Open knowledge base
                </Link>
                <Link
                  href="/dashboard/clients"
                  className="inline-flex rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium dark:border-zinc-600"
                >
                  Pick a client first
                </Link>
              </div>
              <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-500">You can continue this wizard and upload files later.</p>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Bot personality</h2>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Display name</label>
                <Input value={state.botName} onChange={(e) => update({ botName: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Welcome message</label>
                <textarea
                  value={state.welcomeMessage}
                  onChange={(e) => update({ welcomeMessage: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Tone</label>
                <select
                  value={state.tone}
                  onChange={(e) => update({ tone: e.target.value })}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                >
                  <option value="professional">Professional</option>
                  <option value="friendly">Friendly</option>
                  <option value="sales">Sales-focused</option>
                  <option value="support">Support-focused</option>
                </select>
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Team notifications</h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Where should we alert your team for hot leads or handoffs?</p>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Notification email</label>
                <Input
                  type="email"
                  value={state.notifyEmail || session?.user?.email || ""}
                  onChange={(e) => update({ notifyEmail: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Mobile (optional)</label>
                <Input type="tel" value={state.notifyPhone} onChange={(e) => update({ notifyPhone: e.target.value })} placeholder="+91 …" />
              </div>
            </div>
          )}

          {step === 7 && (
            <div>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Preview & go live</h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Try the visitor experience — then finish to create your first client. On the next screen you can open the{" "}
                <strong className="font-medium text-zinc-800 dark:text-zinc-200">merchant portal</strong> preview and
                copy a link to share after you grant access.
              </p>
              <div className="mt-4 max-w-md">
                <InteractiveDemoChat variant="compact" />
              </div>
              <ul className="mt-6 space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
                <li className="flex gap-2">
                  <span className="text-emerald-600">✓</span> Company: {state.companyName || "—"}
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-600">✓</span> Template: {TEMPLATES.find((t) => t.id === state.templateId)?.title}
                </li>
                <li className="flex gap-2">
                  <span className="text-zinc-400">○</span> Knowledge uploads — continue in dashboard
                </li>
              </ul>
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 pt-6 dark:border-zinc-800">
            <Button type="button" variant="secondary" onClick={back} disabled={step === 0 || loading}>
              Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button type="button" onClick={next} disabled={loading}>
                Continue
              </Button>
            ) : (
              <Button type="button" onClick={finish} disabled={loading || !state.companyName.trim()}>
                {loading ? "Finishing…" : "Finish & create workspace client"}
              </Button>
            )}
          </div>
          {step === 1 ? (
            <button type="button" onClick={next} className="mt-2 text-sm text-zinc-500 underline dark:text-zinc-400">
              Skip for now
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
