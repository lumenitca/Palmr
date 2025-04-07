"use client"

import { LoginForm } from "./components/login-form";
import { LoginHeader } from "./components/login-header";
import { StaticBackgroundLights } from "./components/static-background-lights";
import { useLogin } from "./hooks/use-login";
import { LoadingScreen } from "@/components/layout/loading-screen";
import { DefaultFooter } from "@/components/ui/default-footer";
import { motion } from "framer-motion";
import { LanguageSwitcher } from "@/components/general/language-switcher";

export default function LoginPage() {
  const login = useLogin();

  if (login.isAuthenticated === null) {
    return <LoadingScreen />;
  }

  return (
    <div className="relative flex flex-col h-screen">
      <div className="fixed top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>

      <div className="container mx-auto max-w-7xl px-6 flex-grow">
        <StaticBackgroundLights />
        <div className="relative flex h-full w-full items-center justify-center">
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="flex w-full max-w-sm flex-col gap-4 rounded-lg bg-background/80 backdrop-blur-md px-8 pb-10 pt-6 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
          >
            <LoginHeader />
            <LoginForm
              error={login.error}
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
