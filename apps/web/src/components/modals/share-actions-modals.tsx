import { FileSelector } from "../general/file-selector";
import { RecipientSelector } from "../general/recipient-selector";
import { updateSharePassword } from "@/http/endpoints";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/modal";
import { Switch } from "@heroui/switch";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export interface ShareActionsModalsProps {
  shareToDelete: any;
  shareToEdit: any;
  shareToManageFiles: any;
  shareToManageRecipients: any;
  onCloseDelete: () => void;
  onCloseEdit: () => void;
  onCloseManageFiles: () => void;
  onCloseManageRecipients: () => void;
  onDelete: (shareId: string) => Promise<void>;
  onEdit: (shareId: string, data: any) => Promise<void>;
  onManageFiles: (shareId: string, files: string[]) => Promise<void>;
  onManageRecipients: (shareId: string, recipients: string[]) => Promise<void>;
  onSuccess: () => void;
}

export function ShareActionsModals({
  shareToDelete,
  shareToEdit,
  shareToManageFiles,
  shareToManageRecipients,
  onCloseDelete,
  onCloseEdit,
  onCloseManageFiles,
  onCloseManageRecipients,
  onDelete,
  onEdit,
  onManageFiles,
  onSuccess,
}: ShareActionsModalsProps) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    expiresAt: "",
    isPasswordProtected: false,
    password: "",
    maxViews: "",
  });

  useEffect(() => {
    if (shareToEdit) {
      setEditForm({
        name: shareToEdit.name || "",
        expiresAt: shareToEdit.expiration ? new Date(shareToEdit.expiration).toISOString().slice(0, 16) : "",
        isPasswordProtected: Boolean(shareToEdit.security?.hasPassword),
        password: "",
        maxViews: shareToEdit.security?.maxViews?.toString() || "",
      });
    }
  }, [shareToEdit]);

  const handleDelete = async () => {
    if (!shareToDelete) return;
    setIsLoading(true);
    await onDelete(shareToDelete.id);
    setIsLoading(false);
  };

  const handleEdit = async () => {
    if (!shareToEdit) return;
    setIsLoading(true);

    try {
      const updateData = {
        name: editForm.name,
        expiration: editForm.expiresAt ? new Date(editForm.expiresAt).toISOString() : undefined,
        maxViews: editForm.maxViews ? parseInt(editForm.maxViews) : null,
      };

      await onEdit(shareToEdit.id, updateData);

      if (!editForm.isPasswordProtected && shareToEdit.security.hasPassword) {
        await updateSharePassword(shareToEdit.id, { password: "" });
      } else if (editForm.isPasswordProtected && editForm.password) {
        await updateSharePassword(shareToEdit.id, { password: editForm.password });
      }

      onSuccess();
      onCloseEdit();
      toast.success(t("shareActions.editSuccess"));
    } catch (error) {
      console.error(error);
      toast.error(t("shareActions.editError"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Modal isOpen={!!shareToDelete} onClose={onCloseDelete}>
        <ModalContent>
          <ModalHeader>{t("shareActions.deleteTitle")}</ModalHeader>
          <ModalBody>{t("shareActions.deleteConfirmation")}</ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onCloseDelete}>
              {t("common.cancel")}
            </Button>
            <Button color="danger" isLoading={isLoading} onPress={handleDelete}>
              {t("common.delete")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={!!shareToEdit} onClose={onCloseEdit}>
        <ModalContent>
          <ModalHeader>{t("shareActions.editTitle")}</ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-4">
              <Input
                label={t("shareActions.nameLabel")}
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
              <Input
                label={t("shareActions.expirationLabel")}
                placeholder={t("shareActions.expirationPlaceholder")}
                type="datetime-local"
                value={editForm.expiresAt}
                onChange={(e) => setEditForm({ ...editForm, expiresAt: e.target.value })}
              />
              <Input
                label={t("shareActions.maxViewsLabel")}
                min="1"
                placeholder={t("shareActions.maxViewsPlaceholder")}
                type="number"
                value={editForm.maxViews}
                onChange={(e) => setEditForm({ ...editForm, maxViews: e.target.value })}
              />
              <div className="flex items-center gap-2">
                <Switch
                  isSelected={editForm.isPasswordProtected}
                  onValueChange={(checked) =>
                    setEditForm({
                      ...editForm,
                      isPasswordProtected: checked,
                      password: "",
                    })
                  }
                >
                  {t("shareActions.passwordProtection")}
                </Switch>
              </div>
              {editForm.isPasswordProtected && (
                <Input
                  label={
                    shareToEdit?.security?.hasPassword
                      ? t("shareActions.newPasswordLabel")
                      : t("shareActions.passwordLabel")
                  }
                  placeholder={
                    shareToEdit?.security?.hasPassword
                      ? t("shareActions.newPasswordPlaceholder")
                      : t("shareActions.passwordPlaceholder")
                  }
                  type="password"
                  value={editForm.password}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                />
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onCloseEdit}>
              {t("common.cancel")}
            </Button>
            <Button color="primary" isLoading={isLoading} onPress={handleEdit}>
              {t("common.save")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={!!shareToManageFiles} size="2xl" onClose={onCloseManageFiles}>
        <ModalContent>
          <ModalHeader>{t("shareActions.manageFilesTitle")}</ModalHeader>
          <ModalBody>
            <FileSelector
              selectedFiles={shareToManageFiles?.files?.map((file: { id: string }) => file.id) || []}
              shareId={shareToManageFiles?.id}
              onSave={async (files) => {
                await onManageFiles(shareToManageFiles?.id, files);
                onSuccess();
              }}
            />
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal isOpen={!!shareToManageRecipients} size="2xl" onClose={onCloseManageRecipients}>
        <ModalContent>
          <ModalHeader>{t("shareActions.manageRecipientsTitle")}</ModalHeader>
          <ModalBody>
            <RecipientSelector
              selectedRecipients={shareToManageRecipients?.recipients || []}
              shareAlias={shareToManageRecipients?.alias?.alias}
              shareId={shareToManageRecipients?.id}
              onSuccess={onSuccess}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
