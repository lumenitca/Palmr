import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { getAllConfigs } from "@/http/endpoints";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();

  const response = await getAllConfigs();
  const appNameConfig = response.data.configs.find((config: any) => config.key === "appName");
  const appName = appNameConfig?.value || "Palmr";

  return {
    title: `${t("home.pageTitle")} | ${appName}`,
  };
}

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
