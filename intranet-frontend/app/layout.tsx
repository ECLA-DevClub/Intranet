import type { Metadata } from "next";
import { LanguageProvider } from "@/components/i18n";
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
  description: "Internal Company Portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased text-slate-900 bg-slate-100`}
      >
        <LanguageProvider>
          <AuthGate>
            {children}
          </AuthGate>
        </LanguageProvider>
      </body>
    </html>
  );
}
