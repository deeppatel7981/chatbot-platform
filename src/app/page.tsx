import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-2xl flex-col items-center justify-center py-24 px-6 bg-white dark:bg-black">
        <Image className="dark:invert mb-6" src="/next.svg" alt="Next.js logo" width={120} height={24} priority />

        <h1 className="text-3xl font-semibold text-black dark:text-zinc-50 mb-2">Chatbot Platform</h1>
        <p className="max-w-lg text-center text-lg text-zinc-600 dark:text-zinc-400 mb-6">
          A simple admin interface for managing chatbots. Sign in to access dashboards, settings, and
          analytics for your bots.
        </p>

        <Link
          href="/login"
          className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
        >
          Go to Login
        </Link>
      </main>
    </div>
  );
}
