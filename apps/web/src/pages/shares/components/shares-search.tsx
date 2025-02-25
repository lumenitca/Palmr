import { SharesSearchProps } from "../types";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { useTranslation } from "react-i18next";
import { FaSearch, FaPlus } from "react-icons/fa";

export function SharesSearch({
  searchQuery,
  onSearchChange,
  onCreateShare,
  totalShares,
  filteredCount,
}: SharesSearchProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{t("shares.search.title")}</h2>
        <Button color="primary" startContent={<FaPlus />} onPress={onCreateShare}>
          {t("shares.search.createButton")}
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Input
          className="max-w-xs"
          placeholder={t("shares.search.placeholder")}
          startContent={<FaSearch className="text-gray-400" />}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {searchQuery && (
          <span className="text-sm text-gray-500">
            {t("shares.search.results", {
              filtered: filteredCount,
              total: totalShares,
            })}
          </span>
        )}
      </div>
    </div>
  );
}
