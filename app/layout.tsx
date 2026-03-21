import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import { Toaster } from 'react-hot-toast';
import ToastHandler from "@/components/ToastHandler";
import { Suspense } from "react";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Племенной Реестр Коз | Ассоциация Племенных Коз",
  description: "Официальный племенной реестр молочных коз Ассоциации Племенных Коз",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} antialiased`} suppressHydrationWarning>
        <Toaster position="top-right" />
        <Suspense fallback={null}>
            <ToastHandler />
        </Suspense>
        <Header />
        <Navbar />
        {children}
      </body>
    </html>
  );
}
