import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import projectBanking from "@/assets/project-banking.jpg";
import projectDevtools from "@/assets/project-devtools.jpg";
import projectBentley from "@/assets/project-bentley.jpg";
import projectFnol from "@/assets/project-fnol.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Gokula Kannan — Technical Architect | OutSystems" },
      {
        name: "description",
        content:
          "Technical Architect with 8+ years across banking, fintech and insurance. 5× OutSystems certified. Based in Riyadh, Saudi Arabia.",
      },
      { property: "og:title", content: "Gokula Kannan — Technical Architect" },
      {
        property: "og:description",
        content:
          "Enterprise OutSystems architect. Banking, fintech, mobile, full-stack. Based in Riyadh.",
      },
    ],
  }),
  component: Index,
});

const experience = [
  {
    id: "01",
    role: "Technical Architect",
    company: "Riyad Capital",
    location: "Riyadh, KSA",
    period: "2025 — PRESENT",
    current: true,
    bullets: [
      "Leading architecture and delivery of the Enterprise Digital Platform.",
      "Designed scalable architecture covering UI, integrations and reusable modules.",
      "Delivered POCs for Regula, FACEKI and HyperPay integrations.",
      "Authored custom Cordova plugins wrapping native SDKs into OutSystems.",
      "Stabilized critical pre-production releases under aggressive timelines.",
    ],
  },
  {
    id: "02",
    role: "Technical Architect",
    company: "Onward Technologies Limited",
    location: "Chennai, IN",
    period: "2023 — 2024",
    current: false,
    bullets: [
      "Architectural leadership for enterprise initiatives.",
      "Led solution design for Bentley Motors Dealer Award Systems.",
      "Guided teams on architecture standards and deployment practices.",
    ],
  },
  {
    id: "03",
    role: "Senior Software Engineer",
    company: "Mphasis",
    location: "Chennai, IN",
    period: "2022 — 2023",
    current: false,
    bullets: [
      "Redesigned data models and queries for a 53% performance improvement.",
      "Mentored engineers and accelerated onboarding.",
      "Supported architecture of the FNOL insurance platform.",
    ],
  },
  {
    id: "04",
    role: "Senior Software Engineer",
    company: "Netlink Software Group America",
    location: "Chennai, IN",
    period: "2021 — 2022",
    current: false,
    bullets: [
      "Delivered major initiatives for Riyad Bank and Riyad Capital.",
      "Built secure banking and investment applications.",
      "Owned code reviews and release management.",
    ],
  },
  {
    id: "05",
    role: "Software Engineer",
    company: "Netlink Software Group America",
    location: "Chennai, IN",
    period: "2019 — 2021",
    current: false,
    bullets: [
      "Delivered the Qualified Candidate Database recruitment platform.",
      "Designed API-centric, scalable application components.",
      "Coordinated enterprise deployments.",
    ],
  },
  {
    id: "06",
    role: "Web Developer",
    company: "Hexlope Technologies",
    location: "Chennai, IN",
    period: "2018 — 2019",
    current: false,
    bullets: [
      "Developed cloud migration and visualization solutions.",
      "Built responsive web applications using modern JavaScript.",
    ],
  },
  {
    id: "07",
    role: "Web Developer",
    company: "Teamwork Techknowledge",
    location: "Chennai, IN",
    period: "2015 — 2017",
    current: false,
    bullets: [
      "Delivered e-commerce and service marketplace applications.",
      "Integrated secure payment gateways and backend systems.",
    ],
  },
];

const projects = [
  {
    code: "FINTECH.SYS",
    title: "Enterprise Digital Platform",
    client: "Riyad Capital",
    year: "2025",
    blurb:
      "Large-scale OutSystems platform. Led integrations with Regula, FACEKI, HyperPay and custom native mobile plugins.",
    image: projectBanking,
    tags: ["OutSystems O11", "Cordova", "HyperPay"],
  },
  {
    code: "DEVTOOLS.EXT",
    title: "OutSystems DevTools",
    client: "Community / OSS",
    year: "2024",
    blurb:
      "Chrome extension for OutSystems developers, rebuilt in React: runtime inspection, network monitoring, mock rule engine.",
    image: projectDevtools,
    tags: ["React", "Chrome API", "OSS"],
    link: "https://github.com/developergeekay",
  },
  {
    code: "BENTLEY.MOT",
    title: "Dealer Award Systems",
    client: "Bentley Motors",
    year: "2024",
    blurb:
      "End-to-end solution architecture and implementation for Bentley's global dealer recognition program.",
    image: projectBentley,
    tags: ["Architecture", "OutSystems", "Enterprise"],
  },
  {
    code: "FNOL.INS",
    title: "First Notice of Loss",
    client: "Insurance Enterprise",
    year: "2023",
    blurb:
      "Contributed to architecture of an enterprise insurance claim management platform handling end-to-end FNOL flows.",
    image: projectFnol,
    tags: ["Insurance", "Data Modeling", "Mobile"],
  },
];

