"use client";

import { createContext, useContext, useEffect, useState } from "react";

import { getCurrentUser } from "@/http/endpoints";
import type { GetCurrentUser200User } from "@/http/models";

type AuthUser = Omit<GetCurrentUser200User, "isAdmin">;

type AuthContextType = {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  isAuthenticated: boolean | null;
  setIsAuthenticated: (value: boolean) => void;
  isAdmin: boolean | null;
  setIsAdmin: (value: boolean) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  isAuthenticated: null,
  setIsAuthenticated: () => {},
  isAdmin: null,
  setIsAdmin: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  const logout = () => {
    setUser(null);
    setIsAdmin(false);
    setIsAuthenticated(false);
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await getCurrentUser();
        if (!response?.data?.user) {
          throw new Error("No user data");
        }

        const { isAdmin, ...userData } = response.data.user;

        setUser(userData);
        setIsAdmin(isAdmin);
        setIsAuthenticated(true);
      } catch (err) {
        console.error(err);
        setUser(null);
        setIsAdmin(false);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated,
        setIsAuthenticated,
        isAdmin,
        setIsAdmin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
