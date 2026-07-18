import { dbConnect } from "./db/client";
import { readPortfolioSections, writePortfolio, LIST_SECTIONS } from "./db/portfolio-store";
import { migrateLegacyPortfolioIfNeeded } from "./server/services/portfolio.migration.server";
import { portfolioPageDataSchema, type PortfolioPageData } from "./shared/portfolio.schema";

function safeSort<T extends { sortOrder?: number }>(arr: T[]): T[] {
  if (!Array.isArray(arr)) return [];
  return [...arr].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

export async function getPortfolio(): Promise<PortfolioPageData> {
  await dbConnect();

  let assembled = await readPortfolioSections();
  if (!assembled) {
    // empty store — migrate the legacy single-document blob if one exists
    const migrated = await migrateLegacyPortfolioIfNeeded();
    if (migrated) assembled = await readPortfolioSections();
    if (!assembled) throw new Error("Portfolio data not found. Run: npm run db:seed");
  }

  const data = portfolioPageDataSchema.parse(assembled);
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

  // keyed storage would silently collapse duplicate ids (last wins) —
  // reject them explicitly instead
  for (const { key } of LIST_SECTIONS) {
    const ids = (validated[key] as Array<{ id: string }>).map((i) => i.id);
    if (new Set(ids).size !== ids.length) {
      throw new Error(`Duplicate id in "${key}" — every item needs a unique id.`);
    }
  }

  await dbConnect();
  await writePortfolio(validated);
  return validated;
}
