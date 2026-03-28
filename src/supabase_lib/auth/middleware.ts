import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { isAdmin, checkUserProfileExists } from '@/supabase_lib/users';

export function createMiddlewareClient(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  return { supabase, response };
}

export async function updateSession(request: NextRequest) {
  const { supabase, response } = createMiddlewareClient(request);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/auth';
      return NextResponse.redirect(url);
    }

    // Verify the user has admin role
    if (!(await isAdmin(supabase, user.id))) {
      await supabase.auth.signOut();
      const url = request.nextUrl.clone();
      url.pathname = '/auth';
      url.searchParams.set('error', 'unauthorized');
      return NextResponse.redirect(url);
    }
  }

  if (request.nextUrl.pathname.startsWith('/society')) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/auth';
      return NextResponse.redirect(url);
    }
    // No admin role check — any authenticated user is allowed
  }

  if (request.nextUrl.pathname.startsWith('/onboarding')) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/auth';
      return NextResponse.redirect(url);
    }
    // Already on onboarding — let through
    return response;
  }

  // Global guard: authenticated user with no profile → force onboarding
  if (user && !request.nextUrl.pathname.startsWith('/auth')) {
    const profileExists = await checkUserProfileExists(supabase, user.id);
    if (!profileExists) {
      const url = request.nextUrl.clone();
      url.pathname = '/onboarding';
      return NextResponse.redirect(url);
    }
  }

  return response;
}
