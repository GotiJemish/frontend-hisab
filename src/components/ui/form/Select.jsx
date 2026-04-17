"use client";

import { ChevronDown } from "lucide-react";

/**
 * Select component
 * 
 * @param {string} label
 * @param {string} id
 * @param {Array<{value: string, label: string}>} options
 * @param {string} error
 * @param {boolean} required
 */
export default function Select({
  label,
  id,
  options = [],
  error,
  required = false,
  className = "",
  ...props
}) {
  const selectBase =
    "w-full appearance-none rounded-lg border bg-white px-4 py-2.5 text-sm text-[#0F172A] transition-all duration-150 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-[#111827] dark:text-[#E5E7EB]";

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

      <div className="relative">
        <select
          id={id}
          required={required}
          className={`${selectBase} ${error ? errorBorder : normalBorder} pr-10`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#94A3B8] dark:text-[#6B7280]">
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>

      {error && (
        <p className="text-xs text-[#EF4444] dark:text-[#F87171]">{error}</p>
      )}
    </div>
  );
}
