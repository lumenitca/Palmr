"use client";

import { motion } from "framer-motion";

import { DefaultFooter } from "@/components/ui/default-footer";
import { StaticBackgroundLights } from "../login/components/static-background-lights";
import { ForgotPasswordForm } from "./components/forgot-password-form";
import { ForgotPasswordHeader } from "./components/forgot-password-header";
import { useForgotPassword } from "./hooks/use-forgot-password";

export default function ForgotPasswordPage() {
  const forgotPassword = useForgotPassword();

  return (
    <div className="relative flex min-h-screen flex-col">
      <div className="flex flex-1 items-center justify-center">
        <StaticBackgroundLights />
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
