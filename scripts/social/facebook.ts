import { execFileSync } from "node:child_process";

const GRAPH_VERSION = process.env.META_GRAPH_API_VERSION || "v26.0";

function requiredMetaConfig() {
  const pageId = process.env.META_PAGE_ID?.trim();
  const accessToken = process.env.META_PAGE_ACCESS_TOKEN?.trim();
  if (!pageId || !accessToken) {
    throw new Error(
      "Missing META_PAGE_ID or META_PAGE_ACCESS_TOKEN GitHub Actions secret.",
    );
  }
  return { pageId, accessToken };
}

async function parseGraphResponse(response: Response) {
  const body = (await response.json()) as {
    id?: string;
    post_id?: string;
    error?: { message?: string; type?: string; code?: number };
  };
  if (!response.ok || body.error) {
    throw new Error(
      `Meta Graph API failed (HTTP ${response.status}): ${body.error?.message || JSON.stringify(body)}`,
    );
  }
  return body;
}

export async function publishLinkToFacebook(input: {
  message: string;
  link: string;
}): Promise<string> {
  const { pageId, accessToken } = requiredMetaConfig();
  const body = new URLSearchParams({
    message: input.message,
    link: input.link,
    access_token: accessToken,
  });
  const response = await fetch(
    `https://graph.facebook.com/${GRAPH_VERSION}/${encodeURIComponent(pageId)}/feed`,
    { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body },
  );
  const result = await parseGraphResponse(response);
  const id = result.id || result.post_id;
  if (!id) throw new Error("Meta API returned success without a post ID.");
  return id;
}

export async function publishPngToFacebook(input: {
  png: Buffer;
  caption: string;
}): Promise<string> {
  const { pageId, accessToken } = requiredMetaConfig();
  const form = new FormData();
  form.set("access_token", accessToken);
  form.set("caption", input.caption);
  form.set(
    "source",
    new Blob([new Uint8Array(input.png)], { type: "image/png" }),
    "nawab-tech-social.png",
  );

  const response = await fetch(
    `https://graph.facebook.com/${GRAPH_VERSION}/${encodeURIComponent(pageId)}/photos`,
    { method: "POST", body: form },
  );
  const result = await parseGraphResponse(response);
  const id = result.post_id || result.id;
  if (!id) throw new Error("Meta API returned success without a photo/post ID.");
  return id;
}

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function wrapText(value: string, maxChars: number): string[] {
  const words = value.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 4);
}

export function createSocialCardSvg(input: {
  headline: string;
  subtitle: string;
  category: string;
}): string {
  const headlineLines = wrapText(input.headline, 24);
  const subtitleLines = wrapText(input.subtitle, 42);
  const headlineMarkup = headlineLines
    .map((line, index) => `<text x="88" y="${470 + index * 78}" font-size="62" font-weight="700" fill="#ffffff">${xmlEscape(line)}</text>`)
    .join("");
  const subtitleStart = 520 + headlineLines.length * 78;
  const subtitleMarkup = subtitleLines
    .map((line, index) => `<text x="92" y="${subtitleStart + index * 42}" font-size="28" fill="#cbd5e1">${xmlEscape(line)}</text>`)
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#0b1220"/><stop offset="100%" stop-color="#172c4a"/></linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#60a5fa"/><stop offset="100%" stop-color="#38bdf8"/></linearGradient>
  </defs>
  <rect width="1200" height="1200" rx="44" fill="url(#bg)"/>
  <circle cx="1080" cy="160" r="240" fill="#2563eb" opacity=".12"/>
  <circle cx="1040" cy="190" r="150" fill="none" stroke="#60a5fa" stroke-width="2" opacity=".28"/>
  <rect x="88" y="92" width="10" height="70" rx="5" fill="url(#accent)"/>
  <text x="122" y="120" font-size="34" font-weight="700" letter-spacing="2" fill="#ffffff">NAWAB TECH</text>
  <text x="122" y="158" font-size="18" letter-spacing="4" fill="#93c5fd">BUILD SMARTER</text>
  <rect x="88" y="300" width="auto" height="46" rx="23" fill="#1e3a5f"/>
  <text x="110" y="331" font-size="20" font-weight="600" letter-spacing="1.5" fill="#93c5fd">${xmlEscape(input.category.toUpperCase().slice(0, 42))}</text>
  ${headlineMarkup}
  ${subtitleMarkup}
  <rect x="88" y="1000" width="1024" height="2" fill="#334155"/>
  <text x="88" y="1060" font-size="25" font-weight="600" fill="#ffffff">Practical digital solutions for growing businesses.</text>
  <text x="88" y="1110" font-size="22" fill="#93c5fd">nawab-tech.vercel.app</text>
  <text x="1110" y="1110" text-anchor="end" font-size="18" fill="#94a3b8">WEBSITES • APPS • AUTOMATION</text>
</svg>`;
}

export function renderSvgToPng(svg: string): Buffer {
  // ImageMagick is installed by the independent Facebook workflow.
  return execFileSync("convert", ["-background", "#0b1220", "svg:-", "png:-"], {
    input: svg,
    maxBuffer: 20 * 1024 * 1024,
  });
}
