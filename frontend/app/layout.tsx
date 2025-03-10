import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { MainLayout } from "@/components/layout/MainLayout";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "AgriWaste Marketplace",
  description: "Connecter les producteurs de déchets agricoles avec les chercheurs et les industries",
  keywords: "déchets agricoles, durabilité, marketplace, économie circulaire, afrique du nord",
  authors: [{ name: "Équipe AgriWaste" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  );
}
