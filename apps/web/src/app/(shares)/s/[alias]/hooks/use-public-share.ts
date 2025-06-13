"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { getDownloadUrl, getShareByAlias } from "@/http/endpoints";
import type { GetShareByAlias200Share } from "@/http/models/getShareByAlias200Share";

export function usePublicShare() {
  const t = useTranslations();
  const params = useParams();
  const alias = params?.alias as string;
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
  };

  const handlePasswordSubmit = async () => {
    await loadShare(password);
  };

  const handleDownload = async (file: { id: string; name: string }) => {
    try {
      const response = await getDownloadUrl(file.id);
      const downloadUrl = response.data.url;
      const fileName = downloadUrl.split("/").pop() || file.name;

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      toast.error(t("share.errors.downloadFailed"));
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
