"use client";

import { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/components/i18n";

export default function LanguageToggle() {
  const { lang, setLang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const languages = [
    { code: "en", label: "English (EN)" },
    { code: "ru", label: "Русский (RU)" }
  ];

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        <span>{lang.toUpperCase()}</span>
        <svg className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 origin-top-right outline-none rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-lg z-50 p-1">
          {languages.map((l) => (
            <button
              key={l.code}
              onClick={() => {
                setLang(l.code);
                setIsOpen(false);
              }}
              className={`block w-full rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors ${
                lang === l.code
                  ? "bg-slate-50 dark:bg-slate-800/50 text-indigo-600 dark:text-indigo-400"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-800/50 dark:hover:text-slate-200"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
