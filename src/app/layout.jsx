import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CustomThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import { LoadingProvider } from "@/context/LoadingContext";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Hisab Admin | Dashboard",
  description: "Hisab Admin Panel – Manage bills, users, and reports with ease.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
      
        <CustomThemeProvider>
          <LoadingProvider>
            <AuthProvider>
              <ToastProvider>
                {children}
              </ToastProvider>
            </AuthProvider>
          </LoadingProvider>
        </CustomThemeProvider>
      </body>
    </html>
  );
}
