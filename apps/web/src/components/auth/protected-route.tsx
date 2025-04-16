"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/contexts/auth-context";
import { LoadingScreen } from "../layout/loading-screen";

type ProtectedRouteProps = {
  children: ReactNode;
  requireAdmin?: boolean;
};

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated === false) {
      router.replace("/login");
    } else if (requireAdmin && isAdmin === false) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isAdmin, requireAdmin, router]);

  if (isAuthenticated === null || (requireAdmin && isAdmin === null)) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated || (requireAdmin && !isAdmin)) {
    return null;
  }

  return <>{children}</>;
}
