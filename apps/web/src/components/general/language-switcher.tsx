import { Button } from "@heroui/button";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";
import ReactCountryFlag from "react-country-flag";
import { useTranslation } from "react-i18next";
import { FaGlobe } from "react-icons/fa";

const languages = {
  "en-US": "English",
  "pt-BR": "Português",
  "fr-FR": "Français",
  "es-ES": "Español",
  "de-DE": "Deutsch",
  "tr-TR": "Türkçe (Turkish)",
  "ru-RU": "Русский (Russian)",
  "hi-IN": "हिन्दी (Hindi)",
  "ar-SA": "العربية (Arabic)",
  "zh-CN": "中文 (Chinese)",
  "ja-JP": "日本語 (Japanese)",
  "ko-KR": "한국어 (Korean)",
};

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button isIconOnly className="text-default-500" size="sm" variant="light">
          <FaGlobe size={15} />
        </Button>
      </DropdownTrigger>
      <DropdownMenu selectedKeys={[i18n.language]} selectionMode="single">
        {Object.entries(languages).map(([code, name]) => (
          <DropdownItem key={code} onClick={() => changeLanguage(code)}>
            <ReactCountryFlag
              svg
              countryCode={code.split("-")[1]}
              style={{
                marginRight: "8px",
                width: "1em",
                height: "1em",
              }}
            />
            {name}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
}
