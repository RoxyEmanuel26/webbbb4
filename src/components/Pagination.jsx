import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './Pagination.css';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  // Render a limited set of page numbers so it doesn't overflow on massive results
  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`page-btn ${currentPage === i ? 'active' : ''}`}
          onClick={() => onPageChange(i)}
          disabled={currentPage === i}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  return (
    <div className="pagination-container">
      <button
        className="page-nav-btn"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label="Previous Page"
      >
        &lt; Prev
      </button>
      
      <div className="page-numbers">
        {renderPageNumbers()}
      </div>

      <button
        className="page-nav-btn"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        aria-label="Next Page"
      >
        Next &gt;
      </button>
    </div>
  );
};

export default Pagination;
