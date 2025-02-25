import { ProfileFormProps } from "../types";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Input } from "@heroui/input";
import { useTranslation } from "react-i18next";
import { FaUserEdit } from "react-icons/fa";

export function ProfileForm({ form, onSubmit }: ProfileFormProps) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  return (
    <Card className="p-6">
      <CardHeader>
        <h2 className="text-lg font-semibold">{t("profile.form.title")}</h2>
      </CardHeader>
      <CardBody>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              {...register("firstName")}
              errorMessage={errors.firstName?.message}
              isInvalid={!!errors.firstName}
              label={t("profile.form.firstName")}
              labelPlacement="outside"
              size="md"
            />
            <Input
              {...register("lastName")}
              errorMessage={errors.lastName?.message}
              isInvalid={!!errors.lastName}
              label={t("profile.form.lastName")}
              labelPlacement="outside"
              size="md"
            />
          </div>
          <Input
            {...register("username")}
            errorMessage={errors.username?.message}
            isInvalid={!!errors.username}
            label={t("profile.form.username")}
            labelPlacement="outside"
            size="md"
          />
          <Input
            {...register("email")}
            errorMessage={errors.email?.message}
            isInvalid={!!errors.email}
            label={t("profile.form.email")}
            labelPlacement="outside"
            size="md"
            type="email"
          />
          <div className="flex justify-end">
            <Button
              className="mt-4 font-semibold flex items-center gap-2"
              color="primary"
              isLoading={isSubmitting}
              startContent={!isSubmitting && <FaUserEdit className="text-xl" />}
              type="submit"
            >
              {t("profile.form.updateButton")}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
