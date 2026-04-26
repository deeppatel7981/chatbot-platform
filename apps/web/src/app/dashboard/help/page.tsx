import Link from "next/link";

export default function HelpPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Help center</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Quick links for setup, pricing questions, and product tours — written for business owners, not engineers.
      </p>
      <ul className="mt-8 space-y-3">
        {[
          { href: "/faq", label: "Frequently asked questions", desc: "WhatsApp, handoff, languages, setup time" },
          { href: "/solutions", label: "Product tour (marketing)", desc: "How the platform fits your workflow" },
          { href: "/book-demo", label: "Book a live demo", desc: "Walk through with our team" },
          { href: "/dashboard/integrations", label: "Integration guide", desc: "Widget install and channels" },
          { href: "/contact", label: "Contact & WhatsApp", desc: "Sales and support" },
        ].map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="block rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
            >
              <span className="font-medium text-zinc-900 dark:text-zinc-50">{item.label}</span>
              <span className="mt-0.5 block text-sm text-zinc-500 dark:text-zinc-400">{item.desc}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
