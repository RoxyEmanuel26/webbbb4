import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import './Pagination.css';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (!totalPages || totalPages <= 1) return null;

  /* Build page number array with ellipsis */
  const buildPages = () => {
    const pages = [];
    const delta = 2;
    const left  = Math.max(1, currentPage - delta);
    const right = Math.min(totalPages, currentPage + delta);

    if (left > 1) {
      pages.push(1);
      if (left > 2) pages.push('…');
    }
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages) {
      if (right < totalPages - 1) pages.push('…');
      pages.push(totalPages);
    }
    return pages;
  };

  const pages = buildPages();

  return (
    <nav className="pager" aria-label="Page navigation">
      {/* First */}
      <button
        className="pager__btn pager__btn--icon"
        onClick={() => onPageChange(1)}
        disabled={currentPage <= 1}
        aria-label="First page"
        title="First page"
      >
        <ChevronsLeft size={15} />
      </button>

      {/* Prev */}
      <button
        className="pager__btn pager__btn--icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label="Previous page"
      >
        <ChevronLeft size={15} />
      </button>

      {/* Page Numbers */}
      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`ellipsis-${i}`} className="pager__ellipsis">…</span>
        ) : (
          <button
            key={p}
            className={`pager__btn ${currentPage === p ? 'is-current' : ''}`}
            onClick={() => onPageChange(p)}
            disabled={currentPage === p}
            aria-label={`Page ${p}`}
            aria-current={currentPage === p ? 'page' : undefined}
          >
            {p}
          </button>
        )
      )}

      {/* Next */}
      <button
        className="pager__btn pager__btn--icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        aria-label="Next page"
      >
        <ChevronRight size={15} />
      </button>

      {/* Last */}
      <button
        className="pager__btn pager__btn--icon"
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage >= totalPages}
        aria-label="Last page"
        title="Last page"
      >
        <ChevronsRight size={15} />
      </button>
    </nav>
  );
};

export default Pagination;
