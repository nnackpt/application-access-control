import React from "react"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  // แสดงเฉพาะหน้าแรก หน้าสุดท้าย และหน้าที่อยู่ใกล้ currentPage
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
    <div className="flex items-center space-x-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        Previous
      </button>
      <div className="flex space-x-1">
        {pages.map((page, idx, arr) => {
          const prev = arr[idx - 1]
          const showDots = prev && page - prev > 1
          return (
            <React.Fragment key={page}>
              {showDots && <span className="px-2 py-1 text-gray-400">...</span>}
              <button
                onClick={() => onPageChange(page)}
                className={`px-3 py-1 border rounded text-sm ${
                  currentPage === page
                    ? 'bg-[#005495] text-white border-[#005496]'
                    : 'border-gray-300 hover:bg-gray-50'
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
        className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        Next
      </button>
    </div>
  )
}