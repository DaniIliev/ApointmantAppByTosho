import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import translationEN from "../locales/en/translation.json";
import translationDE from "../locales/de/translation.json";
import translationBG from "../locales/bg/translation.json";

const resources = {
  en: {
    translation: translationEN,
  },
  de: {
    translation: translationDE,
  },
  bg: {
    translation: translationBG,
  },
};

// Determine initial language (persisted in localStorage if available)
const initialLanguage =
  typeof window !== "undefined"
    ? localStorage.getItem("appLocale") || (navigator.language?.slice(0, 2) === "bg" ? "bg" : "en")
    : "en";

// Fallback to 'en' if detected language not part of resources
const safeInitialLanguage = Object.keys(resources).includes(initialLanguage)
  ? initialLanguage
  : "en";

i18n.use(initReactI18next).init({
  resources,
  lng: safeInitialLanguage,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
