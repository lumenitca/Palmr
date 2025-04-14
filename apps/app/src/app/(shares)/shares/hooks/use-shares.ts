"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { getAllConfigs, listUserShares, notifyRecipients } from "@/http/endpoints";
import { ListUserShares200SharesItem } from "@/http/models/listUserShares200SharesItem";

export function useShares() {
  const t = useTranslations();
  const [shares, setShares] = useState<ListUserShares200SharesItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [shareToViewDetails, setShareToViewDetails] = useState<ListUserShares200SharesItem | null>(null);
  const [shareToGenerateLink, setShareToGenerateLink] = useState<ListUserShares200SharesItem | null>(null);
  const [smtpEnabled, setSmtpEnabled] = useState("false");

  const loadShares = async () => {
    try {
      const response = await listUserShares();
      const allShares = response.data.shares || [];
      const sortedShares = [...allShares].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setShares(sortedShares);
    } catch (error) {
      toast.error(t("shares.errors.loadFailed"));
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadConfigs = async () => {
    try {
      const response = await getAllConfigs();
      const smtpConfig = response.data.configs.find((config: any) => config.key === "smtpEnabled");

      setSmtpEnabled(smtpConfig?.value || "false");
    } catch (error) {
      console.error(t("shares.errors.smtpConfigFailed"), error);
    }
  };

  useEffect(() => {
    loadShares();
    loadConfigs();
  }, []);

  const filteredShares = shares.filter(
    (share) => share.name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false
  );

  const handleCopyLink = (share: ListUserShares200SharesItem) => {
    if (!share.alias?.alias) return;

    const link = `${window.location.origin}/s/${share.alias.alias}`;

    navigator.clipboard.writeText(link);
    toast.success(t("shares.messages.linkCopied"));
  };

  const handleNotifyRecipients = async (share: ListUserShares200SharesItem) => {
    if (!share.alias?.alias) return;

    const link = `${window.location.origin}/s/${share.alias.alias}`;

    try {
      await notifyRecipients(share.id, { shareLink: link });
      toast.success(t("shares.messages.recipientsNotified"));
    } catch (error) {
      console.error(error);
      toast.error(t("shares.errors.notifyFailed"));
    }
  };

  return {
    shares,
    isLoading,
    searchQuery,
    shareToViewDetails,
    shareToGenerateLink,
    filteredShares,
    smtpEnabled,
    setSearchQuery,
    setShareToViewDetails,
    setShareToGenerateLink,
    handleCopyLink,
    handleNotifyRecipients,
    loadShares,
  };
}
