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
      color: "bg-blue-50 border-blue-200 group-hover:border-blue-400 group-hover:bg-blue-100/50"
    },
    {
      title: t("home.section.tickets.title"),
      description: t("home.section.tickets.description"),
      href: "/tickets",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500"><path d="m15.4 19.46 1.28 1.68a2.14 2.14 0 0 0 3.43-.03l1.83-2.61a2.13 2.13 0 0 0-.25-2.85l-4.57-3.95"/><path d="m6.6 4.54-1.28-1.68a2.14 2.14 0 0 0-3.43.03L.06 5.5a2.13 2.13 0 0 0 .25 2.85l4.57 3.95"/><path d="M14 11h.01"/><path d="M10 13h.01"/><path d="M4 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path d="M20 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><rect width="16" height="8" x="4" y="8" rx="2" ry="2" transform="rotate(-45 12 12)"/></svg>
      ),
      color: "bg-amber-50 border-amber-200 group-hover:border-amber-400 group-hover:bg-amber-100/50"
    },
    {
      title: t("home.section.documents.title"),
      description: t("home.section.documents.description"),
      href: "/documents",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>
      ),
      color: "bg-emerald-50 border-emerald-200 group-hover:border-emerald-400 group-hover:bg-emerald-100/50"
    },
    {
      title: t("home.section.departments.title"),
      description: t("home.section.departments.description"),
      href: "/departments",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500"><rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/></svg>
      ),
      color: "bg-indigo-50 border-indigo-200 group-hover:border-indigo-400 group-hover:bg-indigo-100/50"
    },
  ];

  return (
    <div className="space-y-8 animate-slide-down">
      {/* Welcome Banner */}
      <header className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        {/* Decorative background gradient */}
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-gradient-to-br from-indigo-500/20 to-sky-400/20 blur-3xl pointer-events-none" />
        
        <div className="relative z-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500 mb-2">
            Intranet EC Portal
          </p>
          <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl">
            {isLoaded ? (
              user ? `Welcome back, ${user.username}!` : "Welcome to the Intranet"
            ) : (
              <div className="h-10 w-64 animate-pulse rounded-lg bg-slate-200" />
            )}
          </h1>
          <p className="mt-3 max-w-xl text-slate-600">
            Access your department tools, file tickets, manage documents, and stay connected with the company.
          </p>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content - Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-800">Quick Actions</h2>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2">
            {sections.map((section) => (
              <Link
                key={section.title}
                href={section.href}
                className={`group flex items-start gap-4 rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${section.color}`}
              >
                <div className="flex-shrink-0 mt-1 rounded-xl bg-white p-2 shadow-sm border border-slate-100">
                  {section.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 group-hover:text-slate-900">
                    {section.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600 line-clamp-2">
                    {section.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
             <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-800">My Recent Activity</h3>
                <Link href="/tickets" className="text-sm font-medium text-indigo-600 hover:underline">View all</Link>
             </div>
             <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-slate-100 rounded-xl bg-slate-50">
               <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 mb-3"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
               <h4 className="text-sm font-medium text-slate-700">No recent activity found.</h4>
               <p className="text-xs text-slate-500 mt-1">Actions you perform will appear here.</p>
             </div>
          </div>
        </div>

        {/* Sidebar - Company Feed */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50/50 p-5">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                Company Feed
              </h2>
            </div>
            
            <div className="divide-y divide-slate-100 p-2">
              <div className="p-4 transition hover:bg-slate-50 rounded-xl">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-2">
                  <span className="rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5">Announcement</span>
                  <span>Today, 10:00 AM</span>
                </div>
                <h3 className="text-sm font-semibold text-slate-800">Q1 Townhall Meeting</h3>
                <p className="mt-1 text-xs text-slate-600">Join us for the quarterly review meeting this Friday. Check calendar invites.</p>
              </div>

              <div className="p-4 transition hover:bg-slate-50 rounded-xl">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-2">
                  <span className="rounded-full bg-sky-100 text-sky-700 px-2 py-0.5">IT Dept</span>
                  <span>Yesterday</span>
                </div>
                <h3 className="text-sm font-semibold text-slate-800">System Maintenance</h3>
                <p className="mt-1 text-xs text-slate-600">The staging server will be down for 2 hours tonight for upgrades.</p>
              </div>

              <div className="p-4 transition hover:bg-slate-50 rounded-xl">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-2">
                  <span className="rounded-full bg-rose-100 text-rose-700 px-2 py-0.5">HR</span>
                  <span>Mar 12</span>
                </div>
                <h3 className="text-sm font-semibold text-slate-800">Welcome new hires!</h3>
                <p className="mt-1 text-xs text-slate-600">We are super excited to welcome 5 new engineers to the DevClub block.</p>
              </div>
            </div>
            
            <div className="border-t border-slate-100 p-4 text-center">
              <button className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition">View All News</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}