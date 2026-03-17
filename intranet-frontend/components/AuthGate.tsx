"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getAccessToken, getStoredUser, logoutLocal } from "@/lib/auth";
import { fetchMe } from "@/lib/api";

const LOGIN_PATH = "/login";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [ready, setReady] = useState(false);

  const isLoginRoute = useMemo(() => pathname === LOGIN_PATH, [pathname]);

  useEffect(() => {
    let active = true;

    async function boot() {
      const access = getAccessToken();

      if (!access) {
        if (!isLoginRoute) {
          router.replace(LOGIN_PATH);
        }
        if (active) setReady(true);
        return;
      }

      if (isLoginRoute) {
        router.replace("/");
        if (active) setReady(true);
        return;
      }

      const existingUser = getStoredUser();
      if (existingUser) {
        if (active) setReady(true);
        return;
      }

      try {
        await fetchMe();
      } catch {
        // Токен мог протухнуть; fetchMe внутри попробует refresh.
        // Если всё равно упало — выкидываем локальную сессию.
        logoutLocal();
        router.replace(LOGIN_PATH);
      } finally {
        if (active) setReady(true);
      }
    }

    boot();
    return () => {
      active = false;
    };
  }, [isLoginRoute, router]);

  if (!ready) {
    return (
      <div className="mx-auto w-full max-w-6xl px-6 py-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="h-4 w-40 rounded bg-slate-100" />
          <div className="mt-4 h-4 w-64 rounded bg-slate-100" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
