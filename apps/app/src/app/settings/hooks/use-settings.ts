"use client";

import { ConfigType, GroupFormData } from "../types";
import { Config } from "../types";
import { useShareContext } from "@/contexts/share-context";
import { useAppInfo } from "@/contexts/app-info-context";
import { getAllConfigs, bulkUpdateConfigs } from "@/http/endpoints";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { toast } from "sonner";
import { z } from "zod";
import { useTranslations } from "next-intl";

const createSchemas = () => ({
  settingsSchema: z.object({
    configs: z.record(
      z.union([z.string(), z.number()]).transform((val) => String(val))
    ),
  }),
});

export function useSettings() {
  const t  = useTranslations();
  const { settingsSchema } = createSchemas();
  const [isLoading, setIsLoading] = useState(true);
  const [configs, setConfigs] = useState<Record<string, string>>({});
  const [groupedConfigs, setGroupedConfigs] = useState<Record<string, Config[]>>({});
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({
    general: true,
    email: true,
    security: true,
    storage: true,
  });
  const { refreshAppInfo } = useAppInfo();
  const { refreshShareContext } = useShareContext();

  const groupForms = {
    general: useForm<GroupFormData>({ resolver: zodResolver(settingsSchema) }),
    email: useForm<GroupFormData>({ resolver: zodResolver(settingsSchema) }),
    security: useForm<GroupFormData>({ resolver: zodResolver(settingsSchema) }),
    storage: useForm<GroupFormData>({ resolver: zodResolver(settingsSchema) }),
  } as const;

  type ValidGroup = keyof typeof groupForms;

  const loadConfigs = async () => {
    try {
      const response = await getAllConfigs();
      const configsData = response.data.configs.reduce((acc: Record<string, string>, config) => {
        acc[config.key] = config.value;

        return acc;
      }, {});

      const grouped = response.data.configs.reduce((acc: Record<string, Config[]>, config) => {
        const group = config.group || "general";

        if (!acc[group]) acc[group] = [];

        acc[group].push({
          ...config,
          type: (config.type as ConfigType) || "text",
        });

        // Sort configs by key to maintain consistent order
        acc[group].sort((a, b) => {
          // Para o grupo general, coloca appLogo primeiro
          if (group === "general") {
            if (a.key === "appLogo") return -1;
            if (b.key === "appLogo") return 1;
          }

          // Para o grupo email, coloca smtpEnabled primeiro
          if (group === "email") {
            if (a.key === "smtpEnabled") return -1;
            if (b.key === "smtpEnabled") return 1;
          }

          // Ordenação padrão alfabética para os demais casos
          return a.key.localeCompare(b.key);
        });

        return acc;
      }, {});

      setConfigs(configsData);
      setGroupedConfigs(grouped);

      Object.entries(grouped).forEach(([groupName, groupConfigs]) => {
        if (groupName === "general" || groupName === "email" || groupName === "security" || groupName === "storage") {
          const group = groupName as ValidGroup;
          const groupConfigData = groupConfigs.reduce(
            (acc, config) => {
              acc[config.key] = configsData[config.key];

              return acc;
            },
            {} as Record<string, string>
          );

          groupForms[group].reset({ configs: groupConfigData });
        }
      });
    } catch (error) {
      toast.error(t("settings.errors.loadFailed"));
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const onGroupSubmit = async (group: ValidGroup, data: GroupFormData) => {
    try {
      const groupConfigKeys = groupedConfigs[group].map((config) => config.key);
      const configsToUpdate = Object.entries(data.configs)
        .filter(([key, newValue]) => {
          const currentValue = configs[key];

          return groupConfigKeys.includes(key) && String(newValue) !== currentValue;
        })
        .map(([key, value]) => ({
          key,
          value: String(value),
        }));

      if (configsToUpdate.length === 0) {
        toast.info(t("settings.messages.noChanges"));

        return;
      }

      await bulkUpdateConfigs(configsToUpdate);
      toast.success(t("settings.messages.updateSuccess", { group: t(`settings.groups.${group}`) }));
      await loadConfigs();

      if (group === "email") {
        await refreshShareContext();
      }

      await refreshAppInfo();
    } catch (error) {
      toast.error(t("settings.errors.updateFailed"));
      console.error(error);
    }
  };

  const toggleCollapse = (group: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [group]: !prev[group],
    }));
  };

  useEffect(() => {
    loadConfigs();
  }, []);

  return {
    isLoading,
    groupedConfigs,
    collapsedGroups,
    groupForms,
    toggleCollapse,
    onGroupSubmit,
  };
}
