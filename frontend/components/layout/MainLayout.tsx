import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { Toaster } from '@/components/ui/sonner';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow pt-16">
          {children}
        </main>
        <Footer />
        <Toaster position="top-right" richColors />
      </div>
    </AuthProvider>
  );
} 