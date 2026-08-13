import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { imagekit } from "@/lib/imagekit";

export const dynamic = "force-dynamic";

// Server-side upload - more secure, no client private key exposure
// POST /api/admin/upload with FormData { file: File, fileName?: string, folder?: string }

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuth();
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const fileName = (formData.get("fileName") as string) || file?.name || `upload-${Date.now()}`;
    const folder = (formData.get("folder") as string) || "/nawab-tech/blog";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file size - ImageKit free allows 25MB per file
    if (file.size > 25 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Max 25MB" }, { status: 400 });
    }

    // Validate mime type - only images for blog
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only images allowed" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResponse = await imagekit.upload({
      file: buffer,
      fileName: fileName.replace(/[^a-zA-Z0-9_.-]/g, "_"),
      folder,
      useUniqueFileName: true,
    });

    return NextResponse.json({
      success: true,
      url: uploadResponse.url,
      fileId: uploadResponse.fileId,
      name: uploadResponse.name,
      thumbnailUrl: uploadResponse.thumbnailUrl,
      width: uploadResponse.width,
      height: uploadResponse.height,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error.message || "Upload failed" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await getAuth();
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get("fileId");

    if (!fileId) {
      return NextResponse.json({ error: "fileId required" }, { status: 400 });
    }

    await imagekit.deleteFile(fileId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: error.message || "Delete failed" },
      { status: 500 }
    );
  }
}
