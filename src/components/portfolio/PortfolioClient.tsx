"use client";

import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { ThemeToggle } from "@/components/ThemeToggle";
import AssistantLauncher from "@/components/portfolio/AssistantLauncher";
import projectBanking from "@/assets/project-banking.jpg";
import projectDevtools from "@/assets/project-devtools.jpg";
import projectBentley from "@/assets/project-bentley.jpg";
import projectFnol from "@/assets/project-fnol.jpg";
import type { PortfolioPageData } from "@/lib/shared/portfolio.schema";

const DARK_ACCENTS  = ["#e2ff66", "#66ffe0", "#ff6b6b", "#b066ff", "#66b8ff"];
const LIGHT_ACCENTS = ["#3d7000", "#006b6b", "#a01020", "#5a0090", "#0050a0"];
const DARK_FG  = "#0a0a0b";
const LIGHT_FG = "#f3f2ed";

const projectImageMap: Record<string, typeof projectBanking> = {
  banking: projectBanking,
  devtools: projectDevtools,
  bentley: projectBentley,
  fnol: projectFnol,
};

type UiText = PortfolioPageData["uiText"];

// ── PageLoader ────────────────────────────────────────────────────────────────
function PageLoader({
  logoText,
  bootNode,
  bootLinesText,
  onComplete,
}: {
  logoText: string;
  bootNode: string;
  bootLinesText: UiText["bootLines"];
  onComplete: () => void;
}) {
  const [visibleLines, setVisibleLines] = useState(0);
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const bootLines = [
    { text: `$ BOOT --node=${bootNode} --operator=G.KANNAN`, type: "cmd" },
    ...bootLinesText,
  ] as const;

  useEffect(() => {
    const lineTimings = [150, 550, 950, 1350, 1850];
    const timeouts = lineTimings.map((t, i) => setTimeout(() => setVisibleLines(i + 1), t));
    const startTime = Date.now();
    const totalDuration = 2300;
    const tick = setInterval(() => {
      const pct = Math.min(Math.floor(((Date.now() - startTime) / totalDuration) * 100), 100);
      setProgress(pct);
      if (pct >= 100) clearInterval(tick);
    }, 20);
    const exitTimer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onCompleteRef.current(), 500);
    }, 2500);
    return () => {
      timeouts.forEach(clearTimeout);
      clearInterval(tick);
      clearTimeout(exitTimer);
    };
  }, []);

  return (
    <div
      className={`fixed inset-0 z-[100] bg-background flex items-center justify-center transition-opacity duration-500 ${exiting ? "opacity-0 pointer-events-none" : "opacity-100"}`}
    >
      {/* Loader atmosphere */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-20" style={{
          background: "radial-gradient(circle, color-mix(in srgb, var(--brand) 30%, transparent), transparent 70%)",
        }} />
      </div>
      <div className="w-full max-w-md px-6 font-mono relative z-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-3 rounded-full bg-brand animate-glow-pulse" style={{
            boxShadow: "0 0 10px var(--brand), 0 0 24px color-mix(in srgb, var(--brand) 50%, transparent)",
          }} />
          <span className="text-brand text-sm font-bold tracking-widest">{logoText}</span>
        </div>
        <div className="relative p-px rounded-lg overflow-hidden mb-6" style={{
          background: "linear-gradient(135deg, color-mix(in srgb, var(--brand) 30%, transparent), transparent 60%)",
        }}>
          <div className="rounded-lg bg-surface/90 backdrop-blur-sm overflow-hidden">
            <div className="bg-surface px-4 py-2 border-b border-border flex items-center gap-2">
              <div className="size-2 rounded-full bg-border" />
              <div className="size-2 rounded-full bg-border" />
              <div className="size-2 rounded-full bg-border" />
              <span className="text-[10px] text-muted ml-2 uppercase tracking-widest">
                bash — init_sequence
              </span>
            </div>
            <div className="p-5 space-y-2 min-h-[140px]">
              {bootLines.slice(0, visibleLines).map((line, i) => (
                <p
                  key={i}
                  className={`text-xs leading-relaxed ${
                    line.type === "ok"
                      ? "text-brand font-bold"
                      : line.type === "cmd"
                        ? "text-foreground"
                        : "text-muted"
                  }`}
                >
                  {line.text}
                  {i === visibleLines - 1 && visibleLines < bootLines.length && (
                    <span className="text-brand cursor-blink ml-0.5">_</span>
                  )}
                </p>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-0.5 bg-surface/50 rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-100 rounded-full"
              style={{
                width: `${progress}%`,
                background: `linear-gradient(to right, color-mix(in srgb, var(--brand) 60%, transparent), var(--brand))`,
                boxShadow: "0 0 8px var(--brand)",
              }}
            />
          </div>
          <div className="flex justify-between text-[10px] tracking-widest text-muted">
            <span>INITIALIZING_PORTFOLIO</span>
            <span className="text-brand">{progress}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── AtmosphereLayer ───────────────────────────────────────────────────────────
function AtmosphereLayer() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(128,128,128,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(128,128,128,0.04) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />
      {/* Brand radial — top-right */}
      <div
        className="absolute -top-64 -right-64 w-[1000px] h-[1000px] rounded-full"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--brand) 8%, transparent) 0%, transparent 65%)",
        }}
      />
      {/* Accent radial — bottom-left */}
      <div
        className="absolute -bottom-80 -left-64 w-[800px] h-[800px] rounded-full"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(110, 50, 220, 0.06) 0%, transparent 65%)",
        }}
      />
      {/* Subtle center depth */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1400px] h-[600px] rounded-full opacity-40"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, color-mix(in srgb, var(--brand) 3%, transparent) 0%, transparent 70%)",
        }}
      />
    </div>
  );
}

