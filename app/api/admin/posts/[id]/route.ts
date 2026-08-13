import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getAuth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import BlogPost from "@/models/blog-post";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

// GET /api/admin/posts/:id
export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const auth = await getAuth();
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const post = await BlogPost.findById(id).lean();
    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ post });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/admin/posts/:id
export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const auth = await getAuth();
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const body = await request.json();

    if (body.category && body.category.name && !body.category.slug) {
      body.category.slug = body.category.name.toLowerCase().replace(/\s+/g, "-");
    }

    const post = await BlogPost.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

    try {
      revalidateTag("blog-posts", "max");
      revalidateTag(`blog-${post.slug}`, "max");
    } catch {}

    return NextResponse.json({ success: true, post });
  } catch (error: any) {
    console.error("Update error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/admin/posts/:id
export async function DELETE(request: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const auth = await getAuth();
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const post = await BlogPost.findByIdAndDelete(id);
    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

    try {
      revalidateTag("blog-posts", "max");
    } catch {}

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
