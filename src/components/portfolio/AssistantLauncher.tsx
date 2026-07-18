"use client";

import { useEffect, useState } from "react";

const ASSISTANT_URL = "/assistant";
const DISMISS_KEY = "assistant_popup_dismissed";

function ChatIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      <path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01" />
    </svg>
  );
}

export default function AssistantLauncher() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");

  const fullMessage = "Hi — I'm Gokul's AI. Ask me about his work, skills or projects.";

  // entrance + auto-open the invite once per session
  useEffect(() => {
    const entrance = setTimeout(() => setMounted(true), 1200);
    let invite: ReturnType<typeof setTimeout> | undefined;
    if (sessionStorage.getItem(DISMISS_KEY) !== "1") {
      invite = setTimeout(() => setOpen(true), 3200);
    }
    return () => {
      clearTimeout(entrance);
      if (invite) clearTimeout(invite);
    };
  }, []);

  // typewriter for the invite copy
  useEffect(() => {
    if (!open) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTyped(fullMessage);
      return;
    }
    setTyped("");
    let i = 0;
    const iv = setInterval(() => {
      i += 1;
      setTyped(fullMessage.slice(0, i));
      if (i >= fullMessage.length) clearInterval(iv);
    }, 28);
    return () => clearInterval(iv);
  }, [open]);

  const dismiss = () => {
    setOpen(false);
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // ignore storage failures
    }
  };

  if (!mounted) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[90] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {/* invite popup */}
      {open && (
        <div
          role="dialog"
          aria-label="AI assistant"
          className="w-[280px] overflow-hidden rounded-lg border border-brand/30 bg-surface/95 backdrop-blur-sm shadow-2xl
            motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 motion-safe:zoom-in-95 motion-safe:duration-300"
          style={{ boxShadow: "0 0 24px color-mix(in srgb, var(--brand) 22%, transparent)" }}
        >
          <div className="flex items-center gap-2 border-b border-border bg-surface px-3 py-2">
            <span className="size-2 rounded-full bg-brand animate-glow-pulse" aria-hidden="true" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand">GOKUL_AI</span>
            <span className="ml-1 text-[10px] tracking-widest text-muted">// online</span>
            <button
              onClick={dismiss}
              aria-label="Dismiss assistant popup"
              className="ml-auto text-muted hover:text-foreground transition-colors text-sm leading-none"
            >
              ✕
            </button>
          </div>
          <a
            href={ASSISTANT_URL}
            className="block p-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <p className="min-h-[3.5em] text-xs leading-relaxed text-foreground/85">
              {typed}
              <span className="cursor-blink text-brand">_</span>
            </p>
            <span className="mt-3 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-brand">
              &gt; Launch_assistant →
            </span>
          </a>
        </div>
      )}

      {/* floating chat button */}
      <a
        href={ASSISTANT_URL}
        aria-label="Open Gokul's AI assistant"
        title="Ask Gokul's AI"
        className="group relative flex size-14 items-center justify-center rounded-full bg-brand text-brand-foreground
          shadow-lg transition-transform duration-200 hover:scale-105 active:scale-95
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        style={{ boxShadow: "0 0 20px color-mix(in srgb, var(--brand) 45%, transparent)" }}
      >
        {/* pulsing ring when the popup is closed, to keep drawing the eye */}
        {!open && (
          <span
            className="absolute inset-0 rounded-full border border-brand motion-safe:animate-ping"
            aria-hidden="true"
          />
        )}
        <ChatIcon className="size-6" />
      </a>
    </div>
  );
}
