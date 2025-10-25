// components/AuthGuard.tsx
"use client";

import { useUser } from '@/hooks/useUser';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export default function AuthGuard({ children, redirectTo = '/login' }: AuthGuardProps) {
  const { user, loading, session } = useUser();
  const router = useRouter();

  useEffect(() => {
    console.log('AuthGuard: user:', user?.id, 'loading:', loading, 'session:', !!session);
    console.log('AuthGuard: Full user object:', user);
    console.log('AuthGuard: Full session object:', session);
    
    // Only redirect if we're done loading and have no user/session
    if (!loading && !user && !session) {
      console.log('AuthGuard: Redirecting to login');
      router.push(redirectTo);
    }
  }, [user, loading, session, router, redirectTo]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-emerald-600" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show loading while redirecting
  if (!user && !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-emerald-600" />
          <p className="text-gray-600 dark:text-gray-400">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // User is authenticated, render children
  return <>{children}</>;
}
