/**
 * Embeddable widget. Build: npm run build → dist/widget.iife.js
 *
 * Backend LLD (Supabase Edge):
 *   data-functions-base="https://<ref>.supabase.co/functions/v1"
 *   data-public-key="<widget_configs.public_key>"
 *   data-supabase-anon-key="<anon key>"
 *
 * Legacy Next.js proxy:
 *   data-api-base="https://your-app.com"
 *   data-public-id="<legacy widget uuid>"
 */
import React from "react";
import { createRoot } from "react-dom/client";
import { WidgetRoot } from "./WidgetRoot";

function boot() {
  const scripts = document.querySelectorAll<HTMLScriptElement>(
    "script[data-public-key], script[data-public-id]",
  );
  scripts.forEach((script) => {
    const publicKey = script.dataset.publicKey?.trim();
    const publicId = script.dataset.publicId?.trim();
    if (!publicKey && !publicId) return;

    const mount = document.createElement("div");
    const idKey = (publicKey ?? publicId ?? "w").slice(0, 12);
    mount.id = `chatbot-widget-${idKey.replace(/[^a-z0-9]/gi, "")}`;
    script.insertAdjacentElement("afterend", mount);
    const root = createRoot(mount);
    root.render(
      <React.StrictMode>
        <WidgetRoot
          mode={publicKey ? "supabase" : "next"}
          publicKey={publicKey ?? ""}
          publicId={publicId ?? ""}
          functionsBase={script.dataset.functionsBase ?? ""}
          supabaseAnonKey={script.dataset.supabaseAnonKey ?? ""}
          apiBase={script.dataset.apiBase ?? ""}
        />
      </React.StrictMode>,
    );
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
