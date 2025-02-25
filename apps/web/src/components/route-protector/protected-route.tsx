import { LoadingScreen } from "../layout/loading-screen";
import { useAuth } from "@/contexts/auth-context";
import { Navigate } from "react-router-dom";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated === null) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate replace to="/login" />;
  }

  return children;
}
