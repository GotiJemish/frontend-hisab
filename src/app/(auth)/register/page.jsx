"use client";

import { useState } from "react";
import { Button, Checkbox, Label } from "flowbite-react";
import Input from "@/components/ui/form/Input";
import Link from "next/link";
import { UserPlus, Mail, Key } from "lucide-react";
import { useRouter } from "next/navigation";
import apiClient from "@/utilities/apiClients";
import { useToast } from "@/context/ToastContext";
import { useLoading } from "@/context/LoadingContext";
import { registerDetailsSchema, otpSchema, setPasswordSchema } from "@/utilities/validations";

export default function RegisterPage() {
  const router = useRouter();
  const toast = useToast();
  const { loading, setLoading } = useLoading();
  const [step, setStep] = useState(1);

  // Step 1 data
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");

  // Step 2 data
  const [otp, setOtp] = useState("");

  // Step 3 data
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // The validation schema might not have company_name yet, but we will pass it anyway
      await registerDetailsSchema.validate({ firstName, lastName, email }, { abortEarly: false });

      const response = await apiClient.post("/auth/register/", {
        first_name: firstName,
        last_name: lastName,
        email,
        company_name: companyName,
      });

      if (response.data.success) {
        toast.success(response.data.message || "OTP sent successfully.");
        setStep(2);
      } else {
        toast.error(response.data.message || "Registration failed.");
      }
    } catch (err) {
      if (err.name === "ValidationError") {
        err.inner.forEach(validationError => {
          toast.error(validationError.message);
        });
      } else {
        if (err.response?.data?.email) {
          toast.error(err.response.data.email[0]);
        } else if (err.response?.data?.non_field_errors) {
          toast.error(err.response.data.non_field_errors[0]);
        } else {
          toast.error(err.response?.data?.message || err.response?.data?.error || "Registration failed.");
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

      const response = await apiClient.post("auth/verify-otp/register/", {
        email,
        otp,
      });

      if (response.data.success) {
        toast.success("Email verified successfully. Please set your password.");
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

  const handleSetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await setPasswordSchema.validate({ password, confirmPassword }, { abortEarly: false });

      const response = await apiClient.post("auth/set-password/", {
        email,
        password,
      });

      if (response.data.success) {
        toast.success("Account created and password set successfully. Redirecting to login...");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        toast.error(response.data.message || "Failed to set password.");
      }
    } catch (err) {
      if (err.name === "ValidationError") {
        err.inner.forEach(validationError => {
          toast.error(validationError.message);
        });
      } else {
        toast.error(err.response?.data?.message || err.response?.data?.error || "Failed to set password.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-2">
          {step === 1 && "Create an account"}
          {step === 2 && "Verify Email"}
          {step === 3 && "Set Password"}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
          {step === 1 && "Join HISAAB to manage your finances effortlessly."}
          {step === 2 && `An OTP has been sent to ${email}`}
          {step === 3 && "Secure your account with a strong password."}
        </p>
      </div>

      {step === 1 && (
        <form className="space-y-5" onSubmit={handleRegister}>
          <div className="grid grid-cols-2 gap-4">
            <Input 
              id="firstName"
              label="First Name"
              type="text"
              placeholder="John"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            <Input 
              id="lastName"
              label="Last Name"
              type="text"
              placeholder="Doe"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
          <Input 
            id="companyName"
            label="Organization/Company Name"
            type="text"
            placeholder="Acme Corp"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
          />
          <Input 
            id="email"
            label="Email"
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          
          <div className="flex items-start gap-2 pt-2">
            <Checkbox id="terms" className="text-blue-600 focus:ring-blue-500 rounded mt-0.5" required />
            <Label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-400 font-medium leading-tight cursor-pointer">
              I accept the <Link href="#" className="font-bold text-blue-600 hover:text-blue-800 dark:text-blue-500 hover:underline transition-colors">Terms and Conditions</Link>
            </Label>
          </div>
          
          <Button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600! hover:bg-blue-700! focus:ring-4! focus:ring-blue-300! dark:bg-blue-600! dark:hover:bg-blue-700! dark:focus:ring-blue-800! transition-all duration-200 mt-4 py-1 shadow-md hover:shadow-lg rounded-xl font-semibold disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <UserPlus className={`mr-2 h-5 w-5 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Sending OTP..." : "Continue"}
          </Button>
          
          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6 font-medium">
            Already have an account?{" "}
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
            <Mail className={`mr-2 h-5 w-5 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Verifying..." : "Verify Email"}
          </Button>
          
          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6 font-medium">
            <button 
              type="button" 
              onClick={() => setStep(1)} 
              className="font-bold text-blue-600 hover:text-blue-800 dark:text-blue-500 dark:hover:text-blue-400 transition-colors"
            >
              Back to registration
            </button>
          </p>
        </form>
      )}

      {step === 3 && (
        <form className="space-y-5" onSubmit={handleSetPassword}>
          <Input 
            id="password"
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Input 
            id="confirm-password"
            label="Confirm Password"
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
            {loading ? "Saving..." : "Set Password"}
          </Button>
        </form>
      )}
    </div>
  );
}
