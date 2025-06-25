"use client";

import { useTranslations } from "next-intl";
import { UseFormRegister, UseFormSetValue, UseFormWatch } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Config } from "../types";

const HIDDEN_FIELDS = ["serverUrl", "firstUserAccess"];

export function isFieldHidden(fieldKey: string): boolean {
  return HIDDEN_FIELDS.includes(fieldKey);
}

export interface ConfigInputProps {
  config: Config;
  register: UseFormRegister<any>;
  setValue: UseFormSetValue<any>;
  watch: UseFormWatch<any>;
  error?: any;
  smtpEnabled?: string;
  authProvidersEnabled?: string;
}

export function SettingsInput({
  config,
  register,
  setValue,
  watch,
  error,
  smtpEnabled,
  authProvidersEnabled,
}: ConfigInputProps) {
  const t = useTranslations();

  const isSmtpField = config.group === "email" && config.key !== "smtpEnabled";
  const isAuthProvidersField = config.group === "auth-providers" && config.key !== "authProvidersEnabled";
  const isDisabled =
    (isSmtpField && smtpEnabled === "false") || (isAuthProvidersField && authProvidersEnabled === "false");

  const renderInput = () => {
    if (config.type === "boolean") {
      return (
        <Switch
          id={config.key}
          checked={watch(`configs.${config.key}`) === "true"}
          onCheckedChange={(checked) => setValue(`configs.${config.key}`, checked ? "true" : "false")}
          disabled={isDisabled}
        />
      );
    }

    if (config.key === "appDescription") {
      return (
        <Textarea
          id={config.key}
          {...register(`configs.${config.key}`)}
          disabled={isDisabled}
          className="min-h-[80px]"
        />
      );
    }

    if (config.type === "number" || config.type === "bigint") {
      return (
        <Input
          id={config.key}
          type="number"
          {...register(`configs.${config.key}`, {
            setValueAs: (value: string) => (value === "" ? "" : String(Number(value))),
          })}
          disabled={isDisabled}
        />
      );
    }

    return (
      <Input
        id={config.key}
        type={
          config.key.toLowerCase().includes("password") || config.key.toLowerCase().includes("secret")
            ? "password"
            : "text"
        }
        {...register(`configs.${config.key}`)}
        disabled={isDisabled}
      />
    );
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={config.key} className={isDisabled ? "text-muted-foreground" : ""}>
        {t(`settings.fields.${config.key}.title`)}
      </Label>
      {renderInput()}
      {error && <p className="text-sm text-destructive">{error.message}</p>}
    </div>
  );
}
