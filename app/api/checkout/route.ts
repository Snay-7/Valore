import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-06-20",
});

export async function POST(req: NextRequest) {
  try {
    const { priceId, userId, userEmail, tier } = await req.json();

    if (!priceId || !userId || !userEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: userEmail,
      client_reference_id: userId,
      metadata: { userId, tier },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://valoraplatform.io"}/dashboard?subscribed=true&tier=${tier}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://valoraplatform.io"}/pricing?cancelled=true`,
      subscription_data: {
        metadata: { userId, tier },
        trial_period_days: 14,
      },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Checkout error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
