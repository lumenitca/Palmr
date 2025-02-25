import { getDownloadUrl, getShareByAlias } from "@/http/endpoints";
import type { GetShareByAlias200Share } from "@/http/models/getShareByAlias200Share";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

export function usePublicShare() {
  const { t } = useTranslation();
  const { alias } = useParams<{ alias: string }>();
  const [share, setShare] = useState<GetShareByAlias200Share | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isPasswordError, setIsPasswordError] = useState(false);

  const loadShare = async (sharePassword?: string) => {
    if (!alias) return;

    try {
      setIsLoading(true);
      const response = await getShareByAlias(alias, sharePassword ? { password: sharePassword } : undefined);

      setShare(response.data.share);
      setIsPasswordModalOpen(false);
      setIsPasswordError(false);
    } catch (error: any) {
      handleShareError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareError = (error: any) => {
    if (error.response?.data?.error === "Password required") {
      setIsPasswordModalOpen(true);
      setShare(null);
    } else if (error.response?.data?.error === "Invalid password") {
      setIsPasswordError(true);
      toast.error(t("share.errors.invalidPassword"));
    } else {
      toast.error(t("share.errors.loadFailed"));
    }
    console.error(error);
  };

  const handlePasswordSubmit = async () => {
    await loadShare(password);
  };

  const handleDownload = async (objectName: string, fileName: string) => {
    try {
      const encodedObjectName = encodeURIComponent(objectName);
      const response = await getDownloadUrl(encodedObjectName);
      const downloadUrl = response.data.url;

      await downloadFile(downloadUrl, fileName);
      toast.success(t("share.messages.downloadStarted"));
    } catch (error) {
      toast.error(t("share.errors.downloadFailed"));
      console.error(error);
    }
  };

  const downloadFile = async (url: string, fileName: string) => {
    const fileResponse = await fetch(url);
    const blob = await fileResponse.blob();
    const objectUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = objectUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(objectUrl);
  };

  useEffect(() => {
    loadShare();
  }, [alias]);

  return {
    isLoading,
    share,
    password,
    isPasswordModalOpen,
    isPasswordError,
    setPassword,
    handlePasswordSubmit,
    handleDownload,
  };
}