// ── HeroCodePanel ─────────────────────────────────────────────────────────────
function HeroCodePanel({
  portfolio,
  visible,
}: {
  portfolio: PortfolioPageData;
  visible: boolean;
}) {
  const [linesShown, setLinesShown] = useState(0);

  const codeLines: Array<{ type: string; key?: string; value?: string; text?: string }> = [
    { type: "cmd", text: "$ whoami --json" },
    { type: "blank" },
    { type: "brace", text: "{" },
    { type: "field", key: '"name"', value: `"${portfolio.profile.name}"` },
    { type: "field", key: '"role"', value: `"${portfolio.profile.role}"` },
    { type: "field", key: '"location"', value: `"${portfolio.profile.location}"` },
    { type: "field", key: '"status"', value: `"${portfolio.profile.availability}"` },
    ...portfolio.profile.stats.slice(0, 3).map((s) => ({
      type: "field",
      key: `"${s.label.toLowerCase().replace(/ /g, "_")}"`,
      value: `${s.value}${s.suffix ? `  // ${s.suffix}` : ""}`,
    })),
    { type: "brace", text: "}" },
    { type: "blank" },
    { type: "active", text: "$" },
  ];

  useEffect(() => {
    if (!visible) return;
    setLinesShown(0);
    let i = 0;
    const id = setInterval(() => {
      i++;
      setLinesShown(i);
      if (i >= codeLines.length) clearInterval(id);
    }, 115);
    return () => clearInterval(id);
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="hidden lg:block relative">
      {/* Ambient glow behind panel */}
      <div
        className="absolute -inset-12 rounded-3xl blur-3xl opacity-30"
        style={{
          background:
            "radial-gradient(ellipse, color-mix(in srgb, var(--brand) 20%, transparent), transparent 70%)",
        }}
      />
      {/* Gradient-border wrapper */}
      <div
        className="relative p-px rounded-2xl"
        style={{
          background:
            "linear-gradient(135deg, color-mix(in srgb, var(--brand) 35%, transparent) 0%, color-mix(in srgb, var(--brand) 8%, transparent) 40%, transparent 70%)",
        }}
      >
        <div className="rounded-2xl bg-surface backdrop-blur-2xl overflow-hidden">
          {/* Window chrome */}
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border/60 bg-surface-2">
            <div className="size-3 rounded-full bg-red-400/70" />
            <div className="size-3 rounded-full bg-yellow-400/70" />
            <div className="size-3 rounded-full bg-green-400/70" />
            <span className="ml-3 text-[10px] text-muted tracking-[0.2em] uppercase">
              bash — identity.json
            </span>
            <div className="ml-auto flex items-center gap-1.5">
              <div className="size-1.5 rounded-full bg-brand animate-glow-pulse" />
              <span className="text-[9px] text-brand tracking-widest">LIVE</span>
            </div>
          </div>

          {/* Code */}
          <div className="p-6 font-mono text-[11px] sm:text-xs leading-[1.8] min-h-[300px] bg-surface/60">
            {codeLines.slice(0, linesShown).map((line, i) => {
              if (line.type === "blank") return <div key={i} className="h-2" />;
              if (line.type === "brace") {
                return (
                  <p key={i} className="text-muted/60">
                    {line.text}
                  </p>
                );
              }
              if (line.type === "cmd") {
                return (
                  <p key={i} className="text-brand/70 mb-1">
                    {line.text}
                  </p>
                );
              }
              if (line.type === "active") {
                return (
                  <p key={i} className="text-brand/70 mt-1">
                    {line.text}
                    <span className="cursor-blink">_</span>
                  </p>
                );
              }
              if (line.type === "field") {
                const isComment = line.value?.includes("//");
                const valuePart = isComment ? line.value?.split("//")[0].trim() : line.value;
                const commentPart = isComment ? `// ${line.value?.split("//")[1].trim()}` : null;
                return (
                  <p key={i} className="ml-5">
                    <span className="text-brand/65">{line.key}</span>
                    <span className="text-muted/40">: </span>
                    <span className="text-foreground/90">{valuePart}</span>
                    {commentPart && (
                      <span className="text-muted/40 ml-2">{commentPart}</span>
                    )}
                    <span className="text-muted/30">,</span>
                  </p>
                );
              }
              return null;
            })}
            {linesShown === 0 && (
              <span className="text-brand/50 cursor-blink">_</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── useTilt ───────────────────────────────────────────────────────────────────
function useTilt(intensity = 7) {
  const ref = useRef<HTMLDivElement>(null);

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * intensity;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * -intensity;
      el.style.transform = `perspective(1200px) rotateX(${y}deg) rotateY(${x}deg) translateZ(8px)`;
      el.style.transition = "transform 0.1s ease-out";
    },
    [intensity],
  );

  const onMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform =
      "perspective(1200px) rotateX(0deg) rotateY(0deg) translateZ(0px)";
    el.style.transition = "transform 0.55s cubic-bezier(0.23, 1, 0.32, 1)";
  }, []);

  return { ref, onMouseMove, onMouseLeave };
}

// ── Shared hooks ──────────────────────────────────────────────────────────────
function useClock(timeZone: string) {
  const [time, setTime] = useState("--:--:--");
  useEffect(() => {
    const update = () => {
      try {
        const fmt = new Intl.DateTimeFormat("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
          timeZone,
        });
        setTime(fmt.format(new Date()));
      } catch {
        setTime("INVALID_TZ");
      }
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [timeZone]);
  return time;
}

function useScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const update = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      const total = scrollHeight - clientHeight;
      setProgress(total > 0 ? (scrollTop / total) * 100 : 0);
    };
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, []);
  return progress;
}

const SCAN_MS = 550;
const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%►▣╳≡≢▶";

