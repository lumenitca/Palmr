"use client";

import { useEffect, useState } from "react";
import { IconLock, IconLockOpen, IconMail } from "@tabler/icons-react";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader } from "@/components/ui/loader";
import { getShare } from "@/http/endpoints";
import { getFileIcon } from "@/utils/file-icons";

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
  const t = useTranslations();
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
    <Dialog open={!!shareId} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t("shareDetails.title")}</DialogTitle>
          <DialogDescription>{t("shareDetails.subtitle")}</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader size="lg" />
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="rounded-lg border p-4">
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

                <div className="space-y-4">
                  <div className="rounded-lg border p-4">
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

              <div className="rounded-lg border p-4">
                <h3 className="font-medium">{t("shareDetails.security")}</h3>
                <div className="mt-3 flex gap-2">
                  {share.security?.hasPassword ? (
                    <Badge variant="secondary">
                      <IconLock className="h-4 w-4" />
                      {t("shareDetails.passwordProtected")}
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <IconLockOpen className="h-4 w-4" />
                      {t("shareDetails.publicAccess")}
                    </Badge>
                  )}
                  {share.security?.maxViews && (
                    <Badge variant="secondary">
                      {t("shareDetails.maxViews")} {share.security.maxViews}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="font-medium">
                  {t("shareDetails.files")} ({share.files?.length || 0})
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {share.files?.map((file: ShareFile) => {
                    const { icon: FileIcon, color } = getFileIcon(file.name);
                    return (
                      <Badge key={file.id} variant="secondary">
                        <FileIcon className={`h-4 w-4 ${color}`} />
                        {file.name.length > 20 ? file.name.substring(0, 20) + "..." : file.name}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="font-medium">
                  {t("shareDetails.recipients")} ({share.recipients?.length || 0})
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {share.recipients?.map((recipient: ShareRecipient) => (
                    <Badge key={recipient.id} variant="secondary">
                      <IconMail className="h-4 w-4" />
                      {recipient.email}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={onClose}>{t("common.close")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
