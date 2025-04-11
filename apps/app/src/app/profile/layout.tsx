import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

interface LayoutProps {
  children: React.ReactNode;
}

export async function generateMetadata(): Promise<Metadata> {
  const translate = await getTranslations();

  return {
    title: translate("profile.pageTitle"),
  };
}

export default function ProfileLayout({ children }: LayoutProps) {
  return <>{children}</>;
}
