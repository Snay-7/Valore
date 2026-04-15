import { NextRequest, NextResponse } from "next/server";

const ROLE_PDF: Record<string, string> = {
  developer:           "https://valoraplatform.io/guides/Valora_For_Developers-2.pdf",
  lender:              "https://valoraplatform.io/guides/Valora_For_Lenders-2.pdf",
  advisor:             "https://valoraplatform.io/guides/Valora_For_Advisors-2.pdf",
  surveyor:            "https://valoraplatform.io/guides/Valora_For_Surveyors-2.pdf",
  hotel_investor:      "https://valoraplatform.io/guides/Valora_For_HotelInvestors-2.pdf",
  hotel_asset_manager: "https://valoraplatform.io/guides/Valora_For_HotelAssetManagers-2.pdf",
};

const ROLE_LABEL: Record<string, string> = {
  developer:           "Developer / Sponsor",
  lender:              "Lender / Debt Fund",
  advisor:             "Advisor / Investment Manager",
  surveyor:            "Surveyor / Valuer",
  hotel_investor:      "Hotel Investor / Operator",
  hotel_asset_manager: "Hotel Asset Manager",
};

const ROLE_INTRO: Record<string, string> = {
  developer:           "We've put together a guide covering everything Valora does for developers — IRR, RLV, sensitivity matrix, live market comps and your investment memorandum in one click.",
  lender:              "We've put together a guide covering the lender-specific metrics in Valora — DSCR, Debt Yield, LTV at exit, sensitivity stress testing and AI sense check.",
  advisor:             "We've put together a guide covering how advisors and investment managers use Valora — multi-currency, scenario comparison, shareable client reports and AI comps.",
  surveyor:            "We've put together a guide covering how Valora handles residual valuations — RLV, break-even analysis, sensitivity matrix and defensible AI benchmarking.",
  hotel_investor:      "We've put together a guide covering Valora's Hotel model — Actual vs Normalised NOI, live ADR comps, year-by-year hold modelling and split IVA/VAT treatment.",
  hotel_asset_manager: "We've put together a guide covering how asset managers use Valora — actual NOI vs underwritten, exit sensitivity, DSCR monitoring and LP reporting.",
};

