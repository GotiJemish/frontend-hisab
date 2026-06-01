"use client";

import React from "react";
import {
  X,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
} from "lucide-react";
import Link from "next/link";
import { Toast } from "flowbite-react";

const Alert = ({
  variant = "info",
  title = null,
  message = null,
  showLink = false,
  linkHref = "#",
  linkText = "Learn more",
  closeToast = () => { },
}) => {
  // Map variant keys to support common naming (success, error/danger, warning, info)
  const normVariant = variant === "danger" ? "error" : variant;

  const variantStyles = {
    success: {
      iconBg: "bg-emerald-50 text-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-400 ring-4 ring-emerald-50/50 dark:ring-emerald-950/10",
      icon: <CheckCircle className="h-5 w-5" />,
      border: "border-l-4 border-l-emerald-500",
    },
    error: {
      iconBg: "bg-rose-50 text-rose-500 dark:bg-rose-950/40 dark:text-rose-400 ring-4 ring-rose-50/50 dark:ring-rose-950/10",
      icon: <XCircle className="h-5 w-5" />,
      border: "border-l-4 border-l-rose-500",
    },
    warning: {
      iconBg: "bg-amber-50 text-amber-500 dark:bg-amber-950/40 dark:text-amber-400 ring-4 ring-amber-50/50 dark:ring-amber-950/10",
      icon: <AlertTriangle className="h-5 w-5" />,
      border: "border-l-4 border-l-amber-500",
    },
    info: {
      iconBg: "bg-blue-50 text-blue-500 dark:bg-blue-950/40 dark:text-blue-400 ring-4 ring-blue-50/50 dark:ring-blue-950/10",
      icon: <Info className="h-5 w-5" />,
      border: "border-l-4 border-l-blue-500",
    },
  };

  const style = variantStyles[normVariant] || variantStyles.info;

  return (
    <Toast
      className={`
        ${style.border}
      `}
    >
      <div className="flex items-start gap-3.5 w-full">
        {/* Icon Circle */}
        <div className={`flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full ${style.iconBg}`}>
          {style.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pt-0.5">
          {title && (
            <h4 className="text-sm font-bold text-gray-900 dark:text-white leading-tight mb-1">
              {title}
            </h4>
          )}
          {message && (
            <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-455 leading-relaxed break-words">
              {message}
            </p>
          )}
          {showLink && (
            <Link
              href={linkHref}
              className="inline-flex items-center mt-2.5 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline"
            >
              {linkText}
            </Link>
          )}
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={closeToast}
          className="
            flex-shrink-0 -mx-1.5 -my-1.5 p-1.5 rounded-xl outline-none
            text-gray-400 hover:text-gray-700 hover:bg-gray-50
            dark:text-gray-500 dark:hover:text-white dark:hover:bg-slate-800/80
            transition-colors focus:ring-2 focus:ring-blue-500/20
          "
          aria-label="Close"
        >
          <span className="sr-only">Close</span>
          <X className="h-4 w-4" />
        </button>
      </div>
    </Toast>
  );
};

export default Alert;
