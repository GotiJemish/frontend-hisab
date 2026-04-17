import {
  XCircle,
  Info,
  CheckCircle,
  AlertTriangle,
  X,
} from "lucide-react";
import Link from "next/link";
import React from "react";
// variant: "success" | "error" | "warning" | "info"; // Alert type

const Alert = ({
  variant = "error",
  title = null,
  message = null,
  showLink = false,
  linkHref = "#",
  linkText = "Learn more",
  closeToast = () => {},
}) => {
  // Tailwind classes for each variant
  const variantClasses = {
    success: {
      container:
        "border-success-500 bg-success-50 dark:border-success-500/30 dark:bg-success-500/15",
      icon: "text-success-500",
    },
    error: {
      container:
        "border-error-500 bg-error-50 dark:border-error-500/30 dark:bg-error-500/15",
      icon: "text-error-500",
    },
    warning: {
      container:
        "border-warning-500 bg-warning-50 dark:border-warning-500/30 dark:bg-warning-500/15",
      icon: "text-warning-500",
    },
    info: {
      container:
        "border-blue-light-500 bg-blue-light-50 dark:border-blue-light-500/30 dark:bg-blue-light-500/15",
      icon: "text-blue-light-500",
    },
  };

  // Icon for each variant
  const icons = {
    success: <CheckCircle size={20} />,
    error: <XCircle size={20} />,
    warning: <AlertTriangle size={20} />,
    info: <Info size={20} />,
  };

  return (
    <div
      className={`rounded-lg border flex px-3 py-2 ${variantClasses[variant].container}`}
    >
      <div className="flex items-start gap-3">
        <div className={`flex gap-2 ${variantClasses[variant].icon}`}>
          {icons[variant]}
        </div>

        <div>
          {title && (
            <h4 className="mb-1 text-sm font-semibold text-gray-800 dark:text-white/90">
              {title}
            </h4>
          )}

          {message && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {message}
            </p>
          )}
          {showLink && (
            <Link
              href={linkHref}
              className="inline-block mt-3 text-sm font-medium text-gray-500 underline dark:text-gray-400"
            >
              {linkText}
            </Link>
          )}
        </div>
      </div>

      <button
        onClick={closeToast}
        className={`text-lg font-bold ml-2 hover:opacity-70 -mt-4 -me-2 ${variantClasses[variant].icon}`}
        aria-label="Close toast"
      >
        {/* &times; */}
        <X size={18} />
      </button>
    </div>
  );
};

export default Alert;