const stack = {
  "Low-Code Platforms": ["OutSystems O11", "OutSystems Developer Cloud"],
  "Front-End": ["React", "Angular", "JavaScript", "HTML5 / CSS3", "Angular Material"],
  "Back-End & Data": ["Node.js", "SQL", "MySQL", "MongoDB"],
  "Mobile": ["Cordova", "Native SDK Integrations"],
  "DevOps & Infra": ["Git", "Bitbucket", "AWS", "Apache", "Nginx", "Jira"],
};

const certifications = [
  "OutSystems Tech Lead (O11)",
  "Front-end Developer Specialist (O11 & ODC)",
  "Associate Developer (ODC)",
  "Mobile Developer Specialist (O11 & ODC)",
  "Associate Reactive Developer",
  "Angular — The Complete Guide",
  "Neutrinos Certified Professional Developer",
];

const proficiency = [
  { label: "OUTSYSTEMS_O11", value: 98 },
  { label: "ENTERPRISE_ARCHITECTURE", value: 94 },
  { label: "MOBILE_INTEGRATIONS", value: 90 },
  { label: "REACT / FRONTEND", value: 88 },
  { label: "NODE / BACKEND", value: 82 },
];

const BOOT_LINES = [
  { text: "$ BOOT --node=RIYADH_01 --operator=G.KANNAN", type: "cmd" },
  { text: "> Verifying identity modules...", type: "info" },
  { text: "> Loading OutSystems runtime...", type: "info" },
  { text: "> Mounting portfolio interface...", type: "info" },
  { text: "● SYSTEM_ONLINE // READY", type: "ok" },
] as const;

