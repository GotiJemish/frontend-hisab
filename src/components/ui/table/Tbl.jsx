"use client";

import { useState, useMemo } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight, FileSpreadsheet, FileText } from "lucide-react";

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
  showExport = true,
}) {
  const cellPy = compact ? "py-2.5" : "py-4";

  // State for client-side sorting/pagination
  const [sortConfig, setSortConfig] = useState(null);
  const [internalPage, setInternalPage] = useState(1);

  // Helper to extract text from JSX element/nodes for Excel/PDF exports
  const extractTextFromJSX = (node) => {
    if (node === null || node === undefined) return "";
    if (typeof node === "string" || typeof node === "number" || typeof node === "boolean") {
      return String(node);
    }
    if (Array.isArray(node)) {
      return node.map(extractTextFromJSX).join(" ");
    }
    if (typeof node === "object") {
      if (node.props) {
        return extractTextFromJSX(node.props.children);
      }
      return "";
    }
    return "";
  };

  const handleExportCSV = () => {
    const exportableColumns = columns.filter(col => col.key !== "actions" && col.key !== "select" && col.header);
    
    // Construct headers row
    const headers = exportableColumns.map(col => `"${String(col.header).replace(/"/g, '""')}"`).join(",");
    
    // Construct data rows
    const rows = sortedData.map(row => {
      return exportableColumns.map(col => {
        let val = "";
        if (col.renderText) {
          val = col.renderText(row[col.key], row);
        } else if (col.render) {
          try {
            const jsx = col.render(row[col.key], row);
            val = extractTextFromJSX(jsx) || (row[col.key] !== undefined ? String(row[col.key]) : "");
          } catch (e) {
            val = row[col.key] !== undefined ? String(row[col.key]) : "";
          }
        } else {
          val = row[col.key] !== undefined ? String(row[col.key]) : "";
        }
        return `"${String(val).replace(/"/g, '""')}"`;
      }).join(",");
    });

    const blob = new Blob(["\uFEFF" + [headers, ...rows].join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${caption || "export"}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    const exportableColumns = columns.filter(col => col.key !== "actions" && col.key !== "select" && col.header);
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to export PDF.");
      return;
    }

    const dateStr = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

    const headersHTML = exportableColumns.map(col => `
      <th style="text-align: left; padding: 10px; border-bottom: 2px solid #E2E8F0; font-weight: 600; font-size: 12px; color: #4A5568;">
        ${col.header}
      </th>
    `).join("");

    const rowsHTML = sortedData.map((row, idx) => {
      const cellsHTML = exportableColumns.map(col => {
        let val = "";
        if (col.renderText) {
          val = col.renderText(row[col.key], row);
        } else if (col.render) {
          try {
            const jsx = col.render(row[col.key], row);
            val = extractTextFromJSX(jsx) || (row[col.key] !== undefined ? String(row[col.key]) : "");
          } catch (e) {
            val = row[col.key] !== undefined ? String(row[col.key]) : "";
          }
        } else {
          val = row[col.key] !== undefined ? String(row[col.key]) : "-";
        }
        return `
          <td style="padding: 10px; border-bottom: 1px solid #EDF2F7; font-size: 11px; color: #2D3748;">
            ${val}
          </td>
        `;
      }).join("");
      const bg = idx % 2 === 1 ? 'background-color: #F8FAFC;' : '';
      return `<tr style="${bg}">${cellsHTML}</tr>`;
    }).join("");

    const title = caption || "Hisaab Report";

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <style>
          @media print {
            body { -webkit-print-color-adjust: exact; }
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            margin: 40px;
            color: #2D3748;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            border-bottom: 2px solid #E2E8F0;
            padding-bottom: 15px;
            margin-bottom: 30px;
          }
          .title {
            font-size: 24px;
            font-weight: bold;
            color: #1A202C;
            margin: 0;
          }
          .meta {
            font-size: 12px;
            color: #718096;
            text-align: right;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          .footer {
            margin-top: 50px;
            font-size: 11px;
            color: #A0AEC0;
            text-align: center;
            border-top: 1px solid #E2E8F0;
            padding-top: 15px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="title">${title}</h1>
            <div style="font-size: 12px; color: #4A5568; margin-top: 5px;">HISAAB Management System</div>
          </div>
          <div class="meta">
            <div>Generated on: ${dateStr}</div>
            <div>Total Records: ${sortedData.length}</div>
          </div>
        </div>
        
        <table>
          <thead>
            <tr>${headersHTML}</tr>
          </thead>
          <tbody>
            ${rowsHTML}
          </tbody>
        </table>

        <div class="footer">
          This is a system generated report. HISAAB Ledger Export.
        </div>

        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

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

      {/* ── Table Footer (Pagination & Export Actions) ── */}
      {(pagination || showExport) && currentTotal > 0 && !loading && (
        <div className="px-5 py-3 border-t border-[#E2E8F0] dark:border-[#1F2937] flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#F8FAFC] dark:bg-[#0F172A] print-hide">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 text-xs text-[#64748B] dark:text-[#94A3B8]">
            {pagination ? (
              <div>
                Showing <span className="font-semibold text-[#0F172A] dark:text-[#E2E8F0]">{(currentPage - 1) * rowsPerPage + 1}</span> to <span className="font-semibold text-[#0F172A] dark:text-[#E2E8F0]">{Math.min(currentPage * rowsPerPage, currentTotal)}</span> of <span className="font-semibold text-[#0F172A] dark:text-[#E2E8F0]">{currentTotal}</span> results
              </div>
            ) : (
              <div>
                Total <span className="font-semibold text-[#0F172A] dark:text-[#E2E8F0]">{currentTotal}</span> records
              </div>
            )}
            {showExport && (
              <div className="flex items-center gap-2 sm:border-l border-[#E2E8F0] dark:border-[#1F2937] sm:pl-4">
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[#E2E8F0] dark:border-[#1F2937] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] text-slate-700 dark:text-slate-350 font-semibold transition-colors cursor-pointer"
                  title="Export to Excel / CSV"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-500" />
                  <span>Excel</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportPDF}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[#E2E8F0] dark:border-[#1F2937] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] text-slate-700 dark:text-slate-350 font-semibold transition-colors cursor-pointer"
                  title="Print / Export to PDF"
                >
                  <FileText className="h-3.5 w-3.5 text-rose-600 dark:text-rose-500" />
                  <span>PDF</span>
                </button>
              </div>
            )}
          </div>
          {pagination && (
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
          )}
        </div>
      )}
    </div>
  );
}
