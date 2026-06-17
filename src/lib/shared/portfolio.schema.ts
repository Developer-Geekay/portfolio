import { z } from "zod";

export const statSchema = z.object({
  label: z.string().min(1),
  value: z.number().int().nonnegative(),
  suffix: z.string(),
});

export const heroTypewriterSchema = z.object({
  lines: z.array(z.string()).default([]),
  speedMs: z.number().int().min(25).max(250).default(72),
  linePauseMs: z.number().int().min(0).max(5000).default(1600),
});

export const heroSchema = z
  .object({
    line1: z.string(),
    line2: z.string(),
    typewriter: heroTypewriterSchema.default({
      lines: [],
      speedMs: 72,
      linePauseMs: 1600,
    }),
    command: z.string().min(1),
    introLines: z.array(z.string().min(1)),
    badges: z.array(z.object({ label: z.string().min(1), tone: z.enum(["brand", "muted"]) })),
    primaryActionLabel: z.string().min(1),
    secondaryActionLabel: z.string().min(1),
    cvLabel: z.string().min(1),
  })
  .refine(
    (hero) => {
      const configuredLines = hero.typewriter.lines.filter((line) => line.trim().length > 0);
      return (
        configuredLines.length > 0 || hero.line1.trim().length > 0 || hero.line2.trim().length > 0
      );
    },
    {
      message: "At least one hero line is required.",
      path: ["typewriter", "lines"],
    },
  );

export const profileSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  location: z.string().min(1),
  timezone: z.string().min(1),
  availability: z.string().min(1),
  about: z.array(z.string().min(1)),
  stats: z.array(statSchema),
});

export const headerSchema = z.object({
  logoText: z.string().min(1).default(">_ GK"),
  timezone: z.string().min(1).default("Asia/Riyadh"),
  timeLabel: z.string().min(1).default("RIYADH"),
  nodeLabel: z.string().min(1).default("RIYADH_NODE_01"),
  bootNode: z.string().min(1).default("RIYADH_01"),
});

export const projectSchema = z.object({
  id: z.string().min(1),
  code: z.string().min(1),
  title: z.string().min(1),
  client: z.string().min(1),
  year: z.string().min(1),
  blurb: z.string().min(1),
  imageKey: z.string().min(1),
  tags: z.array(z.string().min(1)),
  link: z.string().url().optional().or(z.literal("")),
  featured: z.boolean(),
  sortOrder: z.number().int(),
});

export const experienceSchema = z.object({
  id: z.string().min(1),
  role: z.string().min(1),
  company: z.string().min(1),
  location: z.string().min(1),
  period: z.string().min(1),
  current: z.boolean(),
  bullets: z.array(z.string().min(1)),
  sortOrder: z.number().int(),
});

export const stackGroupSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  items: z.array(z.string().min(1)),
  sortOrder: z.number().int(),
});

export const certificationSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  sortOrder: z.number().int(),
});

export const proficiencySchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  value: z.number().int().min(0).max(100),
  sortOrder: z.number().int(),
});

export const educationSchema = z.object({
  degree: z.string().min(1),
  institution: z.string().min(1),
  period: z.string().min(1),
});

export const awardSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  issuer: z.string().min(1),
  sortOrder: z.number().int(),
});

export const languageSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  level: z.string().min(1),
  sortOrder: z.number().int(),
});

export const contactSchema = z.object({
  email: z.string().email(),
  phone: z.string().min(1),
  linkedinUrl: z.string().url(),
  linkedinLabel: z.string().min(1),
  githubUrl: z.string().url(),
  githubLabel: z.string().min(1),
});

export const seoSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  ogTitle: z.string().min(1),
  ogDescription: z.string().min(1),
});

export const portfolioPageDataSchema = z.object({
  header: headerSchema.default({
    logoText: ">_ GK",
    timezone: "Asia/Riyadh",
    timeLabel: "RIYADH",
    nodeLabel: "RIYADH_NODE_01",
    bootNode: "RIYADH_01",
  }),
  profile: profileSchema,
  hero: heroSchema,
  projects: z.array(projectSchema),
  experience: z.array(experienceSchema),
  stack: z.array(stackGroupSchema),
  certifications: z.array(certificationSchema),
  proficiency: z.array(proficiencySchema),
  education: educationSchema,
  awards: z.array(awardSchema),
  languages: z.array(languageSchema),
  contact: contactSchema,
  seo: seoSchema,
});

export type PortfolioPageData = z.infer<typeof portfolioPageDataSchema>;
export type Project = z.infer<typeof projectSchema>;
export type Experience = z.infer<typeof experienceSchema>;
