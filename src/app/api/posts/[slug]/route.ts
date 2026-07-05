import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getPostBySlug, savePost, deletePost, type PostFrontmatter } from "@/lib/posts";
import { auth } from "@/lib/auth";

const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,100}$/

function hasValidApiKey(req: NextRequest): boolean {
  const apiKey = process.env.API_SECRET_KEY;
  if (!apiKey) return false;
  return req.headers.get("authorization") === `Bearer ${apiKey}`;
}

function validateSlug(slug: string): NextResponse | null {
  if (!SLUG_RE.test(slug)) {
    return NextResponse.json({ message: "Invalid slug." }, { status: 400 });
  }
  return null;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const invalid = validateSlug(slug);
  if (invalid) return invalid;
  const post = getPostBySlug(slug);
  // unpublished drafts are only visible to the admin session / API key
  if (!post || (!post.published && !(await auth()) && !hasValidApiKey(req))) {
    return NextResponse.json({ message: "Not found." }, { status: 404 });
  }
  return NextResponse.json(post);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  if (!session && !hasValidApiKey(req)) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }
  const { slug } = await params;
  const invalid = validateSlug(slug);
  if (invalid) return invalid;
  try {
    const body = await req.json();
    const { content, ...frontmatter } = body as { content: string } & PostFrontmatter;
    savePost(slug, frontmatter, content ?? "");
    revalidatePath("/blog");
    revalidatePath(`/blog/${slug}`);
    return NextResponse.json({ slug });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update post.";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  if (!session && !hasValidApiKey(req)) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }
  const { slug } = await params;
  const invalid = validateSlug(slug);
  if (invalid) return invalid;
  deletePost(slug);
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  return NextResponse.json({ ok: true });
}
