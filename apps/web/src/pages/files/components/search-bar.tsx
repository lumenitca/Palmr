import type { SearchBarProps } from "../types";
import { Input } from "@heroui/input";
import { useTranslation } from "react-i18next";
import { FaSearch } from "react-icons/fa";

export function SearchBar({ searchQuery, onSearch, totalFiles, filteredCount }: SearchBarProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-2">
      <Input
        className="max-w-xs"
        placeholder={t("searchBar.placeholder")}
        startContent={<FaSearch className="text-gray-400" />}
        value={searchQuery}
        onChange={(e) => onSearch(e.target.value)}
      />
      {searchQuery && (
        <span className="text-sm text-gray-500">
          {t("searchBar.results", { filtered: filteredCount, total: totalFiles })}
        </span>
      )}
    </div>
  );
}
