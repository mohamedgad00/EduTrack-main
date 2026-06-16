"use client";

import { Languages } from "lucide-react";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export default function LanguageToggle() {
  const { toggleLocale, t } = useLanguage();

  return (
    <button
      type="button"
      onClick={toggleLocale}
      className="fixed bottom-4 end-4 z-50 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-lg transition-colors hover:bg-blue-50"
    >
      <Languages size={16} />
      {t("language.toggle")}
    </button>
  );
}
