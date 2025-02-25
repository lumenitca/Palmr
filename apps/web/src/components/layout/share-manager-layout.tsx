import { Breadcrumbs, BreadcrumbItem } from "@heroui/breadcrumbs";
import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { TbLayoutDashboardFilled } from "react-icons/tb";

interface ShareManagerLayoutProps {
  children: ReactNode;
  icon: ReactNode;
  title: string;
  breadcrumbLabel: string;
}

export function ShareManagerLayout({ children, icon, title, breadcrumbLabel }: ShareManagerLayoutProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Breadcrumbs>
          <BreadcrumbItem href="/dashboard">
            <TbLayoutDashboardFilled className="text-sm mr-0.5" />
            {t("navigation.dashboard")}
          </BreadcrumbItem>
          <BreadcrumbItem>
            {icon} {breadcrumbLabel}
          </BreadcrumbItem>
        </Breadcrumbs>
        <div className="flex items-center gap-2">
          {icon}
          <h1 className="text-2xl font-bold">{title}</h1>
        </div>
      </div>
      {children}
    </div>
  );
}
