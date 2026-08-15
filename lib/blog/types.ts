export type BlogPost = {
  _id?: string;
  slug: string;
  title: string;
  excerpt: string;

  category: {
    _id?: string;
    name: string;
    slug: string;
    description?: string;
  };

  tags: string[];

  author: {
    name: string;
    role: string;
  };

  publishedAt: string;
  updatedAt?: string;

  readingTime: number;

  featured?: boolean;

  coverImage?: string;
  coverImageFileId?: string;

  contentPath: string;
  content?: string;
  status?: "draft" | "published";

  seo: {
    title: string;
    description: string;
    keywords?: string[];
    ogImage?: string;
  };
};
