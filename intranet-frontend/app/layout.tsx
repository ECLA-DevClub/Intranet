import type { Metadata } from "next";
import { LanguageProvider } from "@/components/i18n";
import AppHeader from "@/components/AppHeader";
import AuthGate from "@/components/AuthGate";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Intranet",
  description: "Внутренний портал компании",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased text-slate-900`}
      >
        <LanguageProvider>
          <AuthGate>
            <div className="min-h-screen bg-slate-100">
              <AppHeader />
              <main className="mx-auto w-full max-w-6xl px-6 py-8">{children}</main>
            </div>
          </AuthGate>
        </LanguageProvider>
      </body>
    </html>
  );
}
