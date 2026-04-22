import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * ════════════════════════════════════════════════════════════════════
 * VALORA — Copilot top-up checkout
 * Drop at: app/api/topup/route.ts
 * ════════════════════════════════════════════════════════════════════
 * Creates a Stripe one-time checkout session for a message-pack purchase.
 * On successful payment, Stripe fires checkout.session.completed with
 * metadata.messages_amount — handled in your Stripe webhook (add the
 * snippet from stripe-webhook-topup-handler.ts).
 *
 * Pack options (change PACKS below to retune):
 *   +50   messages  — $9
 *   +250  messages  — $29  (best value)
 *   +1000 messages  — $89
 *
 * Required env:
 *   STRIPE_SECRET_KEY
 *   NEXT_PUBLIC_STRIPE_TOPUP_50_PRICE       (Stripe price ID — one-time)
 *   NEXT_PUBLIC_STRIPE_TOPUP_250_PRICE
 *   NEXT_PUBLIC_STRIPE_TOPUP_1000_PRICE
 *   NEXT_PUBLIC_SITE_URL  (for success/cancel URLs)
 *   SUPABASE_SERVICE_ROLE_KEY
 *   NEXT_PUBLIC_SUPABASE_URL
 * ════════════════════════════════════════════════════════════════════
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-12-18.acacia",
});

const supabaseService = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  { auth: { persistSession: false, autoRefreshToken: false } }
);

type PackId = "50" | "250" | "1000";

const PACKS: Record<PackId, { amount: number; priceEnv: string; label: string }> = {
  "50":   { amount: 50,   priceEnv: "NEXT_PUBLIC_STRIPE_TOPUP_50_PRICE",   label: "50 Copilot messages" },
  "250":  { amount: 250,  priceEnv: "NEXT_PUBLIC_STRIPE_TOPUP_250_PRICE",  label: "250 Copilot messages" },
  "1000": { amount: 1000, priceEnv: "NEXT_PUBLIC_STRIPE_TOPUP_1000_PRICE", label: "1000 Copilot messages" },
};

export async function POST(req: Request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }

  // Auth the user
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return NextResponse.json({ error: "Missing Authorization header" }, { status: 401 });
  const { data: authData, error: authError } = await supabaseService.auth.getUser(token);
  if (authError || !authData?.user) return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  const user = authData.user;

  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const packId = body.pack as PackId;
  const pack = PACKS[packId];
  if (!pack) return NextResponse.json({ error: "Unknown pack id. Use 50, 250, or 1000." }, { status: 400 });

  const priceId = process.env[pack.priceEnv];
  if (!priceId) {
    return NextResponse.json({ error: `Missing Stripe price env: ${pack.priceEnv}` }, { status: 500 });
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: user.email || undefined,
      success_url: `${origin}/dashboard?topup=success&amount=${pack.amount}`,
      cancel_url: `${origin}/dashboard?topup=cancelled`,
      metadata: {
        user_id: user.id,
        messages_amount: String(pack.amount),
        product: "copilot_topup",
      },
    });
    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe topup checkout error:", err);
    return NextResponse.json({ error: err?.message || "Checkout failed" }, { status: 500 });
  }
}
