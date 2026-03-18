"use client";

import { Button, Checkbox, Label, TextInput } from "flowbite-react";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow dark:border dark:bg-gray-800 dark:border-gray-700">
      <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
        <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
          Sign in to your account
        </h1>
        <form className="space-y-4 md:space-y-6" onSubmit={(e) => {
          e.preventDefault();
          window.location.href = '/';
        }}>
          <div>
            <Label htmlFor="email" value="Your email" className="mb-2 block" />
            <TextInput id="email" type="email" placeholder="name@company.com" required />
          </div>
          <div>
            <Label htmlFor="password" value="Password" className="mb-2 block" />
            <TextInput id="password" type="password" placeholder="••••••••" required />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-2">
              <Checkbox id="remember" />
              <Label htmlFor="remember">Remember me</Label>
            </div>
            <a href="#" className="font-medium text-primary-600 hover:underline dark:text-primary-500 text-sm">
              Forgot password?
            </a>
          </div>
          <Button type="submit" color="primary" className="w-full">
            Sign in
          </Button>
          <p className="text-sm font-light text-gray-500 dark:text-gray-400">
            Don’t have an account yet?{" "}
            <a href="#" className="font-medium text-primary-600 hover:underline dark:text-primary-500">
              Sign up
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
