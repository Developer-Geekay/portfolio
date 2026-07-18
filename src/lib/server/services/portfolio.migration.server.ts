import mongoose from "mongoose";
import { portfolioPageDataSchema } from "../../shared/portfolio.schema";
import { writePortfolio } from "../../db/portfolio-store";
import { PortfolioProfile } from "../../db/schema";

const LEGACY_COLLECTION = "portfolios";
const BACKUP_COLLECTION = "portfolios_backup";

// Migrates the legacy single-document store ({ data: <whole payload> } in the
// "portfolios" collection) into the per-section collections. Called lazily by
// getPortfolio() when the new store is empty, and by the seed script — so a
// deploy self-migrates on the first page view with no manual step.
//
// Safe to run concurrently: writePortfolio is upsert-idempotent, and the
// legacy collection is renamed (not dropped) only after a successful write.
// Returns true when a legacy payload was migrated.
export async function migrateLegacyPortfolioIfNeeded(): Promise<boolean> {
  const db = mongoose.connection.db;
  if (!db) throw new Error("migrateLegacyPortfolio: no active MongoDB connection");

  // never overwrite an already-populated store with a stale blob —
  // profile is a required section, so its presence means the store has data
  if (await PortfolioProfile.exists({})) return false;

  const legacyDoc = await db.collection(LEGACY_COLLECTION).findOne();
  if (!legacyDoc || legacyDoc.data === undefined) return false;

  // If the blob doesn't validate, throw before touching anything —
  // the legacy collection stays intact for manual inspection.
  const validated = portfolioPageDataSchema.parse(legacyDoc.data);
  await writePortfolio(validated);

  try {
    await db.renameCollection(LEGACY_COLLECTION, BACKUP_COLLECTION, { dropTarget: true });
    console.log(`[portfolio] migrated legacy blob; "${LEGACY_COLLECTION}" renamed to "${BACKUP_COLLECTION}"`);
  } catch (err) {
    // Non-fatal (e.g. rename race between concurrent cold starts) —
    // re-migration is harmless and won't re-trigger once sections exist.
    console.warn("[portfolio] legacy collection rename failed (non-fatal):", err);
  }
  return true;
}
