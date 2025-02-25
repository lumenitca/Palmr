import { ResetPasswordFormProps } from "../types";
import { Button } from "@heroui/button";
import { Form } from "@heroui/form";
import { Input } from "@heroui/input";
import { Link } from "@heroui/link";
import { useTranslation } from "react-i18next";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export function ResetPasswordForm({
  form,
  isPasswordVisible,
  isConfirmPasswordVisible,
  onTogglePassword,
  onToggleConfirmPassword,
  onSubmit,
}: ResetPasswordFormProps) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  return (
    <Form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <Input
        {...register("password")}
        classNames={{
          input: "bg-transparent",
          inputWrapper: "backdrop-blur-md",
        }}
        endContent={
          <button className="focus:outline-none" type="button" onClick={onTogglePassword}>
            {isPasswordVisible ? (
              <FaEye className="text-2xl text-default-400" />
            ) : (
              <FaEyeSlash className="text-2xl text-default-400" />
            )}
          </button>
        }
        errorMessage={errors.password?.message}
        isDisabled={isSubmitting}
        isInvalid={!!errors.password}
        label={t("resetPassword.form.newPassword")}
        placeholder={t("resetPassword.form.newPasswordPlaceholder")}
        type={isPasswordVisible ? "text" : "password"}
        variant="bordered"
      />

      <Input
        {...register("confirmPassword")}
        classNames={{
          input: "bg-transparent",
          inputWrapper: "backdrop-blur-md",
        }}
        endContent={
          <button className="focus:outline-none" type="button" onClick={onToggleConfirmPassword}>
            {isConfirmPasswordVisible ? (
              <FaEye className="text-2xl text-default-400" />
            ) : (
              <FaEyeSlash className="text-2xl text-default-400" />
            )}
          </button>
        }
        errorMessage={errors.confirmPassword?.message}
        isDisabled={isSubmitting}
        isInvalid={!!errors.confirmPassword}
        label={t("resetPassword.form.confirmPassword")}
        placeholder={t("resetPassword.form.confirmPasswordPlaceholder")}
        type={isConfirmPasswordVisible ? "text" : "password"}
        variant="bordered"
      />

      <Button className="w-full" color="success" isLoading={isSubmitting} radius="full" size="lg" type="submit">
        {isSubmitting ? t("resetPassword.form.resetting") : t("resetPassword.form.submit")}
      </Button>

      <div className="mt-4 text-center">
        <Link className="text-default-500 hover:text-success text-sm" href="/login">
          {t("resetPassword.form.backToLogin")}
        </Link>
      </div>
    </Form>
  );
}
