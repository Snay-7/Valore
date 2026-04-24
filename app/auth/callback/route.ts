// ═══════════════════════════════════════════════════════════════════
// VALORA — AUTH CALLBACK ROUTE HANDLER
// Handles Supabase OAuth / magic-link / email-confirmation callbacks.
// Exchanges the `code` query param for a session, then redirects.
// Location: app/auth/callback/route.ts
// ═══════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';
  const errorParam = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  if (errorParam) {
    console.error('[auth/callback] OAuth error:', errorParam, errorDescription);
    return NextResponse.redirect(new URL(`/auth?error=confirmation_failed`, origin));
  }

  if (code) {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('[auth/callback] exchangeCodeForSession error:', error.message);
      return NextResponse.redirect(new URL(`/auth?error=confirmation_failed`, origin));
    }

    return NextResponse.redirect(new URL(next, origin));
  }

  return NextResponse.redirect(new URL('/auth', origin));
}