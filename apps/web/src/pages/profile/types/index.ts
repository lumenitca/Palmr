import { PasswordFormData, ProfileFormData } from "../hooks/use-profile";
import { UseFormReturn } from "react-hook-form";

export interface PasswordFormProps {
  form: UseFormReturn<PasswordFormData>;
  isNewPasswordVisible: boolean;
  isConfirmPasswordVisible: boolean;
  onToggleNewPassword: () => void;
  onToggleConfirmPassword: () => void;
  onSubmit: (data: PasswordFormData) => Promise<void>;
}

export interface ProfileFormProps {
  form: UseFormReturn<ProfileFormData>;
  onSubmit: (data: ProfileFormData) => Promise<void>;
}

export interface ProfilePictureProps {
  userData: {
    firstName: string;
    image?: string;
  };
  onImageChange: (file: File) => Promise<void>;
  onImageRemove: () => Promise<void>;
}
