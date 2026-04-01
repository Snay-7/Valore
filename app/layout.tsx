import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from '@vercel/analytics/next';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Valora — Institutional Development Appraisal",
  description: "Institutional-grade development appraisal platform for BTR, BTS, Hotel and Flip assets.",
  openGraph: {
    title: "Valora — Institutional Development Appraisal",
    description: "Institutional-grade development appraisal platform.",
    siteName: "Valora",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}