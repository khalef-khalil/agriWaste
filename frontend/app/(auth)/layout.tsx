import '../globals.css';
import type { Metadata } from "next";
import { ClientAuthLayoutWrapper } from '../../components/auth/ClientAuthLayoutWrapper';
import localFont from 'next/font/local';

// Import the same fonts as the root layout
const geistSans = localFont({
  src: '../fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: '../fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: "Authentification - AgriWaste Marketplace",
  description: "Connectez-vous ou créez un compte sur AgriWaste Marketplace",
};

// This is crucial - it tells Next.js not to use the root layout
export const dynamic = 'force-static';

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ClientAuthLayoutWrapper>
          {children}
        </ClientAuthLayoutWrapper>
      </body>
    </html>
  );
} 