import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  // Create a response object that we can modify
  let supabaseResponse = NextResponse.next({
    request: req,
  });

  // Create the Supabase client with cookie handling
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            req.cookies.set(name, value);
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // CRITICAL: This refreshes the session if needed and updates cookies
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Define protected routes
  const protectedRoutes = ['/company-dashboard', '/volunteer-dashboard'];
  const isProtectedRoute = protectedRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  );

  // Check authentication for protected routes
  if (isProtectedRoute && !session) {
    console.log('Middleware: No session found, redirecting to login');
    const redirectUrl = new URL('/login', req.url);
    // Optional: Add redirect parameter to return user after login
    redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Optional: Redirect authenticated users away from auth pages
  const authPages = ['/login', '/signup', '/volunteer-signup', '/company-signup'];
  const isAuthPage = authPages.some(page => req.nextUrl.pathname.startsWith(page));

  if (isAuthPage && session) {
    console.log('Middleware: User already authenticated, redirecting to dashboard');

    // Check user's role from metadata and redirect accordingly
    const userRole = session.user?.user_metadata?.role;
    console.log('Middleware: User role from metadata:', userRole);

    if (userRole === 'volunteer') {
      return NextResponse.redirect(new URL('/volunteer-dashboard', req.url));
    } else if (userRole === 'company') {
      return NextResponse.redirect(new URL('/company-dashboard', req.url));
    }

    // Fallback: default to company dashboard if no role found
    return NextResponse.redirect(new URL('/company-dashboard', req.url));
  }

  // Return the response with updated cookies
  return supabaseResponse;
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (if you want middleware to run on API routes, remove this)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};