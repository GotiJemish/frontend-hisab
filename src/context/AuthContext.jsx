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
  refreshProfile: async () => {},
  hasPermission: () => false,
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

  // 🔄 Fetch / profile helper
  const fetchProfile = async (tokenToCheck) => {
    try {
      const activeToken = tokenToCheck || accessToken || localStorage.getItem("auth_token");
      if (!activeToken) return;

      const res = await apiClient.get("/profile/");
      if (res.data && res.data.data) {
        const profile = res.data.data;
        setUser((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            first_name: profile.first_name || "",
            last_name: profile.last_name || "",
            profile_image_url: profile.profile_image_url || null,
            permissions: profile.permissions || prev.permissions || {},
            role: profile.role || prev.role
          };
        });
      }
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
    }
  };
  
  // 🔐 Login
  const login = async ({ access, refresh, user_id }) => {
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
      
      // Load user profile details immediately
      await fetchProfile(access);
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

  // 🔐 Permission helper
  const hasPermission = (moduleName, action) => {
    if (!user) return false;
    if (user.role === "SUPER_ADMIN" || user.role === "COMPANY_ADMIN") {
      return true;
    }
    const perms = user.permissions || {};
    if (perms.all === true) {
      return true;
    }
    const modulePerms = perms[moduleName];
    if (modulePerms === true) {
      return true;
    }
    if (modulePerms && typeof modulePerms === "object") {
      return !!modulePerms[action];
    }
    return false;
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
        
        // Fetch full profile info on page load/mount
        fetchProfile(token);
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
        refreshProfile: fetchProfile,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ✅ useAuth hook
export const useAuth = () => useContext(AuthContext);
