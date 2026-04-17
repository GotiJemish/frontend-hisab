"use client";

import { useState } from "react";
import { Button } from "flowbite-react";
import Input from "@/components/ui/form/Input";
import Link from "next/link";
import { Mail, Key, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import apiClient from "@/utilities/apiClients";
import { useToast } from "@/context/ToastContext";
import { useLoading } from "@/context/LoadingContext";
import { forgotPasswordEmailSchema, otpSchema, setPasswordSchema } from "@/utilities/validations";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const toast = useToast();
  const { loading, setLoading } = useLoading();
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await forgotPasswordEmailSchema.validate({ email }, { abortEarly: false });

      const response = await apiClient.post("/api/forgot-password/", { email });

      if (response.data.success) {
        toast.success(response.data.message || "OTP sent to your email.");
        setStep(2);
      } else {
        toast.error(response.data.message || "Failed to send OTP.");
      }
    } catch (err) {
      if (err.name === "ValidationError") {
        err.inner.forEach(validationError => {
          toast.error(validationError.message);
        });
      } else {
        if (err.response?.data?.email) {
          toast.error(err.response.data.email[0]);
        } else {
          toast.error(err.response?.data?.message || err.response?.data?.error || "No account found with this email.");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await otpSchema.validate({ otp }, { abortEarly: false });

      const response = await apiClient.post("/api/verify-otp/forgot-password/", {
        email,
        otp,
      });

      if (response.data.success) {
        toast.success("OTP verified successfully. You can now reset your password.");
        setStep(3);
      } else {
        toast.error("Invalid or expired OTP.");
      }
    } catch (err) {
      if (err.name === "ValidationError") {
        err.inner.forEach(validationError => {
          toast.error(validationError.message);
        });
      } else {
        toast.error(err.response?.data?.message || err.response?.data?.error || "Invalid OTP.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await setPasswordSchema.validate({ password, confirmPassword }, { abortEarly: false });

      const response = await apiClient.post("/api/reset-password/", {
        email,
        password,
      });

      if (response.data.success) {
        toast.success("Password reset successfully. Redirecting to login...");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        toast.error(response.data.message || "Password reset failed.");
      }
    } catch (err) {
      if (err.name === "ValidationError") {
        err.inner.forEach(validationError => {
          toast.error(validationError.message);
        });
      } else {
        toast.error(err.response?.data?.message || err.response?.data?.error || "Password reset failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-2">
          {step === 1 && "Forgot Password?"}
          {step === 2 && "Verify OTP"}
          {step === 3 && "Reset Password"}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
          {step === 1 && "Enter your email to receive a password reset OTP."}
          {step === 2 && `An OTP has been sent to ${email}`}
          {step === 3 && "Please enter your new password below."}
        </p>
      </div>

      {step === 1 && (
        <form className="space-y-5" onSubmit={handleSendOtp}>
          <Input 
            id="email"
            label="Email"
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          
          <Button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600! hover:bg-blue-700! focus:ring-4! focus:ring-blue-300! dark:bg-blue-600! dark:hover:bg-blue-700! dark:focus:ring-blue-800! transition-all duration-200 mt-4 py-1 shadow-md hover:shadow-lg rounded-xl font-semibold disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <Mail className={`mr-2 h-5 w-5 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Sending OTP..." : "Send OTP"}
          </Button>

          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6 font-medium">
            Remember your password?{" "}
            <Link href="/login" className="font-bold text-blue-600 hover:text-blue-800 dark:text-blue-500 dark:hover:text-blue-400 transition-colors">
              Sign in
            </Link>
          </p>
        </form>
      )}

      {step === 2 && (
        <form className="space-y-5" onSubmit={handleVerifyOtp}>
          <Input 
            id="otp"
            label="Enter OTP"
            type="text"
            placeholder="123456"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            className="text-center tracking-widest font-mono text-xl"
          />

          <Button 
            type="submit" 
            disabled={loading || otp.length < 6}
            className="w-full bg-blue-600! hover:bg-blue-700! focus:ring-4! focus:ring-blue-300! dark:bg-blue-600! dark:hover:bg-blue-700! dark:focus:ring-blue-800! transition-all duration-200 mt-4 py-1 shadow-md hover:shadow-lg rounded-xl font-semibold disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <ShieldCheck className={`mr-2 h-5 w-5 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Verifying..." : "Verify OTP"}
          </Button>

          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6 font-medium">
            <button 
              type="button" 
              onClick={() => setStep(1)} 
              className="font-bold text-blue-600 hover:text-blue-800 dark:text-blue-500 dark:hover:text-blue-400 transition-colors"
            >
              Back to email
            </button>
          </p>
        </form>
      )}

      {step === 3 && (
        <form className="space-y-5" onSubmit={handleResetPassword}>
          <Input 
            id="password"
            label="New Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Input 
            id="confirm-password"
            label="Confirm New Password"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600! hover:bg-blue-700! focus:ring-4! focus:ring-blue-300! dark:bg-blue-600! dark:hover:bg-blue-700! dark:focus:ring-blue-800! transition-all duration-200 mt-4 py-1 shadow-md hover:shadow-lg rounded-xl font-semibold disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <Key className={`mr-2 h-5 w-5 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
      )}
    </div>
  );
}
