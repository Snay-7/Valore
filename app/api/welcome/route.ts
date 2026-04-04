import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email, firstName } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const name = firstName || "there";

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Valora <hello@valoraplatform.io>",
        to: email,
        subject: "Welcome to Valora — watch this first (5 min)",
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome to Valora</title>
</head>
<body style="margin:0;padding:0;background:#06070a;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#06070a;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="580" cellpadding="0" cellspacing="0" style="max-width:580px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="padding:0 0 32px 0;">
              <p style="margin:0;font-size:24px;font-weight:300;color:#c9a84c;letter-spacing:0.12em;">VALORA</p>
              <p style="margin:4px 0 0;font-size:9px;color:#3d4249;letter-spacing:0.18em;text-transform:uppercase;">PRO</p>
            </td>
          </tr>

          <!-- Gold line -->
          <tr>
            <td style="padding:0 0 32px 0;">
              <div style="height:1px;background:linear-gradient(90deg,#c9a84c,transparent);"></div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#0c0e12;border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:40px;">

              <p style="margin:0 0 8px;font-size:22px;font-weight:300;color:#eceae4;line-height:1.3;">Hi ${name},</p>
              <p style="margin:0 0 28px;font-size:22px;font-weight:300;color:#eceae4;line-height:1.3;">Welcome to Valora.</p>

              <p style="margin:0 0 28px;font-size:14px;color:#7d8590;line-height:1.8;">Your account is ready. Before you build your first appraisal, watch this 5-minute walkthrough — it shows exactly how to take a deal from land cost to sensitivity matrix, live.</p>

              <!-- Video CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
                <tr>
                  <td style="background:#12151a;border:1px solid rgba(201,168,76,0.2);border-radius:10px;padding:24px;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-right:16px;">
                          <div style="width:44px;height:44px;border-radius:50%;background:#c9a84c;display:inline-flex;align-items:center;justify-content:center;text-align:center;line-height:44px;">
                            <span style="font-size:16px;color:#06070a;padding-left:4px;">&#9654;</span>
                          </div>
                        </td>
                        <td>
                          <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#eceae4;">How to create an appraisal in 5 minutes</p>
                          <p style="margin:0;font-size:12px;color:#3d4249;">Castlefield, Manchester · BTS · GDV £72.92m · PoC 33.0%</p>
                        </td>
                      </tr>
                    </table>
                    <div style="margin-top:16px;">
                      <a href="https://valoraplatform.io" style="display:inline-block;background:#c9a84c;color:#06070a;font-size:13px;font-weight:600;padding:12px 24px;border-radius:7px;text-decoration:none;">Watch the demo →</a>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- What you'll see -->
              <p style="margin:0 0 16px;font-size:12px;color:#3d4249;text-transform:uppercase;letter-spacing:0.1em;">In the video you'll see</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
                ${[
                  ["A Manchester BTS deal built from scratch"],
                  ["Unit mix, monthly cashflow and S-curve drawdown"],
                  ["Sensitivity matrix — 45 scenarios, RAG coded live"],
                  ["AI Sense Check benchmarking against market data"],
                ].map(([item]) => `
                <tr>
                  <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-right:12px;color:#c9a84c;font-size:10px;">◆</td>
                        <td style="font-size:13px;color:#7d8590;line-height:1.6;">${item}</td>
                      </tr>
                    </table>
                  </td>
                </tr>`).join("")}
              </table>

              <!-- Main CTA -->
              <p style="margin:0 0 20px;font-size:14px;color:#7d8590;line-height:1.8;">Once you've watched, head to your dashboard and create your first appraisal. Most users are done in under 5 minutes.</p>

              <a href="https://valoraplatform.io" style="display:inline-block;background:#c9a84c;color:#06070a;font-size:14px;font-weight:600;padding:14px 32px;border-radius:7px;text-decoration:none;">Open Valora →</a>

              <p style="margin:32px 0 0;font-size:13px;color:#3d4249;line-height:1.8;">If you have any questions reply to this email — I read every one personally.</p>

              <p style="margin:24px 0 0;font-size:13px;color:#7d8590;">Best,<br/>The Valora Team</p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 0 0;">
              <p style="margin:0;font-size:11px;color:#3d4249;line-height:1.8;">Valora Technologies Ltd · Registered in England &amp; Wales<br/>
              <a href="https://valoraplatform.io/privacy" style="color:#3d4249;">Privacy Policy</a> &nbsp;·&nbsp;
              <a href="https://valoraplatform.io/unsubscribe" style="color:#3d4249;">Unsubscribe</a></p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
        `,
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
