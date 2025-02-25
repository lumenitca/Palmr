import { getShare } from "@/http/endpoints";
import { getFileIcon } from "@/utils/file-icons";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/modal";
import { Spinner } from "@heroui/spinner";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaLock, FaUnlock, FaEnvelope } from "react-icons/fa";
import { toast } from "sonner";

interface ShareDetailsModalProps {
  shareId: string | null;
  onClose: () => void;
}

interface ShareFile {
  id: string;
  name: string;
  description: string | null;
  extension: string;
  size: number;
  objectName: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface ShareRecipient {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export function ShareDetailsModal({ shareId, onClose }: ShareDetailsModalProps) {
  const { t } = useTranslation();
  const [share, setShare] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (shareId) {
      loadShareDetails();
    }
  }, [shareId]);

  const loadShareDetails = async () => {
    if (!shareId) return;
    setIsLoading(true);
    try {
      const response = await getShare(shareId);

      setShare(response.data.share);
    } catch (error) {
      console.error(error);
      toast.error(t("shareDetails.loadError"));
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return t("shareDetails.notAvailable");
    try {
      return format(new Date(dateString), "MM/dd/yyyy HH:mm");
    } catch (error) {
      console.error(error);
      console.error("Invalid date:", dateString);

      return t("shareDetails.invalidDate");
    }
  };

  if (!share) return null;

  return (
    <Modal isOpen={!!shareId} size="2xl" onClose={onClose}>
      <ModalContent className="p-1">
        <ModalHeader className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold">{t("shareDetails.title")}</h2>
          <p className="text-sm text-default-500">{t("shareDetails.subtitle")}</p>
        </ModalHeader>
        <ModalBody>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div className="rounded-lg border border-default-200 bg-default-50 p-4">
                    <h3 className="font-medium">{t("shareDetails.basicInfo")}</h3>
                    <div className="mt-3 space-y-3">
                      <div>
                        <span className="text-sm text-default-500">{t("shareDetails.name")}</span>
                        <p className="mt-1 font-medium">{share.name || t("shareDetails.untitled")}</p>
                      </div>
                      <div>
                        <span className="text-sm text-default-500">{t("shareDetails.views")}</span>
                        <p className="mt-1 font-medium">{share.views}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div className="rounded-lg border border-default-200 bg-default-50 p-4">
                    <h3 className="font-medium">{t("shareDetails.dates")}</h3>
                    <div className="mt-3 space-y-3">
                      <div>
                        <span className="text-sm text-default-500">{t("shareDetails.created")}</span>
                        <p className="mt-1 font-medium">{formatDate(share.createdAt)}</p>
                      </div>
                      <div>
                        <span className="text-sm text-default-500">{t("shareDetails.expires")}</span>
                        <p className="mt-1 font-medium">
                          {share.expiration ? formatDate(share.expiration) : t("shareDetails.never")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Full Width Sections */}
              <div className="rounded-lg border border-default-200 bg-default-50 p-4">
                <h3 className="font-medium">{t("shareDetails.security")}</h3>
                <div className="mt-3 flex gap-2">
                  {share.security?.hasPassword ? (
                    <Chip color="warning" startContent={<FaLock className="ml-1.5 mr-1 text-sm" />} variant="flat">
                      {t("shareDetails.passwordProtected")}
                    </Chip>
                  ) : (
                    <Chip color="success" startContent={<FaUnlock className="ml-1.5 mr-1 text-sm" />} variant="flat">
                      {t("shareDetails.publicAccess")}
                    </Chip>
                  )}
                  {share.security?.maxViews && (
                    <Chip color="primary" variant="flat">
                      {t("shareDetails.maxViews", { count: share.security.maxViews })}
                    </Chip>
                  )}
                </div>
              </div>
              <div className="rounded-lg border border-default-200 bg-default-50 p-4">
                <h3 className="font-medium">{t("shareDetails.files", { count: share.files?.length || 0 })}</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {share.files?.map((file: ShareFile) => {
                    const { icon: FileIcon, color } = getFileIcon(file.name);

                    return (
                      <Chip
                        key={file.id}
                        startContent={<FileIcon className={`ml-1.5 text-sm ${color}`} />}
                        variant="flat"
                      >
                        {file.name}
                      </Chip>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-lg border border-default-200 bg-default-50 p-4">
                <h3 className="font-medium">
                  {t("shareDetails.recipients", { count: share.recipients?.length || 0 })}
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {share.recipients?.map((recipient: ShareRecipient) => (
                    <Chip
                      key={recipient.id}
                      startContent={<FaEnvelope className={"ml-2 mr-1 text-sm"} />}
                      variant="flat"
                    >
                      {recipient.email}
                    </Chip>
                  ))}
                </div>
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onPress={onClose}>
            {t("common.close")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
