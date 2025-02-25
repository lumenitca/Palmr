import type { ProfilePictureProps } from "../types";
import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { Card, CardHeader } from "@heroui/card";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";
import { Input } from "@heroui/input";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { FaCamera, FaTrash } from "react-icons/fa";

export function ProfilePicture({ userData, onImageChange, onImageRemove }: ProfilePictureProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      onImageChange(file);
    }
  };

  return (
    <Card className="p-6">
      <CardHeader className="flex flex-row items-center gap-4">
        <div className="relative group">
          <Avatar isBordered className="w-20 h-20" src={userData?.image} />
          <Dropdown>
            <DropdownTrigger>
              <Button
                isIconOnly
                className="absolute bottom-0 right-0 bg-primary-500 text-white"
                radius="full"
                size="sm"
                variant="solid"
              >
                <FaCamera className="text-sm" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu>
              {!!userData?.image ? (
                <DropdownItem
                  key="remove"
                  className="text-danger"
                  color="danger"
                  startContent={<FaTrash />}
                  onClick={onImageRemove}
                >
                  {t("profile.picture.removePhoto")}
                </DropdownItem>
              ) : (
                <DropdownItem key="upload" startContent={<FaCamera />} onClick={handleAvatarClick}>
                  {t("profile.picture.uploadPhoto")}
                </DropdownItem>
              )}
            </DropdownMenu>
          </Dropdown>
          <Input ref={fileInputRef} accept="image/*" className="hidden" type="file" onChange={handleFileChange} />
        </div>
        <div>
          <h2 className="text-lg font-semibold">{t("profile.picture.title")}</h2>
          <p className="text-sm text-default-500">{t("profile.picture.description")}</p>
        </div>
      </CardHeader>
    </Card>
  );
}
