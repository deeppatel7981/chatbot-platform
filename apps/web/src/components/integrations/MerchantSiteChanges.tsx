import CopyButton from "@/components/CopyButton";

type Props = {
  embedSnippet: string;
};

export default function MerchantSiteChanges({ embedSnippet }: Props) {
  const before = `<!DOCTYPE html>
<html>
<head><title>My store</title></head>
<body>
  <h1>Welcome</h1>
  <!-- their existing content -->
</body>
</html>`;

  const after = `<!DOCTYPE html>
<html>
<head><title>My store</title></head>
<body>
  <h1>Welcome</h1>
  <!-- their existing content -->

  ${embedSnippet.trim()}
</body>
</html>`;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Before (client site)</p>
        <pre className="max-h-56 overflow-auto rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-[11px] leading-relaxed text-zinc-700 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300">
          {before.trim()}
        </pre>
        <p className="mt-2 text-xs text-zinc-500">No chat — normal marketing or storefront page.</p>
      </div>
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
          After — one script (usually before &lt;/body&gt;)
        </p>
        <pre className="max-h-56 overflow-auto rounded-xl border border-zinc-300 bg-zinc-100/80 p-3 text-[11px] leading-relaxed text-zinc-800 dark:border-zinc-600 dark:bg-zinc-800/50 dark:text-zinc-200">
          {after.trim()}
        </pre>
        <div className="mt-2 flex flex-wrap gap-2">
          <CopyButton text={embedSnippet.trim()} label="Copy script only" />
        </div>
        <p className="mt-2 text-xs text-zinc-500">
          They don’t change product HTML. The script loads <code className="rounded bg-zinc-200 px-1 dark:bg-zinc-700">widget.js</code> from{" "}
          <strong>your</strong> host; API keys stay on the server.
        </p>
      </div>
    </div>
  );
}
