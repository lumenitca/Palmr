import { ReactNode } from "react";
import Link from "next/link";
import { IconLayoutDashboard } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

import { Navbar } from "@/components/layout/navbar";
import { DefaultFooter } from "@/components/ui/default-footer";
import { Separator } from "@/components/ui/separator";

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
  const t = useTranslations();

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
            <Separator />
            {showBreadcrumb && breadcrumbLabel && (
              <nav className="flex" aria-label="Breadcrumb">
                <ol className="flex items-center gap-2">
                  <li className="flex items-center">
                    <Link
                      href="/dashboard"
                      className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <IconLayoutDashboard className="h-4 w-4 mr-1" />
                      {t("navigation.dashboard")}
                    </Link>
                  </li>
                  <li className="flex items-center before:content-['/'] before:mx-2 before:text-muted-foreground">
                    <span className="flex items-center">
                      {icon} {breadcrumbLabel}
                    </span>
                  </li>
                </ol>
              </nav>
            )}
          </div>

          {children}
        </div>
      </div>
      <DefaultFooter />
    </div>
  );
}
