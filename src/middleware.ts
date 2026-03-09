import { NextResponse, type NextRequest } from 'next/server';

// No-op for now — admin auth is client-side via sessionStorage.
// Replace with Supabase auth checks when real auth is implemented.
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
