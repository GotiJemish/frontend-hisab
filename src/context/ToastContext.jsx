"use client";

import Alert from "@/components/ui/Alert";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";

const MAX_VISIBLE_TOASTS = 4;
const FADE_OUT_DURATION = 300;
const ToastContext = createContext({
  showToast: () => {},
});

// Simple unique ID generator
const generateId = () =>
  `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback(
    ({ message, type = "info", duration = 3000 }) => {
      const id = generateId();

      const newToast = { id, message, type, isRemoving: false };

      setToasts((prev) => {
        if (prev.length < MAX_VISIBLE_TOASTS) {
          return [...prev, newToast];
        } else {
          // Mark oldest toast as removing
          const updated = prev.map((t, i) =>
            i === 0 ? { ...t, isRemoving: true } : t
          );

          // Add new toast at the end
          return [...updated, newToast];
        }
      });

      // Auto remove after duration
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    },
    []
  );

  useEffect(() => {
    const removingToast = toasts.find((t) => t.isRemoving);
    if (!removingToast) return;

    const timeout = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== removingToast.id));
    }, FADE_OUT_DURATION);

    return () => clearTimeout(timeout);
  }, [toasts]);

  const closeToast = (id) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isRemoving: true } : t))
    );
  };

  return (
    <>
      <ToastContext.Provider value={{ showToast }}>
        {children}

        <div className="fixed top-5 right-5 z-50 flex flex-col gap-3 items-end w-full max-w-[calc(100vw-40px)] sm:max-w-md">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`transition-opacity duration-300 w-full flex justify-end ${
                toast.isRemoving ? "opacity-0" : "animate-toast-in"
              }`}
            >
              <Alert
                variant={toast.type}
                message={toast.message}
                title={toast.title}
                showLink={toast.hasLink}
                linkHref={toast.linkHref}
                linkText={toast.link}
                closeToast={() => closeToast(toast.id)}
              />
            </div>
          ))}
        </div>

        <style jsx global>{`
          @keyframes toast-in {
            0% {
              opacity: 0;
              transform: translateX(50px);
            }
            100% {
              opacity: 1;
              transform: translateX(0);
            }
          }

          .animate-toast-in {
            animation: toast-in 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
        `}</style>
      </ToastContext.Provider>
    </>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  const { showToast } = context;

  return useMemo(() => {
    const toastFn = (message, options) => showToast({ message, type: "info", ...options });
    return Object.assign(toastFn, {
      success: (message, options) => showToast({ message, type: "success", ...options }),
      error: (message, options) => showToast({ message, type: "error", ...options }),
      warning: (message, options) => showToast({ message, type: "warning", ...options }),
      info: (message, options) => showToast({ message, type: "info", ...options }),
    });
  }, [showToast]);
};
