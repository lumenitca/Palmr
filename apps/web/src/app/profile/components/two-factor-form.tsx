"use client";

import { useState } from "react";
import {
  IconCopy,
  IconDownload,
  IconEye,
  IconEyeClosed,
  IconKey,
  IconShield,
  IconShieldCheck,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { useTwoFactor } from "../hooks/use-two-factor";

export function TwoFactorForm() {
  const t = useTranslations();
  const {
    isLoading,
    status,
    setupData,
    backupCodes,
    verificationCode,
    disablePassword,
    isSetupModalOpen,
    isDisableModalOpen,
    isBackupCodesModalOpen,
    setVerificationCode,
    setDisablePassword,
    setIsSetupModalOpen,
    setIsDisableModalOpen,
    setIsBackupCodesModalOpen,
    startSetup,
    verifySetup,
    disable2FA,
    generateNewBackupCodes,
    downloadBackupCodes,
    copyBackupCodes,
  } = useTwoFactor();

  const [showPassword, setShowPassword] = useState(false);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconShield className="h-5 w-5" />
            {t("twoFactor.title")}
          </CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {status.enabled ? (
              <IconShieldCheck className="h-5 w-5 text-green-600" />
            ) : (
              <IconShield className="h-5 w-5" />
            )}
            {t("twoFactor.title")}
          </CardTitle>
          <CardDescription>{status.enabled ? t("twoFactor.enabled") : t("twoFactor.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Status: {status.enabled ? "Enabled" : "Disabled"}</p>
              {status.enabled && (
                <p className="text-sm text-muted-foreground">
                  {t("twoFactor.backupCodes.available", { count: status.availableBackupCodes })}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              {status.enabled ? (
                <>
                  <Button variant="outline" onClick={generateNewBackupCodes} disabled={isLoading}>
                    <IconKey className="h-4 w-4" />
                    {t("twoFactor.backupCodes.generateNew")}
                  </Button>
                  <Button variant="destructive" onClick={() => setIsDisableModalOpen(true)} disabled={isLoading}>
                    Disable 2FA
                  </Button>
                </>
              ) : (
                <Button onClick={startSetup} disabled={isLoading}>
                  <IconShield className="h-4 w-4" />
                  Enable 2FA
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Setup Modal */}
      <Dialog open={isSetupModalOpen} onOpenChange={setIsSetupModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("twoFactor.setup.title")}</DialogTitle>
            <DialogDescription>{t("twoFactor.setup.description")}</DialogDescription>
          </DialogHeader>

          {setupData && (
            <div className="space-y-4">
              {/* QR Code */}
              <div className="flex justify-center">
                <img src={setupData.qrCode} alt="2FA QR Code" className="w-48 h-48 border rounded-lg" />
              </div>

              {/* Manual Entry */}
              <div>
                <Label className="text-sm font-medium">{t("twoFactor.setup.manualEntryKey")}</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input value={setupData.manualEntryKey} readOnly className="font-mono text-xs" />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigator.clipboard.writeText(setupData.manualEntryKey)}
                  >
                    <IconCopy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Verification Code */}
              <div>
                <Label htmlFor="verification-code" className="mb-2">
                  {t("twoFactor.setup.verificationCode")}
                </Label>
                <div className="flex justify-start">
                  <InputOTP maxLength={6} value={verificationCode} onChange={setVerificationCode}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <span className="text-sm text-muted-foreground mt-1">
                  {t("twoFactor.setup.verificationCodeDescription")}
                </span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSetupModalOpen(false)} disabled={isLoading}>
              {t("twoFactor.setup.cancel")}
            </Button>
            <Button onClick={verifySetup} disabled={isLoading || !verificationCode || verificationCode.length !== 6}>
              {t("twoFactor.setup.verifyAndEnable")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disable Modal */}
      <Dialog open={isDisableModalOpen} onOpenChange={setIsDisableModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("twoFactor.disable.title")}</DialogTitle>
            <DialogDescription>{t("twoFactor.disable.description")}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="disable-password" className="mb-2">
                {t("twoFactor.disable.password")}
              </Label>
              <div className="relative">
                <Input
                  id="disable-password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t("twoFactor.disable.passwordPlaceholder")}
                  value={disablePassword}
                  onChange={(e) => setDisablePassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <IconEye className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <IconEyeClosed className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDisableModalOpen(false)} disabled={isLoading}>
              {t("twoFactor.disable.cancel")}
            </Button>
            <Button variant="destructive" onClick={disable2FA} disabled={isLoading || !disablePassword}>
              {t("twoFactor.disable.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Backup Codes Modal */}
      <Dialog open={isBackupCodesModalOpen} onOpenChange={setIsBackupCodesModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("twoFactor.backupCodes.title")}</DialogTitle>
            <DialogDescription>{t("twoFactor.backupCodes.description")}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                {backupCodes.map((code, index) => (
                  <div key={index} className="text-center py-1">
                    {code}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={downloadBackupCodes} className="flex-1">
                <IconDownload className="h-4 w-4" />
                {t("twoFactor.backupCodes.download")}
              </Button>
              <Button variant="outline" onClick={copyBackupCodes} className="flex-1">
                <IconCopy className="h-4 w-4" />
                {t("twoFactor.backupCodes.copyToClipboard")}
              </Button>
            </div>

            <div className="text-sm text-muted-foreground">
              {t.raw("twoFactor.backupCodes.instructions").map((instruction: string, index: number) => (
                <p key={index}>{instruction}</p>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setIsBackupCodesModalOpen(false)}>{t("twoFactor.backupCodes.savedMessage")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
