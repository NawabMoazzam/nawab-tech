import { NextRequest, NextResponse } from "next/server";

import { getAuth } from "@/lib/auth";
import type { PexelsResult } from "@/lib/pexels";

export const dynamic = "force-dynamic";

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
const SEARCH_ENDPOINT = "https://api.pexels.com/v1/search";
const REQUEST_TIMEOUT_MS = 10_000;

type PexelsApiPhoto = {
  id: number;
  alt?: string;
  photographer?: string;
  url?: string;
  src?: {
    original?: string;
    large2x?: string;
    large?: string;
    medium?: string;
    small?: string;
  };
};

function toResult(photo: PexelsApiPhoto): PexelsResult | null {
  const url = photo.src?.large2x || photo.src?.large || photo.src?.original;
  const thumb = photo.src?.medium || photo.src?.small || url;

  if (!url || !thumb) return null;

  return {
    id: photo.id,
    url,
    thumb,
    photographer: photo.photographer || "Pexels",
    page: photo.url || "https://www.pexels.com/",
    alt: photo.alt || "",
  };
}

/**
 * Admin-only proxy for the Pexels API, so the key never reaches the browser.
 *
 * - `GET /api/admin/pexels`            → `{ available }`
 * - `GET /api/admin/pexels?q=laptop`   → `{ available, photos }`
 */
export async function GET(request: NextRequest) {
  try {
    return await searchPexels(request);
  } catch (error) {
    console.error("Pexels route error:", error);

    return NextResponse.json(
      { error: "Failed to load Pexels images." },
      { status: 500 },
    );
  }
}

async function searchPexels(request: NextRequest) {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!PEXELS_API_KEY) {
    return NextResponse.json({ available: false, photos: [] });
  }

  const query = request.nextUrl.searchParams.get("q")?.trim();
  if (!query) {
    return NextResponse.json({ available: true, photos: [] });
  }

  const page = Number(request.nextUrl.searchParams.get("page")) || 1;
  const url = new URL(SEARCH_ENDPOINT);
  url.searchParams.set("query", query);
  url.searchParams.set("orientation", "landscape");
  url.searchParams.set("per_page", "12");
  url.searchParams.set("page", String(Math.max(1, page)));

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { Authorization: PEXELS_API_KEY },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      // Search results are identical for everyone — cache them briefly to
      // stay well inside the Pexels rate limit.
      next: { revalidate: 600 },
    });

    if (!response.ok) {
      throw new Error(`Pexels responded with ${response.status}`);
    }

    const json = (await response.json()) as { photos?: PexelsApiPhoto[] };
    const photos = (json.photos || [])
      .map(toResult)
      .filter((photo): photo is PexelsResult => photo !== null);

    return NextResponse.json({ available: true, photos });
  } catch (error) {
    console.error("Pexels search error:", error);

    return NextResponse.json(
      {
        available: true,
        photos: [],
        error: "Pexels search failed. You can still paste an image URL.",
      },
      { status: 200 },
    );
  }
}
