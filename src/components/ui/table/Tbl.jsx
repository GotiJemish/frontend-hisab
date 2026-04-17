"use client";

/**
 * Table – full-featured styled data table
 *
 * Usage:
 *   <Table
 *     columns={[{ key: "name", header: "Name", sortable: true }, ...]}
 *     data={rows}
 *     onRowClick={(row) => console.log(row)}
 *     striped
 *     hoverable
 *   />
 *
 * @param {{ key: string, header: React.ReactNode, sortable?: boolean, align?: "left"|"center"|"right", render?: (value, row) => React.ReactNode }[]} columns
 * @param {Record<string, any>[]} data
 * @param {string}  caption
 * @param {boolean} striped
 * @param {boolean} hoverable
 * @param {boolean} compact
 * @param {boolean} loading
 * @param {string}  emptyMessage
 * @param {(row: any) => void} onRowClick
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
}) {
  const cellPy = compact ? "py-2.5" : "py-4";

  return (
    <div
      className={`w-full overflow-hidden rounded-xl border border-[#E2E8F0] dark:border-[#1F2937] ${className}`}
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-full text-sm">
          {caption && (
            <caption className="sr-only">{caption}</caption>
          )}

          {/* ── Head ── */}
          <thead>
            <tr className="border-b border-[#E2E8F0] dark:border-[#1F2937] bg-[#F8FAFC] dark:bg-[#0F172A]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={`
                    px-5 ${cellPy} text-xs font-semibold uppercase tracking-wider
                    text-[#94A3B8] dark:text-[#6B7280] whitespace-nowrap
                    ${col.align === "center" ? "text-center" : col.align === "right" ? "text-right" : "text-left"}
                  `}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          {/* ── Body ── */}
          <tbody>
            {loading ? (
              /* Skeleton rows */
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-[#E2E8F0] dark:border-[#1F2937]">
                  {columns.map((col) => (
                    <td key={col.key} className={`px-5 ${cellPy}`}>
                      <div className="h-4 rounded bg-[#E2E8F0] dark:bg-[#1F2937] animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className={`px-5 ${cellPy} text-center text-[#94A3B8] dark:text-[#6B7280]`}
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
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
    </div>
  );
}
