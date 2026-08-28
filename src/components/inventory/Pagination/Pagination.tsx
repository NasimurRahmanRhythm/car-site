import Link from "next/link";
import styles from "./Pagination.module.css";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
  searchParams: Record<string, string | undefined>;
}

function buildHref(basePath: string, searchParams: Record<string, string | undefined>, page: number) {
  const params = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value && key !== "page") params.set(key, value);
  });
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export function Pagination({ currentPage, totalPages, basePath, searchParams }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav className={styles.pagination} aria-label="Pagination">
      <Link
        href={buildHref(basePath, searchParams, Math.max(1, currentPage - 1))}
        className={`${styles.pageLink} ${currentPage === 1 ? styles.disabled : ""}`}
        aria-label="Previous page"
      >
        ‹
      </Link>

      {pages.map((page) => (
        <Link
          key={page}
          href={buildHref(basePath, searchParams, page)}
          className={`${styles.pageLink} ${page === currentPage ? styles.active : ""}`}
        >
          {page}
        </Link>
      ))}

      <Link
        href={buildHref(basePath, searchParams, Math.min(totalPages, currentPage + 1))}
        className={`${styles.pageLink} ${currentPage === totalPages ? styles.disabled : ""}`}
        aria-label="Next page"
      >
        ›
      </Link>
    </nav>
  );
}
