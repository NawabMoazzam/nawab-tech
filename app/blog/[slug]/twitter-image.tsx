import { ImageResponse } from "next/og";
import { getPostBySlugWithContent } from "@/lib/blog/queries";
import { BRAND, SOCIAL_THEMES } from "@/lib/social/brand";
import { getSocialFonts } from "@/lib/social/font";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Nawab Tech blog post";

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlugWithContent(slug);
  const t = SOCIAL_THEMES.light;
  const fonts = await getSocialFonts();

  const title = post?.title || "Nawab Tech Insights";
  const category = post?.category?.name || "Insights";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: t.background,
          color: t.foreground,
          padding: "64px 72px 52px 72px",
          fontFamily: "Inter",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 40 }}>
            <div
              style={{
                display: "flex",
                width: 48,
                height: 3,
                backgroundColor: t.primary,
                marginRight: 18,
              }}
            />
            <div
              style={{
                display: "flex",
                fontSize: 20,
                fontWeight: 500,
                letterSpacing: 3,
                textTransform: "uppercase",
                color: t.mutedForeground,
              }}
            >
              {category}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 72,
              lineHeight: 1.02,
              fontWeight: 700,
              letterSpacing: -3,
              color: t.foreground,
              maxWidth: 980,
            }}
          >
            {title}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            width: "100%",
            justifyContent: "space-between",
            alignItems: "flex-end",
            borderTop: `1px solid ${t.border}`,
            paddingTop: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: 2,
              color: t.foreground,
            }}
          >
            {BRAND.wordmark}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 18,
              letterSpacing: 2,
              color: t.mutedForeground,
              textTransform: "uppercase",
            }}
          >
            nawabtech.com
          </div>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
