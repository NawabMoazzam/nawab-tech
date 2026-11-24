import { ImageResponse } from "next/og";
import { BRAND, SOCIAL_CARD_SIZE, SOCIAL_THEMES, type SocialThemeName } from "./brand";
import { getSocialFonts } from "./font";
import type {
  BeforeAfterLayout,
  BigNumberLayout,
  CarouselSlide,
  ChecklistLayout,
  MythRealityLayout,
  OpinionQuoteLayout,
  SocialLayoutPayload,
  TerminalSnippetLayout,
} from "./types";

function themeFor(name: SocialThemeName) {
  return SOCIAL_THEMES[name];
}

function Eyebrow({ text, color }: { text: string; color: string }) {
  return (
    <div
      style={{
        display: "flex",
        fontSize: 22,
        fontWeight: 500,
        letterSpacing: 3,
        textTransform: "uppercase",
        color,
      }}
    >
      {text}
    </div>
  );
}

function Wordmark({ color, muted }: { color: string; muted: string }) {
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        justifyContent: "space-between",
        alignItems: "flex-end",
        borderTop: `1px solid ${muted}`,
        paddingTop: 28,
      }}
    >
      <div style={{ display: "flex", fontSize: 24, fontWeight: 700, letterSpacing: 2, color }}>
        {BRAND.wordmark}
      </div>
      <div style={{ display: "flex", fontSize: 18, letterSpacing: 2, color: muted, textTransform: "uppercase" }}>
        nawabtech.com
      </div>
    </div>
  );
}

function Shell({
  themeName,
  eyebrow,
  children,
}: {
  themeName: SocialThemeName;
  eyebrow: string;
  children: React.ReactNode;
}) {
  const t = themeFor(themeName);
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: t.background,
        color: t.foreground,
        padding: "72px 72px 56px 72px",
        fontFamily: "Inter",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 44 }}>
          <div
            style={{
              display: "flex",
              width: 48,
              height: 3,
              backgroundColor: t.primary,
              marginRight: 18,
            }}
          />
          <Eyebrow text={eyebrow} color={t.mutedForeground} />
        </div>
        {children}
      </div>
      <Wordmark color={t.foreground} muted={t.border} />
    </div>
  );
}

function BigNumber({ data, themeName }: { data: BigNumberLayout; themeName: SocialThemeName }) {
  const t = themeFor(themeName);
  return (
    <Shell themeName={themeName} eyebrow={data.eyebrow}>
      <div
        style={{
          display: "flex",
          fontSize: 168,
          lineHeight: 0.9,
          fontWeight: 700,
          letterSpacing: -8,
          color: t.primary,
          marginBottom: 28,
        }}
      >
        {data.stat}
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 54,
          lineHeight: 1.05,
          fontWeight: 700,
          letterSpacing: -2,
          color: t.foreground,
          marginBottom: 36,
          maxWidth: 900,
        }}
      >
        {data.statLabel}
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 30,
          lineHeight: 1.45,
          fontWeight: 400,
          color: t.mutedForeground,
          maxWidth: 860,
        }}
      >
        {data.body}
      </div>
    </Shell>
  );
}

function MythReality({ data, themeName }: { data: MythRealityLayout; themeName: SocialThemeName }) {
  const t = themeFor(themeName);
  const panel = (label: string, text: string, accent: string, muted: boolean) => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        padding: "36px 0",
        borderTop: `1px solid ${t.border}`,
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 20,
          fontWeight: 700,
          letterSpacing: 3,
          textTransform: "uppercase",
          color: accent,
          marginBottom: 20,
        }}
      >
        {label}
      </div>
      <div
        style={{
          display: "flex",
          fontSize: muted ? 40 : 44,
          lineHeight: 1.2,
          fontWeight: muted ? 500 : 700,
          letterSpacing: -1.5,
          color: muted ? t.mutedForeground : t.foreground,
          maxWidth: 900,
        }}
      >
        {text}
      </div>
    </div>
  );
  return (
    <Shell themeName={themeName} eyebrow={data.eyebrow}>
      {panel("Myth", data.myth, t.mutedForeground, true)}
      {panel("Reality", data.reality, t.primary, false)}
    </Shell>
  );
}

function Checklist({ data, themeName }: { data: ChecklistLayout; themeName: SocialThemeName }) {
  const t = themeFor(themeName);
  const items = data.items.slice(0, 5);
  return (
    <Shell themeName={themeName} eyebrow={data.eyebrow}>
      <div
        style={{
          display: "flex",
          fontSize: 62,
          lineHeight: 1.05,
          fontWeight: 700,
          letterSpacing: -2.5,
          color: t.foreground,
          marginBottom: 44,
          maxWidth: 920,
        }}
      >
        {data.title}
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {items.map((item, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "flex-start",
              padding: "22px 0",
              borderTop: `1px solid ${t.border}`,
            }}
          >
            <div
              style={{
                display: "flex",
                width: 36,
                height: 36,
                border: `1px solid ${t.primary}`,
                color: t.primary,
                fontSize: 18,
                fontWeight: 700,
                alignItems: "center",
                justifyContent: "center",
                marginRight: 20,
                flexShrink: 0,
              }}
            >
              {i + 1}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 31,
                lineHeight: 1.35,
                fontWeight: 400,
                color: t.foreground,
              }}
            >
              {item}
            </div>
          </div>
        ))}
      </div>
    </Shell>
  );
}

