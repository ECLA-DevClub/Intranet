"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LanguageToggle from "@/components/LanguageToggle";
import ThemeToggle from "@/components/ThemeToggle";
import { useLanguage } from "@/components/i18n";
import { logoutLocal } from "@/lib/auth";
import { useUser } from "@/hooks/useUser";

export default function AppHeader() {
  const { t } = useLanguage();
  const router = useRouter();
  const { user, isLoaded, isAdmin } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleLogout = () => {
    logoutLocal();
    router.push("/login");
  };

  const toggleMenu = () => {
    if (isMenuOpen) {
      setIsClosing(true);
      setTimeout(() => {
        setIsMenuOpen(false);
        setIsClosing(false);
      }, 300);
    } else {
      setIsMenuOpen(true);
    }
  };

  const closeMenu = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsMenuOpen(false);
      setIsClosing(false);
    }, 300);
  };

  return (
    <header className="border-b border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md sticky top-0 z-50">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 sm:px-6 py-4">
        {/* Branding */}
        <Link
          href="/"
          className="flex items-center gap-3 transition-opacity hover:opacity-80"
        >
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-indigo-600 to-blue-500 shadow-sm text-sm font-bold text-white tracking-widest ring-2 ring-indigo-600/20">
            EC
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-tight">{t("nav.intranet")}</span>
            <span className="text-[10px] font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400 leading-tight">ECLA DevClub</span>
          </div>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
          <Link className="nav-link px-3 py-2 rounded-lg" href="/">
            {t("nav.dashboard") || "Dashboard"}
          </Link>
          {/* RBAC: Only Admin sees Departments Directory typically, or everyone if public */}
          {/* We'll show it for everyone but note they can't edit it */}
          <Link className="nav-link px-3 py-2 rounded-lg" href="/departments">
            {t("nav.departments")}
          </Link>
          <Link className="nav-link px-3 py-2 rounded-lg" href="/employees">
            {t("nav.employees")}
          </Link>
          <Link className="nav-link px-3 py-2 rounded-lg" href="/tickets">
            {t("nav.tickets")}
          </Link>
          <Link className="nav-link px-3 py-2 rounded-lg" href="/documents">
            {t("nav.documents")}
          </Link>

          <div className="mx-2 h-6 w-px bg-slate-200 dark:bg-slate-700" />
          
          <ThemeToggle />
          <LanguageToggle />

          {/* User Profile Area */}
          <div className="ml-2 flex items-center gap-3 pl-2">
            {isLoaded && user && (
              <div className="flex items-center gap-3 text-right">
                <div className="hidden lg:block">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{user.username}</p>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {user.role} {isAdmin && "👑"}
                  </p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-sm font-bold text-slate-600 dark:text-slate-300 ring-2 ring-slate-200 dark:ring-slate-700">
                  {user.username.charAt(0).toUpperCase()}
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="ml-2 rounded-full p-2 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300 transition"
              title={t("nav.logout")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
            </button>
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <button 
          onClick={toggleMenu}
          className="rounded-lg p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden"
        >
          {isMenuOpen && !isClosing ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
          )}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {(isMenuOpen || isClosing) && (
        <div className={`border-t border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 px-6 py-4 md:hidden shadow-xl backdrop-blur-md ${isClosing ? "animate-slide-up" : "animate-slide-down"}`}>
          {isLoaded && user && (
            <div className="mb-4 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-sm font-bold text-slate-600 dark:text-slate-300">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{user.username}</p>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">{user.role}</p>
              </div>
            </div>
          )}
          <nav className="flex flex-col gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
            <Link href="/" className="rounded-lg p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50" onClick={closeMenu}>{t("nav.dashboard") || "Dashboard"}</Link>
            <Link href="/departments" className="rounded-lg p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50" onClick={closeMenu}>{t("nav.departments")}</Link>
            <Link href="/employees" className="rounded-lg p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50" onClick={closeMenu}>{t("nav.employees")}</Link>
            <Link href="/tickets" className="rounded-lg p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50" onClick={closeMenu}>{t("nav.tickets")}</Link>
            <Link href="/documents" className="rounded-lg p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50" onClick={closeMenu}>{t("nav.documents")}</Link>
            
            <div className="my-2 border-t border-slate-100 dark:border-slate-800" />
            
            <div className="flex items-center justify-between p-2">
              <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t("nav.settings")}</span>
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <LanguageToggle />
              </div>
            </div>
            
            <button
              onClick={() => { closeMenu(); handleLogout(); }}
              className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
              {t("nav.logout")}
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
