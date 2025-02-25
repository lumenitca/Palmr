import { LoginFormData } from "../hooks/use-login";
import { UseFormReturn } from "react-hook-form";

export interface LoginFormProps {
  form: UseFormReturn<LoginFormData>;
  error: string | null;
  isVisible: boolean;
  onToggleVisibility: () => void;
  onSubmit: (data: LoginFormData) => Promise<void>;
}
