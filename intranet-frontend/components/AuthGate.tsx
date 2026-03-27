"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getAccessToken, logoutLocal } from "@/lib/auth";
import { fetchMe } from "@/lib/api";
import AppHeader from "@/components/AppHeader";

const LOGIN_PATH = "/login";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [ready, setReady] = useState(false);

  // Simple check: if on login page, we might want to hide header
  const isLoginRoute = pathname === LOGIN_PATH;

  useEffect(() => {
    let active = true;

    async function boot() {
      const access = getAccessToken();

      // Case 1: No token
      if (!access) {
        if (!isLoginRoute) {
          router.replace(LOGIN_PATH);
        }
        if (active) setReady(true);
        return;
      }

      // Case 2: Token exists, but on login page -> redirect to Home
      if (isLoginRoute) {
        router.replace("/");
        // We don't set ready here effectively because we are redirecting away
        // But to be safe in case of lag:
        if (active) setReady(true);
        return;
      }

      // Case 3: Token exists, on protected page. Validate token/profile.
      try {
        await fetchMe();
        if (active) setReady(true);
      } catch {
        logoutLocal();
        router.replace(LOGIN_PATH);
        if (active) setReady(true);
      }
    }

    boot();
    return () => {
      active = false;
    };
  }, [isLoginRoute, router, pathname]);

  // Loading state
  if (!ready) {
    return (
      <div className="min-h-screen bg-slate-100 p-8 flex justify-center items-start">
         <div className="w-full max-w-4xl space-y-4 animate-pulse">
            <div className="h-16 w-full rounded-2xl bg-white/50" />
            <div className="h-64 w-full rounded-2xl bg-white/50" />
         </div>
      </div>
    );
  }

  // Render application layout
  return (
    <div className="min-h-screen bg-slate-100 pb-10">
      {/* Hide Header on Login Page */}
      {!isLoginRoute && <AppHeader />}
      
      <main className={`mx-auto w-full max-w-6xl px-6 ${!isLoginRoute ? 'py-8' : 'flex items-center justify-center min-h-screen'}`}>
         {children}
      </main>
    </div>
  );
}
