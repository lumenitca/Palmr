import arTranslations from "../locales/ar-SA.json";
import deTranslations from "../locales/de-DE.json";
import enTranslations from "../locales/en-US.json";
import esTranslations from "../locales/es-ES.json";
import frTranslations from "../locales/fr-FR.json";
import hiTranslations from "../locales/hi-IN.json";
import jaTranslations from "../locales/ja-JP.json";
import koTranslations from "../locales/ko-KR.json";
import ptTranslations from "../locales/pt-BR.json";
import ruTranslations from "../locales/ru-RU.json";
import trTranslations from "../locales/tr-TR.json";
import zhTranslations from "../locales/zh-CN.json";
import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      "en-US": {
        translation: enTranslations,
      },
      "pt-BR": {
        translation: ptTranslations,
      },
      "fr-FR": {
        translation: frTranslations,
      },
      "es-ES": {
        translation: esTranslations,
      },
      "de-DE": {
        translation: deTranslations,
      },
      "ru-RU": {
        translation: ruTranslations,
      },
      "hi-IN": {
        translation: hiTranslations,
      },
      "ar-SA": {
        translation: arTranslations,
      },
      "ja-JP": {
        translation: jaTranslations,
      },
      "ko-KR": {
        translation: koTranslations,
      },
      "tr-TR": {
        translation: trTranslations,
      },
      "zh-CN": {
        translation: zhTranslations,
      },
    },
    fallbackLng: "en-US",
    supportedLngs: [
      "en-US",
      "pt-BR",
      "fr-FR",
      "es-ES",
      "de-DE",
      "ru-RU",
      "hi-IN",
      "ar-SA",
      "ja-JP",
      "ko-KR",
      "tr-TR",
      "zh-CN",
    ],
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
