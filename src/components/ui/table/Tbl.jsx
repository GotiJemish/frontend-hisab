"use client";

import { useState, useMemo } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Table – full-featured styled data table with sorting and pagination
 *
 * Usage:
 *   <Table
 *     columns={[{ key: "name", header: "Name", sortable: true }, ...]}
 *     data={rows}
 *     onRowClick={(row) => console.log(row)}
 *     striped
 *     hoverable
 *     pagination
 *     rowsPerPage={10}
 *   />
 */
export default function Table({
  columns = [],
  data = [],
  caption,
  striped = false,
  hoverable = true,
  compact = false,
  loading = false,
  emptyMessage = "No data available.",
  onRowClick,
  className = "",
  pagination = false,
  rowsPerPage = 10,
  serverPagination = false,
  totalItems = 0,
  page = 1,
  onPageChange,
}) {
  const cellPy = compact ? "py-2.5" : "py-4";

  // State for client-side sorting/pagination
  const [sortConfig, setSortConfig] = useState(null);
  const [internalPage, setInternalPage] = useState(1);

  const currentPage = serverPagination ? page : internalPage;
  
  // Sorting logic
  const sortedData = useMemo(() => {
    let sortableItems = [...data];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key] ?? "";
        const bValue = b[sortConfig.key] ?? "";
        
        // Handle numeric values
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
        }

        // Handle string comparison
        const aStr = String(aValue).toLowerCase();
        const bStr = String(bValue).toLowerCase();
        if (aStr < bStr) return sortConfig.direction === "asc" ? -1 : 1;
        if (aStr > bStr) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [data, sortConfig]);

  // Handle header click
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
    if (!serverPagination) setInternalPage(1);
  };

  // Pagination logic
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;
    if (serverPagination) return sortedData; // Data comes pre-sliced
    const startIndex = (internalPage - 1) * rowsPerPage;
    return sortedData.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedData, pagination, internalPage, rowsPerPage, serverPagination]);

  const totalPages = serverPagination 
    ? Math.ceil(totalItems / rowsPerPage) 
    : Math.ceil(sortedData.length / rowsPerPage);
  
  const currentTotal = serverPagination ? totalItems : sortedData.length;

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      if (serverPagination) onPageChange?.(currentPage + 1);
      else setInternalPage(p => p + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      if (serverPagination) onPageChange?.(currentPage - 1);
      else setInternalPage(p => p - 1);
    }
  };

  return (
    <div className={`w-full overflow-hidden rounded-xl border border-[#E2E8F0] dark:border-[#1F2937] ${className} bg-white dark:bg-[#111827] flex flex-col`}>
      <div className="overflow-x-auto flex-1">
        <table className="w-full min-w-full text-sm">
          {caption && <caption className="sr-only">{caption}</caption>}

          {/* ── Head ── */}
          <thead>
            <tr className="border-b border-[#E2E8F0] dark:border-[#1F2937] bg-[#F8FAFC] dark:bg-[#0F172A]">
              {columns.map((col) => {
                const isSorted = sortConfig?.key === col.key;
                
                return (
                  <th
                    key={col.key}
                    scope="col"
                    onClick={() => col.sortable ? requestSort(col.key) : null}
                    className={`
                      px-5 ${cellPy} text-xs font-semibold uppercase tracking-wider
                      text-[#94A3B8] dark:text-[#6B7280] whitespace-nowrap select-none
                      ${col.align === "center" ? "text-center" : col.align === "right" ? "text-right" : "text-left"}
                      ${col.sortable ? "cursor-pointer hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] hover:text-[#0F172A] dark:hover:text-white transition-colors" : ""}
                    `}
                  >
                    <div className={`flex items-center gap-1.5 ${col.align === "center" ? "justify-center" : col.align === "right" ? "justify-end" : "justify-start"}`}>
                      {col.header}
                      {col.sortable && (
                        <span className="flex-shrink-0 text-[#CBD5E1] dark:text-[#475569]">
                          {isSorted && sortConfig.direction === "asc" ? (
                            <ChevronUp className="h-3.5 w-3.5 text-[#2563EB] dark:text-[#3B82F6]" />
                          ) : isSorted && sortConfig.direction === "desc" ? (
                            <ChevronDown className="h-3.5 w-3.5 text-[#2563EB] dark:text-[#3B82F6]" />
                          ) : (
                            <ChevronsUpDown className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* ── Body ── */}
          <tbody>
            {loading ? (
              /* Skeleton rows */
              Array.from({ length: Math.min(rowsPerPage, 5) }).map((_, i) => (
                <tr key={i} className="border-b border-[#E2E8F0] dark:border-[#1F2937]">
                  {columns.map((col) => (
                    <td key={col.key} className={`px-5 ${cellPy}`}>
                      <div className="h-4 rounded bg-[#E2E8F0] dark:bg-[#1F2937] animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className={`px-5 py-8 text-center text-[#94A3B8] dark:text-[#6B7280]`}
                >
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-4xl mb-2">📁</span>
                    <span>{emptyMessage}</span>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIdx) => (
                <tr
                  key={rowIdx}
                  onClick={() => onRowClick?.(row)}
                  className={[
                    "border-b border-[#E2E8F0] dark:border-[#1F2937]",
                    "last:border-b-0",
                    "transition-colors duration-100",
                    striped && rowIdx % 2 === 1
                      ? "bg-[#F8FAFC] dark:bg-[#0F172A]/50"
                      : "bg-white dark:bg-[#111827]",
                    hoverable
                      ? "hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B]"
                      : "",
                    onRowClick ? "cursor-pointer" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`
                        px-5 ${cellPy} text-[#0F172A] dark:text-[#E5E7EB]
                        ${col.align === "center" ? "text-center" : col.align === "right" ? "text-right" : "text-left"}
                      `}
                    >
                      {col.render
                        ? col.render(row[col.key], row, rowIdx)
                        : row[col.key] ?? "—"}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination Footer ── */}
      {pagination && currentTotal > 0 && !loading && (
        <div className="px-5 py-3 border-t border-[#E2E8F0] dark:border-[#1F2937] flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#F8FAFC] dark:bg-[#0F172A]">
          <div className="text-xs text-[#64748B] dark:text-[#94A3B8]">
            Showing <span className="font-semibold text-[#0F172A] dark:text-[#E2E8F0]">{(currentPage - 1) * rowsPerPage + 1}</span> to <span className="font-semibold text-[#0F172A] dark:text-[#E2E8F0]">{Math.min(currentPage * rowsPerPage, currentTotal)}</span> of <span className="font-semibold text-[#0F172A] dark:text-[#E2E8F0]">{currentTotal}</span> results
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="p-1 rounded-md text-[#64748B] dark:text-[#94A3B8] hover:bg-[#E2E8F0] dark:hover:bg-[#1E293B] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="text-xs font-medium text-[#0F172A] dark:text-[#E2E8F0] px-2">
              Page {currentPage} of {totalPages}
            </div>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="p-1 rounded-md text-[#64748B] dark:text-[#94A3B8] hover:bg-[#E2E8F0] dark:hover:bg-[#1E293B] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Next page"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
