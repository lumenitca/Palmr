import { Link } from "@heroui/link";
import { useTranslation } from "react-i18next";

export function DefaultFooter() {
  const { t } = useTranslation();

  return (
    <footer className="w-full flex items-center justify-center py-3 h-16">
      <Link
        isExternal
        className="flex items-center gap-1 text-current"
        href="https://kyantech.com.br"
        title={t("footer.kyanHomepage")}
      >
        <span className="text-default-600 text-xs sm:text-sm">{t("footer.poweredBy")}</span>
        <p className="text-green-700 text-xs sm:text-sm">Kyantech Solutions</p>
      </Link>
    </footer>
  );
}
