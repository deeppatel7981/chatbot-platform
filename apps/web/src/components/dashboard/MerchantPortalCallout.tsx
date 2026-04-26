"use client";

import Link from "next/link";
import { useCallback, useState } from "react";

type Props = {
  clientId: string;
  /** Tighter spacing when nested in a banner */
  compact?: boolean;
};

export default function MerchantPortalCallout({ clientId, compact }: Props) {
  const [copiedPortal, setCopiedPortal] = useState(false);
  const [copiedSignIn, setCopiedSignIn] = useState(false);
  const portalPath = `/portal/${clientId}`;

  const copyPortalUrl = useCallback(async () => {
    const url = typeof window !== "undefined" ? `${window.location.origin}${portalPath}` : portalPath;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedPortal(true);
      window.setTimeout(() => setCopiedPortal(false), 2000);
    } catch {
      /* ignore */
    }
  }, [portalPath]);

  const copySignInUrl = useCallback(async () => {
    const url = typeof window !== "undefined" ? `${window.location.origin}/login` : "/login";
    try {
      await navigator.clipboard.writeText(url);
      setCopiedSignIn(true);
      window.setTimeout(() => setCopiedSignIn(false), 2000);
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <div className={compact ? "mt-3 space-y-2" : "space-y-3"}>
      <p className={compact ? "text-xs text-zinc-700 dark:text-zinc-300" : "text-sm text-zinc-600 dark:text-zinc-400"}>
        <strong className="font-medium text-zinc-900 dark:text-zinc-100">Merchant portal</strong> — the same
        conversations and knowledge screens your merchant sees after they sign in. Preview it here, or share the link
        once they have portal access (your admin enables this in{" "}
        <strong className="font-medium text-zinc-900 dark:text-zinc-100">project settings</strong>).
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={portalPath}
          className="inline-flex rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-[var(--primary-hover)]"
        >
          Open merchant portal
        </Link>
        <Link
          href={`/app/projects/${clientId}`}
          className="inline-flex rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-100 dark:hover:bg-zinc-800"
        >
          Project settings
        </Link>
        <button
          type="button"
          onClick={copyPortalUrl}
          className="inline-flex rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-100 dark:hover:bg-zinc-800"
        >
          {copiedPortal ? "Copied" : "Copy portal link"}
        </button>
        <button
          type="button"
          onClick={copySignInUrl}
          className="inline-flex rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-100 dark:hover:bg-zinc-800"
        >
          {copiedSignIn ? "Copied" : "Copy sign-in link"}
        </button>
      </div>
    </div>
  );
}
