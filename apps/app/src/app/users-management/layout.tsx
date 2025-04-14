import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

interface LayoutProps {
  children: React.ReactNode;
}

export async function generateMetadata(): Promise<Metadata> {
  const translate = await getTranslations();

  return {
    title: translate("settings.pageTitle"),
  };
}

export default function UsersManagementLayout({ children }: LayoutProps) {
  return <>{children}</>;
}
