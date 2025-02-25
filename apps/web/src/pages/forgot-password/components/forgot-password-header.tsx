import { useTranslation } from "react-i18next";
import { RiLockPasswordFill } from "react-icons/ri";

export function ForgotPasswordHeader() {
  const { t } = useTranslation();

  return (
    <div className="space-y-2 text-center">
      <div className="flex items-center justify-center gap-2">
        <RiLockPasswordFill className="text-2xl" />
        <h1 className="text-2xl font-bold tracking-tight">{t("forgotPassword.title")}</h1>
      </div>
      <p className="text-default-500">{t("forgotPassword.description")}</p>
    </div>
  );
}
