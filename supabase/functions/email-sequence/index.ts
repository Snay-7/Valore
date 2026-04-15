import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const FROM = "Snayder at Valora <hello@valoraplatform.io>";
const BASE_URL = "https://valoraplatform.io";
const CALENDLY = "https://calendly.com/hello-valoraplatform/30min";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  });
  return res.ok;
}

function emailHtml(body: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#F8F9FA;font-family:'Inter',system-ui,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 20px;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:540px;">
  <tr><td style="padding-bottom:28px;">
    <table cellpadding="0" cellspacing="0">
      <tr><td style="background:#252D3F;border-radius:8px;padding:9px 16px;">
        <span style="font-size:16px;font-weight:700;color:#ffffff;letter-spacing:-.02em;">Valora</span>
      </td></tr>
    </table>
  </td></tr>
  <tr><td style="background:#ffffff;border:1px solid #E8EAED;border-radius:12px;padding:36px 40px;">
    ${body}
  </td></tr>
  <tr><td style="padding:24px 0 0;text-align:center;font-size:11px;color:#9AA3AF;line-height:1.6;">
    Valora · Institutional Property Appraisal<br/>
    <a href="${BASE_URL}" style="color:#2A8A64;">valoraplatform.io</a>
  </td></tr>
</table>
</td></tr>
</table>
</body></html>`;
}

function p(t: string) { return `<p style="margin:0 0 16px;font-size:15px;color:#1E2433;line-height:1.7;">${t}</p>`; }
function muted(t: string) { return `<p style="margin:0 0 16px;font-size:14px;color:#5A6478;line-height:1.7;">${t}</p>`; }
function cta(t: string, url: string) {
  return `<table cellpadding="0" cellspacing="0" style="margin:24px 0;"><tr><td style="background:#2A8A64;border-radius:8px;">
    <a href="${url}" style="display:inline-block;padding:13px 28px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;">${t}</a>
  </td></tr></table>`;
}
function divider() { return `<div style="height:1px;background:#E8EAED;margin:24px 0;"></div>`; }
function sig(ps?: string) {
  return `${divider()}<p style="margin:0 0 4px;font-size:14px;color:#1E2433;">Snayder</p>
  <p style="margin:0;font-size:13px;color:#9AA3AF;">Valora</p>
  ${ps ? `<p style="margin:16px 0 0;font-size:13px;color:#9AA3AF;font-style:italic;">${ps}</p>` : ""}`;
}
function dealRow(l: string, v: string) {
  return `<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #F0F2F5;">
    <span style="font-size:13px;color:#5A6478;">${l}</span>
    <span style="font-size:13px;font-weight:600;color:#1E2433;">${v}</span>
  </div>`;
}
function featureBox(title: string, desc: string) {
  return `<div style="background:#F8F9FA;border-radius:8px;padding:14px 16px;margin-bottom:10px;">
    <div style="font-size:13px;font-weight:600;color:#1E2433;margin-bottom:4px;">${title}</div>
    <div style="font-size:13px;color:#5A6478;line-height:1.6;">${desc}</div>
  </div>`;
}

// EMAIL 2 — Day 1, no appraisal — role-aware
function getEmail2(firstName: string, role: string | null): { subject: string; html: string } {
  if (role === "lender") return {
    subject: "The number most borrower appraisals get wrong",
    html: emailHtml(`
      <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#1E2433;letter-spacing:-.02em;">Most borrower models get the finance wrong.</h1>
      ${p("They use a flat interest rate on the total loan — not on the actual drawn balance month by month. On a £20m development loan, that's £200–400k of misrepresented profit. The deal looks better on paper than it is.")}
      ${p("Valora's monthly cashflow engine models actual drawdown. You can see exactly what the borrower's real interest cost is — not what they've assumed.")}
      ${muted("Run a deal from your current pipeline through Valora and see the difference.")}
      ${cta("Open Valora →", `${BASE_URL}/dashboard`)}
      ${sig("Any questions, reply to this email.")}
    `)
  };
  if (role === "hotel_investor" || role === "hotel_asset_manager") return {
    subject: "Normalised vs Actual NOI — why it matters",
    html: emailHtml(`
      <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#1E2433;letter-spacing:-.02em;">The NOI gap is where hotel deals are won or lost.</h1>
      ${p("Most hotel appraisals either use the seller's actual NOI (which may not be sustainable) or a model-built normalised NOI (which may not reflect current performance). The gap between the two defines the underwriting.")}
      ${p("Valora has an Actual NOI mode — input the real operating figure and the model capitalises it directly at exit cap rate. You see the valuation gap immediately.")}
      ${muted("Try it on a deal you're currently looking at.")}
      ${cta("Open Valora →", `${BASE_URL}/dashboard`)}
      ${sig("Any questions, reply to this email.")}
    `)
  };
  if (role === "surveyor") return {
    subject: "The assumption lenders always challenge",
    html: emailHtml(`
      <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#1E2433;letter-spacing:-.02em;">Exit yield. Every time.</h1>
      ${p("In residual valuations, the exit yield assumption drives everything. A 25bps move on a £10m GDV scheme changes the land value by £400–600k. It's the number lenders and clients always push back on first.")}
      ${p("Valora's sensitivity matrix shows the full exit yield × rent range in one grid — 45 scenarios, colour-coded. You can see and defend exactly where the residual stands.")}
      ${muted("Run a residual on any deal and see the sensitivity matrix in action.")}
      ${cta("Open Valora →", `${BASE_URL}/dashboard`)}
      ${sig("Any questions, reply to this email.")}
    `)
  };
  if (role === "advisor") return {
    subject: "The one slide clients always ask for",
    html: emailHtml(`
      <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#1E2433;letter-spacing:-.02em;">Sensitivity. Every client meeting, every deal.</h1>
      ${p("The question is always the same — what happens if yields move 25bps? What if rents come in 10% below forecast? Building that manually takes an hour. Presenting it live in a meeting isn't possible with a static spreadsheet.")}
      ${p("Valora generates a 45-scenario sensitivity matrix automatically — exit yield × rent/ADR, colour-coded RAG. It updates in real time as you change assumptions.")}
      ${muted("Try it on a current client mandate.")}
      ${cta("Open Valora →", `${BASE_URL}/dashboard`)}
      ${sig("Any questions, reply to this email.")}
    `)
  };
  return {
    subject: "The one thing most developers get wrong",
    html: emailHtml(`
      <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#1E2433;letter-spacing:-.02em;">Most property models get the finance wrong.</h1>
      ${p("They use a flat interest rate on the total loan — not on the actual drawn balance month by month. The difference on a £5m scheme can be £80–120k in misrepresented profit.")}
      ${p("Valora uses a true monthly cashflow engine with S-curve drawdown. Interest rolls on what's actually drawn. It's the same method institutional lenders use internally.")}
      ${muted("If you haven't modelled a deal yet, now's a good time to see the difference.")}
      ${cta("Open Valora →", `${BASE_URL}/dashboard`)}
      ${sig("You have 3 free appraisals. No time limit — they're yours.")}
    `)
  };
}

// EMAIL 3 — Day 3, no appraisal — role-aware
function getEmail3(firstName: string, role: string | null): { subject: string; html: string } {
  if (role === "lender") return {
    subject: "Run a borrower deal in 3 minutes",
    html: emailHtml(`
      <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#1E2433;letter-spacing:-.02em;">3 minutes to a full credit view.</h1>
      ${p("Open Valora, pick the asset type, enter purchase price, CapEx, exit cap rate and LTC. DSCR, Debt Yield, peak loan, LTV at exit and the full sensitivity matrix — all instant.")}
      ${muted("A complete independent view of any borrower's deal before credit committee.")}
      ${cta("Try it now →", `${BASE_URL}/dashboard`)}
      ${sig("If you want me to walk through a live deal with you, just reply.")}
    `)
  };
  if (role === "hotel_investor" || role === "hotel_asset_manager") return {
    subject: "Model a hotel deal in 3 minutes",
    html: emailHtml(`
      <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#1E2433;letter-spacing:-.02em;">3 minutes to a full hotel appraisal.</h1>
      ${p("Open Valora, click Hotel, enter rooms, ADR, occupancy, purchase price and exit cap rate. RevPAR, EBITDA, NOI, DSCR and IRR — all instant. Pull live ADR comps for your market with one click.")}
      ${muted("Simple mode for acquisitions. Advanced mode for year-by-year holds.")}
      ${cta("Try it now →", `${BASE_URL}/dashboard`)}
      ${sig("If you want me to walk through a deal with you, reply and I'll jump on a call.")}
    `)
  };
  if (role === "surveyor") return {
    subject: "Run a residual in 60 seconds",
    html: emailHtml(`
      <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#1E2433;letter-spacing:-.02em;">60 seconds to a residual land value.</h1>
      ${p("Open Valora, pick BTR or BTS, enter land cost, build cost PSF, units and sale price PSF. RLV, IRR, profit on cost and the full sensitivity matrix — all live.")}
      ${muted("No formulas. A defensible residual with full assumption set in under a minute.")}
      ${cta("Try it now →", `${BASE_URL}/dashboard`)}
      ${sig("If anything's unclear, reply and I'll walk you through it.")}
    `)
  };
  return {
    subject: "60 seconds to your first numbers",
    html: emailHtml(`
      <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#1E2433;letter-spacing:-.02em;">60 seconds to your first numbers.</h1>
      ${p("Open Valora, click <strong>+ New Appraisal</strong>, pick <strong>Flip</strong>, enter purchase price, refurb cost and expected sale price.")}
      ${muted("IRR, profit on cost, equity multiple — all calculated live. No spreadsheet. No formulas.")}
      ${cta("Try it now →", `${BASE_URL}/dashboard`)}
      ${sig("If anything's unclear or you want me to walk through a deal with you, reply and I'll jump on a call.")}
    `)
  };
}

// EMAIL 4 — Day 7, always — role-aware
function getEmail4(firstName: string, role: string | null): { subject: string; html: string } {
  const features = role === "lender"
    ? [["DSCR / Debt Yield / LTV at exit", "Lender metrics calculated automatically — no formula building required."],
       ["Sensitivity matrix", "Exit cap rate × ADR/rent stress — 45 scenarios. See exactly where the deal breaks."],
       ["AI Sense Check", "Flags aggressive assumptions a credit analyst would challenge. Jurisdiction-aware."]]
    : role === "hotel_investor" || role === "hotel_asset_manager"
    ? [["Hotel Advanced model", "Year-by-year hold — Revenue, EBITDA, FF&E, NOI and exit — every year modelled."],
       ["Live ADR comps", "AI-powered real-time ADR benchmarks — flags if your assumption is above market."],
       ["Actual NOI mode", "Input real operating NOI — see the valuation gap vs normalised instantly."]]
    : role === "surveyor"
    ? [["Residual Land Value", "Automatic RLV with full assumption set — defensible against client challenge."],
       ["Sensitivity matrix", "Exit yield × rent — 45 scenarios showing the range around your headline number."],
       ["AI Sense Check", "Market-aware benchmarking — flags what a lender or client would push back on."]]
    : [["Sensitivity matrices", "45 scenarios of exit yield vs rent, colour-coded RAG. Shows exactly how much room you have."],
       ["AI Sense Check", "Benchmarks your assumptions against market data. Flags what a senior lender would challenge."],
       ["Live investor share links", "Send a link, your investor sees your numbers in real time. No PDF attachments."]];

  return {
    subject: `How's your first week going, ${firstName}?`,
    html: emailHtml(`
      <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#1E2433;letter-spacing:-.02em;">How's your first week going, ${firstName}?</h1>
      ${p("A few things users find most useful that you might not have tried yet:")}
      ${features.map(([t, d]) => featureBox(t, d)).join("")}
      ${muted("All available on the 14-day Pro trial — no card needed to start.")}
      ${cta("Start Pro trial →", `${BASE_URL}/pricing`)}
      <p style="margin:0 0 16px;font-size:13px;color:#9AA3AF;">Or if you'd rather see it live first: <a href="${CALENDLY}" style="color:#2A8A64;">Book a 20-min call →</a></p>
      ${sig()}
    `)
  };
}

