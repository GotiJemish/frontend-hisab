"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Bell, Search, Menu, X, CheckCircle, AlertTriangle, Info } from "lucide-react";
import ProfileDropdown from "@/components/ui/dropdown/ProfileDropdown";
import { useAuth } from "@/context/AuthContext";

export default function Header({ toggleSidebar, toggleMobile }) {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const params = useParams();
  const userId = params?.userId || "";
  const { user } = useAuth();

  return (
    <header
      role="banner"
      className="
        sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between gap-4 px-4 md:px-6
        bg-white border-b border-[#E2E8F0]
        dark:bg-[#0F172A] dark:border-[#1F2937]
        shadow-sm
      "
    >
      {/* ── Left: Burger & Logo ── */}
      <div className="flex items-center gap-3">
        {/* Burger Button */}
        <button
          type="button"
          onClick={() => {
            if (window.innerWidth < 768) {
              toggleMobile();
            } else {
              toggleSidebar();
            }
          }}
          className="p-2 -ml-2 rounded-xl text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-[#0F172A] dark:hover:bg-[#1E293B] dark:hover:text-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link
          href={`/${userId}`}
          className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/40 rounded-lg"
          aria-label="Go to dashboard home"
        >
          {/* Logo mark */}
          <div
            aria-hidden="true"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#2563EB] to-[#14B8A6] dark:from-[#3B82F6] dark:to-[#2DD4BF] shadow-sm group-hover:shadow-md transition-shadow"
          >
            <span className="text-white font-black text-sm select-none">H</span>
          </div>

          <div className="flex flex-col leading-tight">
            <span className="font-bold text-[#0F172A] dark:text-[#E2E8F0] text-base tracking-tight">
              Hisab
            </span>
            <span className="text-[10px] font-medium text-[#94A3B8] dark:text-[#6B7280] tracking-widest uppercase -mt-0.5">
              Admin
            </span>
          </div>
        </Link>
      </div>

      {/* ── Center: Search (hidden on sm) ── */}
      <div className="hidden md:flex flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8] dark:text-[#6B7280]"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Search…"
            aria-label="Global search"
            className="
              w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] py-2 pl-10 pr-4 text-sm
              text-[#0F172A] placeholder-[#94A3B8]
              focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 focus:outline-none
              dark:border-[#1F2937] dark:bg-[#111827] dark:text-[#E5E7EB] dark:placeholder-[#6B7280]
              dark:focus:border-[#3B82F6] dark:focus:ring-[#3B82F6]/20
              transition-all duration-150
            "
          />
        </div>
      </div>

      {/* ── Right: Actions ── */}
      <div className="flex items-center gap-2">
        {/* Notification bell */}
        <button
          type="button"
          aria-label="Open notifications"
          id="header-notifications-btn"
          onClick={() => setIsNotifOpen(true)}
          className="
            relative rounded-xl p-2 text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-[#0F172A]
            dark:hover:bg-[#1E293B] dark:hover:text-[#E2E8F0]
            transition-colors focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30
          "
        >
          <Bell className="h-5 w-5" />
          {/* Badge */}
          <span className="absolute top-1 right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#EF4444] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#EF4444]" />
          </span>
        </button>

        {/* Profile */}
        <ProfileDropdown
          user={{
            name: user ? `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email || "User" : "Loading...",
            email: user?.email || "",
            role: user?.role === "COMPANY_ADMIN" ? "Company Admin" : user?.role === "SUPER_ADMIN" ? "Super Admin" : "Staff User",
            avatarUrl: user?.profile_image_url || null,
          }}
        />
      </div>

      {/* Notification Offcanvas */}
      {isNotifOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-[#0F172A]/40 dark:bg-[#0B1220]/70 z-[60] backdrop-blur-sm transition-opacity"
            onClick={() => setIsNotifOpen(false)}
            aria-hidden="true"
          />
          {/* Drawer */}
          <div className="fixed top-0 right-0 z-[70] h-screen w-80 sm:w-96 bg-white dark:bg-[#0F172A] border-l border-[#E2E8F0] dark:border-[#1F2937] shadow-2xl transform transition-transform duration-300 flex flex-col">
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#E2E8F0] dark:border-[#1F2937]">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-[#2563EB] dark:text-[#3B82F6]" />
                <h2 className="text-base font-semibold text-[#0F172A] dark:text-white">Notifications</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsNotifOpen(false)}
                className="text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-[#0F172A] dark:hover:bg-[#1E293B] dark:hover:text-white rounded-lg p-1.5 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 transition-colors"
                aria-label="Close notifications"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Drawer Body - Notification Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {/* Item 1 */}
              <div className="flex gap-3 p-3 rounded-xl bg-[#EFF6FF] dark:bg-[#1E3A5F]/30 border border-[#DBEAFE] dark:border-[#1E3A5F]">
                <div className="mt-1 flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-[#2563EB] dark:text-[#3B82F6]" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-[#1E3A8A] dark:text-[#BFDBFE]">Invoice Paid</h3>
                  <p className="text-xs text-[#3B82F6] dark:text-[#93C5FD] mt-1">Invoice #INV-2041 has been successfully paid by TechCorp Inc.</p>
                  <p className="text-[10px] text-[#2563EB]/70 dark:text-[#60A5FA]/70 mt-2 font-medium">Just now</p>
                </div>
              </div>

              {/* Item 2 */}
              <div className="flex gap-3 p-3 rounded-xl hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/50 border border-transparent transition-colors">
                <div className="mt-1 flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-[#F59E0B] dark:text-[#D97706]" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-[#0F172A] dark:text-[#E2E8F0]">Low Stock Alert</h3>
                  <p className="text-xs text-[#64748B] dark:text-[#9CA3AF] mt-1">Product "Wireless Keyboard" is running low on inventory (3 items left).</p>
                  <p className="text-[10px] text-[#94A3B8] dark:text-[#6B7280] mt-2 font-medium">2 hours ago</p>
                </div>
              </div>

              {/* Item 3 */}
              <div className="flex gap-3 p-3 rounded-xl hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/50 border border-transparent transition-colors">
                <div className="mt-1 flex-shrink-0">
                  <Info className="h-5 w-5 text-[#10B981] dark:text-[#059669]" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-[#0F172A] dark:text-[#E2E8F0]">System Update</h3>
                  <p className="text-xs text-[#64748B] dark:text-[#9CA3AF] mt-1">Performance enhancements and bug fixes have been applied successfully.</p>
                  <p className="text-[10px] text-[#94A3B8] dark:text-[#6B7280] mt-2 font-medium">Yesterday at 4:30 PM</p>
                </div>
              </div>
            </div>
            
            {/* Drawer Footer */}
            <div className="p-4 border-t border-[#E2E8F0] dark:border-[#1F2937]">
              <button 
                type="button" 
                className="w-full py-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] text-sm font-medium text-[#0F172A] dark:text-white hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] transition-colors focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 flex justify-center items-center"
              >
                Mark all as read
              </button>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
