'use client';

import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Leaf } from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/components/auth/AuthProvider';

export function ClientAuthLayoutWrapper({
  children,
}: {
  children: ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-white">
          <div className="flex-grow flex items-center justify-center">
            <div className="w-full max-w-md">
              {children}
            </div>
          </div>
        </div>
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-white to-gray-100 relative overflow-hidden">
        {/* Éléments décoratifs */}
        <div className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/4 w-96 h-96 rounded-full bg-green-50 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/4 w-96 h-96 rounded-full bg-green-100 blur-3xl"></div>
        
        <header className="py-6 px-4 relative z-10">
          <div className="max-w-7xl mx-auto flex justify-center">
            <Link href="/?from=auth&reload=true" className="flex items-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                className="flex items-center"
              >
                <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-lg">
                  <Leaf className="h-5 w-5" />
                </div>
                <span className="ml-2 text-xl font-bold text-green-600">
                  AgriWaste
                </span>
              </motion.div>
            </Link>
          </div>
        </header>
        
        <main className="flex-grow flex items-center justify-center px-4 relative z-10">
          <div className="w-full max-w-md">
            {children}
            
            {/* Links supplémentaires */}
            <div className="mt-8 text-center text-sm text-gray-500">
              <Link href="/?from=auth&reload=true" className="text-green-600 hover:underline">
                ← Retour à l'accueil
              </Link>
              <span className="mx-2">•</span>
              <Link href="/about" className="hover:text-green-600">
                À propos
              </Link>
              <span className="mx-2">•</span>
              <Link href="/contact" className="hover:text-green-600">
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
        <Toaster position="top-right" richColors />
      </div>
    </AuthProvider>
  );
} 