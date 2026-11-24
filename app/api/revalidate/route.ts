import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Public cache-busting endpoint for external automation (e.g. the daily
 * auto-blog GitHub Action). It intentionally does NOT use Better Auth
 * sessions, since the caller is a script with no browser/cookies — it is
 * protected by a shared secret instead.
 *
 * Usage:
 *   GET /api/revalidate?secret=XXXX
 *   GET /api/revalidate?secret=XXXX&slug=my-post&category=web-development
 */
function isAuthorized(request: NextRequest) {
  const configured = process.env.BLOG_REVALIDATE_SECRET;
  if (!configured) return false;

  const headerSecret = request.headers
    .get("authorization")
    ?.replace(/^Bearer\s+/i, "");
  const querySecret = request.nextUrl.searchParams.get("secret");

  return headerSecret === configured || querySecret === configured;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const slug = request.nextUrl.searchParams.get("slug");
  const category = request.nextUrl.searchParams.get("category");

  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/blog/${slug}`);
  if (category) revalidatePath(`/blog/category/${category}`);

  return NextResponse.json({
    success: true,
    revalidated: [
      "/",
      "/blog",
      "/sitemap.xml",
      slug ? `/blog/${slug}` : null,
      category ? `/blog/category/${category}` : null,
    ].filter(Boolean),
  });
}

export async function POST(request: NextRequest) {
  return GET(request);
}
