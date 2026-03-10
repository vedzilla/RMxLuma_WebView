import { createAuthServerClient } from '@/supabase_lib/auth/server';
import { isAdmin } from '@/supabase_lib/users';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/admin';

  if (code) {
    const supabase = await createAuthServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Check that the authenticated user has an admin role
      const { data: { user } } = await supabase.auth.getUser();

      if (!user || !(await isAdmin(supabase, user.id))) {
        // Not an admin — sign them out and redirect with error
        await supabase.auth.signOut();
        return NextResponse.redirect(`${origin}/auth?error=unauthorized`);
      }

      const forwardedHost = request.headers.get('x-forwarded-host');
      if (forwardedHost) {
        const proto = request.headers.get('x-forwarded-proto') || 'https';
        return NextResponse.redirect(`${proto}://${forwardedHost}${next}`);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth?error=auth_code_error`);
}
