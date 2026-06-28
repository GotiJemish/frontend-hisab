"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Inbox,
  FileText,
  Settings,
  HelpCircle,
  LogOut,
  Shield,
  Wallet,
  Receipt,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Sidebar({ collapsed, mobileOpen, closeMobile }) {
  const pathname = usePathname();
  const params = useParams();
  const { logout, user } = useAuth();
  const userId = params?.userId || "";
  
  const isSuper = user?.role === "SUPER_ADMIN";
  const isCompanyAdmin = user?.role === "COMPANY_ADMIN";
  const perms = user?.permissions || {};

  const NAV_ITEMS = [
    { href: `/${userId}`,                 label: "Dashboard",  icon: LayoutDashboard, show: true },
    { href: `/${userId}/users`,           label: "Users",           icon: Users, show: (!isSuper && isCompanyAdmin) || perms.users?.read || perms.users === true },
    { href: `/${userId}/roles`,           label: "Roles",           icon: Shield, show: (!isSuper && isCompanyAdmin) || perms.roles?.read || perms.roles === true },
    { href: `/${userId}/configurations`,  label: "Configurations",  icon: Settings, show: (!isSuper && isCompanyAdmin) },
    { href: `/${userId}/items`,           label: "Products",        icon: ShoppingBag, show: (!isSuper && isCompanyAdmin) || perms.items === true || perms.items?.read },
    { href: `/${userId}/invoices`,        label: "Invoices",        icon: Inbox, show: (!isSuper && isCompanyAdmin) || perms.invoices === true || perms.invoices?.read },
    { href: `/${userId}/challans`,        label: "Challans",        icon: Receipt, show: (!isSuper && isCompanyAdmin) || perms.invoices === true || perms.invoices?.read },
    { href: `/${userId}/contacts`,        label: "Contacts",        icon: Users, show: (!isSuper && isCompanyAdmin) || perms.contacts === true || perms.contacts?.read },
    { href: `/${userId}/accounts`,        label: "Accounts",        icon: Wallet, show: (!isSuper && isCompanyAdmin) || perms.accounts === true || perms.accounts?.read },
    { href: `/${userId}/reports`,  label: "Reports",    icon: FileText, show: (!isSuper && isCompanyAdmin) },
    { href: `/${userId}/organizations`,  label: "Organizations",    icon: Shield, show: isSuper },
  ];

  const BOTTOM_ITEMS = [
    { href: `/${userId}/settings`, label: "Settings",   icon: Settings },
    { href: `/${userId}/help`,     label: "Help",       icon: HelpCircle },
  ];

  return (
    <aside
      aria-label="Main navigation"
      className={`
        absolute md:relative z-40 flex-col h-full shrink-0
        border-r border-[#E2E8F0] dark:border-[#1F2937]
        bg-white dark:bg-[#0F172A]
        transition-all duration-300 ease-in-out
        ${mobileOpen ? "translate-x-0 w-64 shadow-2xl flex" : "-translate-x-full md:translate-x-0 hidden md:flex"}
        ${collapsed && !mobileOpen ? "md:w-[68px]" : "md:w-64"}
      `}
    >
      {/* ── Main nav ── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden pt-4 pb-3 px-2 space-y-0.5">
       
        {NAV_ITEMS.filter(i => i.show).map((item) => (
          <NavItem
            key={item.href}
            {...item}
            active={pathname === item.href}
            collapsed={collapsed && !mobileOpen}
          />
        ))}
      </nav>

      {/* ── Bottom nav ── */}
    
    </aside>
  );
}

/* ─────────────────────────────────── */
/* NavItem                             */
/* ─────────────────────────────────── */
function NavItem({ href, label, icon: Icon, active, collapsed }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`
        group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium
        focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30
        transition-all duration-150
        ${
          active
            ? "bg-[#EFF6FF] text-[#2563EB] dark:bg-[#1E3A5F]/50 dark:text-[#3B82F6]"
            : "text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A] dark:text-[#9CA3AF] dark:hover:bg-[#1E293B] dark:hover:text-[#E5E7EB]"
        }
        ${collapsed ? "justify-center" : ""}
      `}
    >
      {/* Active indicator bar */}
      {active && (
        <span
          aria-hidden="true"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-[#2563EB] dark:bg-[#3B82F6]"
        />
      )}

      <Icon className="h-5 w-5 shrink-0 transition-transform duration-200" aria-hidden="true" />

      {!collapsed && <span className="whitespace-nowrap">{label}</span>}

      {/* Tooltip when collapsed */}
      {collapsed && <Tooltip label={label} />}
    </Link>
  );
}

/* ─────────────────────────────────── */
/* Tooltip                             */
/* ─────────────────────────────────── */
function Tooltip({ label }) {
  return (
    <span
      role="tooltip"
      className="
        pointer-events-none absolute left-full ml-3 z-50
        rounded-lg bg-[#0F172A] dark:bg-[#E2E8F0]
        px-2.5 py-1.5 text-xs font-medium
        text-white dark:text-[#0F172A]
        whitespace-nowrap shadow-lg
        opacity-0 group-hover:opacity-100
        transition-opacity duration-150
      "
    >
      {label}
    </span>
  );
}
