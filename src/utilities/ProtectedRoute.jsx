"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const ProtectedRoute = ({ children, fallback = null }) => {
    const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

   useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

   if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <p className="text-gray-500 text-sm">Checking authentication...</p>
      </div>
    );
  }

   return isAuthenticated ? children : null;
};

export default ProtectedRoute;
