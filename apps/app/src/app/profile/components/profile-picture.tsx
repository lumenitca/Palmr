"use client";

import { useRef } from "react";
import { IconCamera, IconTrash } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import type { ProfilePictureProps } from "../types";

export function ProfilePicture({ userData, onImageChange, onImageRemove }: ProfilePictureProps) {
  const t = useTranslations();
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
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <div className="relative group">
          <Avatar className="w-25 h-25">
            <AvatarImage src={userData?.image} />
            <AvatarFallback className="absolute inset-0 rounded-full border text-4xl font-bold">
              {userData?.firstName
                ? userData.firstName
                    .split(" ")
                    .map((firstName) => firstName[0])
                    .join("")
                    .toUpperCase()
                : ""}
            </AvatarFallback>
          </Avatar>
          <DropdownMenu >
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full cursor-pointer"
                variant="default"
              >
                <IconCamera className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {!!userData?.image ? (
                <DropdownMenuItem className="text-destructive" onClick={onImageRemove}>
                  <IconTrash className="h-4 w-4" />
                  {t("profile.picture.removePhoto")}
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={handleAvatarClick}>
                  <IconCamera className="h-4 w-4" />
                  {t("profile.picture.uploadPhoto")}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <Input ref={fileInputRef} accept="image/*" className="hidden" type="file" onChange={handleFileChange} />
        </div>
        <div>
          <h2 className="text-lg font-semibold">{t("profile.picture.title")}</h2>
          <p className="text-sm text-muted-foreground">{t("profile.picture.description")}</p>
        </div>
      </CardHeader>
    </Card>
  );
}
