import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ProfileDTO } from "../types";
import { authApi } from "../api/authApi";

interface AuthContextType {
  user: ProfileDTO | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: ProfileDTO) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<ProfileDTO | null>>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: () => {},
  logout: () => {},
  refreshUser: async () => {},
  setUser: () => {},
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ProfileDTO | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore auth from localStorage on initial load
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (storedToken) {
        setToken(storedToken);
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch {
            localStorage.removeItem("user");
          }
        }

        // Fetch fresh profile from API to ensure validity
        try {
          const freshProfile = await authApi.getProfile();
          if (freshProfile) {
            setUser(freshProfile);
            localStorage.setItem("user", JSON.stringify(freshProfile));
          }
        } catch (error: any) {
          // If 401, axios interceptor handles redirect
          if (error.response?.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setToken(null);
            setUser(null);
          }
        }
      }
      setIsLoading(false);
    };

    initAuth();

    // Listen to global 401 logout event
    const handleLogoutEvent = () => {
      setToken(null);
      setUser(null);
    };
    window.addEventListener("auth:logout", handleLogoutEvent);
    return () => {
      window.removeEventListener("auth:logout", handleLogoutEvent);
    };
  }, []);

  const login = (newToken: string, newUser: ProfileDTO) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    window.location.href = "/login";
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const profile = await authApi.getProfile();
      setUser(profile);
      localStorage.setItem("user", JSON.stringify(profile));
    } catch (e) {
      console.error("Failed to refresh user profile", e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        logout,
        refreshUser,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
