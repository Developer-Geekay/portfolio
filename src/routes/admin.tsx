import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";

import type { PortfolioPageData } from "@/lib/shared/portfolio.schema";

export const Route = createFileRoute("/admin")({
  component: AdminPortal,
});

// ── helpers ──────────────────────────────────────────────────────────────────

const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}`;

const splitLines = (s: string) =>
  s.split("\n").map((l) => l.trim()).filter(Boolean);

const splitCsv = (s: string) =>
  s.split(",").map((l) => l.trim()).filter(Boolean);

async function fetchPortfolio(): Promise<PortfolioPageData> {
  const res = await fetch("/api/portfolio");
  if (!res.ok) throw new Error(`Server returned ${res.status}`);
  return res.json() as Promise<PortfolioPageData>;
}

async function postPortfolio(data: PortfolioPageData): Promise<PortfolioPageData> {
  const res = await fetch("/api/portfolio", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(body.message ?? `Server returned ${res.status}`);
  }
  return res.json() as Promise<PortfolioPageData>;
}

// ── tiny field components ─────────────────────────────────────────────────────

function F({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] uppercase tracking-widest text-muted">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-brand"
      />
    </label>
  );
}

function T({
  label,
  value,
  onChange,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] uppercase tracking-widest text-muted">
        {label}
      </span>
      <textarea
        value={value}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        className="w-full resize-y border border-border bg-background px-3 py-2 text-sm leading-relaxed text-foreground outline-none focus:border-brand"
      />
    </label>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-4 border border-border bg-surface/20 p-5">{children}</div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-bold uppercase tracking-widest text-brand">{children}</h2>
  );
}

function BtnAdd({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="border border-brand/40 px-4 py-2 text-xs uppercase tracking-widest text-brand hover:bg-brand hover:text-brand-foreground"
    >
      {label}
    </button>
  );
}

function BtnRemove({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-xs uppercase tracking-widest text-red-400 hover:text-red-200"
    >
      Remove
    </button>
  );
}

// ── section renderers ─────────────────────────────────────────────────────────

function HeaderSection({
  data,
  set,
}: {
  data: PortfolioPageData;
  set: (fn: (d: PortfolioPageData) => PortfolioPageData) => void;
}) {
  const h = data.header;
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card>
        <SectionTitle>Header</SectionTitle>
        <F label="Logo text" value={h.logoText} onChange={(v) => set((d) => ({ ...d, header: { ...d.header, logoText: v } }))} />
        <F label="Timezone (IANA)" value={h.timezone} onChange={(v) => set((d) => ({ ...d, header: { ...d.header, timezone: v }, profile: { ...d.profile, timezone: v } }))} />
        <F label="Clock label" value={h.timeLabel} onChange={(v) => set((d) => ({ ...d, header: { ...d.header, timeLabel: v } }))} />
      </Card>
      <Card>
        <SectionTitle>Runtime Labels</SectionTitle>
        <F label="Boot node" value={h.bootNode} onChange={(v) => set((d) => ({ ...d, header: { ...d.header, bootNode: v } }))} />
        <F label="Footer node" value={h.nodeLabel} onChange={(v) => set((d) => ({ ...d, header: { ...d.header, nodeLabel: v } }))} />
        <p className="text-xs leading-relaxed text-muted">
          Use IANA timezone e.g. Asia/Riyadh, Asia/Kolkata, Europe/London.
        </p>
      </Card>
    </div>
  );
}

function ProfileSection({
  data,
  set,
}: {
  data: PortfolioPageData;
  set: (fn: (d: PortfolioPageData) => PortfolioPageData) => void;
}) {
  const p = data.profile;
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card>
        <SectionTitle>Profile</SectionTitle>
        <F label="Name" value={p.name} onChange={(v) => set((d) => ({ ...d, profile: { ...d.profile, name: v } }))} />
        <F label="Role" value={p.role} onChange={(v) => set((d) => ({ ...d, profile: { ...d.profile, role: v } }))} />
        <F label="Location" value={p.location} onChange={(v) => set((d) => ({ ...d, profile: { ...d.profile, location: v } }))} />
        <F label="Timezone" value={p.timezone} onChange={(v) => set((d) => ({ ...d, profile: { ...d.profile, timezone: v }, header: { ...d.header, timezone: v } }))} />
        <T label="About (one paragraph per line)" value={p.about.join("\n")} onChange={(v) => set((d) => ({ ...d, profile: { ...d.profile, about: splitLines(v) } }))} />
      </Card>
      <Card>
        <SectionTitle>Hero &amp; SEO</SectionTitle>
        <T
          label="Typewriter lines (one per line)"
          value={data.hero.typewriter.lines.length ? data.hero.typewriter.lines.join("\n") : [data.hero.line1, data.hero.line2].filter(Boolean).join("\n")}
          onChange={(v) => {
            const next = v.split("\n");
            const nonEmpty = next.filter((l) => l.trim());
            set((d) => ({
              ...d,
              hero: {
                ...d.hero,
                line1: nonEmpty[0] ?? "",
                line2: nonEmpty[1] ?? "",
                typewriter: { ...d.hero.typewriter, lines: next },
              },
            }));
          }}
          rows={3}
        />
        <div className="grid grid-cols-2 gap-4">
          <F label="Type speed ms" type="number" value={data.hero.typewriter.speedMs} onChange={(v) => set((d) => ({ ...d, hero: { ...d.hero, typewriter: { ...d.hero.typewriter, speedMs: Number(v) } } }))} />
          <F label="Phrase hold ms" type="number" value={data.hero.typewriter.linePauseMs} onChange={(v) => set((d) => ({ ...d, hero: { ...d.hero, typewriter: { ...d.hero.typewriter, linePauseMs: Number(v) } } }))} />
        </div>
        <T label="Intro lines (one per line)" value={data.hero.introLines.join("\n")} onChange={(v) => set((d) => ({ ...d, hero: { ...d.hero, introLines: splitLines(v) } }))} />
        <F label="SEO title" value={data.seo.title} onChange={(v) => set((d) => ({ ...d, seo: { ...d.seo, title: v } }))} />
        <T label="SEO description" value={data.seo.description} onChange={(v) => set((d) => ({ ...d, seo: { ...d.seo, description: v } }))} />
      </Card>
    </div>
  );
}

function ProjectsSection({
  data,
  set,
}: {
  data: PortfolioPageData;
  set: (fn: (d: PortfolioPageData) => PortfolioPageData) => void;
}) {
  return (
    <div className="space-y-4">
      <BtnAdd
        label="Add Project"
        onClick={() =>
          set((d) => ({
            ...d,
            projects: [
              ...d.projects,
              {
                id: uid("project"),
                code: "NEW.PROJ",
                title: "New Project",
                client: "Client",
                year: String(new Date().getFullYear()),
                blurb: "Project summary",
                imageKey: "banking",
                tags: ["OutSystems"],
                link: "",
                featured: true,
                sortOrder: d.projects.length * 10 + 10,
              },
            ],
          }))
        }
      />
      {data.projects.map((proj, idx) => (
        <article key={proj.id} className="grid gap-4 border border-border bg-surface/20 p-5 lg:grid-cols-3">
          <F label="Code" value={proj.code} onChange={(v) => set((d) => ({ ...d, projects: d.projects.map((p) => p.id === proj.id ? { ...p, code: v } : p) }))} />
          <F label="Title" value={proj.title} onChange={(v) => set((d) => ({ ...d, projects: d.projects.map((p) => p.id === proj.id ? { ...p, title: v } : p) }))} />
          <F label="Client" value={proj.client} onChange={(v) => set((d) => ({ ...d, projects: d.projects.map((p) => p.id === proj.id ? { ...p, client: v } : p) }))} />
          <F label="Year" value={proj.year} onChange={(v) => set((d) => ({ ...d, projects: d.projects.map((p) => p.id === proj.id ? { ...p, year: v } : p) }))} />
          <F label="Image key" value={proj.imageKey} onChange={(v) => set((d) => ({ ...d, projects: d.projects.map((p) => p.id === proj.id ? { ...p, imageKey: v } : p) }))} />
          <F label="Sort order" type="number" value={proj.sortOrder} onChange={(v) => set((d) => ({ ...d, projects: d.projects.map((p) => p.id === proj.id ? { ...p, sortOrder: Number(v) } : p) }))} />
          <div className="lg:col-span-2">
            <T label="Blurb" value={proj.blurb} onChange={(v) => set((d) => ({ ...d, projects: d.projects.map((p) => p.id === proj.id ? { ...p, blurb: v } : p) }))} />
          </div>
          <T label="Tags (comma separated)" value={proj.tags.join(", ")} onChange={(v) => set((d) => ({ ...d, projects: d.projects.map((p) => p.id === proj.id ? { ...p, tags: splitCsv(v) } : p) }))} />
          <div className="flex items-center justify-between lg:col-span-3">
            <span className="text-xs text-muted">Project #{idx + 1}</span>
            <BtnRemove onClick={() => set((d) => ({ ...d, projects: d.projects.filter((p) => p.id !== proj.id) }))} />
          </div>
        </article>
      ))}
    </div>
  );
}

function ExperienceSection({
  data,
  set,
}: {
  data: PortfolioPageData;
  set: (fn: (d: PortfolioPageData) => PortfolioPageData) => void;
}) {
  return (
    <div className="space-y-4">
      <BtnAdd
        label="Add Experience"
        onClick={() =>
          set((d) => ({
            ...d,
            experience: [
              ...d.experience,
              {
                id: String(d.experience.length + 1).padStart(2, "0"),
                role: "New Role",
                company: "Company",
                location: "Location",
                period: "2026 - PRESENT",
                current: false,
                bullets: ["Key responsibility"],
                sortOrder: d.experience.length * 10 + 10,
              },
            ],
          }))
        }
      />
      {data.experience.map((exp) => (
        <article key={exp.id} className="grid gap-4 border border-border bg-surface/20 p-5 lg:grid-cols-3">
          <F label="ID" value={exp.id} onChange={(v) => set((d) => ({ ...d, experience: d.experience.map((e) => e.id === exp.id ? { ...e, id: v } : e) }))} />
          <F label="Role" value={exp.role} onChange={(v) => set((d) => ({ ...d, experience: d.experience.map((e) => e.id === exp.id ? { ...e, role: v } : e) }))} />
          <F label="Company" value={exp.company} onChange={(v) => set((d) => ({ ...d, experience: d.experience.map((e) => e.id === exp.id ? { ...e, company: v } : e) }))} />
          <F label="Location" value={exp.location} onChange={(v) => set((d) => ({ ...d, experience: d.experience.map((e) => e.id === exp.id ? { ...e, location: v } : e) }))} />
          <F label="Period" value={exp.period} onChange={(v) => set((d) => ({ ...d, experience: d.experience.map((e) => e.id === exp.id ? { ...e, period: v } : e) }))} />
          <F label="Sort order" type="number" value={exp.sortOrder} onChange={(v) => set((d) => ({ ...d, experience: d.experience.map((e) => e.id === exp.id ? { ...e, sortOrder: Number(v) } : e) }))} />
          <div className="lg:col-span-3">
            <T label="Bullets (one per line)" value={exp.bullets.join("\n")} onChange={(v) => set((d) => ({ ...d, experience: d.experience.map((e) => e.id === exp.id ? { ...e, bullets: splitLines(v) } : e) }))} />
          </div>
          <div className="flex items-center justify-between lg:col-span-3">
            <label className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted cursor-pointer">
              <input
                type="checkbox"
                checked={exp.current}
                onChange={(e) => set((d) => ({ ...d, experience: d.experience.map((ex) => ex.id === exp.id ? { ...ex, current: e.target.checked } : ex) }))}
              />
              Current role
            </label>
            <BtnRemove onClick={() => set((d) => ({ ...d, experience: d.experience.filter((e) => e.id !== exp.id) }))} />
          </div>
        </article>
      ))}
    </div>
  );
}

function StackSection({
  data,
  set,
}: {
  data: PortfolioPageData;
  set: (fn: (d: PortfolioPageData) => PortfolioPageData) => void;
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="space-y-4">
        <BtnAdd
          label="Add Stack Group"
          onClick={() =>
            set((d) => ({
              ...d,
              stack: [
                ...d.stack,
                { id: uid("stack"), label: "New Group", items: ["Skill"], sortOrder: d.stack.length * 10 + 10 },
              ],
            }))
          }
        />
        {data.stack.map((g) => (
          <Card key={g.id}>
            <F label="Label" value={g.label} onChange={(v) => set((d) => ({ ...d, stack: d.stack.map((s) => s.id === g.id ? { ...s, label: v } : s) }))} />
            <T label="Items (one per line)" value={g.items.join("\n")} onChange={(v) => set((d) => ({ ...d, stack: d.stack.map((s) => s.id === g.id ? { ...s, items: splitLines(v) } : s) }))} />
            <BtnRemove onClick={() => set((d) => ({ ...d, stack: d.stack.filter((s) => s.id !== g.id) }))} />
          </Card>
        ))}
      </div>
      <Card>
        <SectionTitle>Proficiency</SectionTitle>
        {data.proficiency.map((item) => (
          <div key={item.id} className="grid grid-cols-[1fr_80px] gap-3">
            <F label="Label" value={item.label} onChange={(v) => set((d) => ({ ...d, proficiency: d.proficiency.map((pr) => pr.id === item.id ? { ...pr, label: v } : pr) }))} />
            <F label="%" type="number" value={item.value} onChange={(v) => set((d) => ({ ...d, proficiency: d.proficiency.map((pr) => pr.id === item.id ? { ...pr, value: Number(v) } : pr) }))} />
          </div>
        ))}
      </Card>
    </div>
  );
}

function CertificationsSection({
  data,
  set,
}: {
  data: PortfolioPageData;
  set: (fn: (d: PortfolioPageData) => PortfolioPageData) => void;
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <Card>
        <SectionTitle>Certifications</SectionTitle>
        <T
          label="One per line"
          value={data.certifications.map((c) => c.title).join("\n")}
          onChange={(v) =>
            set((d) => ({
              ...d,
              certifications: splitLines(v).map((title, i) => ({
                id: d.certifications[i]?.id ?? uid("cert"),
                title,
                sortOrder: (i + 1) * 10,
              })),
            }))
          }
          rows={10}
        />
      </Card>
      <Card>
        <SectionTitle>Awards</SectionTitle>
        <T
          label="Title - Issuer (one per line)"
          value={data.awards.map((a) => `${a.title} - ${a.issuer}`).join("\n")}
          onChange={(v) =>
            set((d) => ({
              ...d,
              awards: splitLines(v).map((line, i) => {
                const [title = "", issuer = ""] = line.split(" - ");
                return { id: d.awards[i]?.id ?? uid("award"), title: title.trim(), issuer: issuer.trim() || "Issuer", sortOrder: (i + 1) * 10 };
              }),
            }))
          }
          rows={10}
        />
      </Card>
      <Card>
        <SectionTitle>Languages</SectionTitle>
        <T
          label="Name - Level (one per line)"
          value={data.languages.map((l) => `${l.name} - ${l.level}`).join("\n")}
          onChange={(v) =>
            set((d) => ({
              ...d,
              languages: splitLines(v).map((line, i) => {
                const [name = "", level = ""] = line.split(" - ");
                return { id: d.languages[i]?.id ?? uid("lang"), name: name.trim(), level: level.trim() || "Level", sortOrder: (i + 1) * 10 };
              }),
            }))
          }
          rows={10}
        />
      </Card>
    </div>
  );
}

function ContactSection({
  data,
  set,
}: {
  data: PortfolioPageData;
  set: (fn: (d: PortfolioPageData) => PortfolioPageData) => void;
}) {
  const c = data.contact;
  const ed = data.education;
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card>
        <SectionTitle>Contact</SectionTitle>
        <F label="Email" value={c.email} onChange={(v) => set((d) => ({ ...d, contact: { ...d.contact, email: v } }))} />
        <F label="Phone" value={c.phone} onChange={(v) => set((d) => ({ ...d, contact: { ...d.contact, phone: v } }))} />
        <F label="LinkedIn URL" value={c.linkedinUrl} onChange={(v) => set((d) => ({ ...d, contact: { ...d.contact, linkedinUrl: v } }))} />
        <F label="LinkedIn label" value={c.linkedinLabel} onChange={(v) => set((d) => ({ ...d, contact: { ...d.contact, linkedinLabel: v } }))} />
        <F label="GitHub URL" value={c.githubUrl} onChange={(v) => set((d) => ({ ...d, contact: { ...d.contact, githubUrl: v } }))} />
        <F label="GitHub label" value={c.githubLabel} onChange={(v) => set((d) => ({ ...d, contact: { ...d.contact, githubLabel: v } }))} />
      </Card>
      <Card>
        <SectionTitle>Education</SectionTitle>
        <F label="Degree" value={ed.degree} onChange={(v) => set((d) => ({ ...d, education: { ...d.education, degree: v } }))} />
        <F label="Institution" value={ed.institution} onChange={(v) => set((d) => ({ ...d, education: { ...d.education, institution: v } }))} />
        <F label="Period" value={ed.period} onChange={(v) => set((d) => ({ ...d, education: { ...d.education, period: v } }))} />
      </Card>
    </div>
  );
}

// ── nav tabs ──────────────────────────────────────────────────────────────────

type Section = "header" | "profile" | "projects" | "experience" | "stack" | "certifications" | "contact";

const SECTIONS: { id: Section; label: string }[] = [
  { id: "header", label: "Header" },
  { id: "profile", label: "Profile" },
  { id: "projects", label: "Projects" },
  { id: "experience", label: "Experience" },
  { id: "stack", label: "Stack" },
  { id: "certifications", label: "Certs" },
  { id: "contact", label: "Contact" },
];

// ── main component ────────────────────────────────────────────────────────────

function AdminPortal() {
  const [portfolio, setPortfolio] = useState<PortfolioPageData | null>(null);
  const [active, setActive] = useState<Section>("header");
  const [status, setStatus] = useState<"loading" | "error" | "idle" | "saving" | "saved">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [dirty, setDirty] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const load = useCallback(() => {
    setStatus("loading");
    setErrorMsg("");
    fetchPortfolio()
      .then((data) => {
        if (!mountedRef.current) return;
        setPortfolio(data);
        setDirty(false);
        setStatus("idle");
      })
      .catch((err: unknown) => {
        if (!mountedRef.current) return;
        setErrorMsg(err instanceof Error ? err.message : "Unknown error");
        setStatus("error");
      });
  }, []);

  useEffect(() => { load(); }, [load]);

  const set = useCallback((fn: (d: PortfolioPageData) => PortfolioPageData) => {
    setPortfolio((cur) => (cur ? fn(cur) : cur));
    setDirty(true);
    setStatus("idle");
  }, []);

  const save = async () => {
    if (!portfolio) return;
    setStatus("saving");
    try {
      const saved = await postPortfolio(portfolio);
      if (!mountedRef.current) return;
      setPortfolio(saved);
      setDirty(false);
      setStatus("saved");
      setTimeout(() => { if (mountedRef.current) setStatus("idle"); }, 2500);
    } catch (err: unknown) {
      if (!mountedRef.current) return;
      setErrorMsg(err instanceof Error ? err.message : "Save failed");
      setStatus("error");
    }
  };

  // ── loading ───────────────────────────────────────────────────────────────
  if (status === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background font-mono">
        <div className="border border-border bg-surface/30 px-8 py-6 text-center">
          <div className="mb-3 text-[10px] uppercase tracking-[0.3em] text-brand">Portfolio CMS</div>
          <p className="text-xs uppercase tracking-widest text-muted">Loading data...</p>
        </div>
      </main>
    );
  }

  // ── error ─────────────────────────────────────────────────────────────────
  if (status === "error" && !portfolio) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background font-mono">
        <div className="border border-red-500/40 bg-surface/30 px-8 py-6 text-center">
          <div className="mb-2 text-[10px] uppercase tracking-[0.3em] text-red-400">Load Failed</div>
          <p className="mb-4 text-xs text-muted">{errorMsg || "Could not reach /api/portfolio"}</p>
          <button
            type="button"
            onClick={load}
            className="border border-brand/40 px-4 py-2 text-xs uppercase tracking-widest text-brand hover:bg-brand hover:text-brand-foreground"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  if (!portfolio) return null;

  // ── editor ────────────────────────────────────────────────────────────────
  const statusLine =
    status === "saving" ? "Saving..."
    : status === "saved" ? "Saved."
    : status === "error" ? `Error: ${errorMsg}`
    : dirty ? "Unsaved changes"
    : "All changes saved";

  return (
    <main className="min-h-screen bg-background px-4 py-6 font-mono text-foreground sm:px-6">
      <div className="mx-auto max-w-7xl">

        {/* header bar */}
        <header className="mb-6 flex flex-col gap-4 border-b border-border pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-1 text-[10px] uppercase tracking-[0.3em] text-brand">Portfolio CMS</p>
            <h1 className="text-3xl font-bold font-display">Admin Portal</h1>
            <p className="mt-1 text-xs text-muted">
              {portfolio.projects.length} projects · {portfolio.experience.length} roles · {portfolio.stack.length} stack groups · {portfolio.certifications.length} certs
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/"
              className="inline-flex items-center justify-center border border-border px-4 py-2 text-xs uppercase tracking-widest text-foreground hover:border-brand hover:text-brand"
            >
              Preview
            </Link>
            <button
              type="button"
              onClick={() => void save()}
              disabled={status === "saving" || !dirty}
              className="inline-flex items-center justify-center bg-brand px-4 py-2 text-xs font-bold uppercase tracking-widest text-brand-foreground hover:opacity-90 disabled:opacity-40"
            >
              {status === "saving" ? "Saving..." : "Save"}
            </button>
          </div>
        </header>

        {/* section tabs */}
        <div className="mb-4 flex flex-wrap gap-2">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setActive(s.id)}
              className={`border px-3 py-2 text-[11px] uppercase tracking-widest transition-colors ${
                active === s.id
                  ? "border-brand bg-brand/10 text-brand"
                  : "border-border text-muted hover:border-brand/50 hover:text-foreground"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* status bar */}
        <p className={`mb-5 border px-4 py-2 text-xs ${status === "error" ? "border-red-500/40 text-red-400" : status === "saved" ? "border-brand/30 text-brand" : "border-border text-muted"}`}>
          {statusLine}
        </p>

        {/* section content */}
        {active === "header"         && <HeaderSection         data={portfolio} set={set} />}
        {active === "profile"        && <ProfileSection        data={portfolio} set={set} />}
        {active === "projects"       && <ProjectsSection       data={portfolio} set={set} />}
        {active === "experience"     && <ExperienceSection     data={portfolio} set={set} />}
        {active === "stack"          && <StackSection          data={portfolio} set={set} />}
        {active === "certifications" && <CertificationsSection data={portfolio} set={set} />}
        {active === "contact"        && <ContactSection        data={portfolio} set={set} />}
      </div>
    </main>
  );
}