// EMAIL 5 — Day 10, not pro — role-aware deal example
function getEmail5(firstName: string, role: string | null): { subject: string; html: string } {
  if (role === "lender") return {
    subject: "A deal we stress-tested through Valora",
    html: emailHtml(`
      <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#1E2433;letter-spacing:-.02em;">A real credit stress test.</h1>
      ${p("Here's a hotel acquisition we ran — Grand Plaza Roma, Via del Corso, €250m.")}
      <div style="background:#F8F9FA;border:1px solid #E8EAED;border-radius:10px;padding:20px;margin-bottom:20px;">
        ${[["Purchase Price","€250m"],["DSCR","2.59×"],["Debt Yield","4.4%"],["LTV at Exit","26.3%"],["IRR (Unlevered)","4.9%"],["IRR (Levered)","1.2%"]].map(([l,v]) => dealRow(l,v)).join("")}
      </div>
      ${p("The sensitivity matrix shows the deal is breakeven at 4% exit cap and current ADR. ADR down 10% and it's deeply negative. That's the story the credit committee needs to see.")}
      ${cta("Open your workspace →", `${BASE_URL}/dashboard`)}
      ${sig()}
    `)
  };
  if (role === "hotel_investor" || role === "hotel_asset_manager") return {
    subject: "A hotel deal we ran through Valora",
    html: emailHtml(`
      <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#1E2433;letter-spacing:-.02em;">A real hotel appraisal.</h1>
      ${p("Grand Plaza Roma, Via del Corso, €250m asking price.")}
      <div style="background:#F8F9FA;border:1px solid #E8EAED;border-radius:10px;padding:20px;margin-bottom:20px;">
        ${[["203 rooms","5 Star · Via del Corso"],["ADR","€480 (+26% vs market avg)"],["EBITDA pa","€13.13m"],["IRR (Levered)","1.2%"],["DSCR","2.59×"]].map(([l,v]) => dealRow(l,v)).join("")}
      </div>
      ${p("AI pulled live ADR comps for Via del Corso — €220–350 range for 5-star. At €480 the asset is 26% above market. The sensitivity matrix shows exactly which scenario matters.")}
      ${cta("Open your workspace →", `${BASE_URL}/dashboard`)}
      ${sig()}
    `)
  };
  return {
    subject: "A deal we ran through Valora",
    html: emailHtml(`
      <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#1E2433;letter-spacing:-.02em;">A real deal, real numbers.</h1>
      ${p("Here's a residential flip we modelled — South Kensington, SW7.")}
      <div style="background:#F8F9FA;border:1px solid #E8EAED;border-radius:10px;padding:20px;margin-bottom:20px;">
        ${[["Purchase","£3.5m"],["Refurb","£800k"],["Target sale","£6.6m"],["Hold period","9 months"]].map(([l,v]) => dealRow(l,v)).join("")}
      </div>
      ${p("Initial numbers showed -9.6% profit on cost. The sensitivity matrix showed why — exit yield 20bps aggressive vs comparable sales. One adjustment and the deal flipped positive.")}
      ${cta("Open your workspace →", `${BASE_URL}/dashboard`)}
      ${sig()}
    `)
  };
}

