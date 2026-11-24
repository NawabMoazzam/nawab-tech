"use client";

import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Props = {
  content: string;
};

const components: Components = {
  table({ children, ...props }) {
    return (
      <div className="overflow-x-auto max-w-full">
        <table {...props}>{children}</table>
      </div>
    );
  },
  pre({ children, ...props }) {
    return (
      <pre className="overflow-x-auto max-w-full" {...props}>
        {children}
      </pre>
    );
  },
  code({ className, children, ...props }) {
    const isBlock = /language-/.test(className || "");
    if (isBlock) {
      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }
    return (
      <code
        className={[className, "break-words [overflow-wrap:anywhere]"]
          .filter(Boolean)
          .join(" ")}
        {...props}
      >
        {children}
      </code>
    );
  },
};

export function ArticleContent({ content }: Props) {
  return (
    <div className="prose prose-lg dark:prose-invert max-w-none break-words [overflow-wrap:anywhere] prose-headings:tracking-tight prose-headings:font-medium prose-h2:text-primary prose-h1:text-primary prose-a:text-primary hover:prose-a:underline prose-img:rounded-lg prose-img:border">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
