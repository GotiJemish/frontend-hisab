"use client";

import { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useSearchParams } from "next/navigation";

/**
 * MainLayout – application shell wrapper
 *
 * Wraps everything inside the dashboard: Header at top, Sidebar on left, scrollable main area.
 * Apply theme tokens on the root element via ThemeProvider (in RootLayout).
 *
 * @param {React.ReactNode} children
 */
export default function MainLayout({ children }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const searchParams = useSearchParams();
  const isPdf = searchParams?.get("pdf") === "true";

  if (isPdf) {
    return (
      <main className="flex-1 min-h-screen bg-white dark:bg-[#0B1220] p-4 md:p-6 overflow-y-auto">
        {children}
      </main>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#F8FAFC] dark:bg-[#0B1220]">
      <Header 
        toggleSidebar={() => setIsSidebarCollapsed(prev => !prev)}
        toggleMobile={() => setIsMobileOpen(prev => !prev)}
      />
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar 
          collapsed={isSidebarCollapsed}
          mobileOpen={isMobileOpen}
          closeMobile={() => setIsMobileOpen(false)}
        />
        {/* Overlay for mobile sidebar */}
        {isMobileOpen && (
          <div 
            className="absolute inset-0 bg-[#0F172A]/50 dark:bg-[#0B1220]/80 z-30 md:hidden backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setIsMobileOpen(false)}
            aria-hidden="true"
          />
        )}
        <main
          id="main-content"
          role="main"
          tabIndex={-1}
          className="flex-1 overflow-y-auto bg-[#F8FAFC] dark:bg-[#0B1220] p-4 md:p-6"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
