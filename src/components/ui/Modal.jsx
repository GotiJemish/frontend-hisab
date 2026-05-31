"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { createPortal } from "react-dom";

/**
 * Modal dialog component
 *
 * @param {boolean}           open        - controls visibility
 * @param {() => void}        onClose     - called when backdrop or × is clicked
 * @param {string}            title       - optional modal title
 * @param {"sm"|"md"|"lg"|"xl"|"2xl"|"3xl"|"4xl"|"5xl"|"full"}  size
 * @param {boolean}           closeable   - show the × button and allow backdrop click
 * @param {React.ReactNode}   footer      - optional footer slot (for action buttons)
 * @param {string}            className   - extra classes on the panel
 */
export default function Modal({
  open,
  onClose,
  title,
  size = "md",
  closeable = true,
  footer,
  children,
  className = "",
}) {
  const panelRef = useRef(null);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Focus trap & Escape key
  useEffect(() => {
    if (!open) return;
    function handleKey(e) {
      if (e.key === "Escape" && closeable) onClose?.();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, closeable, onClose]);

  // Auto-focus panel
  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  if (!open) return null;

  const sizeClasses = {
    sm:    "max-w-md",
    md:    "max-w-2xl",
    lg:    "max-w-screen-lg", // 1024px (Container size)
    xl:    "max-w-screen-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
    full:  "max-w-[95vw]",
  };

  const content = (
    <div
      aria-modal="true"
      role="dialog"
      aria-labelledby={title ? "modal-title" : undefined}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={closeable ? onClose : undefined}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        tabIndex={-1}
        className={`
          relative z-10 w-full ${sizeClasses[size]} rounded-2xl border
          bg-white shadow-2xl focus:outline-none
          border-[#E2E8F0] dark:bg-[#111827] dark:border-[#1F2937]
          flex flex-col max-h-[90vh]
          ${className}
        `}
      >
        {/* Header */}
        {(title || closeable) && (
          <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] dark:border-[#1F2937]">
            {title && (
              <h2
                id="modal-title"
                className="text-lg font-semibold text-[#0F172A] dark:text-[#E2E8F0]"
              >
                {title}
              </h2>
            )}
            {closeable && (
              <button
                type="button"
                aria-label="Close modal"
                onClick={onClose}
                className="ml-auto rounded-lg p-1.5 text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-[#0F172A] dark:hover:bg-[#1E293B] dark:hover:text-[#E2E8F0] transition-colors focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 text-sm text-[#475569] dark:text-[#9CA3AF] leading-relaxed">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex-shrink-0 flex items-center justify-end gap-3 px-6 py-4 border-t border-[#E2E8F0] dark:border-[#1F2937] bg-[#F8FAFC] dark:bg-[#0F172A] rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  // Render into document body via portal
  if (typeof document === "undefined") return null;
  return createPortal(content, document.body);
}