function BeforeAfter({ data, themeName }: { data: BeforeAfterLayout; themeName: SocialThemeName }) {
  const t = themeFor(themeName);
  const col = (title: string, points: string[], accent: string) => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "50%",
        paddingRight: 24,
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 20,
          fontWeight: 700,
          letterSpacing: 3,
          textTransform: "uppercase",
          color: accent,
          marginBottom: 24,
        }}
      >
        {title}
      </div>
      {points.slice(0, 4).map((p, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            fontSize: 28,
            lineHeight: 1.35,
            color: t.foreground,
            padding: "14px 0",
            borderTop: `1px solid ${t.border}`,
          }}
        >
          {p}
        </div>
      ))}
    </div>
  );
  return (
    <Shell themeName={themeName} eyebrow={data.eyebrow}>
      <div
        style={{
          display: "flex",
          fontSize: 58,
          lineHeight: 1.05,
          fontWeight: 700,
          letterSpacing: -2.5,
          color: t.foreground,
          marginBottom: 44,
          maxWidth: 920,
        }}
      >
        Before / After
      </div>
      <div style={{ display: "flex", width: "100%" }}>
        {col(data.beforeTitle || "Before", data.beforePoints, t.mutedForeground)}
        {col(data.afterTitle || "After", data.afterPoints, t.primary)}
      </div>
    </Shell>
  );
}

function OpinionQuote({ data, themeName }: { data: OpinionQuoteLayout; themeName: SocialThemeName }) {
  const t = themeFor(themeName);
  return (
    <Shell themeName={themeName} eyebrow={data.eyebrow}>
      <div
        style={{
          display: "flex",
          fontSize: 120,
          lineHeight: 0.8,
          fontWeight: 700,
          color: t.primary,
          marginBottom: 8,
        }}
      >
        “
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 56,
          lineHeight: 1.15,
          fontWeight: 700,
          letterSpacing: -2,
          color: t.foreground,
          marginBottom: 40,
          maxWidth: 920,
        }}
      >
        {data.quote}
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 28,
          lineHeight: 1.45,
          fontWeight: 400,
          color: t.mutedForeground,
          maxWidth: 820,
        }}
      >
        {data.context}
      </div>
    </Shell>
  );
}

function TerminalSnippet({ data, themeName }: { data: TerminalSnippetLayout; themeName: SocialThemeName }) {
  const t = themeFor(themeName);
  const codeBg = themeName === "dark" ? "#191512" : "#EBE8E3";
  return (
    <Shell themeName={themeName} eyebrow={data.eyebrow}>
      <div
        style={{
          display: "flex",
          fontSize: 56,
          lineHeight: 1.05,
          fontWeight: 700,
          letterSpacing: -2,
          color: t.foreground,
          marginBottom: 36,
          maxWidth: 920,
        }}
      >
        {data.title}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          backgroundColor: codeBg,
          border: `1px solid ${t.border}`,
          padding: "32px 36px",
          marginBottom: 28,
        }}
      >
        {data.codeLines.slice(0, 8).map((line, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              fontSize: 24,
              lineHeight: 1.6,
              fontFamily: "Inter",
              color: t.foreground,
              whiteSpace: "pre-wrap",
            }}
          >
            {line || " "}
          </div>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 28,
          lineHeight: 1.4,
          color: t.mutedForeground,
          maxWidth: 860,
        }}
      >
        {data.caption}
      </div>
    </Shell>
  );
}

function Layout({ data, themeName }: { data: SocialLayoutPayload; themeName: SocialThemeName }) {
  switch (data.layout) {
    case "big-number":
      return <BigNumber data={data} themeName={themeName} />;
    case "myth-vs-reality":
      return <MythReality data={data} themeName={themeName} />;
    case "checklist":
      return <Checklist data={data} themeName={themeName} />;
    case "before-after":
      return <BeforeAfter data={data} themeName={themeName} />;
    case "opinion-quote":
      return <OpinionQuote data={data} themeName={themeName} />;
    case "terminal-snippet":
      return <TerminalSnippet data={data} themeName={themeName} />;
  }
}

export async function renderSocialCard(
  data: SocialLayoutPayload,
  themeName: SocialThemeName = "light",
): Promise<ImageResponse> {
  const fonts = await getSocialFonts();
  return new ImageResponse(<Layout data={data} themeName={themeName} />, {
    ...SOCIAL_CARD_SIZE,
    fonts,
  });
}

export async function renderCarouselSlideCard(
  slide: CarouselSlide,
  themeName: SocialThemeName = "light",
  index: number,
  total: number,
): Promise<ImageResponse> {
  const t = themeFor(themeName);
  const fonts = await getSocialFonts();
  const isCover = slide.kind === "cover" || index === 0;
  const isCta = slide.kind === "cta" || index === total - 1;

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
          padding: "72px 72px 56px 72px",
          fontFamily: "Inter",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 44 }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div style={{ display: "flex", width: 48, height: 3, backgroundColor: t.primary, marginRight: 18 }} />
              <Eyebrow text={slide.eyebrow} color={t.mutedForeground} />
            </div>
            <div style={{ display: "flex", fontSize: 20, color: t.mutedForeground, letterSpacing: 2 }}>
              {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: isCover ? 72 : 56,
              lineHeight: 1.05,
              fontWeight: 700,
              letterSpacing: -2.5,
              color: t.foreground,
              marginBottom: 36,
              maxWidth: 920,
            }}
          >
            {slide.title}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: isCta ? 34 : 32,
              lineHeight: 1.45,
              fontWeight: 400,
              color: isCta ? t.foreground : t.mutedForeground,
              maxWidth: 860,
              borderTop: isCover ? "none" : `1px solid ${t.border}`,
              paddingTop: isCover ? 0 : 32,
            }}
          >
            {slide.body}
          </div>
        </div>
        <Wordmark color={t.foreground} muted={t.border} />
      </div>
    ),
    { ...SOCIAL_CARD_SIZE, fonts },
  );
}
