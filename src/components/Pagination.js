import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

function Pagination({ 
  currentPage, 
  totalPages, 
  pageSize, 
  totalItems, 
  onPageChange, 
  onPageSizeChange 
}) {
  if (totalItems === 0) return null;

  const pageSizes = [10, 20, 50, 100];
  
  // Generate page numbers to show
  const getPageNumbers = () => {
    const delta = 2; // Number of pages to show around current page
    const pages = [];
    
    // Always show first page
    pages.push(1);
    
    // Calculate range around current page
    const start = Math.max(2, currentPage - delta);
    const end = Math.min(totalPages - 1, currentPage + delta);
    
    // Add ellipsis after first page if needed
    if (start > 2) {
      pages.push('...');
    }
    
    // Add pages around current page
    for (let i = start; i <= end; i++) {
      if (i !== 1 && i !== totalPages) {
        pages.push(i);
      }
    }
    
    // Add ellipsis before last page if needed
    if (end < totalPages - 1) {
      pages.push('...');
    }
    
    // Always show last page (if more than 1 page)
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    return pages;
  };

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="bg-white border-t border-secondary-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Items info and page size selector */}
        <div className="flex items-center space-x-4">
          <div className="text-sm text-secondary-700">
            Showing <span className="font-medium">{startItem}</span> to{' '}
            <span className="font-medium">{endItem}</span> of{' '}
            <span className="font-medium">{totalItems}</span> messages
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-secondary-600">Show:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(parseInt(e.target.value))}
              className="text-sm border border-secondary-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {pageSizes.map(size => (
                <option key={size} value={size}>
                  {size} per page
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Pagination controls */}
        <div className="flex items-center space-x-2">
          {/* Previous button */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 text-secondary-600 hover:text-secondary-900 disabled:text-secondary-300 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* Page numbers */}
          <div className="flex items-center space-x-1">
            {getPageNumbers().map((page, index) => {
              if (page === '...') {
                return (
                  <span key={`ellipsis-${index}`} className="px-2 py-1 text-secondary-500">
                    <MoreHorizontal className="h-4 w-4" />
                  </span>
                );
              }
              
              const isCurrentPage = page === currentPage;
              return (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`px-3 py-1 text-sm rounded transition-colors ${
                    isCurrentPage
                      ? 'bg-primary-600 text-white'
                      : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100'
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>

          {/* Next button */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 text-secondary-600 hover:text-secondary-900 disabled:text-secondary-300 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Pagination; 