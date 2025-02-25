import { UserStatusModalProps } from "../types";
import { Button } from "@heroui/button";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { useTranslation } from "react-i18next";

export function UserStatusModal({ isOpen, onClose, user, onConfirm }: UserStatusModalProps) {
  const { t } = useTranslation();

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">{t("users.status.title")}</ModalHeader>
        <ModalBody>
          {user && (
            <p>
              {t("users.status.confirmation", {
                action: user.isActive ? t("users.status.deactivate") : t("users.status.activate"),
                firstName: user.firstName,
                lastName: user.lastName,
              })}
            </p>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            {t("common.cancel")}
          </Button>
          <Button color={user?.isActive ? "warning" : "success"} onPress={onConfirm}>
            {user?.isActive ? t("users.status.deactivate") : t("users.status.activate")} {t("users.status.user")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