function PageLoader({ onComplete }: { onComplete: () => void }) {
  const [visibleLines, setVisibleLines] = useState(0);
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const lineTimings = [150, 550, 950, 1350, 1850];
    const timeouts = lineTimings.map((t, i) =>
      setTimeout(() => setVisibleLines(i + 1), t)
    );

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
          <span className="text-brand text-sm font-bold tracking-widest uppercase">
            SYS_ARCH // G.KANNAN
          </span>
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
            {BOOT_LINES.slice(0, visibleLines).map((line, i) => (
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
                {i === visibleLines - 1 && visibleLines < BOOT_LINES.length && (
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

function useClock() {
  const [time, setTime] = useState("--:--:--");
  useEffect(() => {
    const update = () => {
      const fmt = new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZone: "Asia/Riyadh",
      });
      setTime(fmt.format(new Date()));
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);
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

function useScrollReveal(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const els = document.querySelectorAll("[data-reveal]");
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("revealed");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [enabled]);
}

function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) setActive(visible[0].target.id);
      },
      { rootMargin: "-35% 0px -60% 0px" }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return active;
}

function Index() {
  const time = useClock();
  const scrollProgress = useScrollProgress();
  const activeSection = useActiveSection(["root", "projects", "history", "stack", "connect"]);

  const [showLoader, setShowLoader] = useState(true);
  const [contentVisible, setContentVisible] = useState(false);
  const [revealReady, setRevealReady] = useState(false);
  useScrollReveal(revealReady);

  const handleLoaderComplete = () => {
    setContentVisible(true);
    setTimeout(() => {
      setShowLoader(false);
      setRevealReady(true);
    }, 600);
  };

  const skillsRef = useRef<HTMLDivElement>(null);
  const [skillsVisible, setSkillsVisible] = useState(false);
  useEffect(() => {
    const el = skillsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setSkillsVisible(true);
      },
      { threshold: 0.25 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const navCls = (id: string) =>
    `hover:text-brand transition-colors ${activeSection === id ? "text-brand" : ""}`;

  return (
    <div className="min-h-screen bg-background text-foreground font-mono">
      {showLoader && <PageLoader onComplete={handleLoaderComplete} />}
      <div className={`transition-opacity duration-700 ${contentVisible ? "opacity-100" : "opacity-0"}`}>
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 border-b border-brand/20 bg-background/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-2.5 rounded-full bg-brand glow-sm" />
            <div className="font-bold text-xs sm:text-sm tracking-tighter uppercase">
              SYS_ARCH // G.KANNAN<span className="text-brand cursor-blink">_</span>
            </div>
          </div>
          <div className="hidden md:flex gap-5 text-[11px] font-medium tracking-[0.18em] text-muted">
            <a href="#root" className={navCls("root")}>[ 01_ROOT ]</a>
            <a href="#projects" className={navCls("projects")}>[ 02_PROJECTS ]</a>
            <a href="#history" className={navCls("history")}>[ 03_LOGS ]</a>
            <a href="#stack" className={navCls("stack")}>[ 04_STACK ]</a>
            <a href="#connect" className={navCls("connect")}>[ 05_CONNECT ]</a>
          </div>
          <div className="text-[10px] bg-brand/10 px-2.5 py-1 border border-brand/20 rounded text-brand tracking-widest">
            {time} RIYADH
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
              <div className="mb-6 text-brand/70 text-xs">
                $ identity --fetch --role="Technical Architect"
              </div>
              <h1 className="font-display font-bold leading-[0.85] tracking-tighter text-5xl sm:text-7xl md:text-8xl mb-8 glow-lg">
                TECHNICAL<br />
                <span className="text-brand italic">ARCHITECT_</span>
              </h1>
              <div className="max-w-2xl text-sm sm:text-base md:text-lg text-muted leading-relaxed mb-10 space-y-1">
                <p>&gt; Initializing OutSystems core...</p>
                <p>&gt; Architecting fintech &amp; banking platforms...</p>
                <p>&gt; Mentoring engineering teams since 2015.</p>
              </div>
              <div className="flex flex-wrap gap-3 mb-8">
                <div className="px-3 py-1.5 bg-brand/5 border border-brand/30 text-[10px] sm:text-[11px] text-brand tracking-widest">
                  STATUS: AVAILABLE
                </div>
                <div className="px-3 py-1.5 bg-white/5 border border-border text-[10px] sm:text-[11px] text-muted tracking-widest">
                  LOC: RIYADH_KSA
                </div>
                <div className="px-3 py-1.5 bg-white/5 border border-border text-[10px] sm:text-[11px] text-muted tracking-widest">
                  EXP: 8+_YEARS
                </div>
                <div className="px-3 py-1.5 bg-white/5 border border-border text-[10px] sm:text-[11px] text-muted tracking-widest">
                  CERT: 5×_OUTSYSTEMS
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <a
                  href="#connect"
                  className="inline-flex items-center gap-2 bg-brand text-brand-foreground px-5 py-3 text-xs font-bold tracking-widest uppercase hover:opacity-90 transition-opacity"
                >
                  &gt; Initiate Contact
                </a>
                <a
                  href="#projects"
                  className="inline-flex items-center gap-2 border border-border px-5 py-3 text-xs font-bold tracking-widest uppercase text-foreground hover:border-brand/50 hover:text-brand transition-colors"
                >
                  ./view_projects
                </a>
                <a
                  href="/cv.pdf"
                  download
                  className="inline-flex items-center gap-2 border border-brand/30 px-5 py-3 text-xs font-bold tracking-widest uppercase text-brand/70 hover:border-brand hover:text-brand transition-colors"
                >
                  ↓ Download_CV
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
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-brand">
                  README.md
                </h2>
              </div>
              <p className="text-xs text-muted tracking-widest uppercase mb-8">
                // Operator briefing
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="border border-border p-4 bg-surface/30 hover:border-brand/30 transition-colors">
                  <p className="text-2xl font-bold font-display text-brand leading-none">8+</p>
                  <p className="text-[10px] text-muted tracking-widest uppercase mt-2">Years_Exp</p>
                </div>
                <div className="border border-border p-4 bg-surface/30 hover:border-brand/30 transition-colors">
                  <p className="text-2xl font-bold font-display text-brand leading-none">5×</p>
                  <p className="text-[10px] text-muted tracking-widest uppercase mt-2">OS_Certified</p>
                </div>
                <div className="border border-border p-4 bg-surface/30 hover:border-brand/30 transition-colors">
                  <p className="text-2xl font-bold font-display text-brand leading-none">7</p>
                  <p className="text-[10px] text-muted tracking-widest uppercase mt-2">Companies</p>
                </div>
                <div className="border border-border p-4 bg-surface/30 hover:border-brand/30 transition-colors">
                  <p className="text-2xl font-bold font-display text-brand leading-none">2</p>
                  <p className="text-[10px] text-muted tracking-widest uppercase mt-2">Countries</p>
                </div>
              </div>
            </div>
            <div className="lg:col-span-8 space-y-6 text-sm sm:text-base text-muted leading-relaxed" data-reveal data-delay="150">
              <p>
                Technical Architect with <span className="text-foreground">8+ years</span> designing and
                delivering enterprise-grade applications across banking, financial services, insurance and
                digital transformation initiatives.
              </p>
              <p>
                Specialized in <span className="text-foreground">OutSystems architecture</span>, enterprise
                integrations, mobile solutions, and full-stack development — with proven expertise in solution
                design, performance optimization, and technical leadership.
              </p>
              <p>
                Recognized for leading complex initiatives under tight deadlines, mentoring engineering teams,
                and translating business requirements into scalable technical solutions that drive measurable
                outcomes.
              </p>
            </div>
          </div>
        </section>

        {/* Projects */}
        <section id="projects" className="max-w-7xl mx-auto px-4 sm:px-6 mb-24 sm:mb-32">
          <div className="flex items-center gap-4 mb-10" data-reveal>
            <div className="size-2 bg-brand glow-sm shrink-0" />
            <h2 className="text-base sm:text-xl font-bold uppercase tracking-widest whitespace-nowrap">
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
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={p.image}
                    alt={`${p.title} project visual`}
                    width={1280}
                    height={800}
                    loading="lazy"
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                  />
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
            <div className="lg:col-span-8 border border-border p-6 sm:p-8 bg-surface/20" data-reveal>
              <div className="flex items-center gap-3 mb-10">
                <div className="size-2 bg-brand glow-sm" />
                <h2 className="text-base sm:text-xl font-bold uppercase tracking-widest">
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
                    <div className="text-xs text-brand/40 pt-1 font-bold shrink-0 w-6">{e.id}</div>
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
                          <li key={i} className="text-xs sm:text-sm text-muted leading-relaxed flex gap-2">
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
              <div ref={skillsRef} className="border border-brand/20 p-5 sm:p-6 bg-brand/5" data-reveal>
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

              {Object.entries(stack).map(([group, items], i) => (
                <div key={group} className="border border-border p-5" data-reveal data-delay={String((i + 1) * 100)}>
                  <h3 className="text-[11px] font-bold text-muted uppercase tracking-widest mb-3">
                    _{group.replace(/ /g, "_")}
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {items.map((t) => (
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
                  <li key={c} className="text-sm text-muted flex gap-2.5 leading-snug">
                    <span className="text-brand/60 shrink-0 mt-0.5">▣</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-6">
              <div className="border border-border p-6 sm:p-8 bg-surface/20" data-reveal data-delay="150">
                <div className="flex items-center gap-3 mb-6">
                  <div className="size-2 bg-brand glow-sm" />
                  <h2 className="text-base font-bold uppercase tracking-widest">Education.edu</h2>
                </div>
                <div>
                  <h3 className="text-base font-bold font-display">
                    Master of Computer Applications (MCA)
                  </h3>
                  <p className="text-[11px] text-brand/70 mt-1 tracking-widest uppercase">
                    @ Jaya College of Arts &amp; Science
                  </p>
                  <p className="text-xs text-muted mt-1 tracking-widest">2015 — 2017</p>
                </div>
              </div>

              <div className="border border-border p-6 sm:p-8 bg-surface/20" data-reveal data-delay="200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="size-2 bg-brand glow-sm" />
                  <h2 className="text-base font-bold uppercase tracking-widest">Awards.log</h2>
                </div>
                <ul className="space-y-3">
                  <li className="text-sm text-muted flex gap-2.5">
                    <span className="text-brand/60 shrink-0">★</span>
                    <span><span className="text-foreground">Laurel Award</span> — Mphasis</span>
                  </li>
                  <li className="text-sm text-muted flex gap-2.5">
                    <span className="text-brand/60 shrink-0">★</span>
                    <span>
                      <span className="text-foreground">Best Team Player Award</span> — Neutrinos
                    </span>
                  </li>
                </ul>
              </div>

              <div className="border border-border p-6 sm:p-8 bg-surface/20" data-reveal data-delay="300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="size-2 bg-brand glow-sm" />
                  <h2 className="text-base font-bold uppercase tracking-widest">Languages.cfg</h2>
                </div>
                <ul className="space-y-2 text-sm text-muted">
                  <li className="flex justify-between border-b border-border pb-2">
                    <span className="text-foreground">Tamil</span>
                    <span className="text-[10px] tracking-widest uppercase">Native</span>
                  </li>
                  <li className="flex justify-between border-b border-border pb-2">
                    <span className="text-foreground">English</span>
                    <span className="text-[10px] tracking-widest uppercase">Professional</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-foreground">Arabic</span>
                    <span className="text-[10px] tracking-widest uppercase">Elementary</span>
                  </li>
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
              <h2 className="text-3xl sm:text-5xl md:text-6xl font-display font-bold mb-8 tracking-tighter">
                INITIATE_COLLABORATION_
              </h2>
              <a
                href="mailto:developergeekay@gmail.com"
                className="text-brand hover:opacity-80 transition-opacity text-lg sm:text-2xl md:text-3xl underline decoration-brand/30 underline-offset-8 break-words"
              >
                developergeekay@gmail.com
              </a>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 max-w-4xl mx-auto">
              <a
                href="mailto:developergeekay@gmail.com"
                data-reveal
                className="border border-border p-5 hover:border-brand/40 transition-colors group"
              >
                <p className="text-[10px] tracking-widest text-muted uppercase mb-2">_email</p>
                <p className="text-xs text-foreground group-hover:text-brand transition-colors break-words leading-relaxed">
                  developergeekay<br />@gmail.com
                </p>
              </a>
              <a
                href="tel:+966503303578"
                data-reveal
                data-delay="100"
                className="border border-border p-5 hover:border-brand/40 transition-colors group"
              >
                <p className="text-[10px] tracking-widest text-muted uppercase mb-2">_phone</p>
                <p className="text-sm text-foreground group-hover:text-brand transition-colors">
                  +966 50 330 3578
                </p>
              </a>
              <a
                href="https://linkedin.com/in/developer-geekay"
                target="_blank"
                rel="noreferrer"
                data-reveal
                data-delay="200"
                className="border border-border p-5 hover:border-brand/40 transition-colors group"
              >
                <p className="text-[10px] tracking-widest text-muted uppercase mb-2">_linkedin</p>
                <p className="text-sm text-foreground group-hover:text-brand transition-colors">
                  /in/developergeekay
                </p>
              </a>
              <a
                href="https://github.com/developergeekay"
                target="_blank"
                rel="noreferrer"
                data-reveal
                data-delay="300"
                className="border border-border p-5 hover:border-brand/40 transition-colors group"
              >
                <p className="text-[10px] tracking-widest text-muted uppercase mb-2">_github</p>
                <p className="text-sm text-foreground group-hover:text-brand transition-colors">
                  /developergeekay
                </p>
              </a>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-4 py-8 border-t border-border text-[10px] text-muted uppercase tracking-[0.2em]">
              <div className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-brand glow-sm" />
                LINK_ESTABLISHED: RIYADH_NODE_01
              </div>
              <div>© 2026 G.KANNAN // ALL_RIGHTS_RESERVED</div>
              <div className="flex gap-4">
                <a
                  href="https://github.com/developergeekay"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-brand transition-colors"
                >
                  GITHUB
                </a>
                <a
                  href="https://www.linkedin.com/in/developer-geekay"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-brand transition-colors"
                >
                  LINKEDIN
                </a>
                <a href="mailto:developergeekay@gmail.com" className="hover:text-brand transition-colors">
                  EMAIL
                </a>
              </div>
            </div>
          </div>
        </footer>
      </main>
      </div>
    </div>
  );
}

export default Index;
