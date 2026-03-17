"use client";

import { useLanguage } from "@/components/i18n";

export default function LanguageToggle() {
  const { lang, setLang, t } = useLanguage();
  const nextLang = lang === "en" ? "ru" : "en";

  return (
    <button
      type="button"
      onClick={() => setLang(nextLang)}
      aria-label={t("toggle.label")}
      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
    >
      <span>{lang.toUpperCase()}</span>
      <span className="text-slate-400">→</span>
      <span>{nextLang.toUpperCase()}</span>
    </button>
  );
}
