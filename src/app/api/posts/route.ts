import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAllPosts, savePost, type PostFrontmatter } from "@/lib/posts";
import { auth } from "@/lib/auth";

function hasValidApiKey(req: NextRequest): boolean {
  const apiKey = process.env.API_SECRET_KEY;
  if (!apiKey) return false;
  return req.headers.get("authorization") === `Bearer ${apiKey}`;
}

export async function GET(req: NextRequest) {
  const session = await auth();
  const posts = await getAllPosts(!!(session || hasValidApiKey(req)));
  return NextResponse.json(posts);
}

const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,100}$/

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session && !hasValidApiKey(req)) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { slug, content, ...rest } = body as { slug: string; content: string } & PostFrontmatter;
    if (!slug || !rest.title) {
      return NextResponse.json({ message: "slug and title are required." }, { status: 400 });
    }
    if (!SLUG_RE.test(slug)) {
      return NextResponse.json({ message: "Invalid slug format." }, { status: 400 });
    }
    await savePost(slug, { ...rest, slug }, content ?? "");
    revalidatePath("/blog");
    revalidatePath(`/blog/${slug}`);
    return NextResponse.json({ slug }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create post.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
