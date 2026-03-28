import { createAuthServerClient } from '@/supabase_lib/auth/server';
import { isAdmin, checkUserProfileExists } from '@/supabase_lib/users';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  console.log('[auth/callback] origin:', origin, '| code present:', !!code);

  if (code) {
    const supabase = await createAuthServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    console.log('[auth/callback] exchangeCode error:', error?.message ?? 'none');

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('[auth/callback] user:', user?.id ?? 'null');

      if (user) {
        // 1. Admin → /admin
        const admin = await isAdmin(supabase, user.id);
        console.log('[auth/callback] isAdmin:', admin);
        if (admin) {
          const url = `${origin}/admin`;
          console.log('[auth/callback] redirecting to:', url);
          return NextResponse.redirect(url);
        }

        // 2. Society account holder → /society
        const { data: societyAccounts } = await supabase
          .from('society_accounts')
          .select('id')
          .eq('auth_user_id', user.id)
          .limit(1);
        console.log('[auth/callback] societyAccounts:', societyAccounts?.length ?? 0);

        if (societyAccounts && societyAccounts.length > 0) {
          const url = `${origin}/society`;
          console.log('[auth/callback] redirecting to:', url);
          return NextResponse.redirect(url);
        }

        // 3. Onboarded student → /discover, new student → /onboarding
        const profileExists = await checkUserProfileExists(supabase, user.id);
        const destination = profileExists ? '/discover' : '/onboarding';
        const url = `${origin}${destination}`;
        console.log('[auth/callback] profileExists:', profileExists, '| redirecting to:', url);
        return NextResponse.redirect(url);
      }
    }
  }

  const url = `${origin}/auth?error=auth_code_error`;
  console.log('[auth/callback] fallback redirect to:', url);
  return NextResponse.redirect(url);
}
