import { StaticBackgroundLights } from "../login/components/static-background-lights";
import { ResetPasswordForm } from "./components/reset-password-form";
import { ResetPasswordHeader } from "./components/reset-password-header";
import { useResetPassword } from "./hooks/use-reset-password";
import { DefaultFooter } from "@/components/ui/default-footer";
import { GridPattern } from "@/components/ui/grid-pattern";
import { usePageTitle } from "@/hooks/use-page-title";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function ResetPasswordPage() {
  const { t } = useTranslation();

  usePageTitle(t("resetPassword.pageTitle"));
  const navigate = useNavigate();
  const resetPassword = useResetPassword();

  useEffect(() => {
    if (!resetPassword.token) {
      toast.error(t("resetPassword.errors.invalidToken"));
      navigate("/login");
    }
  }, [resetPassword.token, navigate, t]);

  return (
    <div className="relative flex min-h-screen flex-col">
      <div className="flex flex-1 items-center justify-center">
        <StaticBackgroundLights />
        <GridPattern />
        <div className="relative z-10 w-full max-w-md space-y-4 px-4 py-12">
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-default-200 bg-black/20 p-8"
            initial={{ opacity: 0, y: 20 }}
          >
            <ResetPasswordHeader />
            <ResetPasswordForm
              form={resetPassword.form}
              isConfirmPasswordVisible={resetPassword.isConfirmPasswordVisible}
              isPasswordVisible={resetPassword.isPasswordVisible}
              onSubmit={resetPassword.onSubmit}
              onToggleConfirmPassword={() =>
                resetPassword.setIsConfirmPasswordVisible(!resetPassword.isConfirmPasswordVisible)
              }
              onTogglePassword={() => resetPassword.setIsPasswordVisible(!resetPassword.isPasswordVisible)}
            />
          </motion.div>
        </div>
      </div>
      <DefaultFooter />
    </div>
  );
}
