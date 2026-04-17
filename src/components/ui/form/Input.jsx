"use client";

/**
 * InputField component
 *
 * @param {"text"|"email"|"password"|"number"|"search"|"tel"|"url"} type
 * @param {string}  label
 * @param {string}  id
 * @param {string}  placeholder
 * @param {string}  helperText
 * @param {string}  error         - error message (also sets error styling)
 * @param {boolean} required
 * @param {boolean} disabled
 * @param {React.ReactNode} leftIcon
 * @param {React.ReactNode} rightIcon
 */
export default function InputField({
  type = "text",
  label,
  id,
  placeholder = "",
  helperText,
  error,
  required = false,
  disabled = false,
  leftIcon,
  rightIcon,
  className = "",
  ...props
}) {
  const inputBase =
    "w-full rounded-lg border bg-white text-sm text-[#0F172A] placeholder-[#94A3B8] transition-all duration-150 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-[#111827] dark:text-[#E5E7EB] dark:placeholder-[#6B7280]";

  const normalBorder =
    "border-[#E2E8F0] focus:border-[#2563EB] focus:ring-[#2563EB]/20 dark:border-[#1F2937] dark:focus:border-[#3B82F6] dark:focus:ring-[#3B82F6]/20";

  const errorBorder =
    "border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]/20 dark:border-[#F87171] dark:focus:border-[#F87171] dark:focus:ring-[#F87171]/20";

  const paddingClass = leftIcon
    ? rightIcon
      ? "pl-10 pr-10 py-2.5"
      : "pl-10 pr-4 py-2.5"
    : rightIcon
    ? "pl-4 pr-10 py-2.5"
    : "px-4 py-2.5";

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium text-[#0F172A] dark:text-[#E2E8F0]"
        >
          {label}
          {required && (
            <span className="ml-1 text-[#EF4444] dark:text-[#F87171]" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] dark:text-[#6B7280] pointer-events-none">
            {leftIcon}
          </span>
        )}

        <input
          id={id}
          type={type}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${id}-error` : helperText ? `${id}-helper` : undefined
          }
          className={`${inputBase} ${error ? errorBorder : normalBorder} ${paddingClass}`}
          {...props}
        />

        {rightIcon && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] dark:text-[#6B7280]">
            {rightIcon}
          </span>
        )}
      </div>

      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="text-xs text-[#EF4444] dark:text-[#F87171]"
        >
          {error}
        </p>
      )}

      {!error && helperText && (
        <p id={`${id}-helper`} className="text-xs text-[#94A3B8] dark:text-[#6B7280]">
          {helperText}
        </p>
      )}
    </div>
  );
}
