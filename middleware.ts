import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Protect admin routes
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!session) {
      // Not logged in, redirect to login
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // Check if user is admin (usa@furnitures.com)
    const userEmail = session.user.email;
    if (userEmail !== 'usa@furnitures.com') {
      // Not an admin, redirect to home
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  // Protect user routes (require login)
  if (req.nextUrl.pathname.startsWith('/user')) {
    if (!session) {
      // Not logged in, redirect to login
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ['/admin/:path*', '/user/:path*'],
};
