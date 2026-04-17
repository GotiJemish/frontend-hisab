"use client";

import { useState } from "react";
import { Button, Checkbox, Label } from "flowbite-react";
import Input from "@/components/ui/form/Input";
import Link from "next/link";
import { LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import apiClient from "@/utilities/apiClients";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useLoading } from "@/context/LoadingContext";
import { loginSchema } from "@/utilities/validations";
import { jwtDecode } from "jwt-decode";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const toast = useToast();
  const { loading, setLoading } = useLoading();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await loginSchema.validate({ email, password }, { abortEarly: false });

      const response = await apiClient.post("/auth/login/", { email, password });

      if (response.data.success || (response.data.data && (response.data.data.access || response.data.data.refresh))) {
        toast.success("Login successful!");
        
        let access = response.data.data?.access;
        let refresh = response.data.data?.refresh;
        let userId = response.data.data?.user_id;
        
        if (!userId && access) {
          try {
            const decoded = jwtDecode(access);
            userId = decoded.user_id || decoded.id;
          } catch (e) {
            console.error("Failed to decode token", e);
          }
        }

        if (!access) {
          console.error("No access token found in response:", response.data);
          toast.error("Failed to save session. Invalid token format.");
          return;
        }

        login({ access, refresh, user_id: userId });
        
        if (userId) {
          router.push(`/${userId}`);
        } else {
          router.push("/");
        }
      } else {
        toast.error(response.data.message || "Failed to login");
      }
    } catch (err) {
      if (err.name === "ValidationError") {
        err.inner.forEach(validationError => {
          toast.error(validationError.message);
        });
      } else {
        toast.error(err.response?.data?.message || err.response?.data?.error || "Invalid credentials or unverified user.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-2">Welcome back</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Please enter your details to sign in.</p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <Input 
          id="email"
          label="Email"
          type="email"
          placeholder="name@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <div className="relative">
          <Input 
            id="password"
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className="absolute right-0 top-0">
            <Link href="/forgot-password" className="text-sm font-bold text-blue-600 hover:text-blue-800 dark:text-blue-500 dark:hover:text-blue-400 transition-colors">
              Forgot password?
            </Link>
          </div>
        </div>
        
        <div className="flex items-center gap-2 pt-1">
          <Checkbox id="remember" className="text-blue-600 focus:ring-blue-500 rounded" />
          <Label htmlFor="remember" className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer user-select-none font-medium">Remember me for 30 days</Label>
        </div>
        
        <Button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-600! hover:bg-blue-700! focus:ring-4! focus:ring-blue-300! dark:bg-blue-600! dark:hover:bg-blue-700! dark:focus:ring-blue-800! transition-all duration-200 mt-2 py-1 shadow-md hover:shadow-lg rounded-xl font-semibold disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <LogIn className={`mr-2 h-5 w-5 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Signing in..." : "Sign in"}
        </Button>
        
        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-8 font-medium">
          Don't have an account?{" "}
          <Link href="/register" className="font-bold text-blue-600 hover:text-blue-800 dark:text-blue-500 dark:hover:text-blue-400 transition-colors">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}
