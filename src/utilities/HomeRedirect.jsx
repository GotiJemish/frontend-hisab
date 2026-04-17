"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const HomeRedirect = () => {
   const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && user?.user_id) {
        // 👇 redirect to dynamic user route
        router.replace(`/${user.user_id}`);
      } else {
        router.replace("/login");
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

    if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <p className="text-gray-500 text-sm">Checking authentication...</p>
      </div>
    );
  }

  return null;// nothing to render, since we always redirect
};

export default HomeRedirect;
