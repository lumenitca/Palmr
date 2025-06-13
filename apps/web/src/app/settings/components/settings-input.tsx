import { IconInfoCircle } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { UseFormRegister, UseFormSetValue, UseFormWatch } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { TagsInput } from "@/components/ui/tags-input";
import { createFieldTitles } from "../constants";
import { Config } from "../types";
import { FileSizeInput } from "./file-size-input";
import { LogoInput } from "./logo-input";
import { RedirectUriInput } from "./redirect-uri-input";

export interface ConfigInputProps {
  config: Config;
  register: UseFormRegister<any>;
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
  error?: any;
  smtpEnabled?: string;
  oidcEnabled?: string;
}

const TAGS_FIELDS = ["oidcScope", "oidcAdminEmailDomains"];
const HIDDEN_FIELDS = ["serverUrl", "firstUserAccess"];

export function isFieldHidden(fieldKey: string): boolean {
  return HIDDEN_FIELDS.includes(fieldKey);
}

export function SettingsInput({
  config,
  register,
  watch,
  setValue,
  error,
  smtpEnabled,
  oidcEnabled,
}: ConfigInputProps) {
  const t = useTranslations();
  const FIELD_TITLES = createFieldTitles(t);
  const isSmtpField = config.group === "email" && config.key !== "smtpEnabled";
  const isOidcField = config.group === "oidc" && config.key !== "oidcEnabled";
  const isDisabled = (isSmtpField && smtpEnabled === "false") || (isOidcField && oidcEnabled === "false");
  const friendlyLabel = FIELD_TITLES[config.key as keyof ReturnType<typeof createFieldTitles>] || config.key;

  if (config.key === "appLogo") {
    const value = watch(`configs.${config.key}`);

    return (
      <div className="space-y-2">
        <label className="block text-sm font-semibold">{friendlyLabel}</label>
        <LogoInput
          isDisabled={isDisabled}
          value={value}
          onChange={(value) => {
            setValue(`configs.${config.key}`, value, { shouldDirty: true });
          }}
        />
        {error && <p className="text-danger text-xs mt-1">{error.message}</p>}
      </div>
    );
  }

  if (config.key === "oidcRedirectUri") {
    const value = watch(`configs.${config.key}`);

    return (
      <div className="space-y-2">
        <label className="block text-sm font-semibold">{friendlyLabel}</label>
        <RedirectUriInput
          value={value || ""}
          onChange={(value) => {
            setValue(`configs.${config.key}`, value, { shouldDirty: true });
          }}
          disabled={isDisabled}
          error={error}
        />
        {error && <p className="text-danger text-xs mt-1">{error.message}</p>}
      </div>
    );
  }

  if (config.key === "maxFileSize" || config.key === "maxTotalStoragePerUser") {
    const value = watch(`configs.${config.key}`);

    return (
      <div className="space-y-2">
        <label className="block text-sm font-semibold">{friendlyLabel}</label>
        <FileSizeInput
          value={value || "0"}
          onChange={(value) => {
            setValue(`configs.${config.key}`, value, { shouldDirty: true });
          }}
          disabled={isDisabled}
          error={error}
        />
        {error && <p className="text-danger text-xs mt-1">{error.message}</p>}
      </div>
    );
  }

  if (TAGS_FIELDS.includes(config.key)) {
    const value = watch(`configs.${config.key}`);
    const tagsValue = value ? value.split(" ").filter(Boolean) : [];

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label className="block text-sm font-semibold">{friendlyLabel}</label>
          <div className="relative group">
            <IconInfoCircle className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-help transition-colors" />
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-popover text-popover-foreground text-xs rounded-md border shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
              {config.key === "oidcScope"
                ? t("settings.tooltips.oidcScope")
                : t("settings.tooltips.oidcAdminEmailDomains")}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-popover"></div>
            </div>
          </div>
        </div>
        <TagsInput
          value={tagsValue}
          onChange={(tags) => {
            setValue(`configs.${config.key}`, tags.join(" "), { shouldDirty: true });
          }}
          disabled={isDisabled}
          placeholder={
            config.key === "oidcScope"
              ? "openid profile email"
              : config.key === "oidcAdminEmailDomains"
                ? "admin.com company.org"
                : "Digite e pressione Enter"
          }
        />
        {error && <p className="text-danger text-xs mt-1">{error.message}</p>}
      </div>
    );
  }

  switch (config.type) {
    case "boolean":
      return (
        <div className="space-y-2">
          <label className="block text-sm font-semibold">{friendlyLabel}</label>
          <select
            {...register(`configs.${config.key}`)}
            className="w-full rounded-md border border-input bg-transparent px-3 py-2"
            disabled={isDisabled}
          >
            <option value="true">{t("common.yes")}</option>
            <option value="false">{t("common.no")}</option>
          </select>
          {error && <p className="text-danger text-xs mt-1">{error.message}</p>}
        </div>
      );

    case "number":
    case "bigint":
      return (
        <div className="space-y-2">
          <label className="block text-sm font-semibold">{friendlyLabel}</label>
          <Input
            {...register(`configs.${config.key}`, {
              valueAsNumber: true,
            })}
            className="w-full"
            disabled={isDisabled}
            aria-invalid={!!error}
            type="number"
          />
          {error && <p className="text-danger text-xs mt-1">{error.message}</p>}
        </div>
      );

    case "text":
    default:
      const isPasswordField = config.key.includes("Pass") || config.key.includes("Secret");

      if (isPasswordField) {
        return (
          <div className="space-y-2">
            <label className="block text-sm font-semibold">{friendlyLabel}</label>
            <PasswordInput
              {...register(`configs.${config.key}`)}
              className="w-full"
              disabled={isDisabled}
              aria-invalid={!!error}
            />
            {error && <p className="text-danger text-xs mt-1">{error.message}</p>}
          </div>
        );
      }

      return (
        <div className="space-y-2">
          <label className="block text-sm font-semibold">{friendlyLabel}</label>
          <Input
            {...register(`configs.${config.key}`)}
            className="w-full"
            disabled={isDisabled}
            aria-invalid={!!error}
            type="text"
          />
          {error && <p className="text-danger text-xs mt-1">{error.message}</p>}
        </div>
      );
  }
}
