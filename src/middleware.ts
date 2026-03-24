import { type NextRequest } from 'next/server';
import { updateSession } from '@/supabase_lib/auth/middleware';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: ['/admin/:path*', '/society/:path*', '/onboarding'],
};
