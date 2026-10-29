import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import type { Language } from "./language";
import { en } from "./locales/en";
import { ja } from "./locales/ja";

// Translations are bundled, so init finishes synchronously (initAsync: false).
export const initI18n = (language: Language) => {
  i18n.use(initReactI18next).init({
    resources: { en: { translation: en }, ja: { translation: ja } },
    lng: language,
    fallbackLng: "en",
    supportedLngs: ["en", "ja"],
    initAsync: false,
    interpolation: { escapeValue: false },
  });
};
