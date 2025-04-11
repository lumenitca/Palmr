import { useTranslations } from "next-intl";
import { UseFormRegister, UseFormWatch } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { createFieldTitles } from "../constants";
import { Config } from "../types";
import { LogoInput } from "./logo-input";

export interface ConfigInputProps {
  config: Config;
  register: UseFormRegister<any>;
  watch: UseFormWatch<any>;
  error?: any;
  smtpEnabled?: string;
}

export function SettingsInput({ config, register, watch, error, smtpEnabled }: ConfigInputProps) {
  const t = useTranslations();
  const FIELD_TITLES = createFieldTitles(t);
  const isSmtpField = config.group === "email" && config.key !== "smtpEnabled";
  const isDisabled = isSmtpField && smtpEnabled === "false";
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
            register(`configs.${config.key}`).onChange({
              target: { value },
            });
          }}
        />
        {error && <p className="text-danger text-xs mt-1">{error.message}</p>}
      </div>
    );
  }

  switch (config.type) {
    case "boolean":
      return (
        <select
          {...register(`configs.${config.key}`)}
          className="w-full rounded-md border border-input bg-transparent px-3 py-2"
          disabled={isDisabled}
        >
          <option value="true">{t("common.yes")}</option>
          <option value="false">{t("common.no")}</option>
        </select>
      );

    case "number":
    case "bigint":
      return (
        <Input
          {...register(`configs.${config.key}`, {
            valueAsNumber: true,
          })}
          className="w-full"
          disabled={isDisabled}
          aria-invalid={!!error}
          type="number"
        />
      );

    case "text":
    default:
      return (
        <Input
          {...register(`configs.${config.key}`)}
          className="w-full"
          disabled={isDisabled}
          aria-invalid={!!error}
          type="text"
        />
      );
  }
}
