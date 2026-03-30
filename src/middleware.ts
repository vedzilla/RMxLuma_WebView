import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Demo mode — no auth gating, pass through all requests
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
