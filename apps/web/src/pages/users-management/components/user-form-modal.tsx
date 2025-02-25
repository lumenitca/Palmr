import { UserFormModalProps } from "../types";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Select, SelectItem } from "@heroui/select";
import { useTranslation } from "react-i18next";
import { FaSave } from "react-icons/fa";

export function UserFormModal({ isOpen, onClose, modalMode, selectedUser, formMethods, onSubmit }: UserFormModalProps) {
  const { t } = useTranslation();
  const {
    register,
    formState: { errors, isSubmitting },
  } = formMethods;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <form onSubmit={formMethods.handleSubmit(onSubmit)}>
          <ModalHeader>{modalMode === "create" ? t("users.form.titleCreate") : t("users.form.titleEdit")}</ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  {...register("firstName")}
                  errorMessage={errors.firstName?.message}
                  isInvalid={!!errors.firstName}
                  label={t("users.form.firstName")}
                />
                <Input
                  {...register("lastName")}
                  errorMessage={errors.lastName?.message}
                  isInvalid={!!errors.lastName}
                  label={t("users.form.lastName")}
                />
              </div>
              <Input
                {...register("username")}
                errorMessage={errors.username?.message}
                isInvalid={!!errors.username}
                label={t("users.form.username")}
              />
              <Input
                {...register("email")}
                errorMessage={errors.email?.message}
                isInvalid={!!errors.email}
                label={t("users.form.email")}
                type="email"
              />
              <Input
                {...register("password")}
                errorMessage={errors.password?.message}
                isInvalid={!!errors.password}
                label={modalMode === "create" ? t("users.form.password") : t("users.form.newPassword")}
                placeholder={modalMode === "edit" ? t("users.form.passwordPlaceholder") : undefined}
                type="password"
              />
              {modalMode === "edit" && (
                <Select
                  {...register("isAdmin")}
                  defaultSelectedKeys={[selectedUser?.isAdmin ? "true" : "false"]}
                  errorMessage={errors.isAdmin?.message}
                  isInvalid={!!errors.isAdmin}
                  label={t("users.form.role")}
                >
                  <SelectItem key="false" value="false">
                    {t("users.form.roleUser")}
                  </SelectItem>
                  <SelectItem key="true" value="true">
                    {t("users.form.roleAdmin")}
                  </SelectItem>
                </Select>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button className="font-semibold" variant="light" onPress={onClose}>
              {t("common.cancel")}
            </Button>
            <Button className="font-semibold" color="primary" isLoading={isSubmitting} type="submit">
              {modalMode === "create" ? "" : <FaSave />}
              {modalMode === "create" ? t("users.form.create") : t("users.form.save")}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
