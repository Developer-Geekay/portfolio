import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, useRef } from "react";
import projectBanking from "@/assets/project-banking.jpg";
import projectDevtools from "@/assets/project-devtools.jpg";
import projectBentley from "@/assets/project-bentley.jpg";
import projectFnol from "@/assets/project-fnol.jpg";
import { getPortfolio } from "@/lib/api/portfolio.functions";
import type { PortfolioPageData } from "@/lib/shared/portfolio.schema";

// ── Theme color rotation — pick a new random accent on each page load ────────
const THEME_COLORS = ["#e2ff66", "#66ffe0", "#ff6b6b", "#b066ff", "#66b8ff"];
// Guard for SSR: document is only available client-side
if (typeof document !== "undefined") {
  const themeColor = THEME_COLORS[Math.floor(Math.random() * THEME_COLORS.length)];
  document.documentElement.style.setProperty("--brand", themeColor);
}

const projectImageMap: Record<string, string> = {
  banking: projectBanking,
  devtools: projectDevtools,
  bentley: projectBentley,
  fnol: projectFnol,
};

export const Route = createFileRoute("/")({
  component: Index,
});

const BOOT_LINES = [
  { text: "> Verifying identity modules...", type: "info" },
  { text: "> Loading OutSystems runtime...", type: "info" },
  { text: "> Mounting portfolio interface...", type: "info" },
  { text: "● SYSTEM_ONLINE // READY", type: "ok" },
] as const;

