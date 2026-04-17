"use client";

/**
 * Button component
 *
 * @param {"primary"|"secondary"|"danger"|"success"|"warning"|"info"|"ghost"|"outline"} variant
 * @param {"sm"|"md"|"lg"} size
 * @param {boolean} disabled
 * @param {boolean} loading
 * @param {string} className  - extra Tailwind classes
 * @param {React.ReactNode} leftIcon
 * @param {React.ReactNode} rightIcon
 */
export default function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  type = "button",
  className = "",
  leftIcon,
  rightIcon,
  onClick,
  ...props
}) {
  const base =
    "inline-flex items-center justify-center gap-2 font-semibold rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none";

  const sizes = {
    sm: "text-xs px-3 py-1.5 gap-1.5",
    md: "text-sm px-4 py-2",
    lg: "text-base px-6 py-2.5",
  };

  const variants = {
    primary:
      "bg-[#2563EB] text-white border-[#2563EB] hover:bg-[#1D4ED8] hover:border-[#1D4ED8] focus:ring-[#2563EB] dark:bg-[#3B82F6] dark:border-[#3B82F6] dark:hover:bg-[#2563EB] dark:hover:border-[#2563EB] dark:focus:ring-[#3B82F6]",
    secondary:
      "bg-[#0F172A] text-white border-[#0F172A] hover:bg-[#1E293B] hover:border-[#1E293B] focus:ring-[#0F172A] dark:bg-[#E2E8F0] dark:text-[#0F172A] dark:border-[#E2E8F0] dark:hover:bg-white dark:focus:ring-[#E2E8F0]",
    danger:
      "bg-[#EF4444] text-white border-[#EF4444] hover:bg-[#DC2626] hover:border-[#DC2626] focus:ring-[#EF4444] dark:bg-[#F87171] dark:border-[#F87171] dark:text-white dark:hover:bg-[#EF4444] dark:focus:ring-[#F87171]",
    success:
      "bg-[#22C55E] text-white border-[#22C55E] hover:bg-[#16A34A] hover:border-[#16A34A] focus:ring-[#22C55E]",
    warning:
      "bg-[#F59E0B] text-white border-[#F59E0B] hover:bg-[#D97706] hover:border-[#D97706] focus:ring-[#F59E0B] dark:bg-[#FBBF24] dark:border-[#FBBF24] dark:text-[#0F172A]",
    info:
      "bg-[#0EA5E9] text-white border-[#0EA5E9] hover:bg-[#0284C7] hover:border-[#0284C7] focus:ring-[#0EA5E9] dark:bg-[#38BDF8] dark:border-[#38BDF8] dark:text-[#0F172A]",
    ghost:
      "bg-transparent text-[#2563EB] border-transparent hover:bg-[#F1F5F9] focus:ring-[#2563EB] dark:text-[#3B82F6] dark:hover:bg-[#1E293B]",
    outline:
      "bg-transparent text-[#2563EB] border-[#2563EB] hover:bg-[#2563EB] hover:text-white focus:ring-[#2563EB] dark:text-[#3B82F6] dark:border-[#3B82F6] dark:hover:bg-[#3B82F6] dark:hover:text-white",
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      aria-busy={loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4 shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {!loading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
      <span>{children}</span>
      {!loading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
}
