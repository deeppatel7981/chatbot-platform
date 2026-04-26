"use client";

import { useReducedMotion } from "framer-motion";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

type Msg = { id: string; role: "user" | "assistant"; text: string };

const QUICK_FULL = [
  "What are your business hours?",
  "Do you ship to Mumbai?",
  "I need to talk to a human",
] as const;

const QUICK_COMPACT = ["What are your business hours?", "I need to talk to a human"] as const;

function replyFor(userText: string): string {
  const t = userText.toLowerCase();
  if (t.includes("hour") || t.includes("open") || t.includes("time"))
    return "We're open 9am–6pm IST, Monday–Saturday. Sundays by appointment.";
  if (t.includes("ship") || t.includes("mumbai") || t.includes("deliver"))
    return "Yes — we ship across India. Metro orders usually arrive in 2–4 business days.";
  if (t.includes("human") || t.includes("agent") || t.includes("person"))
    return "I'll flag this for our team. A human will follow up on this thread shortly.";
  return "This is an interactive preview — after sign-in, answers come from your uploaded docs and policies via RAG.";
}

let idCounter = 0;
function uid() {
  idCounter += 1;
  return `m-${idCounter}`;
}

type Props = {
  /** Use on login / narrow layouts — shorter copy and fewer chips. */
  variant?: "full" | "compact";
  className?: string;
  id?: string;
};

export default function InteractiveDemoChat({ variant = "full", className = "", id }: Props) {
  const reduceMotion = useReducedMotion();
  const compact = variant === "compact";
  const quick = compact ? QUICK_COMPACT : QUICK_FULL;
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: "welcome",
      role: "assistant",
      text: compact
        ? "Try a quick prompt — same widget your customers get after you go live."
        : "Hi — try a quick prompt below or type your own. This simulates the customer widget experience.",
    },
  ]);
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToEnd = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
  }, [reduceMotion]);

  useEffect(() => {
    scrollToEnd();
  }, [messages, typing, scrollToEnd]);

  const runAssistant = useCallback(
    (userText: string) => {
      setTyping(true);
      const delay = reduceMotion ? 0 : 650 + Math.min(400, userText.length * 12);
      window.setTimeout(() => {
        setTyping(false);
        setMessages((prev) => [
          ...prev,
          { id: uid(), role: "assistant", text: replyFor(userText) },
        ]);
      }, delay);
    },
    [reduceMotion]
  );

  const send = (raw: string) => {
    const text = raw.trim();
    if (!text || typing) return;
    setInput("");
    setMessages((prev) => [...prev, { id: uid(), role: "user", text }]);
    runAssistant(text);
  };

  return (
    <motion.div
      id={id}
      initial={reduceMotion ? false : { opacity: 0, y: compact ? 12 : 24 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={[
        "relative mx-auto max-w-lg",
        compact ? "mt-0 w-full max-w-none" : "mt-10 xl:mt-0",
        className,
      ].join(" ")}
    >
      <p className="mb-2 text-center text-xs font-medium text-zinc-500 dark:text-zinc-400">
        {compact ? "Live widget demo" : "Widget preview"}
      </p>
      <div className="overflow-hidden rounded-xl border border-zinc-200/90 bg-white shadow-md dark:border-zinc-700 dark:bg-zinc-900">
        <div className="flex items-center gap-2 border-b border-zinc-200/80 bg-zinc-900 px-3 py-2.5 dark:border-zinc-700 dark:bg-zinc-950">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-40" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-zinc-300 dark:bg-zinc-500" />
          </span>
          <span className="text-sm font-medium text-white">Widget preview · demo</span>
        </div>

        <div
          className={[
            "space-y-3 overflow-y-auto bg-zinc-50/80 p-4 dark:bg-zinc-950/50",
            compact ? "max-h-[200px]" : "max-h-[280px]",
          ].join(" ")}
        >
          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <motion.div
                key={m.id}
                layout={!reduceMotion}
                initial={reduceMotion ? false : { opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 380, damping: 28 }}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={
                    m.role === "user"
                      ? "max-w-[85%] rounded-2xl rounded-br-md bg-zinc-800 px-3.5 py-2 text-sm text-white shadow-sm dark:bg-zinc-200 dark:text-zinc-900"
                      : "max-w-[90%] rounded-2xl rounded-bl-md border border-zinc-200 bg-white px-3.5 py-2 text-sm text-zinc-800 shadow-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                  }
                >
                  {m.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {typing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-1.5 pl-1"
              aria-label="Assistant is typing"
            >
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="h-2 w-2 rounded-full bg-zinc-400"
                  animate={
                    reduceMotion
                      ? {}
                      : { y: [0, -5, 0], opacity: [0.5, 1, 0.5] }
                  }
                  transition={
                    reduceMotion
                      ? {}
                      : { repeat: Infinity, duration: 0.9, delay: i * 0.15 }
                  }
                />
              ))}
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="border-t border-zinc-100 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-2 flex flex-wrap gap-2">
            {quick.map((q) => (
              <button
                key={q}
                type="button"
                disabled={typing}
                onClick={() => send(q)}
                className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100 active:scale-95 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
              >
                {q}
              </button>
            ))}
          </div>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a customer question…"
              className="min-w-0 flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-400/30 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-500 dark:focus:ring-zinc-500/30"
              disabled={typing}
            />
            <motion.button
              type="submit"
              disabled={typing || !input.trim()}
              whileTap={reduceMotion ? undefined : { scale: 0.96 }}
              className="shrink-0 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
            >
              Send
            </motion.button>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
