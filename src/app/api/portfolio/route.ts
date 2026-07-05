import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getPortfolio, savePortfolio } from "@/lib/portfolio";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const data = await getPortfolio();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ message: "Failed to read portfolio data." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }
  try {
    const body = await req.json();
    const saved = await savePortfolio(body);
    revalidatePath("/");
    return NextResponse.json(saved);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save portfolio data.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
