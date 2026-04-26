"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { CLIENT_BRAND_MARK, CLIENT_BRAND_NAME } from "@/lib/branding";
import { type NavIconId, NavSidebarIcon } from "@/components/dashboard/nav-icons";

const nav = (clientId: string) =>
  [
    { href: `/portal/${clientId}`, label: "Overview", icon: "overview" as const satisfies NavIconId },
    { href: `/portal/${clientId}/chat-logs`, label: "Conversations", icon: "conversations" as const satisfies NavIconId },
    { href: `/portal/${clientId}/documents`, label: "Knowledge", icon: "knowledge" as const satisfies NavIconId },
  ] as const;

function active(pathname: string, href: string, clientId: string) {
  const overview = `/portal/${clientId}`;
  if (href === overview) {
    return pathname === overview || pathname === `${overview}/`;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function collectFocusables(container: HTMLElement): HTMLElement[] {
  const sel = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
  return Array.from(container.querySelectorAll<HTMLElement>(sel)).filter(
    (el) => !el.hasAttribute("disabled") && el.offsetParent !== null && !el.closest("[inert]")
  );
}

export default function PortalShell({
  clientId,
  clientName,
  children,
}: {
  clientId: string;
  clientName: string;
  children: React.ReactNode;
}) {
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

  const items = nav(clientId);

  const sidebar = (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="mb-6 shrink-0 px-1">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-xs font-bold tracking-tight text-primary-foreground">
            {CLIENT_BRAND_MARK}
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold uppercase tracking-wide text-primary">
              Merchant portal
            </p>
            <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">{clientName}</p>
          </div>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
          Sandboxed to this business only — no workspace admin tools.
        </p>
      </div>

      <nav className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto" aria-label="Portal">
        {items.map((item) => {
          const on = active(pathname, item.href, clientId);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary md:min-h-0 md:py-2",
                on
                  ? "bg-primary/10 text-primary dark:text-primary"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/80",
              ].join(" ")}
            >
              <span
                className={[
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
                  on ? "bg-primary text-primary-foreground" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
                ].join(" ")}
                aria-hidden
              >
                <NavSidebarIcon id={item.icon} className="shrink-0" />
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto shrink-0 border-t border-zinc-200/80 pt-4 dark:border-zinc-800">
        <p className="mb-2 px-1 text-[10px] uppercase tracking-wide text-zinc-400">{CLIENT_BRAND_NAME}</p>
        <button
          type="button"
          onClick={() => void signOut({ callbackUrl: "/login" })}
          className="min-h-[44px] w-full rounded-lg border border-zinc-200/90 bg-zinc-50/80 px-3 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 md:min-h-0 dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:focus-visible:outline-emerald-400"
        >
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-zinc-100 text-zinc-900 dark:bg-black dark:text-zinc-50">
      <aside className="hidden w-56 shrink-0 border-r border-zinc-200/90 bg-white md:flex md:flex-col md:px-3 md:py-6 dark:border-zinc-800 dark:bg-[#0d0f14]">
        {sidebar}
      </aside>

      <aside
        ref={mobileNavRef}
        id="portal-mobile-nav"
        inert={!mobileOpen}
        aria-hidden={!mobileOpen}
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-[min(16rem,100vw)] flex-col border-r border-zinc-200 bg-white p-5 shadow-xl transition-transform dark:border-zinc-800 dark:bg-[#0d0f14] md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        {sidebar}
      </aside>

      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-zinc-950/40 backdrop-blur-[2px] md:hidden"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-zinc-200/90 bg-white/95 px-4 py-3 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/95 md:hidden">
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-zinc-200 bg-white p-2 text-zinc-800 shadow-sm transition hover:bg-zinc-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 active:scale-95 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800 dark:focus-visible:outline-emerald-400"
            aria-expanded={mobileOpen}
            aria-controls="portal-mobile-nav"
          >
            <span className="sr-only">Open menu</span>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="min-w-0 truncate text-sm font-semibold">{clientName}</span>
          <div className="w-11 shrink-0" aria-hidden />
        </header>

        <main className="flex-1 overflow-auto px-4 py-6 sm:px-8 sm:py-8">
          <div className="mx-auto w-full max-w-4xl animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
}
