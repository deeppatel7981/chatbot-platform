"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CLIENT_BRAND_MARK, CLIENT_BRAND_NAME } from "@/lib/branding";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: "◆" },
  { href: "/dashboard/clients", label: "Clients", icon: "◎" },
  { href: "/dashboard/integrations", label: "Integrations", icon: "⎘" },
  { href: "/dashboard/knowledge-base", label: "Knowledge", icon: "◇" },
  { href: "/dashboard/bot-preview", label: "Widget", icon: "⬡" },
  { href: "/dashboard/chat-logs", label: "Conversations", icon: "○" },
  { href: "/dashboard/analytics", label: "Analytics", icon: "▣" },
  { href: "/dashboard/payments", label: "Payments", icon: "¤" },
  { href: "/dashboard/settings", label: "Settings", icon: "⚙" },
] as const;

function isActiveNav(href: string, pathname: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleLogout = async () => {
    if (typeof window !== "undefined") localStorage.removeItem("token");
    await signOut({ callbackUrl: "/login" });
  };

  const sidebar = (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="mb-8 flex shrink-0 items-center gap-3 px-1">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-900 text-xs font-bold tracking-tight text-white dark:bg-zinc-100 dark:text-zinc-900">
          {CLIENT_BRAND_MARK}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">{CLIENT_BRAND_NAME}</p>
        </div>
      </div>

      <nav className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto overscroll-contain" aria-label="Main">
        {NAV.map((item) => {
          const active = isActiveNav(item.href, pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={[
                "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150",
                active
                  ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/80 dark:hover:text-zinc-100",
              ].join(" ")}
            >
              <span
                className={[
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-xs tabular-nums transition-colors",
                  active
                    ? "bg-zinc-900 text-white shadow-sm dark:bg-zinc-100 dark:text-zinc-900"
                    : "bg-zinc-50 text-zinc-500 group-hover:text-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-500 dark:group-hover:text-zinc-300",
                ].join(" ")}
                aria-hidden
              >
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="shrink-0 space-y-2 border-t border-zinc-200/80 pt-4 dark:border-zinc-800">
        <Link
          href="/#for-business"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/80 dark:hover:text-zinc-100"
        >
          <span className="text-xs" aria-hidden>
            ?
          </span>
          Why this helps
        </Link>
        <Link
          href="/solutions"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/80 dark:hover:text-zinc-100"
        >
          <span className="text-xs" aria-hidden>
            →
          </span>
          Setup guide
        </Link>
      </div>

      <button
        type="button"
        onClick={handleLogout}
        className="mt-4 w-full shrink-0 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        Sign out
      </button>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-zinc-100 text-zinc-900 dark:bg-black dark:text-zinc-50">
      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-zinc-950/40 backdrop-blur-[2px] md:hidden"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <aside className="hidden w-60 shrink-0 border-r border-zinc-200/90 bg-white md:flex md:flex-col md:px-3 md:py-6 dark:border-zinc-800 dark:bg-zinc-950">
        {sidebar}
      </aside>

      <aside
        id="mobile-nav"
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-[min(18rem,100vw)] flex-col border-r border-zinc-200 bg-white p-6 shadow-xl transition-transform duration-300 ease-out dark:border-zinc-800 dark:bg-zinc-950 md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        {sidebar}
      </aside>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-zinc-200/90 bg-white/95 px-4 py-3 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/95 md:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex items-center justify-center rounded-lg border border-zinc-200 bg-white p-2 text-zinc-800 shadow-sm transition hover:bg-zinc-50 active:scale-95 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
          >
            <span className="sr-only">Open menu</span>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex min-w-0 flex-1 items-center justify-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-900 text-[10px] font-bold tracking-tight text-white dark:bg-zinc-100 dark:text-zinc-900">
              {CLIENT_BRAND_MARK}
            </div>
            <span className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">{CLIENT_BRAND_NAME}</span>
          </div>
          <div className="w-10 shrink-0" aria-hidden />
        </header>

        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-10">
          <div className="mx-auto max-w-6xl animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
}