// EMAIL 6 — Day 14, not pro
function getEmail6(firstName: string, role: string | null): { subject: string; html: string } {
  const features = role === "lender"
    ? ["DSCR / Debt Yield / LTV at exit","Sensitivity matrix — 45 stress scenarios","AI Sense Check","Shareable credit reports","Unlimited deals","Priority support"]
    : role === "hotel_investor" || role === "hotel_asset_manager"
    ? ["Hotel Advanced — year-by-year hold model","Live ADR market comps","Actual NOI mode","IM waterfall / promote structure","Shareable investment memorandums","Unlimited deals"]
    : role === "surveyor"
    ? ["Residual Land Value with full sensitivity","AI market benchmarking","Shareable client reports","All 7 asset models","Unlimited deals","Priority support"]
    : ["Unlimited projects","AI Sense Check","Live investor share links","AI brochure PDF generator","DSCR / ICR and equity multiple","Priority support"];

  return {
    subject: "Your free appraisals don't expire — but this does",
    html: emailHtml(`
      <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#1E2433;letter-spacing:-.02em;">Your 3 free appraisals don't expire.</h1>
      ${p("But the 14-day Pro trial window closes today. After this, starting a trial means committing to a billing cycle.")}
      ${muted("Pro gives you:")}
      <ul style="margin:0 0 20px;padding-left:20px;">
        ${features.map(f => `<li style="font-size:14px;color:#1E2433;line-height:1.8;">${f}</li>`).join("")}
      </ul>
      ${muted("£99/month. Cancel anytime.")}
      ${cta("Start Pro trial — free for 14 days →", `${BASE_URL}/pricing`)}
      ${divider()}
      ${muted("If it's not the right time, no pressure. Come back when you have a deal that needs it.")}
      ${sig("If you have questions about whether Pro is right for you, just reply. Happy to talk it through.")}
    `)
  };
}

