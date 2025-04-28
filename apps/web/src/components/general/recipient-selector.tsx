"use client";

import { useEffect, useState } from "react";
import { IconBell, IconMail, IconPlus, IconTrash } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useShareContext } from "@/contexts/share-context";
import { addRecipients, notifyRecipients, removeRecipients } from "@/http/endpoints";

interface Recipient {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

interface RecipientSelectorProps {
  shareId: string;
  selectedRecipients: Recipient[];
  shareAlias?: string;
  onSuccess: () => void;
}

export function RecipientSelector({ shareId, selectedRecipients, shareAlias, onSuccess }: RecipientSelectorProps) {
  const t = useTranslations();
  const { smtpEnabled } = useShareContext();
  const [recipients, setRecipients] = useState<string[]>(selectedRecipients?.map((recipient) => recipient.email) || []);
  const [newRecipient, setNewRecipient] = useState("");

  useEffect(() => {
    setRecipients(selectedRecipients?.map((recipient) => recipient.email) || []);
  }, [selectedRecipients]);

  const handleAddRecipient = () => {
    if (newRecipient && !recipients.includes(newRecipient)) {
      addRecipients(shareId, { emails: [newRecipient] })
        .then(() => {
          setRecipients([...recipients, newRecipient]);
          setNewRecipient("");
          toast.success(t("recipientSelector.addSuccess"));
          onSuccess();
        })
        .catch(() => {
          toast.error(t("recipientSelector.addError"));
        });
    }
  };

  const handleRemoveRecipient = (email: string) => {
    removeRecipients(shareId, { emails: [email] })
      .then(() => {
        setRecipients(recipients.filter((r) => r !== email));
        toast.success(t("recipientSelector.removeSuccess"));
        onSuccess();
      })
      .catch(() => {
        toast.error(t("recipientSelector.removeError"));
      });
  };

  const handleNotifyRecipients = async () => {
    if (!shareAlias) return;

    const link = `${window.location.origin}/s/${shareAlias}`;
    const loadingToast = toast.loading(t("recipientSelector.sendingNotifications"));

    try {
      await notifyRecipients(shareId, { shareLink: link });
      toast.dismiss(loadingToast);
      toast.success(t("recipientSelector.notifySuccess"));
    } catch (error) {
      console.error(error);
      toast.dismiss(loadingToast);
      toast.error(t("recipientSelector.notifyError"));
    }
  };

  return (
    <div className="flex flex-col gap-4 mb-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <IconMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
          <Input
            className="pl-9"
            placeholder={t("recipientSelector.emailPlaceholder")}
            value={newRecipient}
            onChange={(e) => setNewRecipient(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddRecipient()}
          />
        </div>
        <Button onClick={handleAddRecipient}>
          <IconPlus className="h-4 w-4" />
          {t("recipientSelector.add")}
        </Button>
      </div>

      <div className="border rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium">{t("recipientSelector.recipients", { count: recipients.length })}</h3>
          {recipients.length > 0 && shareAlias && smtpEnabled === "true" && (
            <Button variant="outline" size="sm" onClick={handleNotifyRecipients}>
              <IconBell className="h-4 w-4" />
              {t("recipientSelector.notifyAll")}
            </Button>
          )}
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          <div className="flex flex-col gap-2">
            {recipients.length === 0 ? (
              <div className="text-center py-8 text-gray-500">{t("recipientSelector.noRecipients")}</div>
            ) : (
              recipients.map((email, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-secondary rounded-lg hover:bg-secondary/80"
                >
                  <div className="flex items-center gap-2">
                    <IconMail className="text-gray-500 h-4 w-4" />
                    <span>{email}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleRemoveRecipient(email)}
                  >
                    <IconTrash className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
