import { NextRequest, NextResponse } from "next/server";

// Supabase calls this webhook on every auth event
// Set this URL in Supabase → Authentication → Hooks → Send Email Hook
// or use Database Webhooks on the auth.users table

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Supabase auth webhook payload
    const event = body?.type || body?.event;
    const user = body?.record || body?.data?.user;

    // Only fire on new user signup
    if (event !== "INSERT" && event !== "SIGNED_UP") {
      return NextResponse.json({ received: true });
    }

    if (!user?.email) {
      return NextResponse.json({ received: true });
    }

    const email = user.email;
    const firstName = user.raw_user_meta_data?.full_name?.split(" ")[0] || "";

    // Fire welcome email
    const welcomeRes = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || "https://valoraplatform.io"}/api/welcome`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, firstName }),
      }
    );

    if (!welcomeRes.ok) {
      console.error("Welcome email failed:", await welcomeRes.text());
    }

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