// MAIN
serve(async (req) => {
  try {
    const authHeader = req.headers.get("Authorization");
    if (authHeader !== `Bearer ${Deno.env.get("FUNCTION_SECRET")}`) {
      return new Response("Unauthorized", { status: 401 });
    }

    const now = new Date();

    const { data: users, error } = await supabase
      .from("profiles")
      .select("id, full_name, created_at, role")
      .order("created_at", { ascending: false });

    if (error) throw error;

    let sent = 0;

    for (const user of users || []) {
      const { data: authUser } = await supabase.auth.admin.getUserById(user.id);
      const email = authUser?.user?.email;
      if (!email) continue;

      const firstName = (user.full_name || email.split("@")[0]).split(" ")[0];
      const role = user.role || null;
      const signupDate = new Date(user.created_at);
      const daysSinceSignup = Math.floor((now.getTime() - signupDate.getTime()) / (1000 * 60 * 60 * 24));

      const { data: logs } = await supabase
        .from("email_logs").select("email_number").eq("user_id", user.id);
      const sentNumbers = new Set((logs || []).map((l: any) => l.email_number));

      const { count: appraisalCount } = await supabase
        .from("appraisals").select("id", { count: "exact", head: true }).eq("user_id", user.id);

      const { data: profile } = await supabase
        .from("profiles").select("tier").eq("id", user.id).single();
      const isPro = profile?.tier === "professional" || profile?.tier === "enterprise";

      let emailToSend: { subject: string; html: string } | null = null;
      let emailNumber: number | null = null;

      // Email 1 Day 0 — handled by /api/welcome route (role-based PDF)
      if (daysSinceSignup === 1 && !sentNumbers.has(2) && (appraisalCount || 0) === 0) {
        emailToSend = getEmail2(firstName, role); emailNumber = 2;
      } else if (daysSinceSignup === 3 && !sentNumbers.has(3) && (appraisalCount || 0) === 0) {
        emailToSend = getEmail3(firstName, role); emailNumber = 3;
      } else if (daysSinceSignup === 7 && !sentNumbers.has(4)) {
        emailToSend = getEmail4(firstName, role); emailNumber = 4;
      } else if (daysSinceSignup === 10 && !sentNumbers.has(5) && !isPro) {
        emailToSend = getEmail5(firstName, role); emailNumber = 5;
      } else if (daysSinceSignup === 14 && !sentNumbers.has(6) && !isPro) {
        emailToSend = getEmail6(firstName, role); emailNumber = 6;
      }

      if (emailToSend && emailNumber) {
        const ok = await sendEmail(email, emailToSend.subject, emailToSend.html);
        if (ok) {
          await supabase.from("email_logs").insert({ user_id: user.id, email_number: emailNumber });
          sent++;
        }
      }
    }

    return new Response(JSON.stringify({ ok: true, sent, users: users?.length || 0 }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500, headers: { "Content-Type": "application/json" },
    });
  }
});
