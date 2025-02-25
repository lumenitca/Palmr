import { createFieldTitles } from "../constants";
import { Config } from "../types";
import { LogoInput } from "./logo-input";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { UseFormRegister, UseFormWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

export interface ConfigInputProps {
  config: Config;
  register: UseFormRegister<any>;
  watch: UseFormWatch<any>;
  error?: any;
  smtpEnabled?: string;
}

export function SettingsInput({ config, register, watch, error, smtpEnabled }: ConfigInputProps) {
  const { t } = useTranslation();
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
        <Select
          {...register(`configs.${config.key}`)}
          classNames={{
            label: "font-semibold",
          }}
          errorMessage={error?.message}
          isDisabled={isDisabled}
          isInvalid={!!error}
          label={friendlyLabel}
          labelPlacement="outside"
          size="md"
        >
          <SelectItem key="true" value="true">
            {t("common.yes")}
          </SelectItem>
          <SelectItem key="false" value="false">
            {t("common.no")}
          </SelectItem>
        </Select>
      );

    case "number":
    case "bigint":
      return (
        <Input
          {...register(`configs.${config.key}`, {
            valueAsNumber: true,
          })}
          classNames={{
            label: "font-semibold",
          }}
          errorMessage={error?.message}
          isDisabled={isDisabled}
          isInvalid={!!error}
          label={friendlyLabel}
          labelPlacement="outside"
          size="md"
          type="number"
        />
      );

    case "text":
    default:
      return (
        <Input
          {...register(`configs.${config.key}`)}
          classNames={{
            label: "font-semibold",
          }}
          errorMessage={error?.message}
          isDisabled={isDisabled}
          isInvalid={!!error}
          label={friendlyLabel}
          labelPlacement="outside"
          size="md"
          type="text"
        />
      );
  }
}