function injectScanLine(el: HTMLElement, delay: number) {
  setTimeout(() => {
    const rect = el.getBoundingClientRect();
    if (rect.width < 10 || rect.height < 10) return;
    const color =
      getComputedStyle(document.documentElement).getPropertyValue("--brand").trim() ||
      "#e2ff66";
    const r = parseInt(color.replace("#", "").slice(0, 2), 16);
    const g = parseInt(color.replace("#", "").slice(2, 4), 16);
    const b = parseInt(color.replace("#", "").slice(4, 6), 16);
    const line = document.createElement("div");
    line.style.cssText = [
      "position:fixed",
      `top:${rect.top}px`,
      `left:${rect.left}px`,
      `height:${rect.height}px`,
      "width:2px",
      `background:linear-gradient(to bottom,transparent,${color} 15%,${color} 85%,transparent)`,
      `box-shadow:0 0 14px 5px rgba(${r},${g},${b},0.65)`,
      "pointer-events:none",
      "z-index:9999",
      `transition:transform ${SCAN_MS}ms cubic-bezier(0.77,0,0.18,1),opacity 200ms ease`,
      "will-change:transform",
    ].join(";");
    document.body.appendChild(line);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        line.style.transform = `translateX(${rect.width}px)`;
      });
    });
    setTimeout(() => {
      line.style.opacity = "0";
      setTimeout(() => line.parentNode?.removeChild(line), 250);
    }, SCAN_MS + 60);
  }, delay);
}

function scrambleText(el: HTMLElement, delay: number) {
  const original = el.textContent ?? "";
  if (!original.trim()) return;
  setTimeout(() => {
    let frame = 0;
    const total = 22;
    const tick = () => {
      frame++;
      const progress = frame / total;
      el.textContent = original
        .split("")
        .map((ch, i) => {
          if (/[\s._/()[\]-]/.test(ch)) return ch;
          if (i / original.length < progress) return original[i];
          return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
        })
        .join("");
      if (frame < total) requestAnimationFrame(tick);
      else el.textContent = original;
    };
    requestAnimationFrame(tick);
  }, delay);
}

function StatCounter({
  value,
  suffix,
  revealReady,
}: {
  value: number;
  suffix: string;
  revealReady: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [count, setCount] = useState(0);
  const [showSuffix, setShowSuffix] = useState(false);

  useEffect(() => {
    if (!revealReady) return;
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        obs.disconnect();
        setTimeout(() => {
          const start = performance.now();
          const duration = 1000;
          const tick = (now: number) => {
            const t = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - t, 3);
            setCount(Math.round(eased * value));
            if (t < 1) requestAnimationFrame(tick);
            else {
              setCount(value);
              setShowSuffix(true);
            }
          };
          requestAnimationFrame(tick);
        }, SCAN_MS + 80);
      },
      { threshold: 0.5 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [revealReady, value]);

  return (
    <span ref={ref} className="tabular-nums">
      {count}
      <span
        className={`transition-opacity duration-300 ${showSuffix ? "opacity-100" : "opacity-0"}`}
      >
        {suffix}
      </span>
    </span>
  );
}

function setupScrollReveal() {
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target as HTMLElement;
        const cssDelay = parseInt(el.dataset.delay ?? "0");
        el.classList.add("revealed");
        obs.unobserve(el);
        injectScanLine(el, cssDelay);
        el.querySelectorAll<HTMLElement>("[data-scramble]").forEach((h) => {
          scrambleText(h, cssDelay + SCAN_MS - 60);
        });
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -40px 0px" },
  );
  document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => obs.observe(el));
}

type HeroPhrase = string[];

function useHeroTyping(
  start: boolean,
  phrases: HeroPhrase[],
  speedMs: number,
  phrasePauseMs: number,
) {
  const [typedLines, setTypedLines] = useState<string[]>([]);
  const [activeLineIndex, setActiveLineIndex] = useState(0);
  const [commandPhraseIndex, setCommandPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const holdMs = Math.max(1400, phrasePauseMs);
  const reverseSpeedMs = Math.max(90, Math.round(speedMs * 1.35));

  useEffect(() => {
    setTypedLines(phrases[0]?.map(() => "") ?? []);
    setActiveLineIndex(0);
    setCommandPhraseIndex(0);
    setIsDeleting(false);
    if (!start || phrases.length === 0) return;

    let phraseIndex = 0;
    let flatIndex = 0;
    let deleting = false;
    let timeout: ReturnType<typeof setTimeout> | undefined;

    const getCurrentPhrase = () => phrases[phraseIndex] ?? [];
    const getTotalChars = (phrase: HeroPhrase) =>
      phrase.reduce((sum, line) => sum + line.length, 0);
    const getTypedState = (phrase: HeroPhrase, count: number) => {
      let remaining = count;
      let active = 0;
      const nextLines = phrase.map((line, index) => {
        if (remaining >= line.length) {
          remaining -= line.length;
          active = index;
          return line;
        }
        if (remaining > 0) {
          active = index;
          const partial = line.slice(0, remaining);
          remaining = 0;
          return partial;
        }
        return "";
      });
      return { nextLines, active };
    };

    const tick = () => {
      const phrase = getCurrentPhrase();
      const totalChars = getTotalChars(phrase);
      if (!deleting && flatIndex <= totalChars) {
        const { nextLines, active } = getTypedState(phrase, flatIndex);
        setTypedLines(nextLines);
        setActiveLineIndex(active);
        setIsDeleting(false);
        flatIndex++;
        timeout = setTimeout(tick, speedMs);
        return;
      }
      if (!deleting) {
        deleting = true;
        flatIndex = totalChars;
        timeout = setTimeout(tick, holdMs);
        return;
      }
      if (flatIndex >= 0) {
        const { nextLines, active } = getTypedState(phrase, flatIndex);
        setTypedLines(nextLines);
        setActiveLineIndex(active);
        setIsDeleting(true);
        flatIndex--;
        timeout = setTimeout(tick, reverseSpeedMs);
        return;
      }
      phraseIndex = (phraseIndex + 1) % phrases.length;
      flatIndex = 0;
      deleting = false;
      setCommandPhraseIndex(phraseIndex);
      setTypedLines(getCurrentPhrase().map(() => ""));
      setActiveLineIndex(0);
      setIsDeleting(false);
      timeout = setTimeout(tick, 350);
    };

    timeout = setTimeout(tick, 0);
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [start, phrases, speedMs, phrasePauseMs, holdMs, reverseSpeedMs]);

  return { typedLines, activeLineIndex, commandPhraseIndex, isDeleting };
}

function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) setActive(visible[0].target.id);
      },
      { rootMargin: "-35% 0px -60% 0px" },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return active;
}

