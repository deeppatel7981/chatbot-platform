"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CLIENT_BRAND_MARK, CLIENT_BRAND_NAME } from "@/lib/branding";
import DataSourceBanner from "@/components/dashboard/DataSourceBanner";
import { type NavIconId, NavSidebarIcon } from "@/components/dashboard/nav-icons";
import { signOut } from "next-auth/react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type NavItem = {
  href: string;
  label: string;
  icon: NavIconId;
  /** Von Restorff / Tesler: mark unfinished areas so they don’t read as broken product. */
  soon?: boolean;
};

const NAV_SECTIONS: { heading: string; items: NavItem[] }[] = [
  {
    heading: "Operations",
    items: [
      { href: "/app/overview", label: "Overview", icon: "overview" },
      { href: "/app/conversations", label: "Conversations", icon: "conversations" },
      { href: "/app/leads", label: "Leads", icon: "leads" },
      { href: "/app/tasks", label: "Tasks", icon: "tasks", soon: true },
      { href: "/app/contacts", label: "Contacts", icon: "contacts" },
    ],
  },
  {
    heading: "Setup",
    items: [
      { href: "/app/projects", label: "Projects", icon: "projects" },
      { href: "/app/knowledge", label: "Knowledge", icon: "knowledge" },
      { href: "/app/widget", label: "Widget", icon: "widget" },
      { href: "/app/automations", label: "Automations", icon: "automations" },
      { href: "/app/integrations", label: "Integrations", icon: "integrations" },
    ],
  },
  {
    heading: "Reporting",
    items: [{ href: "/app/analytics", label: "Analytics", icon: "analytics" }],
  },
  {
    heading: "Admin",
    items: [
      { href: "/app/team", label: "Team", icon: "team" },
      { href: "/app/settings", label: "Settings", icon: "settings" },
      { href: "/app/payments", label: "Payments", icon: "payments", soon: true },
      { href: "/app/help", label: "Help", icon: "help" },
    ],
  },
];

function isActiveNav(href: string, pathname: string) {
  if (href === "/app/overview") return pathname === "/app/overview" || pathname === "/app";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function collectFocusables(container: HTMLElement): HTMLElement[] {
  const sel = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
  return Array.from(container.querySelectorAll<HTMLElement>(sel)).filter(
    (el) => !el.hasAttribute("disabled") && el.offsetParent !== null && !el.closest("[inert]")
  );
}

export default function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileNavRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMobileOpen(false));
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const container = mobileNavRef.current;
    if (!container) return;

    const focusables = collectFocusables(container);
    const t = window.setTimeout(() => focusables[0]?.focus(), 0);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    container.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(t);
      container.removeEventListener("keydown", onKeyDown);
      menuButtonRef.current?.focus();
    };
  }, [mobileOpen]);

  const handleLogout = async () => {
    const sb = getSupabaseBrowserClient();
    if (sb) await sb.auth.signOut();
    if (typeof window !== "undefined") localStorage.removeItem("token");
    await signOut({ callbackUrl: "/login" });
  };

  const linkClass = useCallback((active: boolean) => {
    return [
      "group flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 md:min-h-0 md:py-1.5",
      "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary dark:focus-visible:outline-primary",
      active
        ? "border-l-2 border-violet-500 bg-zinc-100 pl-[10px] text-zinc-900 dark:bg-zinc-800/90 dark:text-zinc-50"
        : "border-l-2 border-transparent pl-[10px] text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/80 dark:hover:text-zinc-100",
    ].join(" ");
  }, []);

  const sidebar = (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="mb-6 flex shrink-0 items-center gap-3 px-1">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-900 text-xs font-bold tracking-tight text-white dark:bg-zinc-100 dark:text-zinc-900">
          {CLIENT_BRAND_MARK}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">{CLIENT_BRAND_NAME}</p>
        </div>
      </div>

      <nav className="flex min-h-0 flex-1 flex-col gap-0 overflow-y-auto overscroll-contain pr-0.5" aria-label="Main">
        {NAV_SECTIONS.map((section) => (
          <div key={section.heading} className="mb-4 last:mb-0">
            <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              {section.heading}
            </p>
            <div className="flex flex-col gap-0.5">
              {section.items.map((item) => {
                const active = isActiveNav(item.href, pathname);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={item.soon ? `${item.label} (coming soon)` : item.label}
                    className={linkClass(active)}
                  >
                    <span
                      className={[
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors",
                        active
                          ? "bg-violet-600 text-white shadow-sm dark:bg-violet-500"
                          : "bg-zinc-50 text-zinc-600 group-hover:text-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-400 dark:group-hover:text-zinc-200",
                      ].join(" ")}
                      aria-hidden
                    >
                      <NavSidebarIcon id={item.icon} className="shrink-0" />
                    </span>
                    <span className="flex min-w-0 flex-1 items-center gap-2">
                      <span className="truncate">{item.label}</span>
                      {item.soon ? (
                        <span className="shrink-0 rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-900 dark:bg-amber-950/80 dark:text-amber-200">
                          Soon
                        </span>
                      ) : null}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-auto shrink-0 space-y-2 border-t border-zinc-200/80 pt-4 dark:border-zinc-800">
        <Link
          href="/#for-business"
          className="flex min-h-[44px] items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary md:min-h-0 dark:text-zinc-400 dark:hover:bg-zinc-800/80 dark:hover:text-zinc-100 dark:focus-visible:outline-primary"
        >
          <span className="text-xs" aria-hidden>
            ?
          </span>
          Why this helps
        </Link>
        <Link
          href="/solutions"
          className="flex min-h-[44px] items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary md:min-h-0 dark:text-zinc-400 dark:hover:bg-zinc-800/80 dark:hover:text-zinc-100 dark:focus-visible:outline-primary"
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
        className="mt-3 min-h-[44px] w-full shrink-0 rounded-lg border border-zinc-200/90 bg-zinc-50/80 px-3 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary md:min-h-0 dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:focus-visible:outline-primary"
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

      <aside className="hidden w-60 shrink-0 border-r border-zinc-200/90 bg-white md:flex md:flex-col md:px-3 md:py-6 dark:border-zinc-800 dark:bg-[#0d0f14]">
        {sidebar}
      </aside>

      <aside
        ref={mobileNavRef}
        id="mobile-nav"
        inert={!mobileOpen}
        aria-hidden={!mobileOpen}
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-[min(18rem,100vw)] flex-col border-r border-zinc-200 bg-white p-6 shadow-xl transition-transform duration-300 ease-out dark:border-zinc-800 dark:bg-[#0d0f14] md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        {sidebar}
      </aside>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-zinc-200/90 bg-white/95 px-4 py-3 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/95 md:hidden">
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-zinc-200 bg-white p-2 text-zinc-800 shadow-sm transition hover:bg-zinc-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-95 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800 dark:focus-visible:outline-primary"
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
          <div className="w-11 shrink-0" aria-hidden />
        </header>

        <main className="flex-1 overflow-auto px-4 py-6 sm:px-8 sm:py-8 lg:px-10">
          <div className="mx-auto w-full max-w-6xl animate-fade-in xl:max-w-7xl 2xl:max-w-[90rem]">
            <DataSourceBanner />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
