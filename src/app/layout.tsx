import type { Metadata, Viewport } from "next";
import { Manrope, Sora } from "next/font/google";
import "@/styles/globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-sora",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Deedar — Field Outlet Tracker",
  description: "Field sales outlet tracker for Deedar reps.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1F5C3F",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} ${sora.variable}`}>
      <body>{children}</body>
    </html>
  );
}
