import { useTranslation } from "react-i18next";
import { RiLockPasswordFill } from "react-icons/ri";

export function ResetPasswordHeader() {
  const { t } = useTranslation();

  return (
    <div className="space-y-2 text-center">
      <div className="flex items-center justify-center gap-2">
        <RiLockPasswordFill className="text-2xl" />
        <h1 className="text-2xl font-bold tracking-tight">{t("resetPassword.header.title")}</h1>
      </div>
      <p className="text-default-500">{t("resetPassword.header.description")}</p>
    </div>
  );
}
