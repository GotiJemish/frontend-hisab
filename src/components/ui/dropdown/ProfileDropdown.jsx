"use client";

import { useRef, useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  User,
  Settings,
  LayoutDashboard,
  LogOut,
  Sun,
  Moon,
  ChevronDown,
  Bell,
} from "lucide-react";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";

/**
 * ProfileDropdown
 *
 * @param {{ name: string, email: string, avatarUrl?: string, role?: string }} user
 */
export default function ProfileDropdown({
  user = {
    name: "Admin User",
    email: "admin@hisab.com",
    role: "Super Admin",
    avatarUrl: null,
  },
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const params = useParams();
  const userId = params?.userId || "";

  // Close on outside click
  useEffect(() => {
    function handleOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  // Close on Escape
  useEffect(() => {
    function handleEsc(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  const initials = (user.name || "User")
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div ref={containerRef} className="relative">
      {/* ── Trigger ── */}
      <button
        type="button"
        id="profile-dropdown-btn"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Open profile menu"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] transition-colors focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 dark:focus:ring-[#3B82F6]/30"
      >
        {/* Avatar */}
        <div className="relative">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="h-8 w-8 rounded-full object-cover ring-2 ring-[#2563EB]/30 dark:ring-[#3B82F6]/30"
            />
          ) : (
            <div
              aria-hidden="true"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#2563EB] to-[#14B8A6] text-xs font-bold text-white select-none dark:from-[#3B82F6] dark:to-[#2DD4BF]"
            >
              {initials}
            </div>
          )}
          {/* Online dot */}
          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[#22C55E] ring-2 ring-white dark:ring-[#111827]" />
        </div>

        {/* Name – hidden on xs */}
        <div className="hidden sm:flex flex-col items-start leading-tight">
          <span className="text-sm font-semibold text-[#0F172A] dark:text-[#E2E8F0]">
            {user.name}
          </span>
          <span className="text-xs text-[#94A3B8] dark:text-[#6B7280]">
            {user.role}
          </span>
        </div>

        <ChevronDown
          className={`hidden sm:block h-4 w-4 text-[#94A3B8] transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {/* ── Panel ── */}
      {open && (
        <div
          role="menu"
          aria-labelledby="profile-dropdown-btn"
          className="
            absolute right-0 z-50 mt-2 w-72 rounded-2xl border
            bg-white shadow-xl
            border-[#E2E8F0]
            dark:bg-[#111827] dark:border-[#1F2937] dark:shadow-black/50
            origin-top-right
          "
        >
          {/* User info header */}
          <div className="px-5 py-4 border-b border-[#E2E8F0] dark:border-[#1F2937]">
            <div className="flex items-center gap-3">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="h-12 w-12 rounded-full object-cover ring-2 ring-[#2563EB]/20"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#2563EB] to-[#14B8A6] text-sm font-bold text-white dark:from-[#3B82F6] dark:to-[#2DD4BF]">
                  {initials}
                </div>
              )}
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-[#0F172A] dark:text-[#E2E8F0] truncate">
                  {user.name}
                </span>
                <span className="text-xs text-[#94A3B8] dark:text-[#6B7280] truncate">
                  {user.email}
                </span>
                <span className="mt-1 inline-flex items-center rounded-full bg-[#EFF6FF] px-2 py-0.5 text-xs font-medium text-[#2563EB] dark:bg-[#1E3A5F] dark:text-[#93C5FD] w-fit">
                  {user.role}
                </span>
              </div>
            </div>
          </div>

          {/* Nav items */}
          <div className="py-1.5">
            <MenuItem href={`/${userId}`} icon={<LayoutDashboard className="h-4 w-4" />}>
              Dashboard
            </MenuItem>
            {user.role !== "Company Admin" && (
              <MenuItem href={`/${userId}/profile`} icon={<User className="h-4 w-4" />}>
                My Profile
              </MenuItem>
            )}
            <MenuItem href={`/${userId}/notifications`} icon={<Bell className="h-4 w-4" />}>
              Notifications
            </MenuItem>
            <MenuItem href={`/${userId}/configurations`} icon={<Settings className="h-4 w-4" />}>
              Settings
            </MenuItem>
          </div>

          {/* ── Theme Toggle ── */}
          <div className="px-4 py-3 border-t border-b border-[#E2E8F0] dark:border-[#1F2937]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {theme === "dark" ? (
                  <Moon className="h-4 w-4 text-[#3B82F6]" aria-hidden="true" />
                ) : (
                  <Sun className="h-4 w-4 text-[#F59E0B]" aria-hidden="true" />
                )}
                <span className="text-sm font-medium text-[#0F172A] dark:text-[#E5E7EB]">
                  {theme === "dark" ? "Dark Mode" : "Light Mode"}
                </span>
              </div>

              {/* Toggle pill */}
              <button
                type="button"
                role="switch"
                aria-checked={theme === "dark"}
                aria-label="Toggle dark mode"
                onClick={toggleTheme}
                className={`
                  relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent
                  transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-1
                  ${
                    theme === "dark"
                      ? "bg-[#3B82F6] focus:ring-[#3B82F6]"
                      : "bg-[#E2E8F0] focus:ring-[#2563EB]"
                  }
                `}
              >
                <span
                  className={`
                    inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0
                    transition-transform duration-300
                    ${theme === "dark" ? "translate-x-5" : "translate-x-0"}
                  `}
                />
              </button>
            </div>
          </div>

          {/* Sign out */}
          <div className="py-1.5">
            <button
              type="button"
              role="menuitem"
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#EF4444] hover:bg-[#FEF2F2] dark:text-[#F87171] dark:hover:bg-[#450A0A]/30 transition-colors"
              onClick={() => {
                setOpen(false);
                logout();
              }}
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* Internal helper */
function MenuItem({ href, icon, children }) {
  return (
    <Link
      href={href}
      role="menuitem"
      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#0F172A] hover:bg-[#F1F5F9] dark:text-[#E5E7EB] dark:hover:bg-[#1E293B] transition-colors"
    >
      <span className="text-[#94A3B8] dark:text-[#6B7280]">{icon}</span>
      {children}
    </Link>
  );
}
