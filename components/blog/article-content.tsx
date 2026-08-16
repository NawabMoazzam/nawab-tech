"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Props = {
  content: string;
};

export function ArticleContent({ content }: Props) {
  return (
    <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:tracking-tight prose-headings:font-medium prose-h2:text-primary prose-h1:text-primary prose-a:text-primary hover:prose-a:underline prose-img:rounded-lg prose-img:border">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
