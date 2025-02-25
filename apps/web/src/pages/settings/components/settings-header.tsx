import { Breadcrumbs, BreadcrumbItem } from "@heroui/breadcrumbs";
import { Divider } from "@heroui/divider";
import { useTranslation } from "react-i18next";
import { FaCog } from "react-icons/fa";
import { TbLayoutDashboardFilled } from "react-icons/tb";

export function SettingsHeader() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row items-center gap-2">
        <FaCog className="text-xl" />
        <h1 className="text-2xl font-bold">{t("settings.title")}</h1>
      </div>
      <Divider />
      <Breadcrumbs>
        <BreadcrumbItem href="/dashboard">
          <TbLayoutDashboardFilled className="text-sm mr-0.5" />
          {t("navigation.dashboard")}
        </BreadcrumbItem>
        <BreadcrumbItem>
          <FaCog className="text-sm mr-0.5" /> {t("settings.breadcrumb")}
        </BreadcrumbItem>
      </Breadcrumbs>
    </div>
  );
}
