import { IconDeviceFloppy } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserFormModalProps } from "../types";

export function UserFormModal({ isOpen, onClose, modalMode, selectedUser, formMethods, onSubmit }: UserFormModalProps) {
  const t = useTranslations();
  const {
    register,
    formState: { errors, isSubmitting },
  } = formMethods;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <form onSubmit={formMethods.handleSubmit(onSubmit)}>
          <DialogHeader>
            {modalMode === "create" ? t("users.form.titleCreate") : t("users.form.titleEdit")}
          </DialogHeader>
          <div className="py-4">
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("users.form.firstName")}</Label>
                  <Input {...register("firstName")} className={errors.firstName ? "border-destructive" : ""} />
                  {errors.firstName && <FormMessage>{errors.firstName.message}</FormMessage>}
                </div>
                <div className="space-y-2">
                  <Label>{t("users.form.lastName")}</Label>
                  <Input {...register("lastName")} className={errors.lastName ? "border-destructive" : ""} />
                  {errors.lastName && <FormMessage>{errors.lastName.message}</FormMessage>}
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t("users.form.username")}</Label>
                <Input {...register("username")} className={errors.username ? "border-destructive" : ""} />
                {errors.username && <FormMessage>{errors.username.message}</FormMessage>}
              </div>

              <div className="space-y-2">
                <Label>{t("users.form.email")}</Label>
                <Input {...register("email")} type="email" className={errors.email ? "border-destructive" : ""} />
                {errors.email && <FormMessage>{errors.email.message}</FormMessage>}
              </div>

              <div className="space-y-2">
                <Label>{modalMode === "create" ? t("users.form.password") : t("users.form.newPassword")}</Label>
                <Input
                  {...register("password")}
                  type="password"
                  className={errors.password ? "border-destructive" : ""}
                  placeholder={modalMode === "edit" ? t("users.form.passwordPlaceholder") : undefined}
                />
                {errors.password && <FormMessage>{errors.password.message}</FormMessage>}
              </div>

              {modalMode === "edit" && (
                <div className="space-y-2">
                  <Label>{t("users.form.role")}</Label>
                  <Select defaultValue={selectedUser?.isAdmin ? "true" : "false"} {...register("isAdmin")}>
                    <SelectTrigger className={errors.isAdmin ? "border-destructive" : ""}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">{t("users.form.roleUser")}</SelectItem>
                      <SelectItem value="true">{t("users.form.roleAdmin")}</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.isAdmin && <FormMessage>{errors.isAdmin.message}</FormMessage>}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose} type="button">
              {t("common.cancel")}
            </Button>
            <Button disabled={isSubmitting} type="submit">
              {modalMode === "create" ? "" : <IconDeviceFloppy className="mr-2 h-4 w-4" />}
              {modalMode === "create" ? t("users.form.create") : t("users.form.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
