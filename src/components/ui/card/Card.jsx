"use client";

/**
 * Card component
 *
 * @param {"default"|"elevated"|"flat"|"outlined"} variant
 * @param {string}  className  extra Tailwind overrides
 * @param {React.ReactNode} header  - optional header slot
 * @param {React.ReactNode} footer  - optional footer slot
 * @param {boolean} hover  - adds hover lift effect
 */
export default function Card({
  children,
  variant = "default",
  className = "",
  header,
  footer,
  hover = false,
  ...props
}) {
  const base =
    "rounded-xl border overflow-hidden transition-all duration-200";

  const variants = {
    default:
      "bg-white border-[#E2E8F0] shadow-sm dark:bg-[#111827] dark:border-[#1F2937]",
    elevated:
      "bg-white border-[#E2E8F0] shadow-md dark:bg-[#111827] dark:border-[#1F2937]",
    flat:
      "bg-[#F8FAFC] border-[#E2E8F0] dark:bg-[#0F172A] dark:border-[#1F2937]",
    outlined:
      "bg-transparent border-2 border-[#2563EB] dark:border-[#3B82F6]",
  };

  const hoverClass = hover
    ? "hover:-translate-y-1 hover:shadow-lg cursor-pointer"
    : "";

  return (
    <div
      className={`${base} ${variants[variant]} ${hoverClass} ${className}`}
      {...props}
    >
      {header && (
        <div className="px-5 py-4 border-b border-[#E2E8F0] dark:border-[#1F2937]">
          {header}
        </div>
      )}

      <div className="p-5">{children}</div>

      {footer && (
        <div className="px-5 py-4 border-t border-[#E2E8F0] dark:border-[#1F2937] bg-[#F8FAFC] dark:bg-[#0F172A]">
          {footer}
        </div>
      )}
    </div>
  );
}
