import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { useTranslation } from "react-i18next";

interface FileActionsModalsProps {
  fileToRename: { id: string; name: string; description?: string } | null;
  fileToDelete: { id: string; name: string } | null;
  onRename: (fileId: string, newName: string, description?: string) => Promise<void>;
  onDelete: (fileId: string) => Promise<void>;
  onCloseRename: () => void;
  onCloseDelete: () => void;
}

export function FileActionsModals({
  fileToRename,
  fileToDelete,
  onRename,
  onDelete,
  onCloseRename,
  onCloseDelete,
}: FileActionsModalsProps) {
  const { t } = useTranslation();

  const splitFileName = (fullName: string) => {
    const lastDotIndex = fullName.lastIndexOf(".");

    return lastDotIndex === -1
      ? { name: fullName, extension: "" }
      : {
          name: fullName.substring(0, lastDotIndex),
          extension: fullName.substring(lastDotIndex),
        };
  };

  return (
    <>
      <Modal isOpen={!!fileToRename} size="sm" onClose={onCloseRename}>
        <ModalContent>
          <ModalHeader>{t("fileActions.editFile")}</ModalHeader>
          <ModalBody>
            {fileToRename && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Input
                    defaultValue={splitFileName(fileToRename.name).name}
                    label={t("fileActions.nameLabel")}
                    placeholder={t("fileActions.namePlaceholder")}
                    onKeyUp={(e) => {
                      if (e.key === "Enter" && fileToRename) {
                        const newName = e.currentTarget.value + splitFileName(fileToRename.name).extension;

                        onRename(fileToRename.id, newName);
                      }
                    }}
                  />
                  <p className="text-sm text-gray-500">
                    {t("fileActions.extension")}: {splitFileName(fileToRename.name).extension}
                  </p>
                </div>
                <Input
                  defaultValue={fileToRename.description || ""}
                  label={t("fileActions.descriptionLabel")}
                  placeholder={t("fileActions.descriptionPlaceholder")}
                />
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onCloseRename}>
              {t("common.cancel")}
            </Button>
            <Button
              color="primary"
              onPress={() => {
                const nameInput = document.querySelector(
                  `input[placeholder="${t("fileActions.namePlaceholder")}"]`
                ) as HTMLInputElement;
                const descInput = document.querySelector(
                  `input[placeholder="${t("fileActions.descriptionPlaceholder")}"]`
                ) as HTMLInputElement;

                if (fileToRename && nameInput && descInput) {
                  const newName = nameInput.value + splitFileName(fileToRename.name).extension;

                  onRename(fileToRename.id, newName, descInput.value);
                }
              }}
            >
              {t("common.save")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={!!fileToDelete} size="sm" onClose={onCloseDelete}>
        <ModalContent>
          <ModalHeader>{t("fileActions.deleteFile")}</ModalHeader>
          <ModalBody>
            <p>{t("fileActions.deleteConfirmation", { fileName: fileToDelete?.name })}</p>
            <p className="text-sm text-gray-500 mt-2">{t("fileActions.deleteWarning")}</p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onCloseDelete}>
              {t("common.cancel")}
            </Button>
            <Button color="danger" onPress={() => fileToDelete && onDelete(fileToDelete.id)}>
              {t("common.delete")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
