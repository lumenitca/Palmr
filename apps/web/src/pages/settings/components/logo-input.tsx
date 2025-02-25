import { useAppInfo } from "@/contexts/app-info-context";
import { removeLogo, uploadLogo } from "@/http/endpoints";
import { Button } from "@heroui/button";
import { Image } from "@heroui/image";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaCloudUploadAlt, FaTrash } from "react-icons/fa";
import { toast } from "sonner";

interface LogoInputProps {
  value?: string;
  onChange: (value: string) => void;
  isDisabled?: boolean;
}

export function LogoInput({ value, onChange, isDisabled }: LogoInputProps) {
  const { t } = useTranslation();
  const [isUploading, setIsUploading] = useState(false);
  const [currentLogo, setCurrentLogo] = useState(value);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { refreshAppInfo, appLogo } = useAppInfo();

  useEffect(() => {
    setCurrentLogo(appLogo);
  }, [appLogo]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      setIsUploading(true);
      const response = await uploadLogo({ file: file });
      const newLogoUrl = response.data.logo;

      setCurrentLogo(newLogoUrl);
      onChange(newLogoUrl);
      await refreshAppInfo();
      toast.success(t("logo.messages.uploadSuccess"));
    } catch (error: any) {
      toast.error(error.response?.data?.error || t("logo.errors.uploadFailed"));
      console.error(error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveLogo = async () => {
    try {
      setIsUploading(true);
      await removeLogo();
      setCurrentLogo("");
      onChange("");
      await refreshAppInfo();
      toast.success(t("logo.messages.removeSuccess"));
    } catch (error: any) {
      toast.error(error.response?.data?.error || t("logo.errors.removeFailed"));
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <input
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        disabled={isDisabled}
        type="file"
        onChange={handleFileSelect}
      />

      {currentLogo ? (
        <div className="flex flex-col items-center gap-4">
          <Image
            alt={t("logo.labels.appLogo")}
            className="max-w-[200px] h-auto rounded-lg object-contain"
            src={currentLogo}
          />
          <Button
            color="danger"
            isDisabled={isDisabled}
            isLoading={isUploading}
            startContent={!isUploading && <FaTrash />}
            variant="light"
            onPress={handleRemoveLogo}
          >
            {t("logo.buttons.remove")}
          </Button>
        </div>
      ) : (
        <Button
          className="w-full py-8"
          isDisabled={isDisabled}
          isLoading={isUploading}
          startContent={!isUploading && <FaCloudUploadAlt className="text-xl" />}
          variant="bordered"
          onPress={() => fileInputRef.current?.click()}
        >
          {t("logo.buttons.upload")}
        </Button>
      )}
    </div>
  );
}
