import { FilesPage } from "./pages/files/page";
import { ForgotPasswordPage } from "./pages/forgot-password/page";
import { ResetPasswordPage } from "./pages/reset-password/page";
import { SettingsPage } from "./pages/settings/page";
import { PublicSharePage } from "./pages/share/[alias]/page";
import { SharesPage } from "./pages/shares/page";
import { AdminProtectedRoute } from "@/components/route-protector/admin-protected-route";
import { ProtectedRoute } from "@/components/route-protector/protected-route";
import { DashboardPage } from "@/pages/dashboard/page";
import { HomePage } from "@/pages/home/page";
import { LoginPage } from "@/pages/login/page";
import { ProfilePage } from "@/pages/profile/page";
import { AdminAreaPage } from "@/pages/users-management/page";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Route, Routes } from "react-router-dom";

function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    document.documentElement.dir = i18n.language === "ar-SA" ? "rtl" : "ltr";
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <Routes>
      <Route element={<HomePage />} path="/" />
      <Route element={<LoginPage />} path="/login" />
      <Route
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
        path="/dashboard"
      />
      <Route
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
        path="/profile"
      />
      <Route
        element={
          <AdminProtectedRoute>
            <SettingsPage />
          </AdminProtectedRoute>
        }
        path="/settings"
      />
      <Route
        element={
          <AdminProtectedRoute>
            <AdminAreaPage />
          </AdminProtectedRoute>
        }
        path="/admin"
      />
      <Route
        element={
          <ProtectedRoute>
            <FilesPage />
          </ProtectedRoute>
        }
        path="/files"
      />
      <Route
        element={
          <ProtectedRoute>
            <SharesPage />
          </ProtectedRoute>
        }
        path="/shares"
      />
      <Route element={<PublicSharePage />} path="/s/:alias" />
      <Route element={<ForgotPasswordPage />} path="/forgot-password" />
      <Route element={<ResetPasswordPage />} path="/reset-password" />
    </Routes>
  );
}

export default App;