function getDynamicHeroCommand(command: string, role: string) {
  if (!role.trim()) return command;
  if (command.includes("--role=")) {
    return command.replace(/--role=(?:"[^"]*"|'[^']*'|[^\s]+)/, `--role="${role}"`);
  }
  return `${command} --role="${role}"`;
}

// ── ProjectCard ───────────────────────────────────────────────────────────────
type ProjectWithImage = {
  code: string;
  title: string;
  client: string;
  year: string | number;
  blurb: string;
  tags: string[];
  image: typeof projectBanking;
};

function ProjectCard({ p, i }: { p: ProjectWithImage; i: number }) {
  const tilt = useTilt(6);
  return (
    <div
      data-reveal
      data-delay={i % 2 === 1 ? "150" : undefined}
      style={{ willChange: "transform" }}
    >
      <div
        className="p-px rounded-xl group transition-all duration-300"
        style={{
          background:
            "linear-gradient(135deg, color-mix(in srgb, var(--brand) 15%, transparent), transparent 50%)",
        }}
      >
        <article
          ref={tilt.ref}
          onMouseMove={tilt.onMouseMove}
          onMouseLeave={tilt.onMouseLeave}
          className="rounded-xl bg-surface/90 backdrop-blur-sm overflow-hidden hover:bg-surface transition-colors duration-300"
        >
          <div className="relative aspect-video overflow-hidden">
            <Image
              src={p.image}
              alt={`${p.title} project visual`}
              className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0"
            />
            <div className="absolute inset-0 bg-brand opacity-0 group-hover:opacity-50 transition-opacity duration-700 mix-blend-color" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
            <div
              className="absolute bottom-4 left-4 text-[10px] bg-brand text-brand-foreground px-2.5 py-1 font-bold tracking-widest rounded-sm"
              style={{
                boxShadow: "0 0 12px color-mix(in srgb, var(--brand) 40%, transparent)",
              }}
            >
              {p.code}
            </div>
            <div className="absolute top-4 right-4 text-[10px] bg-background/70 backdrop-blur-sm border border-border/60 text-muted px-2.5 py-1 rounded-sm tracking-widest">
              [{p.year}]
            </div>
          </div>
          <div className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-bold font-display group-hover:text-brand transition-colors duration-300">
                {p.title}
              </h3>
              <p className="text-[11px] text-brand/60 mt-1 tracking-widest uppercase">
                @ {p.client}
              </p>
            </div>
            <p className="text-sm text-muted leading-relaxed mb-5">{p.blurb}</p>
            <div className="flex flex-wrap gap-1.5 mb-5">
              {p.tags.map((t) => (
                <span
                  key={t}
                  className="text-[10px] px-2.5 py-1 border border-border/60 text-muted tracking-wider rounded-sm group-hover:border-brand/25 group-hover:text-muted transition-colors duration-200"
                >
                  {t}
                </span>
              ))}
            </div>
            <div className="text-[10px] text-brand/50 font-bold tracking-widest group-hover:text-brand transition-colors flex items-center gap-1.5">
              EXECUTE_VIEW
              <span className="inline-block translate-x-0 group-hover:translate-x-2 transition-transform duration-300">
                —&gt;
              </span>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function PortfolioClient({ portfolio }: { portfolio: PortfolioPageData }) {
  const { resolvedTheme } = useTheme();
  const accentIndexRef = useRef(Math.floor(Math.random() * DARK_ACCENTS.length));

  useEffect(() => {
    const isDark = resolvedTheme === "dark";
    const accents = isDark ? DARK_ACCENTS : LIGHT_ACCENTS;
    const fg = isDark ? DARK_FG : LIGHT_FG;
    const color = accents[accentIndexRef.current];
    document.documentElement.style.setProperty("--brand", color);
    document.documentElement.style.setProperty("--brand-foreground", fg);
  }, [resolvedTheme]);

  useEffect(() => {
    return () => {
      document.documentElement.style.removeProperty("--brand");
      document.documentElement.style.removeProperty("--brand-foreground");
    };
  }, []);

  const time = useClock(portfolio.header.timezone ?? "Asia/Riyadh");
  const scrollProgress = useScrollProgress();
  const activeSection = useActiveSection(["root", "projects", "history", "connect"]);

  const [showLoader, setShowLoader] = useState(true);
  const [contentVisible, setContentVisible] = useState(false);
  const [revealReady, setRevealReady] = useState(false);
  const [typingReady, setTypingReady] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLoaderComplete = () => {
    setContentVisible(true);
    setTimeout(() => setTypingReady(true), 350);
    setTimeout(() => {
      setShowLoader(false);
      setRevealReady(true);
      setupScrollReveal();
    }, 600);
  };

  const heroPhrases = useMemo(() => {
    const configuredPhrases = portfolio.hero.typewriter.lines
      .map((phrase) =>
        phrase
          .split("/")
          .map((line) => line.trim())
          .filter(Boolean),
      )
      .filter((phrase) => phrase.length > 0);
    if (configuredPhrases.length > 0) return configuredPhrases;
    const fallbackPhrase = [portfolio.hero.line1, portfolio.hero.line2].filter(
      (line) => line.trim().length > 0,
    );
    return fallbackPhrase.length > 0 ? [fallbackPhrase] : [];
  }, [portfolio]);

  const { typedLines: typedHeroLines, activeLineIndex, commandPhraseIndex } = useHeroTyping(
    typingReady,
    heroPhrases,
    portfolio.hero.typewriter.speedMs ?? 72,
    portfolio.hero.typewriter.linePauseMs ?? 80,
  );
  const activeHeroRole = (heroPhrases[commandPhraseIndex] ?? typedHeroLines)
    .filter((line) => line.trim().length > 0)
    .join(" ")
    .replace(/_/g, "")
    .trim();
  const heroCommand = getDynamicHeroCommand(
    portfolio.hero.command ?? "",
    activeHeroRole || portfolio.profile.role || "",
  );

  const skillsRef = useRef<HTMLDivElement>(null);
  const [skillsVisible, setSkillsVisible] = useState(false);
  useEffect(() => {
    const el = skillsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setSkillsVisible(true);
      },
      { threshold: 0.25 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const navCls = (id: string) =>
    `hover:text-brand transition-colors duration-200 ${activeSection === id ? "text-brand" : ""}`;

  const projects = portfolio.projects.map((project) => ({
    ...project,
    image: projectImageMap[project.imageKey] ?? projectBanking,
  }));

  return (
    <div className="min-h-screen bg-background text-foreground font-mono overflow-x-hidden">
      {/* Atmospheric background */}
      <AtmosphereLayer />

      {showLoader && (
        <PageLoader
          logoText={portfolio.header.logoText}
          bootNode={portfolio.header.bootNode}
          bootLinesText={portfolio.uiText.bootLines}
          onComplete={handleLoaderComplete}
        />
      )}

      <div
        className={`relative z-10 transition-opacity duration-700 ${
          contentVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* ── Nav ── */}
        <nav className="fixed top-0 w-full z-50 border-b border-border/40 bg-background/75 backdrop-blur-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="size-2.5 rounded-full bg-brand"
                style={{
                  boxShadow:
                    "0 0 8px var(--brand), 0 0 20px color-mix(in srgb, var(--brand) 40%, transparent)",
                }}
              />
              <div className="font-bold text-xs sm:text-sm tracking-widest">
                {portfolio.header.logoText}
                <span className="text-brand cursor-blink">_</span>
              </div>
            </div>
            <div className="hidden md:flex gap-5 text-[11px] font-medium tracking-[0.18em] text-muted">
              <a href="#root" className={navCls("root")}>{portfolio.uiText.navLabels.root}</a>
              <a href="#projects" className={navCls("projects")}>{portfolio.uiText.navLabels.projects}</a>
              <a href="#history" className={navCls("history")}>{portfolio.uiText.navLabels.logs}</a>
              <Link href="/blog" className="hover:text-brand transition-colors duration-200">{portfolio.uiText.navLabels.blog}</Link>
              <a href="#connect" className={navCls("connect")}>{portfolio.uiText.navLabels.connect}</a>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <div className="hidden lg:block text-[10px] bg-brand/10 px-2.5 py-1 border border-brand/20 rounded text-brand tracking-widest whitespace-nowrap">
                {time} {portfolio.header.timeLabel}
              </div>
              {/* Hamburger — mobile only */}
              <button
                className="md:hidden flex flex-col justify-center items-center gap-[5px] w-11 h-11 -mr-1"
                onClick={() => setMobileMenuOpen((o) => !o)}
                aria-label="Toggle menu"
              >
                <span className={`block h-[1.5px] w-5 bg-foreground transition-all duration-200 origin-center ${mobileMenuOpen ? "rotate-45 translate-y-[6.5px]" : ""}`} />
                <span className={`block h-[1.5px] w-5 bg-foreground transition-all duration-200 ${mobileMenuOpen ? "opacity-0 scale-x-0" : ""}`} />
                <span className={`block h-[1.5px] w-5 bg-foreground transition-all duration-200 origin-center ${mobileMenuOpen ? "-rotate-45 -translate-y-[6.5px]" : ""}`} />
              </button>
            </div>
          </div>
          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-2xl px-4 py-4 flex flex-col gap-4 text-[11px] font-medium tracking-[0.18em] text-muted">
              <a href="#root" onClick={() => setMobileMenuOpen(false)} className={navCls("root")}>[ 01_ROOT ]</a>
              <a href="#projects" onClick={() => setMobileMenuOpen(false)} className={navCls("projects")}>[ 02_PROJECTS ]</a>
              <a href="#history" onClick={() => setMobileMenuOpen(false)} className={navCls("history")}>[ 03_LOGS ]</a>
              <Link href="/blog" onClick={() => setMobileMenuOpen(false)} className="hover:text-brand transition-colors duration-200">[ 04_BLOG ]</Link>
              <a href="#connect" onClick={() => setMobileMenuOpen(false)} className={navCls("connect")}>[ 05_CONNECT ]</a>
            </div>
          )}
          {/* Gradient progress bar */}
          <div className="h-[2px] bg-surface/20">
            <div
              className="h-full transition-all duration-100 ease-out"
              style={{
                width: `${scrollProgress}%`,
                background: `linear-gradient(to right, color-mix(in srgb, var(--brand) 50%, transparent), var(--brand))`,
                boxShadow: "0 0 6px var(--brand)",
              }}
            />
          </div>
        </nav>

        <main className="pt-14 pb-20">

          {/* ── Hero: Full Width ── */}
          <section
            id="root"
            className="max-w-7xl mx-auto px-4 sm:px-6 min-h-[calc(100svh-3.5rem)] flex flex-col justify-center mb-16 sm:mb-28 md:mb-36"
          >
            <div className="animate-reveal py-10 sm:py-16 max-w-5xl">
              {/* Command prompt */}
              <p className="text-brand/50 text-[11px] tracking-[0.25em] mb-6 font-mono truncate">
                {heroCommand}
              </p>

              {/* Massive typewriter — full width, dramatic */}
              <h1 className="font-display font-black leading-[0.9] tracking-tighter text-[clamp(2.2rem,9vw,8rem)] mb-8 sm:mb-10 text-glow">
                {typedHeroLines.map((text, index) => {
                  const isActive = index === activeLineIndex;
                  const isAccentLine = index > 0 || typedHeroLines.length === 1;
                  return (
                    <span
                      key={`${index}-${text}`}
                      className={isAccentLine ? "text-brand italic" : undefined}
                    >
                      {index > 0 && <br />}
                      {text}
                      {isActive && (
                        <span className={isAccentLine ? "cursor-blink" : "text-brand cursor-blink"}>
                          _
                        </span>
                      )}
                    </span>
                  );
                })}
              </h1>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-6 sm:mb-8">
                <div className="hidden sm:block h-px w-12 bg-brand/60 shrink-0" />
                <div className="flex flex-wrap gap-2">
                  {portfolio.hero.badges.map((badge) => (
                    <div
                      key={badge.label}
                      className={`px-3 py-1 rounded-full border text-[10px] tracking-[0.15em] font-medium ${
                        badge.tone === "brand"
                          ? "bg-brand/10 border-brand/40 text-brand"
                          : "bg-surface/80 border-border/70 text-muted"
                      }`}
                      style={
                        badge.tone === "brand"
                          ? { boxShadow: "0 0 12px color-mix(in srgb, var(--brand) 15%, transparent)" }
                          : undefined
                      }
                    >
                      {badge.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Intro lines */}
              <div className="max-w-2xl text-sm text-muted leading-relaxed mb-8 sm:mb-10 space-y-1.5 break-words">
                {portfolio.hero.introLines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 mb-10 sm:mb-16">
                <a
                  href="#connect"
                  className="inline-flex items-center justify-center gap-2 bg-brand text-brand-foreground px-7 py-3.5 text-xs font-bold tracking-[0.18em] uppercase hover:opacity-90 transition-opacity rounded-sm"
                  style={{
                    boxShadow: "0 0 24px color-mix(in srgb, var(--brand) 40%, transparent), 0 4px 24px color-mix(in srgb, var(--brand) 20%, transparent)",
                  }}
                >
                  {portfolio.hero.primaryActionLabel}
                </a>
                <a
                  href="#projects"
                  className="inline-flex items-center justify-center gap-2 border border-border/70 px-7 py-3.5 text-xs font-bold tracking-[0.18em] uppercase text-foreground hover:border-brand/60 hover:text-brand transition-colors rounded-sm"
                >
                  {portfolio.hero.secondaryActionLabel}
                </a>
                <a
                  href="/cv.pdf"
                  download
                  className="inline-flex items-center justify-center gap-2 border border-brand/25 px-7 py-3.5 text-xs font-bold tracking-[0.18em] uppercase text-brand/60 hover:border-brand/60 hover:text-brand transition-colors rounded-sm"
                >
                  ↓ {portfolio.hero.cvLabel}
                </a>
              </div>

              {/* Stats strip */}
              <div className="grid grid-cols-2 sm:flex border-t border-border/30 pt-8">
                {portfolio.profile.stats.map((stat, i) => (
                  <div
                    key={stat.label}
                    className={[
                      "px-4 sm:px-6 py-3 sm:py-2 sm:flex-1",
                      i % 2 === 1 ? "border-l border-border/30" : "",
                      i >= 2 ? "border-t border-border/30 sm:border-t-0" : "",
                      i > 0 ? "sm:border-l sm:border-border/30" : "",
                    ].join(" ")}
                  >
                    <p className="text-2xl sm:text-3xl font-black font-display text-brand leading-none tabular-nums">
                      <StatCounter value={stat.value} suffix={stat.suffix} revealReady={revealReady} />
                    </p>
                    <p className="text-[9px] text-muted tracking-[0.2em] uppercase mt-1">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Projects ── */}
          <section
            id="projects"
            className="max-w-7xl mx-auto px-4 sm:px-6 mb-16 sm:mb-28 md:mb-36"
          >
            <div className="flex items-center gap-4 mb-12" data-reveal>
              <div
                className="size-2 bg-brand shrink-0 rounded-full"
                style={{ boxShadow: "0 0 8px var(--brand)" }}
              />
              <h2
                data-scramble
                className="text-base sm:text-xl font-bold uppercase tracking-widest whitespace-nowrap"
              >
                {portfolio.uiText.sectionTitles.workLog}
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-border/80 to-transparent" />
              <span className="text-brand text-xs cursor-blink">█</span>
            </div>

            <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
              {projects.map((p, i) => (
                <ProjectCard key={p.code} p={p} i={i} />
              ))}
            </div>
          </section>

          {/* ── Career History + Stack ── */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-16 sm:mb-28 md:mb-36">
            <div className="grid lg:grid-cols-12 gap-8">

              {/* Timeline */}
              <section id="history" className="lg:col-span-8" data-reveal>
                <div
                  className="p-px rounded-xl"
                  style={{
                    background:
                      "linear-gradient(135deg, color-mix(in srgb, var(--brand) 15%, transparent), transparent 55%)",
                  }}
                >
                  <div className="rounded-xl bg-surface/90 backdrop-blur-sm p-4 sm:p-8">
                    <div className="flex items-center gap-3 mb-6 sm:mb-10">
                      <div
                        className="size-2 bg-brand rounded-full"
                        style={{ boxShadow: "0 0 8px var(--brand)" }}
                      />
                      <h2
                        data-scramble
                        className="text-base sm:text-xl font-bold uppercase tracking-widest"
                      >
                        {portfolio.uiText.sectionTitles.careerHistory}
                      </h2>
                    </div>
                    <ol className="space-y-8 sm:space-y-10">
                      {portfolio.experience.map((e) => (
                        <li
                          key={e.id}
                          className={`flex gap-5 sm:gap-6 group transition-all ${
                            e.current
                              ? "pl-4 border-l-2 border-brand/60"
                              : "pl-4 border-l-2 border-border/30"
                          }`}
                          style={
                            e.current
                              ? {
                                  borderLeftColor:
                                    "color-mix(in srgb, var(--brand) 60%, transparent)",
                                }
                              : undefined
                          }
                        >
                          <div className="text-[10px] text-brand/50 pt-1.5 font-bold shrink-0 w-6 tracking-widest">
                            {e.id}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1.5 mb-1.5">
                              <h3 className="text-base sm:text-lg font-bold font-display group-hover:text-brand transition-colors duration-200 flex items-center gap-2 flex-wrap">
                                {e.role}
                                {e.current && (
                                  <span
                                    className="text-[9px] bg-brand/15 text-brand border border-brand/35 px-2 py-0.5 tracking-widest font-bold rounded-full"
                                    style={{
                                      boxShadow:
                                        "0 0 8px color-mix(in srgb, var(--brand) 20%, transparent)",
                                    }}
                                  >
                                    ● CURRENT
                                  </span>
                                )}
                              </h3>
                              <span className="text-[11px] text-muted tracking-widest shrink-0">
                                {e.period}
                              </span>
                            </div>
                            <p className="text-[11px] text-brand/60 mb-3 tracking-widest uppercase">
                              @ {e.company} — {e.location}
                            </p>
                            <ul className="space-y-2">
                              {e.bullets.map((b, bi) => (
                                <li
                                  key={bi}
                                  className="text-xs sm:text-sm text-muted leading-relaxed flex gap-2.5"
                                >
                                  <span className="text-brand/50 shrink-0">›</span>
                                  <span>{b}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </section>

              {/* Stack sidebar */}
              <aside id="stack" className="lg:col-span-4 space-y-5">

                {/* Proficiency bars */}
                <div
                  ref={skillsRef}
                  className="p-px rounded-xl"
                  style={{
                    background:
                      "linear-gradient(135deg, color-mix(in srgb, var(--brand) 30%, transparent), transparent 60%)",
                  }}
                  data-reveal
                >
                  <div className="rounded-xl bg-surface/90 backdrop-blur-sm p-5 sm:p-6">
                    <h3 className="text-[11px] font-bold text-brand uppercase tracking-widest mb-6">
                      {portfolio.uiText.sectionTitles.currentDependencies}
                    </h3>
                    <div className="space-y-5">
                      {portfolio.proficiency.map((p) => (
                        <div key={p.label}>
                          <div className="flex justify-between text-[10px] mb-1.5 tracking-widest">
                            <span className="text-muted">{p.label}</span>
                            <span className="text-brand/70">{p.value}%</span>
                          </div>
                          <div className="h-1 bg-surface/60 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-1000 ease-out"
                              style={{
                                width: skillsVisible ? `${p.value}%` : "0%",
                                background: `linear-gradient(to right, color-mix(in srgb, var(--brand) 60%, transparent), var(--brand))`,
                                boxShadow: skillsVisible
                                  ? "0 0 6px color-mix(in srgb, var(--brand) 50%, transparent)"
                                  : "none",
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Tech stack groups */}
                {portfolio.stack.map((group, i) => (
                  <div
                    key={group.id}
                    className="border border-border/40 rounded-xl p-5 bg-surface/80 hover:bg-surface transition-colors"
                    data-reveal
                    data-delay={String((i + 1) * 100)}
                  >
                    <h3 className="text-[11px] font-bold text-muted uppercase tracking-widest mb-3.5">
                      _{group.label.replace(/ /g, "_")}
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {group.items.map((t) => (
                        <span
                          key={t}
                          className="px-2.5 py-1 border border-border/50 text-[10px] text-foreground/70 tracking-wider rounded-sm hover:border-brand/40 hover:text-brand transition-colors duration-200 cursor-default"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </aside>
            </div>
          </div>

          {/* ── Credentials ── */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-16 sm:mb-28 md:mb-36">
            <div className="grid md:grid-cols-2 gap-8">

              {/* Certifications */}
              <div
                className="p-px rounded-xl"
                style={{
                  background:
                    "linear-gradient(135deg, color-mix(in srgb, var(--brand) 15%, transparent), transparent 55%)",
                }}
                data-reveal
              >
                <div className="rounded-xl bg-surface/90 backdrop-blur-sm p-4 sm:p-8 h-full">
                  <div className="flex items-center gap-3 mb-7">
                    <div
                      className="size-2 bg-brand rounded-full"
                      style={{ boxShadow: "0 0 8px var(--brand)" }}
                    />
                    <h2 className="text-base font-bold uppercase tracking-widest">
                      {portfolio.uiText.sectionTitles.certifications}
                    </h2>
                  </div>
                  <ul className="space-y-4">
                    {portfolio.certifications.map((c) => (
                      <li key={c.id} className="text-sm text-muted flex gap-3 leading-snug">
                        <span className="text-brand/50 shrink-0 mt-0.5">▣</span>
                        <span>{c.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Right column */}
              <div className="space-y-5">

                {/* Education */}
                <div
                  className="border border-border/40 rounded-xl p-4 sm:p-8 bg-surface/80"
                  data-reveal
                  data-delay="150"
                >
                  <div className="flex items-center gap-3 mb-5">
                    <div
                      className="size-2 bg-brand rounded-full"
                      style={{ boxShadow: "0 0 8px var(--brand)" }}
                    />
                    <h2 className="text-base font-bold uppercase tracking-widest">
                      {portfolio.uiText.sectionTitles.education}
                    </h2>
                  </div>
                  <h3 className="text-base font-bold font-display">
                    {portfolio.education.degree}
                  </h3>
                  <p className="text-[11px] text-brand/60 mt-1.5 tracking-widest uppercase">
                    @ {portfolio.education.institution}
                  </p>
                  <p className="text-xs text-muted mt-1 tracking-widest">
                    {portfolio.education.period}
                  </p>
                </div>

                {/* Awards */}
                <div
                  className="border border-border/40 rounded-xl p-4 sm:p-8 bg-surface/80"
                  data-reveal
                  data-delay="200"
                >
                  <div className="flex items-center gap-3 mb-5">
                    <div
                      className="size-2 bg-brand rounded-full"
                      style={{ boxShadow: "0 0 8px var(--brand)" }}
                    />
                    <h2 className="text-base font-bold uppercase tracking-widest">
                      {portfolio.uiText.sectionTitles.awards}
                    </h2>
                  </div>
                  <ul className="space-y-3">
                    {portfolio.awards.map((award) => (
                      <li key={award.id} className="text-sm text-muted flex gap-2.5">
                        <span className="text-brand/50 shrink-0">★</span>
                        <span>
                          <span className="text-foreground/90">{award.title}</span>{" "}
                          — {award.issuer}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Languages */}
                <div
                  className="border border-border/40 rounded-xl p-4 sm:p-8 bg-surface/80"
                  data-reveal
                  data-delay="300"
                >
                  <div className="flex items-center gap-3 mb-5">
                    <div
                      className="size-2 bg-brand rounded-full"
                      style={{ boxShadow: "0 0 8px var(--brand)" }}
                    />
                    <h2 className="text-base font-bold uppercase tracking-widest">
                      {portfolio.uiText.sectionTitles.languages}
                    </h2>
                  </div>
                  <ul className="space-y-2.5 text-sm text-muted">
                    {portfolio.languages.map((language, index) => (
                      <li
                        key={language.id}
                        className={`flex justify-between ${
                          index < portfolio.languages.length - 1
                            ? "border-b border-border/30 pb-2.5"
                            : ""
                        }`}
                      >
                        <span className="text-foreground">{language.name}</span>
                        <span className="text-[10px] tracking-widest uppercase text-muted/60">
                          {language.level}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* ── Contact ── */}
          <footer id="connect" className="border-t border-border/30">
            {/* Dramatic top gradient */}
            <div
              className="h-px w-full"
              style={{
                background:
                  "linear-gradient(to right, transparent, var(--brand), transparent)",
                boxShadow: "0 0 20px color-mix(in srgb, var(--brand) 40%, transparent)",
              }}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 sm:pt-24 pb-16 sm:pb-20">
              {/* Big CTA */}
              <div className="text-center mb-10 sm:mb-20" data-reveal>
                <div
                  className="inline-flex items-center gap-2.5 mb-8 px-4 py-1.5 rounded-full bg-brand/10 border border-brand/25 text-brand text-[10px] tracking-[0.3em]"
                  style={{
                    boxShadow:
                      "0 0 20px color-mix(in srgb, var(--brand) 15%, transparent)",
                  }}
                >
                  <span
                    className="size-1.5 rounded-full bg-brand animate-glow-pulse"
                    style={{ boxShadow: "0 0 6px var(--brand)" }}
                  />
                  PINGING_NETWORK...
                </div>

                <h2
                  data-scramble
                  className="text-[clamp(1.5rem,6.5vw,4.5rem)] sm:text-5xl md:text-7xl font-display font-black mb-6 sm:mb-10 tracking-tighter text-glow break-words"
                >
                  {portfolio.uiText.sectionTitles.collaboration}
                </h2>

                <a
                  href={`mailto:${portfolio.contact.email}`}
                  className="text-brand hover:opacity-75 transition-opacity text-base sm:text-2xl md:text-3xl underline decoration-brand/20 underline-offset-8 break-all"
                  style={{
                    textShadow:
                      "0 0 30px color-mix(in srgb, var(--brand) 30%, transparent)",
                  }}
                >
                  {portfolio.contact.email}
                </a>
              </div>

              {/* Contact cards — brand-bar style */}
              <div className="grid sm:grid-cols-3 gap-3 sm:gap-4 mb-10 sm:mb-20 max-w-4xl mx-auto" data-reveal data-delay="100">
                {[
                  {
                    ...portfolio.uiText.contactActions[0],
                    value: portfolio.contact.phone,
                    href: `tel:${portfolio.contact.phone.replace(/\s/g, "")}`,
                    external: false,
                  },
                  {
                    ...portfolio.uiText.contactActions[1],
                    value: portfolio.contact.linkedinLabel,
                    href: portfolio.contact.linkedinUrl,
                    external: true,
                  },
                  {
                    ...portfolio.uiText.contactActions[2],
                    value: portfolio.contact.githubLabel,
                    href: portfolio.contact.githubUrl,
                    external: true,
                  },
                ].map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noreferrer" : undefined}
                    className="group flex flex-col border border-border/40 hover:border-brand/50 transition-all duration-300 overflow-hidden bg-surface/80 hover:bg-surface"
                  >
                    {/* Top brand bar */}
                    <div
                      className="h-[3px] w-full group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        background: "linear-gradient(to right, var(--brand), color-mix(in srgb, var(--brand) 30%, transparent))",
                        boxShadow: "0 0 8px color-mix(in srgb, var(--brand) 40%, transparent)",
                        opacity: 0.4,
                      }}
                    />
                    <div className="p-4 sm:p-6 flex flex-col gap-3 sm:gap-4 flex-1">
                      {/* Label + index */}
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold tracking-[0.25em] text-muted uppercase">
                          _{item.label}
                        </span>
                        <span className="text-[10px] text-brand/40 group-hover:text-brand/80 font-bold tracking-widest transition-colors">
                          [{item.index}]
                        </span>
                      </div>
                      {/* Value */}
                      <p className="text-sm font-mono text-foreground group-hover:text-brand transition-colors duration-200 leading-relaxed break-all">
                        {item.value}
                      </p>
                      {/* Action */}
                      <div className="mt-auto pt-3 border-t border-border/30 flex items-center justify-between">
                        <span className="text-[10px] tracking-widest text-brand/50 group-hover:text-brand font-bold uppercase transition-colors">
                          {item.action}
                        </span>
                        <span className="text-brand/40 group-hover:text-brand group-hover:translate-x-1 transition-all duration-200 text-sm">
                          →
                        </span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>

              {/* Footer bar */}
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t border-border/20 text-[10px] text-muted/50 uppercase tracking-[0.2em]">
                <div className="flex items-center gap-2">
                  <span
                    className="size-1.5 rounded-full bg-brand"
                    style={{ boxShadow: "0 0 6px var(--brand)" }}
                  />
                  LINK_ESTABLISHED: {portfolio.header.nodeLabel}
                </div>
                <div>{portfolio.uiText.footerText}</div>
              </div>
            </div>
          </footer>
        </main>
      </div>

      <AssistantLauncher />
    </div>
  );
}
