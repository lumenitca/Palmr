import { PasswordFormProps } from "../types";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Input } from "@heroui/input";
import { useTranslation } from "react-i18next";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { RiLockPasswordFill } from "react-icons/ri";

export function PasswordForm({
  form,
  isNewPasswordVisible,
  isConfirmPasswordVisible,
  onToggleNewPassword,
  onToggleConfirmPassword,
  onSubmit,
}: PasswordFormProps) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  return (
    <Card className="p-6">
      <CardHeader>
        <h2 className="text-lg font-semibold">{t("profile.password.title")}</h2>
      </CardHeader>
      <CardBody>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <Input
            {...register("newPassword")}
            endContent={
              <button className="focus:outline-none" type="button" onClick={onToggleNewPassword}>
                {isNewPasswordVisible ? (
                  <FaEye className="text-2xl text-default-400" />
                ) : (
                  <FaEyeSlash className="text-2xl text-default-400" />
                )}
              </button>
            }
            errorMessage={errors.newPassword?.message}
            isInvalid={!!errors.newPassword}
            label={t("profile.password.newPassword")}
            labelPlacement="outside"
            size="md"
            type={isNewPasswordVisible ? "text" : "password"}
          />
          <Input
            {...register("confirmPassword")}
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
            isInvalid={!!errors.confirmPassword}
            label={t("profile.password.confirmPassword")}
            labelPlacement="outside"
            size="md"
            type={isConfirmPasswordVisible ? "text" : "password"}
          />
          <div className="flex justify-end">
            <Button
              className="mt-4 font-semibold flex items-center gap-2"
              color="primary"
              isLoading={isSubmitting}
              startContent={!isSubmitting && <RiLockPasswordFill className="text-xl" />}
              type="submit"
            >
              {t("profile.password.updateButton")}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
