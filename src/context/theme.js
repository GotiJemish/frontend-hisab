import { createTheme } from "flowbite-react";

export const customTheme = createTheme({
  button: {
    color: {
      primary:
        "bg-primary hover:bg-primary-hover text-white dark:bg-primary dark:hover:bg-primary-hover dark:text-white",
      secondary:
        "bg-primary/10 text-primary hover:bg-primary hover:text-white dark:bg-primary/20 dark:text-primary dark:hover:bg-primary dark:hover:text-white",
      danger:
        "bg-danger hover:bg-red-600 text-white dark:bg-danger dark:hover:bg-red-700",
      success:
        "bg-success hover:bg-green-600 text-white dark:bg-success dark:hover:bg-green-700",
      warning:
        "bg-warning hover:bg-yellow-600 text-white dark:bg-warning dark:hover:bg-yellow-600",
      outlinePrimary:
        "border border-primary text-primary hover:bg-primary/10 dark:border-primary dark:text-primary dark:hover:bg-primary/20",
      outlineDanger:
        "border border-danger text-danger hover:bg-danger/10 dark:border-danger dark:text-danger dark:hover:bg-danger/20",
    },
    size: {
      lg: "px-6 py-3 text-lg",
    },
    disabled: "opacity-50 cursor-not-allowed",
    loading: "inline animate-spin",
  },

  textInput: {
    base: "flex",
    addon:
      "inline-flex items-center rounded-l-md border border-r-0 border-border bg-bg-hover px-3 text-sm text-text-primary dark:border-border dark:bg-bg-sidebar dark:text-text-primary",
    field: {
      base: "relative w-full",
      icon: {
        base: "pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3",
        svg: "h-5 w-5 text-text-muted",
      },
      rightIcon: {
        base: "pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3",
        svg: "h-5 w-5 text-text-muted",
      },
      input: {
        base: "block w-full border disabled:cursor-not-allowed disabled:opacity-50",
        sizes: {
          sm: "p-2 sm:text-xs",
          md: "p-2.5 text-sm",
          lg: "p-4 sm:text-base text-lg",
        },
        colors: {
          gray: "border-border bg-bg-card text-text-primary placeholder-text-muted focus:border-primary focus:ring-primary dark:border-border dark:bg-bg-card dark:text-text-primary dark:placeholder-text-muted dark:focus:border-primary dark:focus:ring-primary",
          info: "border-info bg-bg-card text-text-primary placeholder-text-muted focus:border-info focus:ring-info",
          failure:
            "border-danger bg-bg-card text-text-primary placeholder-text-muted focus:border-danger focus:ring-danger",
          warning:
            "border-warning bg-bg-card text-text-primary placeholder-text-muted focus:border-warning focus:ring-warning",
          success:
            "border-success bg-bg-card text-text-primary placeholder-text-muted focus:border-success focus:ring-success",
        },
        withRightIcon: { on: "pr-10", off: "" },
        withIcon: { on: "pl-10", off: "" },
        withAddon: { on: "rounded-r-lg", off: "rounded-lg" },
        withShadow: { on: "shadow-sm", off: "" },
      },
    },
  },

  spinner: {
    base: "inline animate-spin",
    color: {
      primary: "fill-primary text-text-muted",
      failure: "fill-danger text-text-muted",
      gray: "fill-text-secondary text-text-muted",
      info: "fill-info text-text-muted",
      success: "fill-success text-text-muted",
      warning: "fill-warning text-text-muted",
    },
    size: {
      xs: "h-3 w-3",
      sm: "h-4 w-4",
      md: "h-6 w-6",
      lg: "h-8 w-8",
      xl: "h-10 w-10",
    },
  },

  dropdown: {
    base: "relative",
    inlineWrapper: "relative inline-block",
    arrowIcon: "ml-2 h-4 w-4",
    floating: {
      animation: "transition-opacity",
      base: "z-50 bg-bg-card shadow-lg border border-border dark:bg-bg-card dark:border-border",
      content: "p-1 text-sm text-text-primary",
      divider: "my-1 h-px bg-divider",
      header:
        "flex items-center justify-between px-2 py-2 text-sm font-semibold border-b border-border",
      hidden: "invisible opacity-0",
      item: {
        base: "flex items-center justify-between py-2 px-2 hover:bg-bg-hover focus:outline-none cursor-pointer",
        container: "",
        content: "flex items-center gap-2",
        href: "w-full",
        icon: "h-5 w-5 text-text-muted",
        label: "flex-1 whitespace-nowrap text-text-primary",
        active: "bg-bg-hover",
        disabled: "cursor-not-allowed opacity-50",
      },
      trigger: "w-full border-none bg-transparent",
    },
    content: "py-1 text-sm text-text-primary",
    divider: "my-1 h-px bg-divider",
    header: "block px-4 py-2 text-sm text-text-secondary",
    hidden: "hidden",
    item: {
      base: "cursor-pointer flex items-center justify-between px-4 py-2 hover:bg-bg-hover focus:outline-none",
      container: "",
      content: "flex items-center gap-2",
      href: "w-full",
      icon: "h-5 w-5 text-text-muted",
      label: "text-sm font-medium text-text-primary",
      active: "bg-bg-hover",
      disabled: "cursor-not-allowed opacity-50",
    },
    trigger:
      "w-full border border-border bg-bg-card px-4 py-2 text-sm font-medium text-text-primary hover:bg-bg-hover focus:outline-none focus:ring-2 focus:ring-primary/30",
  },

  card: {
    base: "rounded-lg bg-bg-card shadow-sm border border-border dark:bg-bg-card dark:border-border",
  },

  table: {
    root: {
      base: "w-full text-left text-sm text-text-secondary",
      shadow: "shadow-md",
      wrapper: "h-full overflow-x-auto",
    },
    body: {
      base: "group/body",
      cell: {
        base: "whitespace-nowrap px-6 py-4 text-text-primary",
      },
    },
    head: {
      base: "bg-bg-hover text-xs uppercase text-text-secondary dark:bg-bg-hover",
      cell: {
        base: "px-6 py-3 font-semibold text-text-primary",
      },
    },
    row: {
      base: "border-b border-border bg-bg-card dark:bg-bg-card dark:border-border",
      hovered: "hover:bg-bg-hover dark:hover:bg-bg-hover",
      striped: "even:bg-bg-hover dark:even:bg-bg-hover",
    },
  },

  modal: {
    root: {
      base: "fixed inset-x-0 top-0 z-50 h-screen overflow-y-auto overflow-x-hidden md:inset-0 md:h-full",
      show: {
        on: "flex bg-black/50",
        off: "hidden",
      },
    },
    content: {
      base: "relative h-full w-full p-4 md:h-auto",
      inner:
        "relative flex max-h-[90dvh] flex-col rounded-lg bg-bg-card shadow dark:bg-bg-card",
    },
    header: {
      base: "flex items-start justify-between rounded-t border-b border-border p-5 dark:border-border",
      title: "text-xl font-semibold text-text-primary dark:text-text-primary",
      close: {
        base: "ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-text-muted hover:bg-bg-hover hover:text-text-primary dark:hover:bg-bg-hover dark:hover:text-text-primary",
        icon: "h-5 w-5",
      },
    },
    body: {
      base: "flex-1 overflow-auto p-6",
      popup: "pt-0",
    },
    footer: {
      base: "flex items-center space-x-2 rounded-b border-t border-border p-6 dark:border-border",
      popup: "border-t",
    },
  },

  badge: {
    root: {
      base: "flex h-fit items-center gap-1 font-semibold",
      color: {
        info: "bg-info/10 text-info dark:bg-info/20 dark:text-info",
        gray: "bg-bg-hover text-text-secondary dark:bg-bg-hover dark:text-text-secondary",
        failure: "bg-danger/10 text-danger dark:bg-danger/20 dark:text-danger",
        success: "bg-success/10 text-success dark:bg-success/20 dark:text-success",
        warning: "bg-warning/10 text-warning dark:bg-warning/20 dark:text-warning",
        primary: "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary",
      },
    },
  },

  select: {
    base: "flex",
    addon:
      "inline-flex items-center rounded-l-md border border-r-0 border-border bg-bg-hover px-3 text-sm text-text-primary",
    field: {
      base: "relative w-full",
      icon: {
        base: "pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3",
        svg: "h-5 w-5 text-text-muted",
      },
      select: {
        base: "block w-full border disabled:cursor-not-allowed disabled:opacity-50",
        sizes: {
          sm: "p-2 sm:text-xs",
          md: "p-2.5 text-sm",
          lg: "p-4 sm:text-base text-lg",
        },
        colors: {
          gray: "border-border bg-bg-card text-text-primary focus:border-primary focus:ring-primary dark:border-border dark:bg-bg-card dark:text-text-primary",
          info: "border-info bg-bg-card text-text-primary focus:border-info focus:ring-info",
          failure:
            "border-danger bg-bg-card text-text-primary focus:border-danger focus:ring-danger",
          warning:
            "border-warning bg-bg-card text-text-primary focus:border-warning focus:ring-warning",
          success:
            "border-success bg-bg-card text-text-primary focus:border-success focus:ring-success",
        },
        withAddon: { on: "rounded-r-lg", off: "rounded-lg" },
        withShadow: { on: "shadow-sm", off: "" },
      },
    },
  },
  toast: {
    root: {
      base: "flex backdrop-blur-md items-start w-full max-w-[400px] p-4 rounded-2xl shadow-xl transition-all duration-300 border",
    },
    toggle: {
      base: "flex-shrink-0 -mx-1.5 -my-1.5 p-1.5 rounded-xl outline-none text-gray-400 hover:text-gray-700 hover:bg-gray-50 dark:text-gray-500 dark:hover:text-white dark:hover:bg-slate-800/80 transition-colors focus:ring-2 focus:ring-blue-500/20",
      icon: "h-4 w-4",
    },
    variants: {
      success: {
        container: "bg-emerald-50/50 border-emerald-200/80 dark:bg-emerald-950/20 dark:border-emerald-500/30",
        iconBg: "bg-emerald-600 text-white dark:bg-emerald-600 dark:text-white",
        title: "text-gray-900 dark:text-white",
        message: "text-gray-500 dark:text-gray-455",
      },
      error: {
        container: "bg-rose-50/50 border-rose-200/80 dark:bg-rose-950/20 dark:border-rose-500/30",
        iconBg: "bg-rose-600 text-white dark:bg-rose-600 dark:text-white",
        title: "text-gray-900 dark:text-white",
        message: "text-gray-500 dark:text-gray-455",
      },
      danger: {
        container: "bg-rose-50/50 border-rose-200/80 dark:bg-rose-950/20 dark:border-rose-500/30",
        iconBg: "bg-rose-600 text-white dark:bg-rose-600 dark:text-white",
        title: "text-gray-900 dark:text-white",
        message: "text-gray-500 dark:text-gray-455",
      },
      warning: {
        container: "bg-amber-50/50 border-amber-200/80 dark:bg-amber-950/20 dark:border-amber-500/30",
        iconBg: "bg-transparent text-amber-500 dark:text-amber-500",
        title: "text-gray-900 dark:text-white",
        message: "text-gray-500 dark:text-gray-455",
      },
      info: {
        container: "bg-blue-50/50 border-blue-200/80 dark:bg-blue-950/20 dark:border-blue-500/30",
        iconBg: "bg-blue-600 text-white dark:bg-blue-600 dark:text-white",
        title: "text-gray-900 dark:text-white",
        message: "text-gray-500 dark:text-gray-455",
      },
      loading: {
        container: "bg-purple-50/50 border-purple-200/80 dark:bg-purple-950/20 dark:border-purple-500/30",
        iconBg: "bg-transparent text-purple-600 dark:text-purple-400",
        title: "text-gray-900 dark:text-white",
        message: "text-gray-500 dark:text-gray-455",
      },
      promise: {
        container: "bg-teal-50/50 border-teal-200/80 dark:bg-teal-950/20 dark:border-teal-500/30",
        iconBg: "bg-teal-600 text-white dark:bg-teal-600 dark:text-white",
        title: "text-gray-900 dark:text-white",
        message: "text-gray-500 dark:text-gray-455",
      },
      pending: {
        container: "bg-teal-50/50 border-teal-200/80 dark:bg-teal-950/20 dark:border-teal-500/30",
        iconBg: "bg-teal-600 text-white dark:bg-teal-600 dark:text-white",
        title: "text-gray-900 dark:text-white",
        message: "text-gray-500 dark:text-gray-455",
      },
      default: {
        container: "bg-slate-50/50 border-slate-200/80 dark:bg-slate-900/40 dark:border-slate-700/50",
        iconBg: "bg-slate-600 text-white dark:bg-slate-600 dark:text-white",
        title: "text-gray-900 dark:text-white",
        message: "text-gray-500 dark:text-gray-455",
      },
      neutral: {
        container: "bg-slate-50/50 border-slate-200/80 dark:bg-slate-900/40 dark:border-slate-700/50",
        iconBg: "bg-slate-600 text-white dark:bg-slate-600 dark:text-white",
        title: "text-gray-900 dark:text-white",
        message: "text-gray-500 dark:text-gray-455",
      },
      custom: {
        container: "bg-pink-50/50 border-pink-200/80 dark:bg-pink-950/20 dark:border-pink-500/30",
        iconBg: "bg-pink-600 text-white dark:bg-pink-600 dark:text-white",
        title: "text-gray-900 dark:text-white",
        message: "text-gray-500 dark:text-gray-455",
      },
    }
  },
});