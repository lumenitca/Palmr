import { useShareContext } from "@/contexts/ShareContext";
import { addRecipients, removeRecipients, notifyRecipients } from "@/http/endpoints";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FaPlus, FaTrash, FaEnvelope, FaBell } from "react-icons/fa";
import { toast } from "sonner";

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
  const { t } = useTranslation();
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
        <Input
          placeholder={t("recipientSelector.emailPlaceholder")}
          startContent={<FaEnvelope className="text-gray-400" />}
          value={newRecipient}
          onChange={(e) => setNewRecipient(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleAddRecipient()}
        />
        <Button color="primary" startContent={<FaPlus />} onPress={handleAddRecipient}>
          {t("recipientSelector.add")}
        </Button>
      </div>

      <div className="border rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium">{t("recipientSelector.recipients", { count: recipients.length })}</h3>
          {recipients.length > 0 && shareAlias && smtpEnabled === "true" && (
            <Button color="primary" size="sm" startContent={<FaBell />} variant="flat" onPress={handleNotifyRecipients}>
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
                  className="flex items-center justify-between p-3 bg-foreground-100 rounded-lg hover:bg-foreground-200"
                >
                  <div className="flex items-center gap-2">
                    <FaEnvelope className="text-gray-400" />
                    <span>{email}</span>
                  </div>
                  <Button
                    isIconOnly
                    color="danger"
                    size="sm"
                    variant="light"
                    onPress={() => handleRemoveRecipient(email)}
                  >
                    <FaTrash />
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
