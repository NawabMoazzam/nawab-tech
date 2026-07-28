export type BlogCategory = {
  name: string;
  slug: string;
};

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;

  category: BlogCategory;

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

  seo: {
    title: string;
    description: string;
  };
};
