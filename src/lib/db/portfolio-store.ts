import type { Model } from "mongoose";
import type { PortfolioPageData } from "../shared/portfolio.schema";
import {
  PortfolioProject,
  PortfolioExperience,
  PortfolioStackGroup,
  PortfolioCertification,
  PortfolioProficiency,
  PortfolioAward,
  PortfolioLanguage,
  PortfolioHeader,
  PortfolioProfile,
  PortfolioHero,
  PortfolioEducation,
  PortfolioContact,
  PortfolioSeo,
  PortfolioUiText,
} from "./schema";

type ListKey = "projects" | "experience" | "stack" | "certifications" | "proficiency" | "awards" | "languages";
type SingletonKey = "header" | "profile" | "hero" | "education" | "contact" | "seo" | "uiText";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const LIST_SECTIONS: ReadonlyArray<{ key: ListKey; model: Model<any> }> = [
  { key: "projects", model: PortfolioProject },
  { key: "experience", model: PortfolioExperience },
  { key: "stack", model: PortfolioStackGroup },
  { key: "certifications", model: PortfolioCertification },
  { key: "proficiency", model: PortfolioProficiency },
  { key: "awards", model: PortfolioAward },
  { key: "languages", model: PortfolioLanguage },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const SINGLETON_SECTIONS: ReadonlyArray<{ key: SingletonKey; model: Model<any> }> = [
  { key: "header", model: PortfolioHeader },
  { key: "profile", model: PortfolioProfile },
  { key: "hero", model: PortfolioHero },
  { key: "education", model: PortfolioEducation },
  { key: "contact", model: PortfolioContact },
  { key: "seo", model: PortfolioSeo },
  { key: "uiText", model: PortfolioUiText },
];

// Raw (unvalidated) read of every section; caller zod-parses the result.
// Returns null when the store is empty (no singleton docs at all) so the
// caller can attempt legacy migration first.
export async function readPortfolioSections(): Promise<Record<string, unknown> | null> {
  const [listResults, singletonResults] = await Promise.all([
    Promise.all(LIST_SECTIONS.map(({ model }) => model.find().sort({ sortOrder: 1 }).lean())),
    Promise.all(SINGLETON_SECTIONS.map(({ model }) => model.findOne().lean())),
  ]);

  if (singletonResults.every((doc) => doc === null)) return null;

  const assembled: Record<string, unknown> = {};
  LIST_SECTIONS.forEach(({ key }, i) => {
    assembled[key] = listResults[i];
  });
  SINGLETON_SECTIONS.forEach(({ key }, i) => {
    // omit missing singletons so zod .default() (e.g. uiText, header) kicks in
    if (singletonResults[i] !== null) assembled[key] = singletonResults[i];
  });
  return assembled;
}

// Decomposes a zod-validated payload into per-collection writes.
//
// The Pi runs standalone mongod (no replica set), so multi-document
// transactions are unavailable. Instead: upserts before deletes, all writes
// idempotent — a torn write can leave stale extra list items but never
// missing data, and re-saving any full payload repairs the store.
export async function writePortfolio(validated: PortfolioPageData): Promise<void> {
  const listWrites = LIST_SECTIONS.map(async ({ key, model }) => {
    const items = validated[key] as Array<{ id: string }>;
    if (items.length > 0) {
      await model.bulkWrite(
        items.map((item) => ({
          replaceOne: { filter: { id: item.id }, replacement: item, upsert: true },
        })),
      );
    }
    await model.deleteMany({ id: { $nin: items.map((i) => i.id) } });
  });

  const singletonWrites = SINGLETON_SECTIONS.map(({ key, model }) =>
    model.replaceOne({}, validated[key] as object, { upsert: true }),
  );

  await Promise.all([...listWrites, ...singletonWrites]);
}
