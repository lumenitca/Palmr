import { LoginFormProps } from "../types";
import { Button } from "@heroui/button";
import { Form } from "@heroui/form";
import { Input } from "@heroui/input";
import { Link } from "@heroui/link";
import { useTranslation } from "react-i18next";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export function LoginForm({ form, error, isVisible, onToggleVisibility, onSubmit }: LoginFormProps) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  return (
    <>
      {error && <div className="text-danger text-sm text-center bg-danger/10 p-2 rounded-medium">{error}</div>}

      <Form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
        <Input
          {...register("email")}
          classNames={{
            input: "bg-transparent",
            inputWrapper: "backdrop-blur-md",
          }}
          errorMessage={errors.email?.message}
          isDisabled={isSubmitting}
          isInvalid={!!errors.email}
          label={t("login.emailLabel")}
          placeholder={t("login.emailPlaceholder")}
          type="email"
          variant="bordered"
        />

        <Input
          {...register("password")}
          classNames={{
            input: "bg-transparent",
            inputWrapper: "backdrop-blur-md",
          }}
          endContent={
            <button type="button" onClick={onToggleVisibility}>
              {isVisible ? (
                <FaEye className="pointer-events-none text-2xl text-default-400" />
              ) : (
                <FaEyeSlash className="pointer-events-none text-2xl text-default-400" />
              )}
            </button>
          }
          errorMessage={errors.password?.message}
          isDisabled={isSubmitting}
          isInvalid={!!errors.password}
          label={t("login.passwordLabel")}
          placeholder={t("login.passwordPlaceholder")}
          type={isVisible ? "text" : "password"}
          variant="bordered"
        />

        <Button className="w-full mt-4" color="success" isLoading={isSubmitting} radius="full" size="lg" type="submit">
          {isSubmitting ? t("login.signingIn") : t("login.signIn")}
        </Button>
      </Form>
      <div className="flex w-full items-center justify-center px-1 mt-2">
        <Link className="text-default-500 hover:text-success text-sm" href="/forgot-password">
          {t("login.forgotPassword")}
        </Link>
      </div>
    </>
  );
}