function PageLoader({
  logoText,
  bootNode,
  onComplete,
}: {
  logoText: string;
  bootNode: string;
  onComplete: () => void;
}) {
  const [visibleLines, setVisibleLines] = useState(0);
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const bootLines = [
    { text: `$ BOOT --node=${bootNode} --operator=G.KANNAN`, type: "cmd" },
    ...BOOT_LINES,
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
      <div className="w-full max-w-md px-6 font-mono">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-3 rounded-full bg-brand glow-sm" />
          <span className="text-brand text-sm font-bold tracking-widest">{logoText}</span>
        </div>

        <div className="border border-brand/20 bg-surface/20 rounded-lg overflow-hidden mb-6">
          <div className="bg-surface px-4 py-2 border-b border-border flex items-center gap-2">
            <div className="size-2 rounded-full bg-white/10" />
            <div className="size-2 rounded-full bg-white/10" />
            <div className="size-2 rounded-full bg-white/10" />
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

        <div className="space-y-2">
          <div className="h-0.5 bg-white/5">
            <div
              className="h-full bg-brand glow-sm transition-all duration-100"
              style={{ width: `${progress}%` }}
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

// ── Scan-line animation helpers ──────────────────────────────────────────────
const SCAN_MS = 550;
const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%►▣╳≡≢▶";

function injectScanLine(el: HTMLElement, delay: number) {
  setTimeout(() => {
    const rect = el.getBoundingClientRect();
    if (rect.width < 10 || rect.height < 10) return;

    const color =
      getComputedStyle(document.documentElement).getPropertyValue("--brand").trim() || "#e2ff66";
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);

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
      `z-index:9999`,
      `transition:transform ${SCAN_MS}ms cubic-bezier(0.77,0,0.18,1),opacity 200ms ease`,
      "will-change:transform",
    ].join(";");

    document.body.appendChild(line);

    // Double rAF to force paint before animating
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

// ── StatCounter — counts 0 → value on scroll-reveal ─────────────────────────
function StatCounter({
  value,
  suffix,
  revealReady,
}: {
  value: number;
  suffix: string;
  revealReady: boolean;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
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
        // Start after parent scan-reveal completes
        setTimeout(() => {
          const start = performance.now();
          const duration = 900;
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
    <p ref={ref} className="text-2xl font-bold font-display text-brand leading-none">
      {count}
      <span
        className={`transition-opacity duration-300 ${showSuffix ? "opacity-100" : "opacity-0"}`}
      >
        {suffix}
      </span>
    </p>
  );
}

// ── setupScrollReveal — called once after loader exits ───────────────────────
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

function Index() {
  const [portfolio, setPortfolio] = useState<PortfolioPageData | null>(null);
  const time = useClock(portfolio?.header.timezone ?? "Asia/Riyadh");
  const scrollProgress = useScrollProgress();
  const activeSection = useActiveSection(["root", "projects", "history", "stack", "connect"]);

  const [loadError, setLoadError] = useState<string | null>(null);
  const [showLoader, setShowLoader] = useState(true);
  const [contentVisible, setContentVisible] = useState(false);
  const [revealReady, setRevealReady] = useState(false);
  const [typingReady, setTypingReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getPortfolio()
      .then((data) => {
        if (!cancelled) setPortfolio(data);
      })
      .catch((error) => {
        console.error(error);
        if (!cancelled) setLoadError("Unable to load portfolio content.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

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
    if (!portfolio) return [];
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
  const {
    typedLines: typedHeroLines,
    activeLineIndex,
    commandPhraseIndex,
  } = useHeroTyping(
    typingReady && !!portfolio,
    heroPhrases,
    portfolio?.hero.typewriter.speedMs ?? 72,
    portfolio?.hero.typewriter.linePauseMs ?? 80,
  );
  const activeHeroRole = (heroPhrases[commandPhraseIndex] ?? typedHeroLines)
    .filter((line) => line.trim().length > 0)
    .join(" ")
    .replace(/_/g, "")
    .trim();
  const heroCommand = getDynamicHeroCommand(
    portfolio?.hero.command ?? "",
    activeHeroRole || portfolio?.profile.role || "",
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
    `hover:text-brand transition-colors ${activeSection === id ? "text-brand" : ""}`;

  const projects =
    portfolio?.projects.map((project) => ({
      ...project,
      image: projectImageMap[project.imageKey] ?? projectBanking,
    })) ?? [];
  const experience = portfolio?.experience ?? [];
  const stack = portfolio?.stack ?? [];
  const certifications = portfolio?.certifications ?? [];
  const proficiency = portfolio?.proficiency ?? [];

  if (loadError) {
    return (
      <div className="min-h-screen bg-background text-foreground font-mono flex items-center justify-center px-4">
        <div className="border border-border bg-surface/30 p-6 max-w-md">
          <p className="text-xs text-brand tracking-widest uppercase mb-3">CONTENT_LOAD_FAILED</p>
          <p className="text-sm text-muted">{loadError}</p>
        </div>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="min-h-screen bg-background text-foreground font-mono flex items-center justify-center px-4">
        <div className="text-xs text-brand tracking-[0.3em] uppercase cursor-blink">
          Loading_Portfolio_Data
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-mono">
      {showLoader && (
        <PageLoader
          logoText={portfolio.header.logoText}
          bootNode={portfolio.header.bootNode}
          onComplete={handleLoaderComplete}
        />
      )}
      <div
        className={`transition-opacity duration-700 ${contentVisible ? "opacity-100" : "opacity-0"}`}
      >
        {/* Nav */}
        <nav className="fixed top-0 w-full z-50 border-b border-brand/20 bg-background/90 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-2.5 rounded-full bg-brand glow-sm" />
              <div className="font-bold text-xs sm:text-sm tracking-widest">
                {portfolio.header.logoText}
                <span className="text-brand cursor-blink">_</span>
              </div>
            </div>
            <div className="hidden md:flex gap-5 text-[11px] font-medium tracking-[0.18em] text-muted">
              <a href="#root" className={navCls("root")}>
                [ 01_ROOT ]
              </a>
              <a href="#projects" className={navCls("projects")}>
                [ 02_PROJECTS ]
              </a>
              <a href="#history" className={navCls("history")}>
                [ 03_LOGS ]
              </a>
              <a href="#stack" className={navCls("stack")}>
                [ 04_STACK ]
              </a>
              <a href="#connect" className={navCls("connect")}>
                [ 05_CONNECT ]
              </a>
            </div>
            <div className="text-[10px] bg-brand/10 px-2.5 py-1 border border-brand/20 rounded text-brand tracking-widest">
              {time} {portfolio.header.timeLabel}
            </div>
          </div>
          {/* Scroll progress bar */}
          <div className="h-[2px] bg-brand/10">
            <div
              className="h-full bg-brand transition-all duration-100 ease-out"
              style={{ width: `${scrollProgress}%` }}
            />
          </div>
        </nav>

        <main className="pt-20 pb-20">
          {/* Hero */}
          <section id="root" className="max-w-7xl mx-auto px-4 sm:px-6 mb-24 sm:mb-32">
            <div className="border border-border rounded-lg overflow-hidden animate-reveal">
              <div className="bg-surface px-4 py-2 border-b border-border flex items-center gap-2">
                <div className="size-2 rounded-full bg-white/10" />
                <div className="size-2 rounded-full bg-white/10" />
                <div className="size-2 rounded-full bg-white/10" />
                <div className="text-[10px] text-muted ml-2 uppercase tracking-widest">
                  bash — ~/gokula.kannan
                </div>
              </div>
              <div className="p-6 sm:p-10 md:p-14">
                <div className="mb-6 text-brand/70 text-xs">{heroCommand}</div>
                <h1 className="font-display font-bold leading-[0.85] tracking-tighter text-5xl sm:text-7xl md:text-8xl mb-8 glow-lg">
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
                          <span
                            className={isAccentLine ? "cursor-blink" : "text-brand cursor-blink"}
                          >
                            _
                          </span>
                        )}
                      </span>
                    );
                  })}
                </h1>
                <div className="max-w-2xl text-sm sm:text-base md:text-lg text-muted leading-relaxed mb-10 space-y-1">
                  {portfolio.hero.introLines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
                <div className="flex flex-wrap gap-3 mb-8">
                  {portfolio.hero.badges.map((badge) => (
                    <div
                      key={badge.label}
                      className={`px-3 py-1.5 border text-[10px] sm:text-[11px] tracking-widest ${
                        badge.tone === "brand"
                          ? "bg-brand/5 border-brand/30 text-brand"
                          : "bg-white/5 border-border text-muted"
                      }`}
                    >
                      {badge.label}
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-3">
                  <a
                    href="#connect"
                    className="inline-flex items-center gap-2 bg-brand text-brand-foreground px-5 py-3 text-xs font-bold tracking-widest uppercase hover:opacity-90 transition-opacity"
                  >
                    {portfolio.hero.primaryActionLabel}
                  </a>
                  <a
                    href="#projects"
                    className="inline-flex items-center gap-2 border border-border px-5 py-3 text-xs font-bold tracking-widest uppercase text-foreground hover:border-brand/50 hover:text-brand transition-colors"
                  >
                    {portfolio.hero.secondaryActionLabel}
                  </a>
                  <a
                    href="/cv.pdf"
                    download
                    className="inline-flex items-center gap-2 border border-brand/30 px-5 py-3 text-xs font-bold tracking-widest uppercase text-brand/70 hover:border-brand hover:text-brand transition-colors"
                  >
                    ↓ {portfolio.hero.cvLabel}
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* About */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-24 sm:mb-32">
            <div className="grid lg:grid-cols-12 gap-8">
              <div className="lg:col-span-4" data-reveal>
                <div className="flex items-center gap-3 mb-4">
                  <div className="size-2 bg-brand glow-sm" />
                  <h2
                    data-scramble
                    className="text-xs font-bold uppercase tracking-[0.2em] text-brand"
                  >
                    README.md
                  </h2>
                </div>
                <p className="text-xs text-muted tracking-widest uppercase mb-8">
                  // Operator briefing
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {portfolio.profile.stats.map((stat) => (
                    <div
                      key={stat.label}
                      className="border border-border p-4 bg-surface/30 hover:border-brand/30 transition-colors"
                    >
                      <StatCounter
                        value={stat.value}
                        suffix={stat.suffix}
                        revealReady={revealReady}
                      />
                      <p className="text-[10px] text-muted tracking-widest uppercase mt-2">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div
                className="lg:col-span-8 space-y-6 text-sm sm:text-base text-muted leading-relaxed"
                data-reveal
                data-delay="150"
              >
                {portfolio.profile.about.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>
          </section>

          {/* Projects */}
          <section id="projects" className="max-w-7xl mx-auto px-4 sm:px-6 mb-24 sm:mb-32">
            <div className="flex items-center gap-4 mb-10" data-reveal>
              <div className="size-2 bg-brand glow-sm shrink-0" />
              <h2
                data-scramble
                className="text-base sm:text-xl font-bold uppercase tracking-widest whitespace-nowrap"
              >
                Deployment_Logs
              </h2>
              <div className="h-px flex-1 bg-border" />
              <span className="text-brand text-xs cursor-blink">█</span>
            </div>

            <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
              {projects.map((p, i) => (
                <article
                  key={p.code}
                  data-reveal
                  data-delay={i % 2 === 1 ? "150" : undefined}
                  className="group border border-border hover:border-brand/50 transition-all duration-300 p-1 bg-surface/30 hover:shadow-lg hover:shadow-brand/5 hover:-translate-y-0.5"
                >
                  <div className="relative aspect-video overflow-hidden isolate">
                    <img
                      src={p.image}
                      alt={`${p.title} project visual`}
                      width={1280}
                      height={800}
                      loading="lazy"
                      className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:scale-105"
                    />
                    {/* Colorize overlay — mix-blend-mode:color maps brand hue onto the grayscale image */}
                    <div className="absolute inset-0 bg-brand opacity-0 group-hover:opacity-75 transition-opacity duration-700 mix-blend-color" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 text-[10px] bg-brand text-brand-foreground px-2 py-0.5 font-bold tracking-widest">
                      {p.code}
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3 gap-3">
                      <div>
                        <h3 className="text-lg font-bold font-display">{p.title}</h3>
                        <p className="text-[11px] text-brand/70 mt-1 tracking-widest uppercase">
                          @ {p.client}
                        </p>
                      </div>
                      <span className="text-[10px] font-mono text-muted shrink-0">[{p.year}]</span>
                    </div>
                    <p className="text-sm text-muted leading-relaxed mb-5">{p.blurb}</p>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {p.tags.map((t) => (
                        <span
                          key={t}
                          className="text-[10px] px-2 py-0.5 border border-border text-muted tracking-wider group-hover:border-brand/20 transition-colors"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    <div className="text-[10px] text-brand/60 font-bold tracking-widest group-hover:text-brand transition-colors flex items-center gap-1">
                      EXECUTE_VIEW
                      <span className="inline-block translate-x-0 group-hover:translate-x-1.5 transition-transform duration-300">
                        —&gt;
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* History + Stack */}
          <section id="history" className="max-w-7xl mx-auto px-4 sm:px-6 mb-24 sm:mb-32">
            <div className="grid lg:grid-cols-12 gap-8">
              <div
                className="lg:col-span-8 border border-border p-6 sm:p-8 bg-surface/20"
                data-reveal
              >
                <div className="flex items-center gap-3 mb-10">
                  <div className="size-2 bg-brand glow-sm" />
                  <h2
                    data-scramble
                    className="text-base sm:text-xl font-bold uppercase tracking-widest"
                  >
                    Career_History.log
                  </h2>
                </div>

                <ol className="space-y-10">
                  {experience.map((e) => (
                    <li
                      key={e.id}
                      className={`flex gap-4 sm:gap-6 group transition-all ${
                        e.current
                          ? "pl-3 border-l-2 border-brand/60"
                          : "pl-3 border-l-2 border-transparent"
                      }`}
                    >
                      <div className="text-xs text-brand/40 pt-1 font-bold shrink-0 w-6">
                        {e.id}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1 mb-1.5">
                          <h3 className="text-base sm:text-lg font-bold font-display group-hover:text-brand transition-colors flex items-center gap-2 flex-wrap">
                            {e.role}
                            {e.current && (
                              <span className="text-[9px] bg-brand/20 text-brand border border-brand/40 px-1.5 py-0.5 tracking-widest font-bold rounded-sm">
                                ● CURRENT
                              </span>
                            )}
                          </h3>
                          <span className="text-[11px] text-muted tracking-widest shrink-0">
                            {e.period}
                          </span>
                        </div>
                        <p className="text-[11px] text-brand/70 mb-3 tracking-widest uppercase">
                          @ {e.company} — {e.location}
                        </p>
                        <ul className="space-y-1.5">
                          {e.bullets.map((b, i) => (
                            <li
                              key={i}
                              className="text-xs sm:text-sm text-muted leading-relaxed flex gap-2"
                            >
                              <span className="text-brand/40 shrink-0">›</span>
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              <aside id="stack" className="lg:col-span-4 space-y-6">
                <div
                  ref={skillsRef}
                  className="border border-brand/20 p-5 sm:p-6 bg-brand/5"
                  data-reveal
                >
                  <h3 className="text-[11px] font-bold text-brand uppercase tracking-widest mb-5">
                    _Current_Dependencies
                  </h3>
                  <div className="space-y-4">
                    {proficiency.map((p) => (
                      <div key={p.label}>
                        <div className="flex justify-between text-[10px] text-muted mb-1.5 tracking-widest">
                          <span>{p.label}</span>
                          <span>{p.value}%</span>
                        </div>
                        <div className="h-1 bg-white/5 overflow-hidden">
                          <div
                            className="h-full bg-brand glow-sm transition-all duration-1000 ease-out"
                            style={{ width: skillsVisible ? `${p.value}%` : "0%" }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {stack.map((group, i) => (
                  <div
                    key={group.id}
                    className="border border-border p-5"
                    data-reveal
                    data-delay={String((i + 1) * 100)}
                  >
                    <h3 className="text-[11px] font-bold text-muted uppercase tracking-widest mb-3">
                      _{group.label.replace(/ /g, "_")}
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {group.items.map((t) => (
                        <span
                          key={t}
                          className="px-2 py-1 border border-border text-[10px] text-foreground/80 tracking-wider hover:border-brand/40 hover:text-brand transition-colors"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </aside>
            </div>
          </section>

          {/* Certifications + Education */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-24 sm:mb-32">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="border border-border p-6 sm:p-8 bg-surface/20" data-reveal>
                <div className="flex items-center gap-3 mb-6">
                  <div className="size-2 bg-brand glow-sm" />
                  <h2 className="text-base font-bold uppercase tracking-widest">
                    Certifications.cert
                  </h2>
                </div>
                <ul className="space-y-3">
                  {certifications.map((c) => (
                    <li key={c.id} className="text-sm text-muted flex gap-2.5 leading-snug">
                      <span className="text-brand/60 shrink-0 mt-0.5">▣</span>
                      <span>{c.title}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-6">
                <div
                  className="border border-border p-6 sm:p-8 bg-surface/20"
                  data-reveal
                  data-delay="150"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="size-2 bg-brand glow-sm" />
                    <h2 className="text-base font-bold uppercase tracking-widest">Education.edu</h2>
                  </div>
                  <div>
                    <h3 className="text-base font-bold font-display">
                      {portfolio.education.degree}
                    </h3>
                    <p className="text-[11px] text-brand/70 mt-1 tracking-widest uppercase">
                      @ {portfolio.education.institution}
                    </p>
                    <p className="text-xs text-muted mt-1 tracking-widest">
                      {portfolio.education.period}
                    </p>
                  </div>
                </div>

                <div
                  className="border border-border p-6 sm:p-8 bg-surface/20"
                  data-reveal
                  data-delay="200"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="size-2 bg-brand glow-sm" />
                    <h2 className="text-base font-bold uppercase tracking-widest">Awards.log</h2>
                  </div>
                  <ul className="space-y-3">
                    {portfolio.awards.map((award) => (
                      <li key={award.id} className="text-sm text-muted flex gap-2.5">
                        <span className="text-brand/60 shrink-0">★</span>
                        <span>
                          <span className="text-foreground">{award.title}</span> — {award.issuer}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div
                  className="border border-border p-6 sm:p-8 bg-surface/20"
                  data-reveal
                  data-delay="300"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="size-2 bg-brand glow-sm" />
                    <h2 className="text-base font-bold uppercase tracking-widest">Languages.cfg</h2>
                  </div>
                  <ul className="space-y-2 text-sm text-muted">
                    {portfolio.languages.map((language, index) => (
                      <li
                        key={language.id}
                        className={`flex justify-between ${index < portfolio.languages.length - 1 ? "border-b border-border pb-2" : ""}`}
                      >
                        <span className="text-foreground">{language.name}</span>
                        <span className="text-[10px] tracking-widest uppercase">
                          {language.level}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Contact */}
          <footer id="connect" className="pt-20 border-t border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="text-center mb-16" data-reveal>
                <div className="inline-flex items-center gap-2 mb-5 px-3 py-1 bg-brand/10 border border-brand/20 text-brand text-[10px] tracking-[0.3em]">
                  <span className="size-1.5 rounded-full bg-brand animate-pulse" />
                  PINGING_NETWORK...
                </div>
                <h2
                  data-scramble
                  className="text-3xl sm:text-5xl md:text-6xl font-display font-bold mb-8 tracking-tighter"
                >
                  INITIATE_COLLABORATION_
                </h2>
                <a
                  href={`mailto:${portfolio.contact.email}`}
                  className="text-brand hover:opacity-80 transition-opacity text-lg sm:text-2xl md:text-3xl underline decoration-brand/30 underline-offset-8 break-words"
                >
                  {portfolio.contact.email}
                </a>
              </div>

              <div className="grid sm:grid-cols-3 gap-6 mb-16 max-w-4xl mx-auto">
                <a
                  href={`tel:${portfolio.contact.phone.replace(/\s/g, "")}`}
                  data-reveal
                  className="border border-border p-5 hover:border-brand/40 transition-colors group"
                >
                  <p className="text-[10px] tracking-widest text-muted uppercase mb-2">_phone</p>
                  <p className="text-sm text-foreground group-hover:text-brand transition-colors">
                    {portfolio.contact.phone}
                  </p>
                </a>
                <a
                  href={portfolio.contact.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  data-reveal
                  data-delay="100"
                  className="border border-border p-5 hover:border-brand/40 transition-colors group"
                >
                  <p className="text-[10px] tracking-widest text-muted uppercase mb-2">_linkedin</p>
                  <p className="text-sm text-foreground group-hover:text-brand transition-colors">
                    {portfolio.contact.linkedinLabel}
                  </p>
                </a>
                <a
                  href={portfolio.contact.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  data-reveal
                  data-delay="200"
                  className="border border-border p-5 hover:border-brand/40 transition-colors group"
                >
                  <p className="text-[10px] tracking-widest text-muted uppercase mb-2">_github</p>
                  <p className="text-sm text-foreground group-hover:text-brand transition-colors">
                    {portfolio.contact.githubLabel}
                  </p>
                </a>
              </div>

              <div className="flex flex-col md:flex-row justify-between items-center gap-4 py-8 border-t border-border text-[10px] text-muted uppercase tracking-[0.2em]">
                <div className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-brand glow-sm" />
                  LINK_ESTABLISHED: {portfolio.header.nodeLabel}
                </div>
                <div>© 2026 G.KANNAN // ALL_RIGHTS_RESERVED</div>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}

export default Index;