export async function POST(req: NextRequest) {
  try {
    const { email, firstName, role, company } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const rawFirst = firstName || "there";
    const name = rawFirst.charAt(0).toUpperCase() + rawFirst.slice(1).toLowerCase();
    const roleLabel = role ? ROLE_LABEL[role] : null;
    const roleIntro = role ? ROLE_INTRO[role] : null;
    const pdfUrl = role ? ROLE_PDF[role] : null;
    const companyDisplay = company ? ` · ${company}` : "";

    // Fetch PDF and attach as base64
    let attachments: any[] = [];
    if (pdfUrl) {
      try {
        const pdfRes = await fetch(pdfUrl);
        if (pdfRes.ok) {
          const pdfBuffer = await pdfRes.arrayBuffer();
          const base64 = Buffer.from(pdfBuffer).toString("base64");
          const filename = `Valora_${(roleLabel || "Guide").replace(/[\s\/]+/g, "_")}.pdf`;
          attachments = [{ filename, content: base64, type: "application/pdf" }];
        }
      } catch (e) {
        console.warn("PDF fetch failed:", e);
      }
    }

    const roleSection = roleLabel ? `
      <p style="margin:0 0 12px;font-size:11px;color:#9AA3AF;text-transform:uppercase;letter-spacing:0.1em;">${roleLabel}${companyDisplay}</p>
      <p style="margin:0 0 28px;font-size:14px;color:#5A6478;line-height:1.8;">${roleIntro}</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
        <tr>
          <td style="background:#F8F9FA;border:1px solid #E8EAED;border-radius:10px;padding:20px 24px;">
            <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#1E2433;">📎 Your guide is attached to this email.</p>
            <p style="margin:0;font-size:12px;color:#5A6478;">Valora for ${roleLabel} — everything the platform does for you, in one page.</p>
          </td>
        </tr>
      </table>` : "";

    const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#F2F3F0;font-family:'Inter',system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F2F3F0;padding:48px 20px;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="max-width:580px;width:100%;">

        <tr><td style="padding:0 0 32px;">
          <table cellpadding="0" cellspacing="0"><tr><td style="background:#1E2433;border-radius:8px;padding:9px 16px;"><span style="font-size:16px;font-weight:700;color:#ffffff;letter-spacing:-.02em;">Valora</span></td></tr></table>
          
        </td></tr>

        <tr><td style="padding:0 0 32px;">
          
        </td></tr>

        <tr><td style="background:#ffffff;border:1px solid #E8EAED;border-radius:12px;padding:40px;">

          <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1E2433;line-height:1.3;">Hi ${name},</p>
          <p style="margin:0 0 28px;font-size:22px;font-weight:700;color:#1E2433;line-height:1.3;">Welcome to Valora.</p>

          <p style="margin:0 0 28px;font-size:14px;color:#5A6478;line-height:1.8;">Your workspace is ready. You're joining developers, lenders and advisors across 5 markets who use Valora to appraise deals in minutes — not days.</p>

          ${roleSection}

          <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
            <tr><td style="background:#12151a;border:1px solid rgba(201,168,76,0.2);border-radius:10px;padding:24px;">
              <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#1E2433;">Model your first deal</p>
              <p style="margin:0 0 16px;font-size:12px;color:#5A6478;">7 asset classes · 25 currencies · AI market comps · Sensitivity matrix</p>
              <a href="https://valoraplatform.io" style="display:inline-block;background:#2A8A64;color:#ffffff;font-size:13px;font-weight:600;padding:12px 24px;border-radius:7px;text-decoration:none;">Open Valora →</a>
            </td></tr>
          </table>

          <p style="margin:0 0 16px;font-size:12px;color:#5A6478;text-transform:uppercase;letter-spacing:0.1em;">What you have access to</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
            ${["BTR, BTS, Hotel, Flip, Commercial, Industrial, Mixed Use",
               "IRR (levered + unlevered), DSCR, Debt Yield, LTV at exit",
               "Live AI market comps — ADR, rent PSF, yield benchmarks",
               "AI Sense Check — flags assumptions a lender would challenge",
               "Shareable investment memorandums in one click"].map(item => `
            <tr><td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
              <table cellpadding="0" cellspacing="0"><tr>
                <td style="padding-right:12px;color:#2A8A64;font-size:10px;">◆</td>
                <td style="font-size:13px;color:#5A6478;line-height:1.6;">${item}</td>
              </tr></table>
            </td></tr>`).join("")}
          </table>

          <p style="margin:0;font-size:13px;color:#9AA3AF;line-height:1.8;">Any questions — reply to this email. I read every one personally.</p>
          <p style="margin:24px 0 0;font-size:13px;color:#5A6478;">Snayder<br/>Valora</p>

        </td></tr>

        <tr><td style="padding:24px 0 0;">
          <p style="margin:0;font-size:11px;color:#9AA3AF;line-height:1.8;">
            Valora Technologies Ltd · Registered in England &amp; Wales<br/>
            <a href="https://valoraplatform.io/privacy" style="color:#9AA3AF;">Privacy Policy</a> &nbsp;·&nbsp;
            <a href="https://valoraplatform.io/unsubscribe" style="color:#9AA3AF;">Unsubscribe</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Snayder at Valora <hello@valoraplatform.io>",
        to: email,
        subject: roleLabel ? `Welcome to Valora — your ${roleLabel} guide` : "Welcome to Valora",
        html,
        attachments: attachments.length > 0 ? attachments : undefined,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json({ error: err }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ success: true, id: data.id });

  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Unknown error" }, { status: 500 });
  }
}
