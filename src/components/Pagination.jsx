"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import './Pagination.css';

const Pagination = ({ currentPage, totalPages }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

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

  const getPageLink = (page) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page);
    return `${pathname}?${params.toString()}`;
  };

  const renderLink = (page, content, isDisabled, extraClass = '', ariaLabel, title) => {
    if (isDisabled) {
      return (
        <span
          className={`pager__btn ${extraClass} ${isDisabled && page === currentPage ? 'is-current' : ''}`}
          aria-label={ariaLabel}
          title={title}
          aria-disabled="true"
          style={page !== currentPage ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
        >
          {content}
        </span>
      );
    }
    return (
      <Link
        href={getPageLink(page)}
        className={`pager__btn ${extraClass}`}
        aria-label={ariaLabel}
        title={title}
      >
        {content}
      </Link>
    );
  };

  return (
    <nav className="pager" aria-label="Page navigation">
      {/* First */}
      {renderLink(1, <ChevronsLeft size={15} />, currentPage <= 1, 'pager__btn--icon', 'First page', 'First page')}
      
      {/* Prev */}
      {renderLink(currentPage - 1, <ChevronLeft size={15} />, currentPage <= 1, 'pager__btn--icon', 'Previous page')}

      {/* Page Numbers */}
      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`ellipsis-${i}`} className="pager__ellipsis">…</span>
        ) : (
          <React.Fragment key={p}>
            {renderLink(p, p, currentPage === p, '', `Page ${p}`)}
          </React.Fragment>
        )
      )}

      {/* Next */}
      {renderLink(currentPage + 1, <ChevronRight size={15} />, currentPage >= totalPages, 'pager__btn--icon', 'Next page')}

      {/* Last */}
      {renderLink(totalPages, <ChevronsRight size={15} />, currentPage >= totalPages, 'pager__btn--icon', 'Last page', 'Last page')}
    </nav>
  );
};

export default Pagination;
