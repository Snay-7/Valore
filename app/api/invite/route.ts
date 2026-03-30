import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  try {
    const { email, firmName, inviteLink, inviterEmail, role } = await req.json();

    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      return NextResponse.json({ sent: false, message: "No email provider configured — share link manually" });
    }

    const resend = new Resend(resendKey);

    const { data, error } = await resend.emails.send({
      from: "VALORA <noreply@valoraplatform.io>",
      to: email,
      subject: `You've been invited to join ${firmName} on VALORA`,
      html: `
        <div style="background:#06070a;color:#eceae4;font-family:system-ui,sans-serif;padding:40px;max-width:520px;margin:0 auto;border-radius:12px">
          
          <div style="font-family:Georgia,serif;font-size:28px;font-weight:300;color:#c9a84c;letter-spacing:.1em;margin-bottom:8px">VALORA</div>
          <div style="font-size:11px;color:#3d4249;text-transform:uppercase;letter-spacing:.12em;margin-bottom:32px">Institutional Development Appraisal Platform</div>

          <h2 style="font-family:Georgia,serif;font-size:24px;font-weight:300;margin-bottom:12px">You've been invited</h2>
          
          <p style="font-size:14px;color:#7d8590;line-height:1.7;margin-bottom:8px">
            <strong style="color:#eceae4">${inviterEmail}</strong> has invited you to join <strong style="color:#eceae4">${firmName}</strong> on VALORA${role ? ` as <strong style="color:#c9a84c">${role}</strong>` : ""}.
          </p>
          
          <p style="font-size:14px;color:#7d8590;line-height:1.7;margin-bottom:28px">
            Click the button below to accept your invitation and access the shared workspace.
          </p>

          <a href="${inviteLink}" style="display:inline-block;background:#c9a84c;color:#06070a;padding:14px 32px;border-radius:8px;font-size:14px;text-decoration:none;font-weight:600;margin-bottom:24px">
            Accept Invitation →
          </a>

          <p style="font-size:12px;color:#3d4249;line-height:1.6;margin-bottom:0">
            Or copy this link:<br/>
            <span style="color:#c9a84c;font-family:monospace;font-size:11px;word-break:break-all">${inviteLink}</span>
          </p>

          <div style="margin-top:32px;padding-top:20px;border-top:1px solid rgba(255,255,255,.06);font-size:11px;color:#3d4249">
            If you weren't expecting this invitation, you can safely ignore this email.<br/>
            VALORA · Institutional Development Appraisal Platform
          </div>

        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ sent: false, error });
    }

    return NextResponse.json({ sent: true, data });

  } catch (err: any) {
    console.error("Invite API error:", err);
    return NextResponse.json({ sent: false, error: err.message });
  }
}
