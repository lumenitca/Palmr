import { LoginForm } from "./components/login-form";
import { LoginHeader } from "./components/login-header";
import { StaticBackgroundLights } from "./components/static-background-lights";
import { useLogin } from "./hooks/use-login";
import { LoadingScreen } from "@/components/layout/loading-screen";
import { DefaultFooter } from "@/components/ui/default-footer";
import { GridPattern } from "@/components/ui/grid-pattern";
import { usePageTitle } from "@/hooks/use-page-title";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export function LoginPage() {
  const { t } = useTranslation();

  usePageTitle(t("login.pageTitle"));

  const login = useLogin();

  if (login.isAuthenticated === null) {
    return <LoadingScreen />;
  }

  return (
    <div className="relative flex flex-col h-screen">
      <div className="container mx-auto max-w-7xl px-6 flex-grow">
        <GridPattern />
        <StaticBackgroundLights />
        <div className="relative flex h-full w-full items-center justify-center">
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="flex w-full max-w-sm flex-col gap-4 rounded-large bg-content1/80 backdrop-blur-md px-8 pb-10 pt-6 shadow-large"
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
          >
            <LoginHeader />
            <LoginForm
              error={login.error}
              form={login.form}
              isVisible={login.isVisible}
              onSubmit={login.onSubmit}
              onToggleVisibility={login.toggleVisibility}
            />
          </motion.div>
        </div>
      </div>
      <DefaultFooter />
    </div>
  );
}
