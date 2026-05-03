"use client";

import Link from "next/link";
import { ArrowRight, TrendingUp, Users, Shield } from "lucide-react";
import { Btn } from "@/components/ui";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0B1220] transition-colors duration-300 flex flex-col font-sans">
      {/* Navbar */}
      <nav className="w-full border-b border-[#E2E8F0] dark:border-[#1F2937] bg-white/80 dark:bg-[#0B1220]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-br from-[#2563EB] to-[#14B8A6]">
                <span className="text-white font-bold text-lg leading-none">H</span>
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#2563EB] to-[#14B8A6]">
                Hisaab
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm font-medium text-[#475569] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#E2E8F0] transition-colors">
                Sign in
              </Link>
              <Link href="/register">
                <Btn variant="primary" size="sm">Get Started</Btn>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center w-full px-4 sm:px-6 lg:px-8 py-20 lg:py-32 overflow-hidden relative">
        {/* Background decorative elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-[#2563EB]/10 to-[#14B8A6]/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EFF6FF] dark:bg-[#1E3A8A]/30 border border-[#BFDBFE] dark:border-[#1E3A8A]">
            <span className="flex h-2 w-2 rounded-full bg-[#2563EB] animate-pulse" />
            <span className="text-xs font-semibold text-[#2563EB] dark:text-[#93C5FD] uppercase tracking-wider">
              Smart Accounting for B2B
            </span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-[#0F172A] dark:text-white">
            Simplify Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] to-[#14B8A6]">Billing & Invoicing</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg lg:text-xl text-[#475569] dark:text-[#94A3B8] leading-relaxed">
            Hisaab brings multi-tenant architecture, automated invoice generation, and comprehensive financial reporting into one elegant platform.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/register">
              <button className="flex items-center justify-center w-full sm:w-auto h-14 px-8 text-lg font-medium rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white transition-all group shadow-lg shadow-blue-500/25">
                Start for free
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <Link href="/login">
              <button className="flex items-center justify-center w-full sm:w-auto h-14 px-8 text-lg font-medium rounded-full bg-white dark:bg-[#1E293B] hover:bg-gray-50 dark:hover:bg-[#334155] text-[#0F172A] dark:text-white border border-[#E2E8F0] dark:border-[#334155] transition-all">
                Login to Dashboard
              </button>
            </Link>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mt-24 lg:mt-32">
          {FEATURES.map((feature, idx) => (
            <div key={idx} className="bg-white/50 dark:bg-[#1E293B]/50 backdrop-blur-sm border border-[#E2E8F0] dark:border-[#334155] p-8 rounded-3xl hover:shadow-xl transition-all duration-300 group">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#2563EB]/10 to-[#14B8A6]/10 flex items-center justify-center text-[#2563EB] dark:text-[#2DD4BF] mb-6 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-[#0F172A] dark:text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-[#475569] dark:text-[#94A3B8] leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[#E2E8F0] dark:border-[#1F2937] py-8 text-center bg-white dark:bg-[#0F172A]">
        <p className="text-[#64748B] dark:text-[#94A3B8] text-sm">
          &copy; {new Date().getFullYear()} Hisaab Project. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

const FEATURES = [
  {
    icon: <Users className="h-6 w-6" />,
    title: "Multi-tenant Roles",
    description: "Manage different organizations and granular access roles (Superadmin, Company Admin, Staff) securely."
  },
  {
    icon: <TrendingUp className="h-6 w-6" />,
    title: "Insightful Dashboard",
    description: "Track total revenue, active users, pending bills, and paid invoices quickly with interactive charts and tables."
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Secure Operations",
    description: "Built with the latest security standards, JWT authentication, and robust server-side middleware validation."
  }
];
