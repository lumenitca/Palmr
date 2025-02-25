import { Breadcrumbs, BreadcrumbItem } from "@heroui/breadcrumbs";
import { Divider } from "@heroui/divider";
import { useTranslation } from "react-i18next";
import { FaShare } from "react-icons/fa";
import { TbLayoutDashboardFilled } from "react-icons/tb";

export function SharesHeader() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row items-center gap-2">
        <FaShare className="text-xl" />
        <h1 className="text-2xl font-bold">{t("shares.header.title")}</h1>
      </div>
      <Divider />
      <Breadcrumbs>
        <BreadcrumbItem href="/dashboard">
          <TbLayoutDashboardFilled className="text-sm mr-0.5" />
          {t("common.dashboard")}
        </BreadcrumbItem>
        <BreadcrumbItem>
          <FaShare className="text-sm mr-0.5" />
          {t("shares.header.myShares")}
        </BreadcrumbItem>
      </Breadcrumbs>
    </div>
  );
}
