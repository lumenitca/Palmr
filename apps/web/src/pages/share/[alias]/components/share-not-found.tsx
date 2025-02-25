import { Card, CardBody } from "@heroui/card";
import { useTranslation } from "react-i18next";
import { FaLock } from "react-icons/fa";

export function ShareNotFound() {
  const { t } = useTranslation();

  return (
    <Card>
      <CardBody className="p-6">
        <div className="flex flex-col items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full bg-danger-100 flex items-center justify-center">
            <FaLock className="text-4xl text-danger-500" />
          </div>
          <h2 className="text-2xl font-semibold text-danger-500">{t("share.notFound.title")}</h2>
        </div>
        <div className="text-center pb-8">
          <p className="text-lg text-default-500">{t("share.notFound.description")}</p>
        </div>
      </CardBody>
    </Card>
  );
}
