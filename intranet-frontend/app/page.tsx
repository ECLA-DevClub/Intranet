"use client";

import Link from "next/link";
import { useLanguage } from "@/components/i18n";

export default function Home() {
  const { t } = useLanguage();
  const sections = [
    {
      title: t("home.section.employees.title"),
      description: t("home.section.employees.description"),
      href: "/employees",
    },
    {
      title: t("home.section.tickets.title"),
      description: t("home.section.tickets.description"),
      href: "/tickets",
    },
    {
      title: t("home.section.documents.title"),
      description: t("home.section.documents.description"),
      href: "/documents",
    },
    {
      title: t("home.section.departments.title"),
      description: t("home.section.departments.description"),
      href: "/departments",
    },
  ];

  return (
    <div className="space-y-10">
      <header className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          {t("home.label")}
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">
          {t("home.title")}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          {t("home.description")}
        </p>
      </header>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {sections.map((section) => (
          <Link
            key={section.title}
            href={section.href}
            className="animated-border group flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                {section.title}
              </h2>
              <p className="mt-2 text-sm text-slate-600">{section.description}</p>
            </div>
            <span className="mt-6 text-sm font-medium text-slate-700 group-hover:text-slate-900">
              {t("home.open")}
            </span>
          </Link>
        ))}
      </section>
    </div>
  );
}