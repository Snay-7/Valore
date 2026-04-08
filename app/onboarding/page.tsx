import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const nextParam = searchParams.get('next')

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options))
        },
      },
    }
  )

  // ── Handle email confirmation (token_hash flow) ──
  if (token_hash && type) {
    const { data, error } = await supabase.auth.verifyOtp({ token_hash, type: type as any })
    if (!error && data?.user) {
      const { count } = await supabase
        .from('appraisals')
        .select('id', { count: 'exact', head: true })
        .eq('created_by', data.user.id)

      const redirectTo = nextParam ?? ((count ?? 0) === 0 ? '/onboarding' : '/dashboard')
      return NextResponse.redirect(`${origin}${redirectTo}`)
    }
    // Confirmation failed
    return NextResponse.redirect(`${origin}/?error=confirmation_failed`)
  }

  // ── Handle OAuth / magic link (code flow) ──
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && data?.user) {
      const user = data.user
      const email = user.email
      const firstName = user.user_metadata?.full_name?.split(' ')[0] || ''

      const isNewUser = (Date.now() - new Date(user.created_at).getTime()) < 60_000

      if (email && isNewUser) {
        try {
          await fetch(`${origin}/api/welcome`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, firstName }),
          })
        } catch (e) {
          console.error('Welcome email failed:', e)
        }
      }

      const { count } = await supabase
        .from('appraisals')
        .select('id', { count: 'exact', head: true })
        .eq('created_by', user.id)

      const redirectTo = nextParam ?? ((count ?? 0) === 0 ? '/onboarding' : '/dashboard')
      return NextResponse.redirect(`${origin}${redirectTo}`)
    }
  }

  return NextResponse.redirect(`${origin}/`)
}
