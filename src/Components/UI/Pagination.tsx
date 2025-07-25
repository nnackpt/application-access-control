import React from "react"
import { ChevronLeft, ChevronRight } from 'lucide-react'; // Import Lucide icons

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const getPages = () => {
    const pages = []
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        Math.abs(i - currentPage) <= 1
      ) {
        pages.push(i)
      }
    }
    return pages
  }

  const pages = getPages()

  return (
    <nav className="flex items-center justify-center space-x-2" aria-label="Pagination">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
      >
        <ChevronLeft className="h-4 w-4 mr-1" /> {/* Lucide Left Arrow Icon */}
        Previous
      </button>

      {/* Changed from `flex -space-x-px` to `flex space-x-1` for spacing */}
      <div className="flex space-x-1">
        {pages.map((page, idx, arr) => {
          const prev = arr[idx - 1]
          const showDots = prev && page - prev > 1
          return (
            <React.Fragment key={page}>
              {showDots && (
                <span className="relative inline-flex items-center px-3 py-2 text-gray-400">
                  ...
                </span>
              )}
              <button
                onClick={() => onPageChange(page)}
                aria-current={currentPage === page ? 'page' : undefined}
                className={`relative inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium transition-colors duration-200 ${ // Added rounded-md here
                  currentPage === page
                    ? 'bg-[var(--primary-color)] text-white border-[var(--primary-color)]'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            </React.Fragment>
          )
        })}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
      >
        Next
        <ChevronRight className="h-4 w-4 ml-1" /> {/* Lucide Right Arrow Icon */}
      </button>
    </nav>
  )
}