import { dbConnect } from "./db/client";
import { Portfolio } from "./db/schema";
import { portfolioPageDataSchema, type PortfolioPageData } from "./shared/portfolio.schema";

function safeSort<T extends { sortOrder?: number }>(arr: T[]): T[] {
  if (!Array.isArray(arr)) return [];
  return [...arr].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

export async function getPortfolio(): Promise<PortfolioPageData> {
  await dbConnect();
  const doc = await Portfolio.findOne().lean();
  if (!doc) throw new Error("Portfolio data not found. Run: npm run db:seed");
  const data = portfolioPageDataSchema.parse(doc.data);
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
  await dbConnect();
  await Portfolio.findOneAndUpdate({}, { data: validated }, { upsert: true });
  return validated;
}
