"use client";

/**
 * Table Row – for manually constructing table rows
 *
 * @param {boolean}         striped    force alternate background
 * @param {boolean}         hoverable
 * @param {() => void}      onClick
 * @param {string}          className
 */
export default function Row({
  striped = false,
  hoverable = true,
  onClick,
  className = "",
  children,
  ...props
}) {
  return (
    <tr
      onClick={onClick}
      className={[
        "border-b border-[#E2E8F0] dark:border-[#1F2937] last:border-b-0 transition-colors duration-100",
        striped ? "bg-[#F8FAFC] dark:bg-[#0F172A]/50" : "bg-white dark:bg-[#111827]",
        hoverable ? "hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B]" : "",
        onClick ? "cursor-pointer" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </tr>
  );
}
