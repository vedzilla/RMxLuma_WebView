import { type NextRequest } from 'next/server';
import { updateSession } from '@/supabase_lib/auth/middleware';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Run middleware on all routes EXCEPT:
     *  - _next/static, _next/image (Next.js internals)
     *  - favicon.ico, logos/, images (static assets)
     *  - auth/callback (must complete OAuth exchange uninterrupted)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|logos/|images/|auth/callback).*)',
  ],
};
