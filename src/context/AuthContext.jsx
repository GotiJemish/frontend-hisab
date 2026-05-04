"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import apiClient from "@/utilities/apiClients";
import { useRouter } from "next/navigation";

// Create context
const AuthContext = createContext({
  accessToken: null,
  user: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  isLoading: true,
});

// Helper: Decode token safely
const decodeToken = (token = "") => {
  if (!token || typeof token !== "string" || token.split(".").length !== 3) {
    console.warn("Invalid token format, skipping decode.");
    return null;
  }

  try {
    return jwtDecode(token);
  } catch (err) {
    console.error("Token decode failed:", err);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  
  // 🔐 Login
  const login = ({ access, refresh,user_id }) => {
    localStorage.setItem("auth_token", access);
    localStorage.setItem("refresh_token", refresh);

    Cookies.set("auth_token", access, { 
      expires: 2, 
      secure: process.env.NODE_ENV === "production", 
      sameSite: "Lax" 
    });


    const decoded = decodeToken(access);
    if (decoded) {
      setAccessToken(access);
      setUser({ 
        user_id: user_id || decoded.user_id, 
        email: decoded.email, 
        role: decoded.role, 
        permissions: decoded.permissions || {}, 
        token: decoded 
      });
      setIsAuthenticated(true);
    }
  };

  // 🚪 Logout
  const logout = () => {
     localStorage.clear();
  Cookies.remove("auth_token");
setAccessToken(null);
    setUser(null);
    setIsAuthenticated(false);
    router.push("/login");
  };

  // ⏱️ Auto-check token on mount
  useEffect(() => {
    const token = localStorage.getItem("auth_token") || "";
   
    const decoded = decodeToken(token);
  


    if (decoded) {
      const isExpired = decoded.exp * 1000 < Date.now();
      // If token is expired or missing the newly added 'role' field, force re-login
      if (isExpired || !decoded.role) {
        logout();
      } else {
        setAccessToken(token);
        setUser({ 
          user_id: decoded.user_id, 
          email: decoded.email, 
          role: decoded.role, 
          permissions: decoded.permissions || {}, 
          token: decoded 
        });
        setIsAuthenticated(true);
      }
    } else {
      setIsAuthenticated(false);
    }

    setIsLoading(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        user,
        isAuthenticated,
        login,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ✅ useAuth hook
export const useAuth = () => useContext(AuthContext);
