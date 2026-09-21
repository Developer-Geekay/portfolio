import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { auth } from "@/lib/auth";

const ALLOWED_MIME_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/svg+xml": ".svg",
  "image/avif": ".avif",
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { message: "No file uploaded or invalid file format." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          message: `File size exceeds 10MB limit (size: ${(file.size / 1024 / 1024).toFixed(1)}MB).`,
        },
        { status: 400 }
      );
    }

    const mimeType = file.type;
    const extension = ALLOWED_MIME_TYPES[mimeType];
    if (!extension) {
      return NextResponse.json(
        {
          message: `Unsupported file type "${mimeType}". Allowed: JPG, PNG, WebP, GIF, SVG, AVIF.`,
        },
        { status: 400 }
      );
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", "projects");
    await fs.mkdir(uploadDir, { recursive: true });

    // Generate safe unique filename
    const randomHex = crypto.randomBytes(6).toString("hex");
    const originalName = "name" in file && typeof file.name === "string" ? file.name : "project";
    const sanitizedBase = path
      .basename(originalName, path.extname(originalName))
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 32);
    const filename = `${sanitizedBase || "project"}-${Date.now().toString(36)}-${randomHex}${extension}`;
    const destinationPath = path.join(uploadDir, filename);

    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(destinationPath, buffer);

    const publicUrl = `/uploads/projects/${filename}`;
    return NextResponse.json({
      url: publicUrl,
      filename,
      size: file.size,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to upload image.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
