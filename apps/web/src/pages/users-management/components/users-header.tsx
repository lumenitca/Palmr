import { UsersHeaderProps } from "../types";
import { Breadcrumbs, BreadcrumbItem } from "@heroui/breadcrumbs";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { useTranslation } from "react-i18next";
import { FaUserPlus, FaUsersCog } from "react-icons/fa";
import { TbLayoutDashboardFilled } from "react-icons/tb";

export function UsersHeader({ onCreateUser }: UsersHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <FaUsersCog className="text-2xl" />
          <h1 className="text-2xl font-bold">{t("users.header.title")}</h1>
        </div>
        <Button
          className="font-semibold"
          color="primary"
          startContent={<FaUserPlus size={18} />}
          onPress={onCreateUser}
        >
          {t("users.header.addUser")}
        </Button>
      </div>
      <Divider />
      <Breadcrumbs>
        <BreadcrumbItem href="/dashboard">
          <TbLayoutDashboardFilled className="text-sm mr-0.5" />
          {t("common.dashboard")}
        </BreadcrumbItem>
        <BreadcrumbItem>
          <FaUsersCog className="text-sm mr-0.5" />
          {t("users.header.management")}
        </BreadcrumbItem>
      </Breadcrumbs>
    </div>
  );
}
