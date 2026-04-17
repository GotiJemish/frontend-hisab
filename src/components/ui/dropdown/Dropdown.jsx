"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

/**
 * Reusable Dropdown component
 *
 * @param {React.ReactNode}   trigger   - the element that opens the dropdown
 * @param {React.ReactNode}   children  - dropdown menu content
 * @param {"left"|"right"}    align     - panel alignment relative to trigger
 * @param {string}            className - extra classes on the panel
 * @param {boolean}           showArrow - show the chevron icon on default trigger
 * @param {string}            label     - if no custom trigger, renders a default button
 */
export default function Dropdown({
  trigger,
  children,
  align = "right",
  className = "",
  label,
  id,
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on Escape
  useEffect(() => {
    function handleEsc(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  const alignClass = align === "left" ? "left-0" : "right-0";

  const defaultTrigger = (
    <button
      type="button"
      id={id}
      aria-haspopup="true"
      aria-expanded={open}
      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-[#0F172A] hover:bg-[#F1F5F9] transition-colors focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 dark:text-[#E2E8F0] dark:hover:bg-[#1E293B]"
    >
      {label}
      <ChevronDown
        className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        aria-hidden="true"
      />
    </button>
  );

  return (
    <div ref={containerRef} className="relative inline-block">
      {/* Trigger */}
      <div onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        {trigger ?? defaultTrigger}
      </div>

      {/* Panel */}
      {open && (
        <div
          role="menu"
          className={`
            absolute z-50 mt-2 min-w-[180px] rounded-xl border bg-white shadow-lg
            border-[#E2E8F0] dark:bg-[#111827] dark:border-[#1F2937] dark:shadow-black/40
            animate-in fade-in-0 zoom-in-95 duration-150
            ${alignClass} ${className}
          `}
        >
          {children}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────── */
/* Sub-components                      */
/* ─────────────────────────────────── */

Dropdown.Header = function DropdownHeader({ children, className = "" }) {
  return (
    <div className={`px-4 py-3 border-b border-[#E2E8F0] dark:border-[#1F2937] ${className}`}>
      {children}
    </div>
  );
};

Dropdown.Item = function DropdownItem({
  children,
  onClick,
  icon,
  className = "",
  danger = false,
  disabled = false,
}) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={onClick}
      className={`
        w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left transition-colors
        disabled:opacity-40 disabled:cursor-not-allowed
        ${
          danger
            ? "text-[#EF4444] hover:bg-[#FEF2F2] dark:text-[#F87171] dark:hover:bg-[#450A0A]/40"
            : "text-[#0F172A] hover:bg-[#F1F5F9] dark:text-[#E5E7EB] dark:hover:bg-[#1E293B]"
        }
        ${className}
      `}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
};

Dropdown.Divider = function DropdownDivider() {
  return <hr className="my-1 border-[#E2E8F0] dark:border-[#1F2937]" />;
};
