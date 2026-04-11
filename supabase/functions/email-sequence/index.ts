import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const FROM = "Isnayder at Valora <hello@valoraplatform.io>";
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
<html><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
</head>
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
    Valora · Professional Property Development Appraisal<br/>
    <a href="${BASE_URL}" style="color:#2A8A64;">valoraplatform.io</a>
  </td></tr>
</table>
</td></tr>
</table>
</body></html>`;
}

function p(text: string) {
  return `<p style="margin:0 0 16px;font-size:15px;color:#1E2433;line-height:1.7;">${text}</p>`;
}
function muted(text: string) {
  return `<p style="margin:0 0 16px;font-size:14px;color:#5A6478;line-height:1.7;">${text}</p>`;
}
function cta(text: string, url: string) {
  return `<table cellpadding="0" cellspacing="0" style="margin:24px 0;">
    <tr><td style="background:#2A8A64;border-radius:8px;">
      <a href="${url}" style="display:inline-block;padding:13px 28px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;">${text}</a>
    </td></tr>
  </table>`;
}
function divider() {
  return `<div style="height:1px;background:#E8EAED;margin:24px 0;"></div>`;
}
function sig(ps?: string) {
  return `${divider()}<p style="margin:0 0 4px;font-size:14px;color:#1E2433;">Isnayder</p>
  <p style="margin:0;font-size:13px;color:#9AA3AF;">Valora</p>
  ${ps ? `<p style="margin:16px 0 0;font-size:13px;color:#9AA3AF;font-style:italic;">${ps}</p>` : ""}`;
}

function getEmail1(firstName: string): { subject: string; html: string } {
  return {
    subject: "Your Valora workspace is ready",
    html: emailHtml(`
      <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#1E2433;letter-spacing:-.02em;">Your workspace is ready, ${firstName}.</h1>
      ${p("Three full appraisals, all 7 models, no credit card.")}
      ${muted("The fastest way to get started: pick a deal you're already looking at and model it. Takes about 3 minutes.")}
      ${cta("Model my first deal →", `${BASE_URL}/dashboard`)}
      ${muted("Not sure which model to use?")}
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
        ${[["BTR / BTS","Residential development"],["Hotel","Acquisition & repositioning"],["Flip","Quick refurb & exit"],["Mixed Use","Mixed-income schemes"],["Commercial","Office, retail, industrial"]].map(([m,d]) =>
          `<tr style="border-bottom:1px solid #F0F2F5;">
            <td style="padding:8px 0;font-size:13px;font-weight:600;color:#1E2433;width:120px;">${m}</td>
            <td style="padding:8px 0;font-size:13px;color:#5A6478;">${d}</td>
          </tr>`
        ).join("")}
      </table>
      ${sig("Any questions, just reply to this email.")}
    `),
  };
}

function getEmail2(firstName: string): { subject: string; html: string } {
  return {
    subject: "The one thing most developers get wrong",
    html: emailHtml(`
      <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#1E2433;letter-spacing:-.02em;">Most property models get the finance wrong.</h1>
      ${p("They use a flat interest rate on the total loan — not on the actual drawn balance month by month. The difference on a £5m scheme can be £80–120k in misrepresented profit.")}
      ${p("Valora uses a true monthly cashflow engine with S-curve drawdown. Interest rolls on what's actually drawn, not the peak balance. It's the same method institutional lenders use internally.")}
      ${muted("If you haven't modelled a deal yet, now's a good time to see the difference.")}
      ${cta("Open Valora →", `${BASE_URL}/dashboard`)}
      ${sig("You have 3 free appraisals. No time limit — they're yours.")}
    `),
  };
}

function getEmail3(firstName: string): { subject: string; html: string } {
  return {
    subject: "60 seconds to your first numbers",
    html: emailHtml(`
      <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#1E2433;letter-spacing:-.02em;">60 seconds to your first numbers.</h1>
      ${p("Open Valora, click <strong>+ New Appraisal</strong>, pick <strong>Flip</strong> (it's the fastest model), enter:")}
      <ul style="margin:0 0 20px;padding-left:20px;">
        <li style="font-size:14px;color:#1E2433;line-height:1.8;">Purchase price</li>
        <li style="font-size:14px;color:#1E2433;line-height:1.8;">Refurb cost</li>
        <li style="font-size:14px;color:#1E2433;line-height:1.8;">Expected sale price</li>
      </ul>
      ${muted("That's it. IRR, profit on cost, equity multiple — all calculated live. No spreadsheet. No formulas.")}
      ${cta("Try it now →", `${BASE_URL}/dashboard`)}
      ${sig("If anything's unclear or you want me to walk through a deal with you, reply and I'll jump on a call.")}
    `),
  };
}

function getEmail4(firstName: string): { subject: string; html: string } {
  return {
    subject: "How's your first week going?",
    html: emailHtml(`
      <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#1E2433;letter-spacing:-.02em;">How's your first week going, ${firstName}?</h1>
      ${p("A few things Pro users find most useful that you might not have tried yet:")}
      ${[
        ["Sensitivity matrices","45 scenarios of exit yield vs rent, colour-coded RAG. Shows exactly how much room you have before a deal breaks."],
        ["AI Sense Check","Benchmarks your assumptions against market data. Flags what a senior lender would challenge before you're in the room."],
        ["Live investor share links","Send a link, your investor sees your numbers in real time. No PDF attachments, no stale versions."],
      ].map(([title, desc]) => `
        <div style="background:#F8F9FA;border-radius:8px;padding:14px 16px;margin-bottom:10px;">
          <div style="font-size:13px;font-weight:600;color:#1E2433;margin-bottom:4px;">${title}</div>
          <div style="font-size:13px;color:#5A6478;line-height:1.6;">${desc}</div>
        </div>`
      ).join("")}
      ${muted("All available on the 14-day Pro trial — no card needed to start.")}
      ${cta("Start Pro trial →", `${BASE_URL}/pricing`)}
      <p style="margin:0 0 16px;font-size:13px;color:#9AA3AF;">Or if you'd rather see it live first: <a href="${CALENDLY}" style="color:#2A8A64;">Book a 20-min call →</a></p>
      ${sig()}
    `),
  };
}

function getEmail5(firstName: string): { subject: string; html: string } {
  return {
    subject: "A deal we ran through Valora",
    html: emailHtml(`
      <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#1E2433;letter-spacing:-.02em;">A real deal, real numbers.</h1>
      ${p("Here's a residential flip we modelled — South Kensington, SW7.")}
      <div style="background:#F8F9FA;border:1px solid #E8EAED;border-radius:10px;padding:20px;margin-bottom:20px;">
        ${[["Purchase","£3.5m"],["Refurb","£800k"],["Target sale","£6.6m"],["Hold period","9 months"]].map(([l,v]) =>
          `<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #F0F2F5;">
            <span style="font-size:13px;color:#5A6478;">${l}</span>
            <span style="font-size:13px;font-weight:600;color:#1E2433;">${v}</span>
          </div>`
        ).join("")}
      </div>
      ${p("Initial numbers showed -9.6% profit on cost. The sensitivity matrix showed why — the exit yield assumption was 20bps aggressive vs comparable sales. One adjustment and the deal flipped positive.")}
      ${muted("That's what the tool is for. Not to rubber-stamp deals — to stress test them before you're committed.")}
      ${cta("Open your workspace →", `${BASE_URL}/dashboard`)}
      ${muted("Need more than 3 appraisals? Pro is £99/month with a 14-day free trial.")}
      <p style="margin:0;font-size:13px;"><a href="${BASE_URL}/pricing" style="color:#2A8A64;">See what's on Pro →</a></p>
      ${sig()}
    `),
  };
}

function getEmail6(firstName: string): { subject: string; html: string } {
  return {
    subject: "Your free appraisals don't expire — but this does",
    html: emailHtml(`
      <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#1E2433;letter-spacing:-.02em;">Your 3 free appraisals don't expire.</h1>
      ${p("But the 14-day Pro trial window closes today. After this, starting a trial means committing to a billing cycle.")}
      ${muted("Pro gives you:")}
      <ul style="margin:0 0 20px;padding-left:20px;">
        ${["Unlimited projects","AI Sense Check","Live investor share links","AI brochure PDF generator","DSCR / ICR and equity multiple","Priority support"].map(f =>
          `<li style="font-size:14px;color:#1E2433;line-height:1.8;">${f}</li>`
        ).join("")}
      </ul>
      ${muted("£99/month. Cancel anytime.")}
      ${cta("Start Pro trial — free for 14 days →", `${BASE_URL}/pricing`)}
      ${divider()}
      ${muted("If it's not the right time, no pressure. Come back when you have a deal that needs it.")}
      ${sig("If you have questions about whether Pro is right for you, just reply. Happy to talk it through.")}
    `),
  };
}

serve(async (req) => {
  try {
    // Auth check — only allow from cron or internal calls
    const authHeader = req.headers.get("Authorization");
    if (authHeader !== `Bearer ${Deno.env.get("FUNCTION_SECRET")}`) {
      return new Response("Unauthorized", { status: 401 });
    }

    const now = new Date();

    // Get all users with their profiles
    const { data: users, error } = await supabase
      .from("profiles")
      .select("id, full_name, created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;

    let sent = 0;

    for (const user of users || []) {
      // Get user email from auth
      const { data: authUser } = await supabase.auth.admin.getUserById(user.id);
      const email = authUser?.user?.email;
      if (!email) continue;

      const firstName = (user.full_name || email.split("@")[0]).split(" ")[0];
      const signupDate = new Date(user.created_at);
      const daysSinceSignup = Math.floor((now.getTime() - signupDate.getTime()) / (1000 * 60 * 60 * 24));

      // Get already sent emails
      const { data: logs } = await supabase
        .from("email_logs")
        .select("email_number")
        .eq("user_id", user.id);
      const sentNumbers = new Set((logs || []).map((l: any) => l.email_number));

      // Get appraisals count
      const { count: appraisalCount } = await supabase
        .from("appraisals")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);

      // Get tier
      const { data: profile } = await supabase
        .from("profiles")
        .select("tier")
        .eq("id", user.id)
        .single();
      const isPro = profile?.tier === "professional" || profile?.tier === "enterprise";

      let emailToSend: { subject: string; html: string } | null = null;
      let emailNumber: number | null = null;

      // Email 1 — Day 0
      if (daysSinceSignup === 0 && !sentNumbers.has(1)) {
        emailToSend = getEmail1(firstName);
        emailNumber = 1;
      }
      // Email 2 — Day 1, no appraisal
      else if (daysSinceSignup === 1 && !sentNumbers.has(2) && (appraisalCount || 0) === 0) {
        emailToSend = getEmail2(firstName);
        emailNumber = 2;
      }
      // Email 3 — Day 3, no appraisal
      else if (daysSinceSignup === 3 && !sentNumbers.has(3) && (appraisalCount || 0) === 0) {
        emailToSend = getEmail3(firstName);
        emailNumber = 3;
      }
      // Email 4 — Day 7, always
      else if (daysSinceSignup === 7 && !sentNumbers.has(4)) {
        emailToSend = getEmail4(firstName);
        emailNumber = 4;
      }
      // Email 5 — Day 10, not pro
      else if (daysSinceSignup === 10 && !sentNumbers.has(5) && !isPro) {
        emailToSend = getEmail5(firstName);
        emailNumber = 5;
      }
      // Email 6 — Day 14, not pro
      else if (daysSinceSignup === 14 && !sentNumbers.has(6) && !isPro) {
        emailToSend = getEmail6(firstName);
        emailNumber = 6;
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
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
