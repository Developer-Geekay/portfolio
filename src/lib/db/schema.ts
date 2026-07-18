import mongoose, { Schema, type Model } from "mongoose";
import type {
  Project,
  Experience,
  StackGroup,
  Certification,
  Proficiency,
  Award,
  Language,
  Header,
  Profile,
  Hero,
  Education,
  Contact,
  Seo,
  UiText,
} from "../shared/portfolio.schema";

export type PostDoc = {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  excerpt: string;
  content: string;
  published: boolean;
};

const postSchema = new Schema<PostDoc>(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    date: { type: String, required: true },
    tags: { type: [String], default: [] },
    excerpt: { type: String, default: "" },
    content: { type: String, default: "" },
    published: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const Post: Model<PostDoc> =
  (mongoose.models.Post as Model<PostDoc>) ?? mongoose.model<PostDoc>("Post", postSchema);

export type PageViewDoc = {
  day: string; // YYYY-MM-DD (UTC)
  ip: string;
  browser: string;
  os: string;
  path: string;
  at: Date;
};

const pageViewSchema = new Schema<PageViewDoc>({
  day: { type: String, required: true, index: true },
  ip: { type: String, default: "unknown" },
  browser: { type: String, default: "Unknown" },
  os: { type: String, default: "Unknown" },
  path: { type: String, default: "/" },
  at: { type: Date, default: () => new Date() },
});

export const PageView: Model<PageViewDoc> =
  (mongoose.models.PageView as Model<PageViewDoc>) ??
  mongoose.model<PageViewDoc>("PageView", pageViewSchema, "analytics_pageviews");

// ── Portfolio: one collection per section ──────────────────────────────────
// Field types mirror the zod schemas in ../shared/portfolio.schema.ts, which
// remain the single source of business validation; Mongoose only enforces
// shape + the unique keys used for upserts.

function defineModel<T>(name: string, collection: string, definition: Record<string, unknown>): Model<T> {
  const existing = mongoose.models[name] as Model<T> | undefined;
  if (existing) return existing;
  return mongoose.model<T>(
    name,
    new Schema<T>(definition as never, { collection, timestamps: true, minimize: false }),
  );
}

// list sections — docs keyed by the app-level string `id`
export const PortfolioProject = defineModel<Project>("PortfolioProject", "portfolio_projects", {
  id: { type: String, required: true, unique: true },
  code: String,
  title: String,
  client: String,
  year: String,
  blurb: String,
  imageKey: String,
  tags: [String],
  link: String,
  featured: Boolean,
  sortOrder: Number,
});

export const PortfolioExperience = defineModel<Experience>("PortfolioExperience", "portfolio_experiences", {
  id: { type: String, required: true, unique: true },
  role: String,
  company: String,
  location: String,
  period: String,
  current: Boolean,
  bullets: [String],
  sortOrder: Number,
});

export const PortfolioStackGroup = defineModel<StackGroup>("PortfolioStackGroup", "portfolio_stack_groups", {
  id: { type: String, required: true, unique: true },
  label: String,
  items: [String],
  sortOrder: Number,
});

export const PortfolioCertification = defineModel<Certification>(
  "PortfolioCertification",
  "portfolio_certifications",
  {
    id: { type: String, required: true, unique: true },
    title: String,
    sortOrder: Number,
  },
);

export const PortfolioProficiency = defineModel<Proficiency>("PortfolioProficiency", "portfolio_proficiencies", {
  id: { type: String, required: true, unique: true },
  label: String,
  value: Number,
  sortOrder: Number,
});

export const PortfolioAward = defineModel<Award>("PortfolioAward", "portfolio_awards", {
  id: { type: String, required: true, unique: true },
  title: String,
  issuer: String,
  sortOrder: Number,
});

export const PortfolioLanguage = defineModel<Language>("PortfolioLanguage", "portfolio_languages", {
  id: { type: String, required: true, unique: true },
  name: String,
  level: String,
  sortOrder: Number,
});

// singleton sections — exactly one doc per collection
export const PortfolioHeader = defineModel<Header>("PortfolioHeader", "portfolio_header", {
  logoText: String,
  timezone: String,
  timeLabel: String,
  nodeLabel: String,
  bootNode: String,
});

export const PortfolioProfile = defineModel<Profile>("PortfolioProfile", "portfolio_profile", {
  name: String,
  role: String,
  location: String,
  timezone: String,
  availability: String,
  about: [String],
  stats: [{ _id: false, label: String, value: Number, suffix: String }],
});

export const PortfolioHero = defineModel<Hero>("PortfolioHero", "portfolio_hero", {
  line1: String,
  line2: String,
  typewriter: {
    lines: [String],
    speedMs: Number,
    linePauseMs: Number,
  },
  command: String,
  introLines: [String],
  badges: [{ _id: false, label: String, tone: String }],
  primaryActionLabel: String,
  secondaryActionLabel: String,
  cvLabel: String,
});

export const PortfolioEducation = defineModel<Education>("PortfolioEducation", "portfolio_education", {
  degree: String,
  institution: String,
  period: String,
});

export const PortfolioContact = defineModel<Contact>("PortfolioContact", "portfolio_contact", {
  email: String,
  phone: String,
  linkedinUrl: String,
  linkedinLabel: String,
  githubUrl: String,
  githubLabel: String,
});

export const PortfolioSeo = defineModel<Seo>("PortfolioSeo", "portfolio_seo", {
  title: String,
  description: String,
  ogTitle: String,
  ogDescription: String,
});

export const PortfolioUiText = defineModel<UiText>("PortfolioUiText", "portfolio_ui_text", {
  bootLines: [{ _id: false, text: String, type: String }],
  navLabels: {
    root: String,
    projects: String,
    logs: String,
    blog: String,
    connect: String,
  },
  sectionTitles: {
    workLog: String,
    careerHistory: String,
    currentDependencies: String,
    certifications: String,
    education: String,
    awards: String,
    languages: String,
    collaboration: String,
  },
  contactActions: [{ _id: false, index: String, label: String, action: String }],
  footerText: String,
});
