import { Breadcrumbs, BreadcrumbItem } from "@heroui/breadcrumbs";
import { Divider } from "@heroui/divider";
import { useTranslation } from "react-i18next";
import { FaUserCircle } from "react-icons/fa";
import { TbLayoutDashboardFilled } from "react-icons/tb";

export function ProfileHeader() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row items-center gap-2">
        <FaUserCircle className="text-xl" />
        <h1 className="text-2xl font-bold">{t("profile.header.title")}</h1>
      </div>
      <Divider />
      <Breadcrumbs>
        <BreadcrumbItem href="/dashboard">
          <TbLayoutDashboardFilled className="text-sm mr-0.5" />
          {t("navigation.dashboard")}
        </BreadcrumbItem>
        <BreadcrumbItem>
          <FaUserCircle className="text-sm mr-0.5" />
          {t("profile.header.title")}
        </BreadcrumbItem>
      </Breadcrumbs>
    </div>
  );
}
