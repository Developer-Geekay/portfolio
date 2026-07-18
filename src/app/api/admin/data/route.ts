import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { auth } from "@/lib/auth";
import { dbConnect } from "@/lib/db/client";
import { LIST_SECTIONS, SINGLETON_SECTIONS } from "@/lib/db/portfolio-store";
import { migrateLegacyPortfolioIfNeeded } from "@/lib/server/services/portfolio.migration.server";

async function storeStatus() {
  const db = mongoose.connection.db!;
  const existing = new Set((await db.listCollections().toArray()).map((c) => c.name));

  const collections = await Promise.all(
    [...LIST_SECTIONS, ...SINGLETON_SECTIONS].map(async ({ key, model }) => ({
      section: key,
      collection: model.collection.name,
      documents: existing.has(model.collection.name) ? await model.countDocuments() : 0,
    })),
  );

  return {
    collections,
    legacyBlobExists: existing.has("portfolios"),
    backupExists: existing.has("portfolios_backup"),
  };
}

export async function GET() {
  if (!(await auth())) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }
  await dbConnect();
  return NextResponse.json(await storeStatus());
}

export async function POST() {
  if (!(await auth())) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }
  await dbConnect();
  try {
    const migrated = await migrateLegacyPortfolioIfNeeded();
    return NextResponse.json({ migrated, ...(await storeStatus()) });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Migration failed.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
