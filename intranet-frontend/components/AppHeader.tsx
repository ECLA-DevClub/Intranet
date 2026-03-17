"use client";

import Link from "next/link";
import LanguageToggle from "@/components/LanguageToggle";
import ThemeToggle from "@/components/ThemeToggle";
import { useLanguage } from "@/components/i18n";

export default function AppHeader() {
  const { t } = useLanguage();

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="nav-link flex items-center gap-3 text-lg font-semibold tracking-tight text-slate-800"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700">
            EC
          </span>
          {t("nav.intranet")}
        </Link>
        <nav className="flex items-center gap-3 text-sm text-slate-600">
          <Link className="nav-link" href="/employees">
            {t("nav.employees")}
          </Link>
          <Link className="nav-link" href="/tickets">
            {t("nav.tickets")}
          </Link>
          <Link className="nav-link" href="/documents">
            {t("nav.documents")}
          </Link>
          <ThemeToggle />
          <LanguageToggle />
        </nav>
      </div>
    </header>
  );
}
