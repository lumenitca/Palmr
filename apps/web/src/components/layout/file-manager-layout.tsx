import { Navbar } from "@/components/layout/navbar";
import { DefaultFooter } from "@/components/ui/default-footer";
import { Breadcrumbs, BreadcrumbItem } from "@heroui/breadcrumbs";
import { Divider } from "@heroui/divider";
import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { TbLayoutDashboardFilled } from "react-icons/tb";

interface FileManagerLayoutProps {
  children: ReactNode;
  title: string;
  icon: ReactNode;
  breadcrumbLabel?: string;
  showBreadcrumb?: boolean;
}

export function FileManagerLayout({
  children,
  title,
  icon,
  breadcrumbLabel,
  showBreadcrumb = true,
}: FileManagerLayoutProps) {
  const { t } = useTranslation();

  return (
    <div className="w-full min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-7xl mx-auto w-full p-6 py-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-row items-center gap-2">
              {icon}
              <h1 className="text-2xl font-bold">{title}</h1>
            </div>
            <Divider />
            {showBreadcrumb && breadcrumbLabel && (
              <Breadcrumbs>
                <BreadcrumbItem href="/dashboard">
                  <TbLayoutDashboardFilled className="text-sm mr-0.5" />
                  {t("navigation.dashboard")}
                </BreadcrumbItem>
                <BreadcrumbItem>
                  {icon} {breadcrumbLabel}
                </BreadcrumbItem>
              </Breadcrumbs>
            )}
          </div>

          {children}
        </div>
      </div>
      <DefaultFooter />
    </div>
  );
}
