"use client";

import { DarkThemeToggle, Navbar, Dropdown, Avatar } from "flowbite-react";

export default function Header() {
  return (
    <Navbar fluid rounded className="border-b dark:border-gray-700">
      <Navbar.Brand href="/">
        <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
          Hisab Admin
        </span>
      </Navbar.Brand>
      <div className="flex md:order-2 gap-2">
        <DarkThemeToggle />
        <Dropdown
          arrowIcon={false}
          inline
          label={
            <Avatar alt="User settings" img="/avatar-placeholder.png" rounded />
          }
        >
          <Dropdown.Header>
            <span className="block text-sm">Admin User</span>
            <span className="block truncate text-sm font-medium">admin@hisab.com</span>
          </Dropdown.Header>
          <Dropdown.Item>Dashboard</Dropdown.Item>
          <Dropdown.Item>Settings</Dropdown.Item>
          <Dropdown.Divider />
          <Dropdown.Item>Sign out</Dropdown.Item>
        </Dropdown>
        <Navbar.Toggle />
      </div>
    </Navbar>
  );
}
