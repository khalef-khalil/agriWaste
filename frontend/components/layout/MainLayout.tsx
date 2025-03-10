'use client';

import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { Toaster } from '@/components/ui/sonner';
import { usePathname } from 'next/navigation';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  
  // Check if this is an auth route
  const isAuthRoute = pathname?.startsWith('/login') || pathname?.startsWith('/register');
  
  // For auth routes, only render the children
  if (isAuthRoute) {
    return <>{children}</>;
  }
  
  // For non-auth routes, render the full layout
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