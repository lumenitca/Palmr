import { Button } from "@heroui/button";
import { useTranslation } from "react-i18next";
import { FaShare, FaPlus } from "react-icons/fa";

interface EmptySharesStateProps {
  onCreateShare: () => void;
}

export function EmptySharesState({ onCreateShare }: EmptySharesStateProps) {
  const { t } = useTranslation();

  return (
    <div className="text-center py-6 flex flex-col items-center gap-2">
      <FaShare className="text-4xl text-gray-500" />
      <p className="text-gray-500">{t("shares.empty.message")}</p>
      <Button color="primary" size="sm" startContent={<FaPlus />} onPress={onCreateShare}>
        {t("shares.empty.createButton")}
      </Button>
    </div>
  );
}
