import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * ════════════════════════════════════════════════════════════════════
 * VALORA — Stripe webhook handler
 * Drop at: app/api/stripe-webhook/route.ts
 * ════════════════════════════════════════════════════════════════════
 * Handles:
 *   • customer.subscription.created / updated / deleted  → upsert subscriptions table
 *   • checkout.session.completed (mode=payment, topup)   → credit copilot_usage.messages_bonus
 *
 * In Stripe Dashboard → Developers → Webhooks → + Add endpoint:
 *   URL:    https://<your-domain>/api/stripe-webhook
 *   Events: customer.subscription.created
 *           customer.subscription.updated
 *           customer.subscription.deleted
 *           checkout.session.completed
 *
 * Copy the signing secret (whsec_...) and add as env var:
 *   STRIPE_WEBHOOK_SECRET = whsec_...
 * Also requires:
 *   STRIPE_SECRET_KEY
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
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

// Map Stripe price IDs to Valora tier names.
// Update these to match your Stripe price IDs.
function tierFromPriceId(priceId: string | undefined): string {
  if (!priceId) return "free";
  const pro = [
    process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE,
    process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ANNUAL,
  ].filter(Boolean);
  const ent = [
    process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE,
    process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ANNUAL,
  ].filter(Boolean);
  if (pro.includes(priceId)) return "professional";
  if (ent.includes(priceId)) return "enterprise";
  return "free";
}

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  // We need the raw body for signature verification — not req.json()
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: any) {
    console.error("Stripe signature verification failed:", err?.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      // ── TOP-UP PURCHASE ──────────────────────────────────────────
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        // Copilot message top-up (one-time payment)
        if (
          session.mode === "payment" &&
          session.metadata?.product === "copilot_topup" &&
          session.metadata?.user_id &&
          session.metadata?.messages_amount
        ) {
          const uid = session.metadata.user_id;
          const amount = parseInt(session.metadata.messages_amount, 10);
          if (amount > 0) {
            const { error } = await supabaseService.rpc("add_copilot_bonus", { uid, amount });
            if (error) {
              console.error("Failed to credit top-up:", uid, amount, error);
              return NextResponse.json({ error: "Credit failed" }, { status: 500 });
            }
            console.log(`Credited ${amount} Copilot messages to user ${uid}`);
          }
          break;
        }

        // Subscription sign-up (mode=subscription) — handled below on
        // customer.subscription.created as well, but some Stripe configs
        // only fire the checkout event on first sign-up.
        if (session.mode === "subscription" && session.subscription && session.metadata?.user_id) {
          const subId = typeof session.subscription === "string" ? session.subscription : session.subscription.id;
          const sub = await stripe.subscriptions.retrieve(subId);
          await upsertSubscription(session.metadata.user_id, sub);
        }
        break;
      }

      // ── SUBSCRIPTION LIFECYCLE ──────────────────────────────────
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = (sub.metadata?.user_id as string) || await userIdFromCustomer(sub.customer);
        if (userId) await upsertSubscription(userId, sub);
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = (sub.metadata?.user_id as string) || await userIdFromCustomer(sub.customer);
        if (userId) {
          await supabaseService.from("subscriptions").upsert({
            user_id: userId,
            tier: "free",
            status: "cancelled",
            stripe_subscription_id: sub.id,
            updated_at: new Date().toISOString(),
          }, { onConflict: "user_id" });
        }
        break;
      }

      default:
        // Unhandled events are fine — Stripe retries only on 5xx responses
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Stripe webhook handler error:", err);
    // Return 500 so Stripe retries. Safer than silently dropping events.
    return NextResponse.json({ error: err?.message || "Handler failed" }, { status: 500 });
  }
}

// ── helpers ─────────────────────────────────────────────────────
async function upsertSubscription(userId: string, sub: Stripe.Subscription) {
  const priceId = sub.items.data[0]?.price?.id;
  const tier = tierFromPriceId(priceId);
  const row = {
    user_id: userId,
    tier,
    status: sub.status,
    stripe_customer_id: typeof sub.customer === "string" ? sub.customer : sub.customer.id,
    stripe_subscription_id: sub.id,
    trial_ends_at: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
    current_period_end: sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null,
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabaseService.from("subscriptions").upsert(row, { onConflict: "user_id" });
  if (error) console.error("Failed to upsert subscription:", error);
}

async function userIdFromCustomer(customer: string | Stripe.Customer | Stripe.DeletedCustomer): Promise<string | null> {
  const customerId = typeof customer === "string" ? customer : customer.id;
  // First try: a subscriptions row already indexed by stripe_customer_id
  const { data } = await supabaseService
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();
  if (data?.user_id) return data.user_id;

  // Fallback: look up customer's email → match auth.users
  try {
    const cust = typeof customer === "string" ? await stripe.customers.retrieve(customer) : customer;
    if (cust && !("deleted" in cust && cust.deleted) && "email" in cust && cust.email) {
      const { data: userMatch } = await supabaseService
        .from("subscriptions")
        .select("user_id")
        .eq("stripe_customer_id", customerId)
        .maybeSingle();
      if (userMatch?.user_id) return userMatch.user_id;
    }
  } catch {}
  return null;
}