import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ 
  currentPage, 
  totalPages, 
  onPageChange 
}) => {
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    pages.push(1);
    
    if (currentPage > 3) {
      pages.push('...');
    }
    
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    if (currentPage < totalPages - 2) {
      pages.push('...');
    }
    
    pages.push(totalPages);
    
    return pages;
  };

  return (
    <div className="pagination">
      <button 
        className="pagination-button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Previous
      </button>
      
      <div className="pagination-numbers">
        {getPageNumbers().map((page, index) => (
          <button
            key={index}
            className={`pagination-number ${
              page === currentPage ? 'active' : ''
            } ${typeof page === 'string' ? 'dots' : ''}`}
            onClick={() => typeof page === 'number' && onPageChange(page)}
            disabled={typeof page === 'string'}
          >
            {page}
          </button>
        ))}
      </div>
      
      <button
        className="pagination-button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;