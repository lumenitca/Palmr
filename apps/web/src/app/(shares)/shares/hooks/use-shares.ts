"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { useSecureConfigValue } from "@/hooks/use-secure-configs";
import { listUserShares, notifyRecipients } from "@/http/endpoints";
import { ListUserShares200SharesItem } from "@/http/models/listUserShares200SharesItem";

export function useShares() {
  const t = useTranslations();
  const [shares, setShares] = useState<ListUserShares200SharesItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [shareToViewDetails, setShareToViewDetails] = useState<ListUserShares200SharesItem | null>(null);
  const [shareToGenerateLink, setShareToGenerateLink] = useState<ListUserShares200SharesItem | null>(null);

  const { value: smtpEnabled } = useSecureConfigValue("smtpEnabled");

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
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadShares();
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
    smtpEnabled: smtpEnabled || "false",
    setSearchQuery,
    setShareToViewDetails,
    setShareToGenerateLink,
    handleCopyLink,
    handleNotifyRecipients,
    loadShares,
  };
}
