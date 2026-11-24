import { readFile } from "node:fs/promises";

type FontWeight = 400 | 500 | 700;

type LoadedFont = {
  name: string;
  data: ArrayBuffer;
  weight: FontWeight;
  style: "normal";
};

let cached: Promise<LoadedFont[]> | null = null;

async function tryReadLocal(path: string): Promise<ArrayBuffer | null> {
  try {
    const buf = await readFile(path);
    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  } catch {
    return null;
  }
}

async function loadLocalFonts(): Promise<LoadedFont[] | null> {
  // Prefer DejaVu Sans (commonly available on Linux/CI) for deterministic rendering.
  const regular = await tryReadLocal("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf");
  const bold = await tryReadLocal("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf");
  if (!regular || !bold) return null;
  return [
    { name: "Inter", data: regular, weight: 400, style: "normal" },
    { name: "Inter", data: regular, weight: 500, style: "normal" },
    { name: "Inter", data: bold, weight: 700, style: "normal" },
  ];
}

async function fetchGoogleFont(weight: FontWeight): Promise<ArrayBuffer> {
  const cssUrl = `https://fonts.googleapis.com/css2?family=Inter:wght@${weight}&display=swap`;
  const cssRes = await fetch(cssUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 6.1; rv:10.0) Gecko/20100101 Firefox/10.0",
    },
  });
  if (!cssRes.ok) throw new Error(`Failed to fetch font CSS (${cssRes.status})`);
  const css = await cssRes.text();
  const match = css.match(/src:\s*url\(([^)]+)\)\s*format\(['"](?:truetype|opentype)['"]\)/);
  const fontUrl = match?.[1];
  if (!fontUrl) throw new Error("Could not find truetype font URL in Google Fonts CSS");
  const fontRes = await fetch(fontUrl);
  if (!fontRes.ok) throw new Error(`Failed to fetch font file (${fontRes.status})`);
  return fontRes.arrayBuffer();
}

async function loadFonts(): Promise<LoadedFont[]> {
  const local = await loadLocalFonts();
  if (local) return local;
  const weights: FontWeight[] = [400, 500, 700];
  return Promise.all(
    weights.map(async (weight) => ({
      name: "Inter",
      data: await fetchGoogleFont(weight),
      weight,
      style: "normal" as const,
    })),
  );
}

export function getSocialFonts(): Promise<LoadedFont[]> {
  if (!cached) cached = loadFonts();
  return cached;
}
