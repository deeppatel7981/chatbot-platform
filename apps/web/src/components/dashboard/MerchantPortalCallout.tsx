"use client";

import Link from "next/link";
import { useCallback, useState } from "react";

type Props = {
  clientId: string;
  /** Tighter spacing when nested in a banner */
  compact?: boolean;
};

export default function MerchantPortalCallout({ clientId, compact }: Props) {
  const [copied, setCopied] = useState(false);
  const portalPath = `/portal/${clientId}`;

  const copyPortalUrl = useCallback(async () => {
    const url = typeof window !== "undefined" ? `${window.location.origin}${portalPath}` : portalPath;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }, [portalPath]);

  return (
    <div className={compact ? "mt-3 space-y-2" : "space-y-3"}>
      <p className={compact ? "text-xs text-zinc-700 dark:text-zinc-300" : "text-sm text-zinc-600 dark:text-zinc-400"}>
        <strong className="font-medium text-zinc-900 dark:text-zinc-100">Merchant portal</strong> — the same
        conversations and knowledge screens your client sees after they sign in. Preview it here, or share the link
        once you have granted them access (
        <code className="rounded bg-zinc-100 px-1 text-[0.7rem] dark:bg-zinc-800">client_portal_access</code>
        ).
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={portalPath}
          className="inline-flex rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
        >
          Open merchant portal
        </Link>
        <Link
          href={`/dashboard/clients/${clientId}`}
          className="inline-flex rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-100 dark:hover:bg-zinc-800"
        >
          Client settings
        </Link>
        <button
          type="button"
          onClick={copyPortalUrl}
          className="inline-flex rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-100 dark:hover:bg-zinc-800"
        >
          {copied ? "Copied" : "Copy portal link"}
        </button>
        <span className="text-[0.7rem] text-zinc-500 dark:text-zinc-400">Sign-in page: /login</span>
      </div>
    </div>
  );
}
