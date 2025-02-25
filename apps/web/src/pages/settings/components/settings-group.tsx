import { createGroupMetadata, createFieldDescriptions } from "../constants";
import { SettingsGroupProps } from "../types";
import { SettingsInput } from "./settings-input";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import React from "react";
import { useTranslation } from "react-i18next";
import { FaChevronDown, FaChevronUp, FaSave } from "react-icons/fa";

export function SettingsGroup({ group, configs, form, isCollapsed, onToggleCollapse, onSubmit }: SettingsGroupProps) {
  const { t } = useTranslation();
  const GROUP_METADATA = createGroupMetadata(t);
  const FIELD_DESCRIPTIONS = createFieldDescriptions(t);

  const metadata = GROUP_METADATA[group as keyof typeof GROUP_METADATA] || {
    title: group,
    description: t("settings.groups.defaultDescription"),
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Card className="p-6">
        <CardHeader className="flex flex-row items-center justify-between cursor-pointer" onClick={onToggleCollapse}>
          <div className="flex flex-row items-center gap-8">
            {metadata.icon && React.createElement(metadata.icon, { className: "text-xl text-gray-500" })}
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-semibold">
                {t(`settings.groups.${group}.title`, { defaultValue: metadata.title })}
              </h2>
              <p className="text-sm text-gray-500">
                {t(`settings.groups.${group}.description`, { defaultValue: metadata.description })}
              </p>
            </div>
          </div>
          {isCollapsed ? <FaChevronDown className="text-gray-500" /> : <FaChevronUp className="text-gray-500" />}
        </CardHeader>
        <CardBody className={`${isCollapsed ? "hidden" : "block"}`}>
          <Divider className="mb-8" />
          <div className="flex flex-col gap-4">
            {configs.map((config) => (
              <div key={config.key} className="space-y-2 mb-3">
                <SettingsInput
                  config={config}
                  error={form.formState.errors.configs?.[config.key]}
                  register={form.register}
                  smtpEnabled={form.watch("configs.smtpEnabled")}
                  watch={form.watch}
                />
                <p className="text-xs text-gray-500 ml-1">
                  {t(`settings.fields.${config.key}.description`, {
                    defaultValue:
                      FIELD_DESCRIPTIONS[config.key as keyof typeof FIELD_DESCRIPTIONS] ||
                      config.description ||
                      t("settings.fields.noDescription"),
                  })}
                </p>
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-4">
            <Button
              color="primary"
              isLoading={form.formState.isSubmitting}
              startContent={!form.formState.isSubmitting && <FaSave className="text-xl" />}
              type="submit"
            >
              {t("settings.buttons.save", {
                group: t(`settings.groups.${group}.title`, { defaultValue: metadata.title }),
              })}
            </Button>
          </div>
        </CardBody>
      </Card>
    </form>
  );
}
