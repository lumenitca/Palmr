"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { requestPasswordReset } from "@/http/endpoints";

export type ForgotPasswordFormData = {
  email: string;
};

export function useForgotPassword() {
  const t = useTranslations();
  const router = useRouter();

  const forgotPasswordSchema = z.object({
    email: z.string().email(t("validation.invalidEmail")),
  });

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await requestPasswordReset({
        email: data.email,
        origin: window.location.origin,
      });
      toast.success(t("forgotPassword.resetInstructions"));
      router.push("/login");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        toast.error(t(err.response.data.message));
      } else {
        toast.error(t("common.unexpectedError"));
      }
    }
  };

  return {
    form,
    onSubmit,
  };
}
