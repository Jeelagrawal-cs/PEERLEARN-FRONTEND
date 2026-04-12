import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { fetchCurrentUser } from "../services/auth.service.js";

const AuthContext = createContext(null);

function normalizeUser(user) {
  if (!user) return null;

  return {
    ...user,
    id: user.id || user.user_id || null,
    name: user.name || user.full_name || "User",
    role: user.role || user.role_name || "student",
    avatar_url: user.avatar_url || user.profile_image || null,
  };
}

function getStoredUser() {
  try {
    const raw = localStorage.getItem("user");
    const parsed = raw ? JSON.parse(raw) : null;
    return normalizeUser(parsed);
  } catch (error) {
    console.error("Failed to parse stored user:", error);
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [user, setUserState] = useState(getStoredUser());
  const [isLoading, setIsLoading] = useState(true);

  function setUser(nextUser) {
    const normalized = normalizeUser(nextUser);

    if (normalized) {
      localStorage.setItem("user", JSON.stringify(normalized));
      setUserState(normalized);
    } else {
      localStorage.removeItem("user");
      setUserState(null);
    }
  }

  function login(authResponse) {
    const resolvedToken =
      authResponse?.token ||
      authResponse?.data?.token ||
      authResponse?.accessToken ||
      null;

    const resolvedUser =
      authResponse?.user ||
      authResponse?.data?.user ||
      authResponse?.data?.data ||
      authResponse?.data ||
      null;

    if (!resolvedToken) {
      throw new Error("Token not found in auth response");
    }

    localStorage.setItem("token", resolvedToken);
    setToken(resolvedToken);
    setUser(resolvedUser);
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUserState(null);
  }

  useEffect(() => {
    async function bootstrapAuth() {
      const storedToken = localStorage.getItem("token");

      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const freshUser = await fetchCurrentUser();
        setUser(freshUser);
        setToken(storedToken);
      } catch (error) {
        console.error("Auth bootstrap failed:", error);
        logout();
      } finally {
        setIsLoading(false);
      }
    }

    bootstrapAuth();
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      isLoading,
      login,
      logout,
      setUser,
    }),
    [token, user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}