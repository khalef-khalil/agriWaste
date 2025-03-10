import { useAuth } from '@/lib/auth';
import { useEffect } from 'react';
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

  useEffect(() => {
    // Skip if still loading
    if (loading) return;

    // Redirect logic
    if (requireAuth && !isAuthenticated) {
      // Save current path for redirect after login
      sessionStorage.setItem('redirectAfterLogin', pathname);
      router.push('/login');
    } else if (!requireAuth && isAuthenticated) {
      // Redirect from login/register to dashboard if already authenticated
      if (pathname === '/login' || pathname === '/register') {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, loading, pathname, requireAuth, router]);

  // Show nothing while loading or redirecting
  if (loading || (requireAuth && !isAuthenticated)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-16 h-16 border-t-4 border-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return <>{children}</>;
} 