"use client";

import React from "react";
import {
  X,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Loader2,
  Clock,
  Bell,
  Star,
} from "lucide-react";
import Link from "next/link";
import { Toast } from "flowbite-react";
import { customTheme } from "@/context/theme";

const Alert = ({
  variant = "info",
  title = null,
  message = null,
  showLink = false,
  linkHref = "#",
  linkText = "Learn more",
  closeToast = () => { },
}) => {
  // Map variant keys to support common naming (success, error/danger, warning, info, loading, promise, default, custom)
  const normVariant = variant === "error" ? "danger" : variant;

  // Retrieve matching theme styles from customTheme
  const themeStyles = customTheme?.toast?.variants?.[normVariant] || customTheme?.toast?.variants?.info;

  // Define icon map for each supported variant
  const iconMap = {
    success: <CheckCircle className="h-5 w-5" />,
    error: <XCircle className="h-5 w-5" />,
    danger: <XCircle className="h-5 w-5" />,
    warning: <AlertTriangle className="h-8 w-8 fill-amber-500 text-white dark:fill-amber-500 dark:text-[#0b1220]" />,
    info: <Info className="h-5 w-5" />,
    loading: <Loader2 className="h-6 w-6 animate-spin" />,
    promise: <Clock className="h-5 w-5" />,
    pending: <Clock className="h-5 w-5" />,
    default: <Bell className="h-5 w-5" />,
    neutral: <Bell className="h-5 w-5" />,
    custom: <Star className="h-5 w-5 fill-white stroke-none" />,
  };

  const variantIcon = iconMap[normVariant] || iconMap.info;

  return (
    <Toast
      className={`${themeStyles.container}`}
      variant={variant}
    >
      <div className="flex items-start gap-3.5 w-full">
        {/* Icon Circle wrapper */}
        <div className={`flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full ${themeStyles.iconBg}`}>
          {variantIcon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pt-0.5">
          {title && (
            <h4 className={`text-sm font-bold leading-tight mb-1 ${themeStyles.title}`}>
              {title}
            </h4>
          )}
          {message && (
            <p className={`text-xs sm:text-sm font-medium leading-relaxed break-words ${themeStyles.message}`}>
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

