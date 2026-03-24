import { createAuthServerClient } from '@/supabase_lib/auth/server';
import { isAdmin, checkUserProfileExists } from '@/supabase_lib/users';
import { NextResponse } from 'next/server';

// Simple in-memory rate limiter for the auth callback
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 10; // max 10 requests per IP per minute

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

export async function GET(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (isRateLimited(ip)) {
    return new NextResponse('Too many requests', { status: 429 });
  }

  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = await createAuthServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // 1. Admin → /admin
        if (await isAdmin(supabase, user.id)) {
          return NextResponse.redirect(`${origin}/admin`);
        }

        // 2. Society account holder → /society
        const { data: societyAccounts } = await supabase
          .from('society_accounts')
          .select('id')
          .eq('auth_user_id', user.id)
          .limit(1);

        if (societyAccounts && societyAccounts.length > 0) {
          return NextResponse.redirect(`${origin}/society`);
        }

        // 3. Onboarded student → /discover, new student → /onboarding
        const profileExists = await checkUserProfileExists(supabase, user.id);
        const destination = profileExists ? '/discover' : '/onboarding';
        return NextResponse.redirect(`${origin}${destination}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/auth?error=auth_code_error`);
}
