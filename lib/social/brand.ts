// Shared brand tokens for social cards and OG images.
// Colors converted from app/globals.css oklch tokens (Satori does not support oklch).
// Keep in sync with globals.css light/dark theme.

export const BRAND = {
  name: "Nawab Tech",
  siteUrl: "https://nawab-tech.vercel.app",
  wordmark: "NAWAB TECH",
} as const;

export type SocialThemeName = "light" | "dark";

export type SocialTheme = {
  background: string;
  foreground: string;
  primary: string;
  border: string;
  mutedForeground: string;
  surface: string;
};

export const SOCIAL_THEMES: Record<SocialThemeName, SocialTheme> = {
  light: {
    // --background: oklch(0.965 0.006 90)
    background: "#F5F3EF",
    // --foreground: oklch(0.18 0.008 70)
    foreground: "#14110E",
    // --primary: oklch(0.59 0.17 35)
    primary: "#CE4D2D",
    // --border: oklch(0.86 0.008 80)
    border: "#D4D0CB",
    // --muted-foreground: oklch(0.48 0.012 70)
    mutedForeground: "#625D56",
    // --card: oklch(0.98 0.004 90)
    surface: "#FBFAF8",
  },
  dark: {
    // --background: oklch(0.16 0.008 70)
    background: "#100D0A",
    // --foreground: oklch(0.94 0.006 85)
    foreground: "#EDEBE7",
    // --primary: oklch(0.68 0.16 40)
    primary: "#E87045",
    // --border: oklch(1 0 0 / 11%)
    border: "#FFFFFF1C",
    // --muted-foreground: oklch(0.68 0.008 75)
    mutedForeground: "#9B9893",
    // --card: oklch(0.195 0.008 70)
    surface: "#191512",
  },
};

export const SOCIAL_CARD_SIZE = { width: 1080, height: 1350 } as const;
