import { Link } from "@heroui/link";
import { useTranslation } from "react-i18next";
import { version } from "../../../package.json";

export function DefaultFooter() {
  const { t } = useTranslation();

  return (
    <footer className="w-full flex items-center justify-center py-3 h-16">
      <div className="flex flex-col items-center">
        <Link
          isExternal
          className="flex items-center gap-1 text-current"
          href="https://kyantech.com.br"
          title={t("footer.kyanHomepage")}
        >
          <span className="text-default-600 text-xs sm:text-sm">{t("footer.poweredBy")}</span>
          <p className="text-green-700 text-xs sm:text-sm">Kyantech Solutions</p>
        </Link>
        <span className="text-default-500 text-[11px] mt-1">v{version}-beta</span>
      </div>
    </footer>
  );
}
