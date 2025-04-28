"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

export function Pagination({ currentPage, totalPages, onPageChange }) {
  // Don't render pagination if there's only one page
  if (totalPages <= 1) return null

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return
    onPageChange(page)
  }

  // Calculate which page numbers to show
  const getPageNumbers = () => {
    const pages = []

    // Always show first page
    pages.push(1)

    // Calculate range around current page
    let rangeStart = Math.max(2, currentPage - 1)
    let rangeEnd = Math.min(totalPages - 1, currentPage + 1)

    // Adjust range to always show 3 pages if possible
    if (rangeEnd - rangeStart < 2) {
      if (rangeStart === 2) {
        rangeEnd = Math.min(totalPages - 1, rangeStart + 2)
      } else if (rangeEnd === totalPages - 1) {
        rangeStart = Math.max(2, rangeEnd - 2)
      }
    }

    // Add ellipsis before range if needed
    if (rangeStart > 2) {
      pages.push("ellipsis1")
    }

    // Add range pages
    for (let i = rangeStart; i <= rangeEnd; i++) {
      pages.push(i)
    }

    // Add ellipsis after range if needed
    if (rangeEnd < totalPages - 1) {
      pages.push("ellipsis2")
    }

    // Always show last page if more than 1 page
    if (totalPages > 1) {
      pages.push(totalPages)
    }

    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <div className="flex items-center justify-center space-x-2">
      <Button variant="outline" size="icon" onClick={() => handlePageChange(1)} disabled={currentPage === 1}>
        <ChevronsLeft className="h-4 w-4" />
        <span className="sr-only">First page</span>
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Previous page</span>
      </Button>

      {pageNumbers.map((page, i) => {
        if (page === "ellipsis1" || page === "ellipsis2") {
          return (
            <Button key={page} variant="outline" size="icon" disabled>
              <span>...</span>
            </Button>
          )
        }

        return (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            onClick={() => handlePageChange(page)}
          >
            {page}
          </Button>
        )
      })}

      <Button
        variant="outline"
        size="icon"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Next page</span>
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={() => handlePageChange(totalPages)}
        disabled={currentPage === totalPages}
      >
        <ChevronsRight className="h-4 w-4" />
        <span className="sr-only">Last page</span>
      </Button>
    </div>
  )
}
