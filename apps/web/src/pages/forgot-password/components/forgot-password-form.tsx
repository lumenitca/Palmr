import { ForgotPasswordFormProps } from "../types";
import { Button } from "@heroui/button";
import { Form } from "@heroui/form";
import { Input } from "@heroui/input";
import { Link } from "@heroui/link";
import { useTranslation } from "react-i18next";

export function ForgotPasswordForm({ form, onSubmit }: ForgotPasswordFormProps) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  return (
    <Form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <Input
        {...register("email")}
        classNames={{
          input: "bg-transparent",
          inputWrapper: "backdrop-blur-md",
        }}
        errorMessage={errors.email?.message}
        isDisabled={isSubmitting}
        isInvalid={!!errors.email}
        label={t("forgotPassword.emailLabel")}
        placeholder={t("forgotPassword.emailPlaceholder")}
        type="email"
        variant="bordered"
      />

      <Button className="w-full" color="success" isLoading={isSubmitting} radius="full" size="lg" type="submit">
        {isSubmitting ? t("forgotPassword.sending") : t("forgotPassword.submit")}
      </Button>

      <div className="mt-4 text-center">
        <Link className="text-default-500 hover:text-success text-sm" href="/login">
          {t("forgotPassword.backToLogin")}
        </Link>
      </div>
    </Form>
  );
}
