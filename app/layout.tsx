import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import { Toaster } from 'react-hot-toast';
import ToastHandler from "@/components/ToastHandler";
import { Suspense } from "react";
import { cookies } from "next/headers";
import { getTranslation, Locale } from "@/lib/translations";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const lang = (cookieStore.get('nxt-lang')?.value as Locale) || 'ru';
  const t = getTranslation(lang);
  return {
    title: t.layout.title,
    description: t.layout.description,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const lang = (cookieStore.get('nxt-lang')?.value as Locale) || 'ru';
  
  return (
    <html lang={lang} suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} antialiased`} suppressHydrationWarning>
        <Toaster position="top-right" />
        <Suspense fallback={null}>
            <ToastHandler />
        </Suspense>
        <Header lang={lang} />
        <Navbar lang={lang} />
        {children}
      </body>
    </html>
  );
}
