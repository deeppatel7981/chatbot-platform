"use client";

import React, { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { APP_DISPLAY_NAME, CLIENT_BRAND_MARK } from "@/lib/branding";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

const BUSINESS_TYPES = ["Real estate", "Clinic / healthcare", "Coaching / edtech", "Manufacturing", "D2C / retail", "Services", "Other"] as const;
const TEAM_SIZES = ["Just me", "2–10", "11–50", "51+"] as const;

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [mockMode, setMockMode] = useState<boolean | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/health");
        const data = await res.json();
        setMockMode(data.database === "mock");
      } catch {
        setMockMode(null);
      }
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (!agreed) {
      setError("Please accept the Terms and Privacy Policy to continue.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setSubmitting(true);
    try {
      const sb = getSupabaseBrowserClient();
      if (sb) {
        const { data, error } = await sb.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { full_name: fullName, organization_name: organizationName },
            emailRedirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback?next=/app/overview`,
          },
        });
        if (error) {
          setError(error.message);
          setSubmitting(false);
          return;
        }
        if (!data.session) {
          setError("Confirm your email if required, then sign in. If confirmation is off, try signing in.");
          setSubmitting(false);
          return;
        }
        const complete = await fetch("/api/auth/complete-supabase-signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ organizationName, fullName }),
        });
        const cj = await complete.json().catch(() => ({}));
        if (!complete.ok) {
          setError(typeof cj.error === "string" ? cj.error : "Could not finish workspace setup");
          setSubmitting(false);
          return;
        }
        setSuccess(true);
        setSubmitting(false);
        return;
      }

      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationName,
          fullName,
          email: email.trim(),
          password,
          phone,
          businessType,
          teamSize,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        const base =
          typeof json.error === "string"
            ? json.error
            : json.error != null
              ? String(json.error)
              : "Could not create account";
        const detailHint = typeof json.details === "string" ? ` (${json.details})` : "";
        const extraHint = typeof json.hint === "string" ? ` ${json.hint}` : "";
        setError(base + detailHint + extraHint);
        setSubmitting(false);
        return;
      }
      const sign = await signIn("credentials", {
        redirect: false,
        username: email.trim(),
        password,
      });
      if (sign?.ok) {
        if (typeof window !== "undefined") localStorage.setItem("token", "next-auth-token");
        setSuccess(true);
        setSubmitting(false);
        return;
      }
      setError("Account created. Sign in with your email and password.");
      router.push("/login?registered=1");
    } catch {
      setError("Network error");
    }
    setSubmitting(false);
  };

  const continueSetup = () => router.push("/onboard");
  const exploreDashboard = () => router.push(getSupabaseBrowserClient() ? "/app/overview" : "/dashboard");

  if (success) {
    return (
      <div className="relative min-h-screen overflow-hidden hero-gradient mesh-bg px-4 py-10 sm:px-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-200/50 via-transparent to-transparent dark:from-zinc-800/20" />
        <div className="relative z-[1] mx-auto max-w-lg text-center">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
            ✓
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Your workspace is ready</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Let’s set up your assistant in a few simple steps — or jump in and explore the dashboard.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button type="button" className="w-full py-3 text-base sm:w-auto sm:min-w-[200px]" onClick={continueSetup}>
              Continue setup
            </Button>
            <button
              type="button"
              onClick={exploreDashboard}
              className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800 sm:w-auto sm:min-w-[200px]"
            >
              Explore dashboard
            </button>
          </div>
          <p className="mt-8 text-sm text-zinc-500">
            <Link href="/" className="font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400">
              ← Back to home
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden hero-gradient mesh-bg px-4 py-10 sm:px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-200/50 via-transparent to-transparent dark:from-zinc-800/20" />

      <div className="relative z-[1] mx-auto w-full max-w-5xl">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-3 rounded-xl px-2 py-1 transition hover:opacity-90"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-900 text-sm font-bold text-white shadow-sm dark:bg-zinc-100 dark:text-zinc-900">
              {CLIENT_BRAND_MARK}
            </span>
            <span className="text-left text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">{APP_DISPLAY_NAME}</span>
          </Link>
          <h1 className="mt-5 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Create your workspace</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">No credit card required to start.</p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1fr_minmax(16rem,20rem)] lg:items-start">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="rounded-2xl border border-zinc-200/80 bg-white/95 p-6 shadow-2xl shadow-zinc-900/10 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/95 sm:p-8"
          >
            {mockMode === true && (
              <p className="mb-4 rounded-xl border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
                <strong>Demo mode</strong> — signup needs a real database. Use{" "}
                <Link href="/login" className="font-medium underline underline-offset-2">
                  Sign in
                </Link>{" "}
                with any email and password <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/60">admin</code>, or set{" "}
                <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/60">MOCK_DATA=false</code> and{" "}
                <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/60">DATABASE_URL</code>.
              </p>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label htmlFor="fullName" className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Full name
                  </label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    autoComplete="name"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="phone" className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Mobile number
                  </label>
                  <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required autoComplete="tel" placeholder="+91 …" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="org" className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Company name
                </label>
                <Input
                  id="org"
                  type="text"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  required
                  minLength={2}
                  autoComplete="organization"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Work email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label htmlFor="biz" className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Business type
                  </label>
                  <select
                    id="biz"
                    required
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                  >
                    <option value="">Select…</option>
                    {BUSINESS_TYPES.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="team" className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Team size
                  </label>
                  <select
                    id="team"
                    required
                    value={teamSize}
                    onChange={(e) => setTeamSize(e.target.value)}
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                  >
                    <option value="">Select…</option>
                    {TEAM_SIZES.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="password" className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="confirm" className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Confirm password
                </label>
                <Input
                  id="confirm"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </div>
              <label className="flex cursor-pointer items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-400"
                />
                <span>
                  I agree to the{" "}
                  <Link href="/terms" className="font-medium text-zinc-900 underline dark:text-zinc-200" target="_blank">
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="font-medium text-zinc-900 underline dark:text-zinc-200" target="_blank">
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>
              {error ? (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">{error}</p>
              ) : null}
              <Button type="submit" className="w-full py-3 text-base" disabled={submitting || mockMode === true}>
                {submitting ? "Creating…" : "Create workspace"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-2 dark:text-zinc-100">
                Sign in
              </Link>
            </p>
          </motion.div>

          <aside className="rounded-2xl border border-zinc-200/80 bg-white/80 p-6 dark:border-zinc-800 dark:bg-zinc-950/80">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">What happens next?</h2>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-zinc-600 dark:text-zinc-400">
              <li>Create your workspace</li>
              <li>Pick your industry template (onboarding)</li>
              <li>Connect website or WhatsApp</li>
              <li>Upload business information</li>
              <li>Preview and go live</li>
            </ol>
            <p className="mt-6 text-xs text-zinc-500 dark:text-zinc-500">
              You can change language, tone, and channels later — nothing is locked on day one.
            </p>
          </aside>
        </div>

        <p className="mt-10 text-center text-sm text-zinc-500">
          <Link href="/" className="font-medium text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
