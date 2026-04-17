"use client";

/**
 * Textarea component
 * 
 * @param {string} label
 * @param {string} id
 * @param {number} rows
 * @param {string} error
 * @param {boolean} required
 */
export default function Textarea({
  label,
  id,
  rows = 4,
  error,
  required = false,
  className = "",
  maxLength,
  value = "",
  ...props
}) {
  const textareaBase =
    "w-full rounded-lg border bg-white px-4 py-2.5 text-sm text-[#0F172A] placeholder-[#94A3B8] transition-all duration-150 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-[#111827] dark:text-[#E5E7EB] dark:placeholder-[#6B7280]";

  const normalBorder =
    "border-[#E2E8F0] focus:border-[#2563EB] focus:ring-[#2563EB]/20 dark:border-[#1F2937] dark:focus:border-[#3B82F6] dark:focus:ring-[#3B82F6]/20";

  const errorBorder =
    "border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]/20 dark:border-[#F87171] dark:focus:border-[#F87171] dark:focus:ring-[#F87171]/20";

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium text-[#0F172A] dark:text-[#E2E8F0]"
        >
          {label}
          {required && <span className="ml-1 text-[#EF4444]">*</span>}
        </label>
      )}

      <textarea
        id={id}
        rows={rows}
        required={required}
        maxLength={maxLength}
        className={`${textareaBase} ${error ? errorBorder : normalBorder}`}
        value={value}
        {...props}
      />

      <div className="flex justify-between">
        {error && (
          <p className="text-xs text-[#EF4444] dark:text-[#F87171]">{error}</p>
        )}
        {maxLength && (
          <p className="ml-auto text-[10px] text-[#94A3B8] dark:text-[#6B7280]">
            {value.length} / {maxLength}
          </p>
        )}
      </div>
    </div>
  );
}
