import { createShare } from "@/http/endpoints";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/modal";
import { Switch } from "@heroui/switch";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface CreateShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateShareModal({ isOpen, onClose, onSuccess }: CreateShareModalProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    password: "",
    expiresAt: "",
    isPasswordProtected: false,
    maxViews: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      await createShare({
        name: formData.name,
        password: formData.isPasswordProtected ? formData.password : undefined,
        expiration: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : undefined,
        maxViews: formData.maxViews ? parseInt(formData.maxViews) : undefined,
        files: [],
      });
      toast.success(t("createShare.success"));
      onSuccess();
      onClose();
      setFormData({
        name: "",
        password: "",
        expiresAt: "",
        isPasswordProtected: false,
        maxViews: "",
      });
    } catch (error) {
      toast.error(t("createShare.error"));
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>{t("createShare.title")}</ModalHeader>
        <ModalBody>
          <div className="flex flex-col gap-4">
            <Input
              label={t("createShare.nameLabel")}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <Input
              label={t("createShare.expirationLabel")}
              placeholder={t("createShare.expirationPlaceholder")}
              type="datetime-local"
              value={formData.expiresAt}
              onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
            />
            <Input
              label={t("createShare.maxViewsLabel")}
              min="1"
              placeholder={t("createShare.maxViewsPlaceholder")}
              type="number"
              value={formData.maxViews}
              onChange={(e) => setFormData({ ...formData, maxViews: e.target.value })}
            />
            <div className="flex items-center gap-2">
              <Switch
                isSelected={formData.isPasswordProtected}
                onValueChange={(checked) =>
                  setFormData({
                    ...formData,
                    isPasswordProtected: checked,
                    password: "",
                  })
                }
              >
                {t("createShare.passwordProtection")}
              </Switch>
            </div>
            {formData.isPasswordProtected && (
              <Input
                label={t("createShare.passwordLabel")}
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            {t("common.cancel")}
          </Button>
          <Button color="primary" isLoading={isLoading} onPress={handleSubmit}>
            {t("createShare.create")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
