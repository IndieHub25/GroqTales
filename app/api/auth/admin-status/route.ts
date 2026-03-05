import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/auth/admin-status
 *
 * Returns whether the caller has a valid server-side admin session.
 * Relies on the httpOnly-style cookies set by the admin login flow
 * and the Next.js middleware – never trusts client-set localStorage.
 */
export async function GET(request: NextRequest) {
  const cookies = request.cookies;
  const sessionActive = cookies.get('adminSessionActive')?.value === 'true';
  const sessionToken = cookies.get('adminSessionToken')?.value;

  const isAdmin = sessionActive && !!sessionToken;

  return NextResponse.json({ isAdmin });
}
