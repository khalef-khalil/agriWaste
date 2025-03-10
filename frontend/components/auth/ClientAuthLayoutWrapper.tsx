'use client';

import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { Leaf } from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';

export function ClientAuthLayoutWrapper({
  children,
}: {
  children: ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-white to-gray-100 relative overflow-hidden">
      {/* Decorative elements - only visible when mounted */}
      {mounted && (
        <>
          <div className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/4 w-96 h-96 rounded-full bg-green-50 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/4 w-96 h-96 rounded-full bg-green-100 blur-3xl"></div>
        </>
      )}
      
      <header className="py-6 px-4 relative z-10">
        <div className="max-w-7xl mx-auto flex justify-center">
          <Link href="/" className="flex items-center">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg">
                {mounted ? <Leaf className="h-5 w-5" /> : null}
              </div>
              <span className="ml-2 text-xl font-bold text-primary">
                {mounted ? 'AgriWaste' : 'AgriWaste'}
              </span>
            </div>
          </Link>
        </div>
      </header>
      
      <main className="flex-grow flex items-center justify-center px-4 relative z-10">
        <div className="w-full max-w-md">
          {children}
          
          {/* Additional links */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <Link href="/" className="text-primary hover:underline">
              ← Retour à l'accueil
            </Link>
            <span className="mx-2">•</span>
            <Link href="/about" className="hover:text-primary">
              À propos
            </Link>
            <span className="mx-2">•</span>
            <Link href="/contact" className="hover:text-primary">
              Contact
            </Link>
          </div>
        </div>
      </main>
      
      <footer className="py-4 px-4 text-center relative z-10">
        <div className="text-sm text-gray-500">
          © {new Date().getFullYear()} AgriWaste Marketplace. Tous droits réservés.
        </div>
      </footer>
      {mounted && <Toaster position="top-right" richColors />}
    </div>
  );
} 