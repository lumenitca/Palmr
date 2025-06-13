import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();

  return {
    title: t("reverseShares.upload.metadata.title"),
    description: t("reverseShares.upload.metadata.description"),
  };
}

export default function ReverseShareLayout({ children }: { children: React.ReactNode }) {
  return children;
}
