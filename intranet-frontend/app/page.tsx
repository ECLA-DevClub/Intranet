"use client";

import Link from "next/link";
import { useLanguage } from "@/components/i18n";
import { useUser } from "@/hooks/useUser";

export default function Home() {
  const { t } = useLanguage();
  const { user, isLoaded, isAdmin } = useUser();

  const sections = [
    {
      title: t("home.section.employees.title"),
      description: t("home.section.employees.description"),
      href: "/employees",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
      ),
      color: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 group-hover:border-blue-400 dark:group-hover:border-blue-600 group-hover:bg-blue-100/50 dark:group-hover:bg-blue-900/40"
    },
    {
      title: t("home.section.tickets.title"),
      description: t("home.section.tickets.description"),
      href: "/tickets",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500"><path d="m15.4 19.46 1.28 1.68a2.14 2.14 0 0 0 3.43-.03l1.83-2.61a2.13 2.13 0 0 0-.25-2.85l-4.57-3.95"/><path d="m6.6 4.54-1.28-1.68a2.14 2.14 0 0 0-3.43.03L.06 5.5a2.13 2.13 0 0 0 .25 2.85l4.57 3.95"/><path d="M14 11h.01"/><path d="M10 13h.01"/><path d="M4 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path d="M20 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><rect width="16" height="8" x="4" y="8" rx="2" ry="2" transform="rotate(-45 12 12)"/></svg>
      ),
      color: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 group-hover:border-amber-400 dark:group-hover:border-amber-600 group-hover:bg-amber-100/50 dark:group-hover:bg-amber-900/40"
    },
    {
      title: t("home.section.documents.title"),
      description: t("home.section.documents.description"),
      href: "/documents",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>
      ),
      color: "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 group-hover:border-emerald-400 dark:group-hover:border-emerald-600 group-hover:bg-emerald-100/50 dark:group-hover:bg-emerald-900/40"
    },
    {
      title: t("home.section.departments.title"),
      description: t("home.section.departments.description"),
      href: "/departments",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500"><rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/></svg>
      ),
      color: "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 group-hover:border-indigo-400 dark:group-hover:border-indigo-600 group-hover:bg-indigo-100/50 dark:group-hover:bg-indigo-900/40"
    },
  ];

  return (
    <div className="space-y-8 animate-slide-down">
      {/* Welcome Banner */}
      <header className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm">
        {/* Decorative background gradient */}
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-gradient-to-br from-indigo-500/20 to-sky-400/20 blur-3xl pointer-events-none" />
        
        <div className="relative z-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500 mb-2">
            {t("home.portal") || "Intranet EC Portal"}
          </p>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white md:text-4xl">
            {isLoaded ? (
              user ? `${t("home.welcome_back") || "Welcome back, "}${user.username}!` : (t("home.welcome") || "Welcome to the Intranet")
            ) : (
              <div className="h-10 w-64 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
            )}
          </h1>
          <p className="mt-3 max-w-xl text-slate-600 dark:text-slate-400">
            {t("home.description_long") || "Access your department tools, file tickets, manage documents, and stay connected with the company."}
          </p>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content - Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">{t("home.quick_actions") || "Quick Actions"}</h2>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2">
            {sections.map((section) => (
              <Link
                key={section.title}
                href={section.href}
                className={`group flex items-start gap-4 rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${section.color}`}
              >
                <div className="flex-shrink-0 mt-1 rounded-xl bg-white dark:bg-slate-800 p-2 shadow-sm border border-slate-100 dark:border-slate-700">
                  {section.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white">
                    {section.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                    {section.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
             <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-800 dark:text-slate-100">{t("home.recent_activity") || "My Recent Activity"}</h3>
                <Link href="/tickets" className="text-sm font-medium text-indigo-600 hover:underline">{t("home.view_all") || "View all"}</Link>
             </div>
             <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900/50">
               <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 dark:text-slate-600 mb-3"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
               <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">{t("home.no_activity") || "No recent activity found."}</h4>
               <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t("home.no_activity_desc") || "Actions you perform will appear here."}</p>
             </div>
          </div>
        </div>

        {/* Sidebar - Company Feed */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 p-5">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                {t("home.company_feed") || "Company Feed"}
              </h2>
            </div>
            
            <div className="divide-y divide-slate-100 dark:divide-slate-800 p-2">
              <div className="p-4 transition hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                  <span className="rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 px-2 py-0.5">{t("home.feed.1.tag")}</span>
                  <span>{t("home.feed.1.date")}</span>
                </div>
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{t("home.feed.1.title")}</h3>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{t("home.feed.1.desc")}</p>
              </div>

              <div className="p-4 transition hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                  <span className="rounded-full bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-400 px-2 py-0.5">{t("home.feed.2.tag")}</span>
                  <span>{t("home.feed.2.date")}</span>
                </div>
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{t("home.feed.2.title")}</h3>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{t("home.feed.2.desc")}</p>
              </div>

              <div className="p-4 transition hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                  <span className="rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400 px-2 py-0.5">{t("home.feed.3.tag")}</span>
                  <span>{t("home.feed.3.date")}</span>
                </div>
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{t("home.feed.3.title")}</h3>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{t("home.feed.3.desc")}</p>
              </div>
            </div>
            
            <div className="border-t border-slate-100 dark:border-slate-800 p-4 text-center">
              <button className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition">{t("home.view_all_news") || "View All News"}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}