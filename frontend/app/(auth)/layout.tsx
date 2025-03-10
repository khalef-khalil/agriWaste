import '../globals.css';
import type { Metadata } from "next";
import { ClientAuthLayoutWrapper } from '../../components/auth/ClientAuthLayoutWrapper';
import { AuthProvider } from '@/components/auth/AuthProvider';

export const metadata: Metadata = {
  title: "Authentification - AgriWaste Marketplace",
  description: "Connectez-vous ou créez un compte sur AgriWaste Marketplace",
};

// This layout replaces the MainLayout but still operates within the root layout
export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // We don't include html/body tags here as they're provided by RootLayout
    <AuthProvider>
      <ClientAuthLayoutWrapper>
        {children}
      </ClientAuthLayoutWrapper>
    </AuthProvider>
  );
} 