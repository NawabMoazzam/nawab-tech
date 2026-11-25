export const SOCIAL_LAYOUTS = [
  "big-number",
  "myth-vs-reality",
  "checklist",
  "before-after",
  "opinion-quote",
  "terminal-snippet",
] as const;

export type SocialLayout = (typeof SOCIAL_LAYOUTS)[number];

export type SocialThemeName = "light" | "dark";

export type BigNumberLayout = {
  layout: "big-number";
  eyebrow: string;
  stat: string;
  statLabel: string;
  body: string;
};

export type MythRealityLayout = {
  layout: "myth-vs-reality";
  eyebrow: string;
  myth: string;
  reality: string;
};

export type ChecklistLayout = {
  layout: "checklist";
  eyebrow: string;
  title: string;
  items: string[];
};

export type BeforeAfterLayout = {
  layout: "before-after";
  eyebrow: string;
  beforeTitle: string;
  beforePoints: string[];
  afterTitle: string;
  afterPoints: string[];
};

export type OpinionQuoteLayout = {
  layout: "opinion-quote";
  eyebrow: string;
  quote: string;
  context: string;
};

export type TerminalSnippetLayout = {
  layout: "terminal-snippet";
  eyebrow: string;
  title: string;
  codeLines: string[];
  caption: string;
};

export type SocialLayoutPayload =
  | BigNumberLayout
  | MythRealityLayout
  | ChecklistLayout
  | BeforeAfterLayout
  | OpinionQuoteLayout
  | TerminalSnippetLayout;

export type CarouselSlide = {
  eyebrow: string;
  title: string;
  body: string;
  kind?: "cover" | "point" | "cta";
};

export type SocialPostRecord = {
  key: string;
  type: "independent" | "blog-share";
  status: "pending" | "published";
  format?: "image" | "carousel";
  layout?: SocialLayout | "carousel";
  theme?: SocialThemeName;
  topic?: string;
  hook?: string;
  caption?: string;
  facebookPostId?: string;
  commentId?: string;
  link?: string;
  publishedAt?: Date;
  createdAt?: Date;
  metrics?: {
    reach?: number;
    impressions?: number;
    reactions?: number;
    comments?: number;
    shares?: number;
    fetchedAt?: Date;
  };
};
