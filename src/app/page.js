import { Button } from "flowbite-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-4">Welcome to Hisab Admin</h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
        Manage your dashboard seamlessly.
      </p>
      <div className="flex gap-4">
        <Link href="/login">
          <Button color="primary">Login</Button>
        </Link>
        <Link href="/">
          <Button color="gray">Go to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
