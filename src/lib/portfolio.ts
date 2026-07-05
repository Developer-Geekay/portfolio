import { db } from "./db/client";
import { portfolioPageDataSchema, type PortfolioPageData } from "./shared/portfolio.schema";

type PortfolioRow = { id: number; data: string; updated_at: string };

function safeSort<T extends { sortOrder?: number }>(arr: T[]): T[] {
  if (!Array.isArray(arr)) return [];
  return [...arr].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

export async function getPortfolio(): Promise<PortfolioPageData> {
  const row = db.prepare("SELECT * FROM portfolio WHERE id = 1").get() as PortfolioRow | undefined;
  if (!row) throw new Error("Portfolio data not found. Run: npm run db:seed");
  const data = portfolioPageDataSchema.parse(JSON.parse(row.data));
  return {
    ...data,
    projects: safeSort(data.projects),
    experience: safeSort(data.experience),
    stack: safeSort(data.stack),
    certifications: safeSort(data.certifications),
    proficiency: safeSort(data.proficiency),
    awards: safeSort(data.awards),
    languages: safeSort(data.languages),
  };
}

export async function savePortfolio(input: unknown): Promise<PortfolioPageData> {
  const validated = portfolioPageDataSchema.parse(input);
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO portfolio (id, data, updated_at) VALUES (1, ?, ?)
     ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at`,
  ).run(JSON.stringify(validated), now);
  return validated;
}
