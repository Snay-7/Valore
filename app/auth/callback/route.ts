import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const nextParam = searchParams.get('next')

  if (code) {
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

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && data?.user) {
      const user = data.user
      const email = user.email
      const firstName = user.user_metadata?.full_name?.split(" ")[0] || ""

      const isNewUser = user.created_at === user.updated_at ||
        (Date.now() - new Date(user.created_at).getTime()) < 60_000

      if (email && isNewUser) {
        try {
          await fetch(`${origin}/api/welcome`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, firstName }),
          })
        } catch (e) {
          console.error("Welcome email failed:", e)
        }
      }

      // New users → onboarding, existing users → dashboard (or custom next param)
      const redirectTo = nextParam ?? (isNewUser ? '/onboarding' : '/dashboard')
      return NextResponse.redirect(`${origin}${redirectTo}`)
    }
  }

  return NextResponse.redirect(`${origin}/`)
}
