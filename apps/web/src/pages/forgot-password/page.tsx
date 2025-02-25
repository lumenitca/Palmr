import { StaticBackgroundLights } from "../login/components/static-background-lights";
import { ForgotPasswordForm } from "./components/forgot-password-form";
import { ForgotPasswordHeader } from "./components/forgot-password-header";
import { useForgotPassword } from "./hooks/use-forgot-password";
import { DefaultFooter } from "@/components/ui/default-footer";
import { GridPattern } from "@/components/ui/grid-pattern";
import { usePageTitle } from "@/hooks/use-page-title";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export function ForgotPasswordPage() {
  const { t } = useTranslation();

  usePageTitle(t("forgotPassword.pageTitle"));
  const forgotPassword = useForgotPassword();

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
            <ForgotPasswordHeader />
            <ForgotPasswordForm form={forgotPassword.form} onSubmit={forgotPassword.onSubmit} />
          </motion.div>
        </div>
      </div>
      <DefaultFooter />
    </div>
  );
}
