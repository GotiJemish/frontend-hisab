"use client";

/**
 * Table Cell – used when building custom table rows manually
 *
 * @param {"td"|"th"}             as
 * @param {"left"|"center"|"right"} align
 * @param {boolean}               compact
 * @param {string}                className
 */
export default function Cell({
  as: Tag = "td",
  align = "left",
  compact = false,
  className = "",
  children,
  ...props
}) {
  const alignClass =
    align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left";

  const py = compact ? "py-2.5" : "py-4";

  const baseClass =
    Tag === "th"
      ? `px-5 ${py} text-xs font-semibold uppercase tracking-wider text-[#94A3B8] dark:text-[#6B7280] bg-[#F8FAFC] dark:bg-[#0F172A]`
      : `px-5 ${py} text-sm text-[#0F172A] dark:text-[#E5E7EB]`;

  return (
    <Tag
      className={`${baseClass} ${alignClass} ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
}
