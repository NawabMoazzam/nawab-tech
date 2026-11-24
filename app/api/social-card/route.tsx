import { NextRequest, NextResponse } from "next/server";
import { renderCarouselSlideCard, renderSocialCard } from "@/lib/social/render";
import { SOCIAL_LAYOUTS, type CarouselSlide, type SocialLayoutPayload, type SocialThemeName } from "@/lib/social/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(request: NextRequest) {
  const configured = process.env.BLOG_REVALIDATE_SECRET;
  if (!configured) return false;
  const header = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const query = request.nextUrl.searchParams.get("secret");
  return header === configured || query === configured;
}

function isTheme(value: unknown): value is SocialThemeName {
  return value === "light" || value === "dark";
}

function isLayout(value: unknown): value is SocialLayoutPayload["layout"] {
  return typeof value === "string" && (SOCIAL_LAYOUTS as readonly string[]).includes(value);
}

function validatePayload(payload: unknown): SocialLayoutPayload {
  if (!payload || typeof payload !== "object") {
    throw new Error("Invalid payload");
  }
  const p = payload as Record<string, unknown>;
  if (!isLayout(p.layout)) throw new Error("Invalid layout");

  switch (p.layout) {
    case "big-number":
      if (!p.stat || !p.statLabel || !p.body) throw new Error("Missing big-number fields");
      return {
        layout: "big-number",
        eyebrow: String(p.eyebrow || "Insight"),
        stat: String(p.stat),
        statLabel: String(p.statLabel),
        body: String(p.body),
      };
    case "myth-vs-reality":
      if (!p.myth || !p.reality) throw new Error("Missing myth-vs-reality fields");
      return {
        layout: "myth-vs-reality",
        eyebrow: String(p.eyebrow || "Myth vs reality"),
        myth: String(p.myth),
        reality: String(p.reality),
      };
    case "checklist":
      if (!Array.isArray(p.items) || p.items.length < 3) throw new Error("Missing checklist items");
      return {
        layout: "checklist",
        eyebrow: String(p.eyebrow || "Checklist"),
        title: String(p.title || ""),
        items: p.items.map((i) => String(i)).slice(0, 5),
      };
    case "before-after":
      if (!Array.isArray(p.beforePoints) || !Array.isArray(p.afterPoints)) {
        throw new Error("Missing before-after fields");
      }
      return {
        layout: "before-after",
        eyebrow: String(p.eyebrow || "Before / After"),
        beforeTitle: String(p.beforeTitle || "Before"),
        beforePoints: p.beforePoints.map((i) => String(i)).slice(0, 4),
        afterTitle: String(p.afterTitle || "After"),
        afterPoints: p.afterPoints.map((i) => String(i)).slice(0, 4),
      };
    case "opinion-quote":
      if (!p.quote) throw new Error("Missing quote");
      return {
        layout: "opinion-quote",
        eyebrow: String(p.eyebrow || "Perspective"),
        quote: String(p.quote),
        context: String(p.context || ""),
      };
    case "terminal-snippet":
      if (!Array.isArray(p.codeLines) || !p.title) throw new Error("Missing terminal fields");
      return {
        layout: "terminal-snippet",
        eyebrow: String(p.eyebrow || "Code"),
        title: String(p.title),
        codeLines: p.codeLines.map((l) => String(l)).slice(0, 8),
        caption: String(p.caption || ""),
      };
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      theme?: unknown;
      payload?: unknown;
      slide?: unknown;
      index?: unknown;
      total?: unknown;
    };

    const theme: SocialThemeName = isTheme(body.theme) ? body.theme : "light";

    if (body.slide) {
      const s = body.slide as Record<string, unknown>;
      const slide: CarouselSlide = {
        eyebrow: String(s.eyebrow || "Nawab Tech"),
        title: String(s.title || ""),
        body: String(s.body || ""),
        kind:
          s.kind === "cover" || s.kind === "point" || s.kind === "cta"
            ? s.kind
            : undefined,
      };
      const index = Number(body.index ?? 0);
      const total = Number(body.total ?? 1);
      return await renderCarouselSlideCard(slide, theme, index, total);
    }

    const payload = validatePayload(body.payload);
    return await renderSocialCard(payload, theme);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
