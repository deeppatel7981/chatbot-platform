"use client";

import React, { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import InteractiveDemoChat from "@/components/marketing/InteractiveDemoChat";
import { APP_DISPLAY_NAME, CLIENT_BRAND_MARK } from "@/lib/branding";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [mockMode, setMockMode] = useState<boolean | null>(null);
  const [healthHint, setHealthHint] = useState<string>("");
  const [registeredBanner, setRegisteredBanner] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search);
      if (q.get("registered") === "1") setRegisteredBanner(true);
    }
  }, []);

  useEffect(() => {
    const check = async () => {
      if (typeof window === "undefined") return;
      const token = localStorage.getItem("token");
      if (token) router.push("/dashboard");
    };
    check();
  }, [router]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/health");
        const data = await res.json();
        setMockMode(data.database === "mock");
        setHealthHint(typeof data.hint === "string" ? data.hint : "");
      } catch {
        setMockMode(null);
        setHealthHint("");
      }
    })();
  }, []);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const res = await signIn("credentials", {
      redirect: false,
      username: email.trim(),
      password,
    });
    setSubmitting(false);

    if (res?.ok) {
      if (typeof window !== "undefined") localStorage.setItem("token", "next-auth-token");
      router.push("/dashboard");
    } else if (res?.error === "CredentialsSignin") {
      if (mockMode) {
        setError('Mock mode: use any email and password exactly "admin".');
      } else {
        setError(
          healthHint ||
            "Wrong email/password, or no user in the database. Set DATABASE_URL, run npm run db:push && npm run db:seed, then admin@example.com / admin"
        );
      }
    } else {
      setError(res?.error ?? "Sign in failed");
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden hero-gradient mesh-bg px-4 py-10 sm:px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-200/50 via-transparent to-transparent dark:from-zinc-800/20" />

      <div className="relative z-[1] mx-auto w-full max-w-6xl xl:max-w-7xl 2xl:max-w-[90rem]">
        <div className="mb-8 text-center lg:mb-10">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-3 rounded-xl px-2 py-1 transition hover:opacity-90"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-900 text-sm font-bold text-white shadow-sm dark:bg-zinc-100 dark:text-zinc-900">
              {CLIENT_BRAND_MARK}
            </span>
            <span className="text-left text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">{APP_DISPLAY_NAME}</span>
          </Link>
          <h1 className="mt-5 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Sign in</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Administrator access</p>
          <p className="mx-auto mt-3 max-w-xl rounded-lg border border-zinc-200 bg-white/90 px-4 py-2.5 text-xs font-medium text-zinc-700 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-300">
            New: try the <strong>live widget demo</strong> on this page → or the full marketing site at{" "}
            <Link href="/#live-widget-demo" className="font-medium text-zinc-900 underline decoration-zinc-400 underline-offset-2 hover:text-zinc-700 dark:text-zinc-100 dark:decoration-zinc-600">
              Home #demo
            </Link>
          </p>
        </div>

        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-12">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="rounded-2xl border border-zinc-200/80 bg-white/95 p-6 shadow-2xl shadow-zinc-900/10 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/95 sm:p-8"
          >
            {registeredBanner && (
              <p className="mb-4 rounded-xl border border-emerald-200/80 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-950 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-100">
                Account created — sign in with your email and password below.
              </p>
            )}
            {mockMode === true && (
              <p className="mb-4 rounded-xl border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
                <strong>Mock data</strong> — use any email and password{" "}
                <code className="rounded bg-amber-100 px-1.5 py-0.5 text-xs dark:bg-amber-900/60">admin</code>.
              </p>
            )}
            {mockMode === false && healthHint ? (
              <p className="mb-4 rounded-xl border border-zinc-200 bg-zinc-50/90 px-4 py-3 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-300">
                {healthHint}
              </p>
            ) : null}

            <form className="space-y-4" onSubmit={handleLogin}>
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="password" className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
              {error ? (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">
                  {error}
                </p>
              ) : null}
              <Button type="submit" className="w-full py-3 text-base" disabled={submitting}>
                {submitting ? "Signing in…" : "Continue"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
              No account?{" "}
              <Link
                href="/signup"
                className="font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-2 hover:decoration-zinc-500 dark:text-zinc-100"
              >
                Create a workspace
              </Link>
            </p>

            <p className="mt-4 text-center text-xs leading-relaxed text-zinc-500 dark:text-zinc-500">
              {mockMode === true ? (
                <>
                  Mock mode — no Postgres. For production data, set{" "}
                  <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">MOCK_DATA=false</code> and{" "}
                  <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">DATABASE_URL</code>.
                </>
              ) : mockMode === false ? (
                <>
                  Seed: <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">npm run db:push</code>{" "}
                  <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">npm run db:seed</code> — then{" "}
                  <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">admin@example.com</code> /{" "}
                  <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">admin</code>
                </>
              ) : (
                <>Checking server…</>
              )}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 sm:p-6"
          >
            <p className="mb-1 text-sm font-semibold text-zinc-900 dark:text-zinc-50">Customer-facing widget (demo)</p>
            <p className="mb-4 text-xs text-zinc-600 dark:text-zinc-400">
              Type or tap a prompt — this runs in your browser only, no account required.
            </p>
            <InteractiveDemoChat variant="compact" />
          </motion.div>
        </div>

        <p className="mt-10 text-center text-sm text-zinc-500">
          <Link href="/" className="font-medium text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
