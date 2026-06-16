"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import Cookies from "js-cookie";
import { Locale, translate } from "@/utils/i18n";

interface LanguageContextValue {
  locale: Locale;
  dir: "ltr" | "rtl";
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window === "undefined") return "en";
    const savedLocale = Cookies.get("locale") as Locale | undefined;
    if (savedLocale === "ar" || savedLocale === "en") {
      return savedLocale;
    }
    return "en";
  });

  const setLocale = (nextLocale: Locale) => {
    setLocaleState(nextLocale);
    Cookies.set("locale", nextLocale, { expires: 365 });
  };

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      locale,
      dir: locale === "ar" ? "rtl" : "ltr",
      setLocale,
      toggleLocale: () => setLocale(locale === "ar" ? "en" : "ar"),
      t: (key: string) => translate(locale, key),
    }),
    [locale],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }
  return context;
}
