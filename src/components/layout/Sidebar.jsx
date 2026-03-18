"use client";

import { Sidebar as FlowbiteSidebar } from "flowbite-react";
import { LayoutDashboard, Users, ShoppingBag, Inbox, FileText, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <FlowbiteSidebar aria-label="Sidebar" className="h-[calc(100vh-65px)] w-64 hidden md:block border-r dark:border-gray-700">
      <FlowbiteSidebar.Items>
        <FlowbiteSidebar.ItemGroup>
          <FlowbiteSidebar.Item as={Link} href="/" active={pathname === '/'} icon={LayoutDashboard}>
            Dashboard
          </FlowbiteSidebar.Item>
          <FlowbiteSidebar.Item as={Link} href="/users" active={pathname === '/users'} icon={Users}>
            Users
          </FlowbiteSidebar.Item>
          <FlowbiteSidebar.Item as={Link} href="/products" active={pathname === '/products'} icon={ShoppingBag}>
            Products
          </FlowbiteSidebar.Item>
          <FlowbiteSidebar.Item as={Link} href="/orders" active={pathname === '/orders'} icon={Inbox}>
            Orders
          </FlowbiteSidebar.Item>
          <FlowbiteSidebar.Item as={Link} href="/reports" active={pathname === '/reports'} icon={FileText}>
            Reports
          </FlowbiteSidebar.Item>
          <FlowbiteSidebar.Item as={Link} href="/login" icon={LogOut}>
            Log Out
          </FlowbiteSidebar.Item>
        </FlowbiteSidebar.ItemGroup>
      </FlowbiteSidebar.Items>
    </FlowbiteSidebar>
  );
}
