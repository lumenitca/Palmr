import { requestPasswordReset } from "@/http/endpoints";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

export type ForgotPasswordFormData = {
  email: string;
};

export function useForgotPassword() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const forgotPasswordSchema = z.object({
    email: z.string().email(t("validation.invalidEmail")),
  });

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await requestPasswordReset(data);
      toast.success(t("forgotPassword.resetInstructions"));
      navigate("/login");
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
