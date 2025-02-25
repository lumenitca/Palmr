import { PasswordModalProps } from "../types";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/modal";
import { useTranslation } from "react-i18next";
import { FaLock } from "react-icons/fa";

export function PasswordModal({ isOpen, password, isError, onPasswordChange, onSubmit }: PasswordModalProps) {
  const { t } = useTranslation();

  return (
    <Modal hideCloseButton isDismissable={false} isOpen={isOpen} onClose={() => {}}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h2>{t("share.password.title")}</h2>
          <div className="flex items-center gap-2 text-warning text-sm">
            <FaLock />
            <p>{t("share.password.protected")}</p>
          </div>
          {isError && (
            <div className="flex items-center gap-2 text-danger text-sm mt-2">
              <p>{t("share.password.incorrect")}</p>
            </div>
          )}
        </ModalHeader>
        <ModalBody>
          <Input
            label={t("share.password.label")}
            placeholder={t("share.password.placeholder")}
            type="password"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSubmit()}
          />
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onPress={onSubmit}>
            {t("share.password.submit")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
