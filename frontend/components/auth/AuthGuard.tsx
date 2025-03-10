'use client';

import { useAuth } from '@/lib/auth';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ReactNode } from 'react';

interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean; // If true, redirect to login when not authenticated
}

export function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Delay showing loading spinner to prevent hydration issues
    const timer = setTimeout(() => {
      setShowLoading(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Skip if not mounted yet (to avoid server/client mismatch)
    if (!isMounted) return;
    
    // Skip if still loading
    if (loading) return;

    // Redirect logic
    if (requireAuth && !isAuthenticated) {
      // Save current path for redirect after login (only on client side)
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('redirectAfterLogin', pathname);
      }
      router.push('/login');
    } else if (!requireAuth && isAuthenticated) {
      // Redirect from login/register to dashboard if already authenticated
      if (pathname === '/login' || pathname === '/register') {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, loading, pathname, requireAuth, router, isMounted]);

  // During SSR and initial mount, always render children to avoid hydration mismatch
  if (!isMounted) {
    return <>{children}</>;
  }

  // After mount, show loading indicator if needed (but only after the delay)
  if (showLoading && (loading || (requireAuth && !isAuthenticated))) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-16 h-16 border-t-4 border-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return <>{children}</>;
} 