import { resetPassword } from "@/http/endpoints";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { TFunction } from "i18next";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

const createSchema = (t: TFunction) =>
  z
    .object({
      password: z.string().min(8, t("validation.passwordLength")),
      confirmPassword: z.string().min(8, t("validation.passwordLength")),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("validation.passwordsMatch"),
      path: ["confirmPassword"],
    });

export type ResetPasswordFormData = z.infer<ReturnType<typeof createSchema>>;

export function useResetPassword() {
  const { t } = useTranslation();
  const schema = createSchema(t);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) return;

    try {
      await resetPassword({
        token,
        password: data.password,
      });

      toast.success(t("resetPassword.messages.success"));
      navigate("/login");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        toast.error(t("resetPassword.errors.serverError"));
      } else {
        toast.error(t("common.unexpectedError"));
      }
    }
  };

  return {
    token,
    form,
    isPasswordVisible,
    isConfirmPasswordVisible,
    setIsPasswordVisible,
    setIsConfirmPasswordVisible,
    onSubmit,
  };
}
