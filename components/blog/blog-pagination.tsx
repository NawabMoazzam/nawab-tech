import Link from "next/link";

type Props = {
  currentPage: number;
  totalPages: number;
};

function pageHref(page: number) {
  return page <= 1 ? "/blog" : `/blog/page/${page}`;
}

export function BlogPagination({ currentPage, totalPages }: Props) {
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="Blog pagination"
      className="flex items-center justify-between gap-4 border-t border-border p-6 sm:p-10"
    >
      {currentPage > 1 ? (
        <Link
          href={pageHref(currentPage - 1)}
          className="text-sm font-medium text-foreground transition-colors hover:text-primary"
        >
          ← Previous
        </Link>
      ) : (
        <span className="text-sm text-muted-foreground">← Previous</span>
      )}

      <span className="text-xs uppercase tracking-widest text-muted-foreground">
        Page {currentPage} of {totalPages}
      </span>

      {currentPage < totalPages ? (
        <Link
          href={pageHref(currentPage + 1)}
          className="text-sm font-medium text-foreground transition-colors hover:text-primary"
        >
          Next →
        </Link>
      ) : (
        <span className="text-sm text-muted-foreground">Next →</span>
      )}
    </nav>
  );
}
