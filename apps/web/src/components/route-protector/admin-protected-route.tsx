import { LoadingScreen } from "../layout/loading-screen";
import { useAuth } from "@/contexts/auth-context";
import { Navigate } from "react-router-dom";

export function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdmin } = useAuth();

  if (isAuthenticated === null || isAdmin === null) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate replace to="/login" />;
  }

  if (!isAdmin) {
    return <Navigate replace to="/dashboard" />;
  }

  return children;
}
