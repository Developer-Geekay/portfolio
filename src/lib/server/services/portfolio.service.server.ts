import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

import { type PortfolioPageData, portfolioPageDataSchema } from "../../shared/portfolio.schema";

const DATA_FILE = resolve(process.cwd(), "data/portfolio.json");

function sortPortfolio(data: PortfolioPageData): PortfolioPageData {
  return {
    ...data,
    projects: [...data.projects].sort((a, b) => a.sortOrder - b.sortOrder),
    experience: [...data.experience].sort((a, b) => a.sortOrder - b.sortOrder),
    stack: [...data.stack].sort((a, b) => a.sortOrder - b.sortOrder),
    certifications: [...data.certifications].sort((a, b) => a.sortOrder - b.sortOrder),
    proficiency: [...data.proficiency].sort((a, b) => a.sortOrder - b.sortOrder),
    awards: [...data.awards].sort((a, b) => a.sortOrder - b.sortOrder),
    languages: [...data.languages].sort((a, b) => a.sortOrder - b.sortOrder),
  };
}

export async function getPortfolioData(): Promise<PortfolioPageData> {
  const raw = await readFile(DATA_FILE, "utf8");
  return sortPortfolio(portfolioPageDataSchema.parse(JSON.parse(raw)));
}

export async function savePortfolioData(input: PortfolioPageData): Promise<PortfolioPageData> {
  const data = sortPortfolio(portfolioPageDataSchema.parse(input));
  await mkdir(dirname(DATA_FILE), { recursive: true });
  await writeFile(DATA_FILE, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  return data;
}
