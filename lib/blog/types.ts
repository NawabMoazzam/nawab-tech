export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;

  category: {
    name: string;
    slug: string;
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

  contentPath: string;

  seo: {
    title: string;
    description: string;
  };
};
