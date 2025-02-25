import { ForgotPasswordFormData } from "../hooks/use-forgot-password";
import { UseFormReturn } from "react-hook-form";

export interface ForgotPasswordFormProps {
  form: UseFormReturn<ForgotPasswordFormData>;
  onSubmit: (data: ForgotPasswordFormData) => Promise<void>;
}
