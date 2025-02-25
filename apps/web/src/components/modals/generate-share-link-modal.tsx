import type { ListUserShares200SharesItem } from "@/http/models/listUserShares200SharesItem";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/modal";
import { nanoid } from "nanoid";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface GenerateShareLinkModalProps {
  shareId: string | null;
  share: ListUserShares200SharesItem | null;
  onClose: () => void;
  onSuccess: () => void;
  onGenerate: (shareId: string, alias: string) => Promise<void>;
}

export function GenerateShareLinkModal({
  shareId,
  share,
  onClose,
  onSuccess,
  onGenerate,
}: GenerateShareLinkModalProps) {
  const { t } = useTranslation();
  const [alias, setAlias] = useState(() => nanoid(10));
  const [isLoading, setIsLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    if (shareId && share?.alias?.alias) {
      setIsEdit(true);
      setAlias(share.alias.alias);
    } else {
      setIsEdit(false);
      setAlias(nanoid(10));
    }
    setGeneratedLink("");
  }, [shareId, share]);

  const handleGenerate = async () => {
    if (!shareId) return;

    try {
      setIsLoading(true);
      await onGenerate(shareId, alias);
      const link = `${window.location.origin}/s/${alias}`;

      setGeneratedLink(link);
      onSuccess();
      toast.success(t("generateShareLink.success"));
    } catch (error) {
      console.error(error);
      toast.error(t("generateShareLink.error"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    toast.success(t("generateShareLink.copied"));
  };

  return (
    <Modal isOpen={!!shareId} onClose={onClose}>
      <ModalContent>
        <ModalHeader>{isEdit ? t("generateShareLink.updateTitle") : t("generateShareLink.generateTitle")}</ModalHeader>
        <ModalBody>
          {!generatedLink ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                {isEdit ? t("generateShareLink.updateDescription") : t("generateShareLink.generateDescription")}
              </p>
              <Input
                placeholder={t("generateShareLink.aliasPlaceholder")}
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">{t("generateShareLink.linkReady")}</p>
              <Input readOnly value={generatedLink} />
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          {!generatedLink ? (
            <Button color="primary" disabled={!alias || isLoading} onPress={handleGenerate}>
              {isEdit ? t("generateShareLink.updateButton") : t("generateShareLink.generateButton")}
            </Button>
          ) : (
            <Button color="primary" onPress={handleCopyLink}>
              {t("generateShareLink.copyButton")}
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
