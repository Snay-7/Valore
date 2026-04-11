import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email, firmName, inviteLink, inviterEmail, role } = await req.json();

    if (!email || !inviteLink) {
      return NextResponse.json({ sent: false, error: "Missing required fields" }, { status: 400 });
    }

    const roleLabel = role === "admin" ? "Admin" : role === "editor" ? "Editor" : "Viewer";

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>You've been invited to join ${firmName} on Valora</title>
</head>
<body style="margin:0;padding:0;background:#F8F9FA;font-family:'Inter',system-ui,-apple-system,sans-serif;-webkit-font-smoothing:antialiased;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8F9FA;padding:48px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

          <!-- Logo -->
          <tr>
            <td style="padding-bottom:32px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#252D3F;border-radius:8px;padding:10px 18px;">
                    <span style="font-size:17px;font-weight:700;color:#ffffff;letter-spacing:-.02em;">Valora</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#FFFFFF;border:1px solid #E8EAED;border-radius:12px;overflow:hidden;">

              <!-- Header bar -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#252D3F;padding:28px 36px;">
                    <p style="margin:0;font-size:11px;font-weight:600;color:rgba(82,196,152,0.8);letter-spacing:.1em;text-transform:uppercase;margin-bottom:8px;">Team Invitation</p>
                    <h1 style="margin:0;font-size:24px;font-weight:700;color:#ffffff;letter-spacing:-.02em;line-height:1.2;">You've been invited</h1>
                  </td>
                </tr>
              </table>

              <!-- Body -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:32px 36px;">

                    <p style="margin:0 0 20px;font-size:15px;color:#1E2433;line-height:1.6;">
                      <strong style="color:#1E2433;">${inviterEmail}</strong> has invited you to join
                      <strong style="color:#1E2433;">${firmName}</strong> on Valora as
                      <strong style="color:#2A8A64;">${roleLabel}</strong>.
                    </p>

                    <p style="margin:0 0 28px;font-size:14px;color:#5A6478;line-height:1.7;">
                      Click the button below to accept your invitation and access the shared workspace.
                    </p>

                    <!-- CTA Button -->
                    <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                      <tr>
                        <td style="background:#2A8A64;border-radius:8px;">
                          <a href="${inviteLink}" style="display:inline-block;padding:14px 32px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:-.01em;">
                            Accept Invitation →
                          </a>
                        </td>
                      </tr>
                    </table>

                    <!-- Divider -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                      <tr><td style="border-top:1px solid #E8EAED;"></td></tr>
                    </table>

                    <p style="margin:0;font-size:12px;color:#9AA3AF;line-height:1.6;">
                      Or copy this link:<br/>
                      <a href="${inviteLink}" style="color:#2A8A64;word-break:break-all;">${inviteLink}</a>
                    </p>

                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 0 0;">
              <p style="margin:0;font-size:11px;color:#9AA3AF;text-align:center;line-height:1.6;">
                Valora · Professional Property Development Appraisal<br/>
                If you weren't expecting this invitation, you can safely ignore this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;

    const { data, error } = await resend.emails.send({
      from: "Valora <noreply@valoraplatform.io>",
      to: email,
      subject: `You've been invited to join ${firmName} on Valora`,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ sent: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ sent: true, id: data?.id });

  } catch (err: any) {
    console.error("Invite API error:", err);
    return NextResponse.json({ sent: false, error: err.message }, { status: 500 });
  }
}
