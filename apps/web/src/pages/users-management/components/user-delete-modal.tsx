import { UserDeleteModalProps } from "../types";
import { Button } from "@heroui/button";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { useTranslation } from "react-i18next";

export function UserDeleteModal({ isOpen, onClose, user, onConfirm }: UserDeleteModalProps) {
  const { t } = useTranslation();

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">{t("users.delete.title")}</ModalHeader>
        <ModalBody>
          {user && (
            <p>
              {t("users.delete.confirmation", {
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
          <Button color="danger" onPress={onConfirm}>
            {t("users.delete.confirm")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
