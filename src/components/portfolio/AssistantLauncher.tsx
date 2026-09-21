"use client";

import { useEffect, useState } from "react";

const ASSISTANT_URL =
  process.env.NEXT_PUBLIC_ASSISTANT_URL || "https://assitant.gokulakannan.dev";
const isExternal = /^https?:\/\//i.test(ASSISTANT_URL);
const DISMISS_KEY = "assistant_popup_dismissed";

interface AssistantLauncherProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AssistantLauncher({ open, onOpenChange }: AssistantLauncherProps) {
  const [mounted, setMounted] = useState(false);
  const [typed, setTyped] = useState("");

  const fullMessage = "Hi — I'm Gokul's AI. Ask me about his work, skills or projects.";

  // entrance + auto-open the invite once per session
  useEffect(() => {
    const entrance = setTimeout(() => setMounted(true), 1200);
    let invite: ReturnType<typeof setTimeout> | undefined;
    if (typeof window !== "undefined" && sessionStorage.getItem(DISMISS_KEY) !== "1") {
      invite = setTimeout(() => onOpenChange(true), 3200);
    }
    return () => {
      clearTimeout(entrance);
      if (invite) clearTimeout(invite);
    };
  }, [onOpenChange]);

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
    onOpenChange(false);
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // ignore storage failures
    }
  };

  if (!mounted || !open) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[90] sm:bottom-6 sm:right-6">
      {/* terminal box */}
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
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
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
    </div>
  );
}
