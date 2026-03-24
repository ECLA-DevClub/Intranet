"use client";

import { useState } from "react";
import Link from "next/link";
import LanguageToggle from "@/components/LanguageToggle";
import ThemeToggle from "@/components/ThemeToggle";
import { useLanguage } from "@/components/i18n";

export default function AppHeader() {
  const { t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const toggleMenu = () => {
    if (isMenuOpen) {
      setIsClosing(true);
      setTimeout(() => {
        setIsMenuOpen(false);
        setIsClosing(false);
      }, 300); // Wait for animation
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
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur sticky top-0 z-50">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 sm:px-6 py-4">
        <Link
          href="/"
          className="nav-link flex items-center gap-3 text-lg font-semibold tracking-tight text-slate-800"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700">
            EC
          </span>
          <span className="hidden sm:inline">{t("nav.intranet")}</span>
          <span className="sm:hidden">Intranet</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-3 text-sm text-slate-600">
          <Link className="nav-link" href="/departments">
            {t("nav.departments")}
          </Link>
          <Link className="nav-link" href="/employees">
            {t("nav.employees")}
          </Link>
          <Link className="nav-link" href="/tickets">
            {t("nav.tickets")}
          </Link>
          <Link className="nav-link" href="/documents">
            {t("nav.documents")}
          </Link>
          <div className="flex items-center gap-2 border-l border-slate-200 pl-3 ml-2">
            <ThemeToggle />
            <LanguageToggle />
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <button 
          onClick={toggleMenu}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          aria-label="Toggle menu"
        >
          {isMenuOpen && !isClosing ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
          )}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {(isMenuOpen || isClosing) && (
        <div className={`border-t border-slate-100 bg-white px-6 py-4 md:hidden shadow-lg ${isClosing ? "animate-slide-up" : "animate-slide-down"}`}>
          <nav className="flex flex-col gap-4 text-sm text-slate-600">
            <Link 
              href="/departments" 
              className="flex items-center rounded-lg p-2 hover:bg-slate-50"
              onClick={closeMenu}
            >
              {t("nav.departments")}
            </Link>
            <Link 
              href="/employees" 
              className="flex items-center rounded-lg p-2 hover:bg-slate-50"
              onClick={closeMenu}
            >
              {t("nav.employees")}
            </Link>
            <Link 
              href="/tickets" 
              className="flex items-center rounded-lg p-2 hover:bg-slate-50"
              onClick={closeMenu}
            >
              {t("nav.tickets")}
            </Link>
            <Link 
              href="/documents" 
              className="flex items-center rounded-lg p-2 hover:bg-slate-50"
              onClick={closeMenu}
            >
              {t("nav.documents")}
            </Link>
            <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-2">
              <span className="text-xs font-medium text-slate-500 uppercase">Settings</span>
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <LanguageToggle />
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
