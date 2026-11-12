import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { Nav } from "@/components/nav";
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
  title: "Text Human",
  description: "Turn AI-written text into something that sounds like a person wrote it.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="border-b border-border">
          <div className="mx-auto flex h-14 w-full max-w-4xl items-center justify-between px-4">
            <Link href="/" className="font-semibold tracking-tight">
              Text Human
            </Link>
            <Suspense fallback={<div className="h-8" />}>
              <Nav />
            </Suspense>
          </div>
        </header>
        <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-10">
          {children}
        </main>
      </body>
    </html>
  );
}
