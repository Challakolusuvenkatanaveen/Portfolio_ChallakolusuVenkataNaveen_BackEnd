const transporter = require("./mailService");

function wrapTemplate(title, body) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:32px 16px">
    <tr>
      <td align="center">
        <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06)">
          <tr>
            <td style="background:linear-gradient(135deg,#2563eb,#4f46e5);padding:36px 40px 28px;text-align:center">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom:12px">
                    <div style="width:48px;height:48px;background:rgba(255,255,255,0.2);border-radius:12px;display:inline-flex;align-items:center;justify-content:center;font-size:22px;font-weight:700;color:#fff">H</div>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <h1 style="margin:0;font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.3px">${title}</h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 40px 24px;background:#ffffff">
              ${body}
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 32px;text-align:center">
              <p style="margin:0;font-size:12px;color:#94a3b8">Portfolio Admin &middot; Automated Notification</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function approvalRequestEmail({ name, email, registeredAt }) {
  return wrapTemplate(
    "New Admin Registration",
    `
    <p style="margin:0 0 6px;font-size:15px;color:#1e293b;font-weight:600">Hello Super Admin,</p>
    <p style="margin:0 0 20px;font-size:14px;color:#475569;line-height:1.6">A new administrator has registered and is awaiting your approval.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:12px;padding:20px;margin-bottom:24px">
      <tr>
        <td style="padding:4px 0"><span style="font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px">Name</span></td>
      </tr>
      <tr>
        <td style="padding:0 0 12px"><span style="font-size:15px;color:#1e293b;font-weight:600">${name}</span></td>
      </tr>
      <tr>
        <td style="padding:4px 0"><span style="font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px">Email</span></td>
      </tr>
      <tr>
        <td style="padding:0 0 12px"><span style="font-size:15px;color:#1e293b">${email}</span></td>
      </tr>
      <tr>
        <td style="padding:4px 0"><span style="font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px">Registered At</span></td>
      </tr>
      <tr>
        <td style="padding:0 0 0"><span style="font-size:15px;color:#1e293b">${registeredAt}</span></td>
      </tr>
    </table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/admin/inbox" style="display:inline-block;background:linear-gradient(135deg,#2563eb,#4f46e5);color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 28px;border-radius:10px">Review in Inbox</a>
        </td>
      </tr>
    </table>
    `
  );
}

function approvedEmail({ name, email }) {
  return wrapTemplate(
    "Account Approved",
    `
    <p style="margin:0 0 6px;font-size:15px;color:#1e293b;font-weight:600">Hello ${name},</p>
    <p style="margin:0 0 6px;font-size:14px;color:#475569;line-height:1.6">Your admin account has been <strong style="color:#059669">approved</strong> by the super admin.</p>
    <p style="margin:0 0 24px;font-size:14px;color:#475569;line-height:1.6">You can now sign in and start managing the portfolio.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/login" style="display:inline-block;background:linear-gradient(135deg,#2563eb,#4f46e5);color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 28px;border-radius:10px">Sign In Now</a>
        </td>
      </tr>
    </table>
    `
  );
}

function rejectedEmail({ name, email }) {
  return wrapTemplate(
    "Account Request Rejected",
    `
    <p style="margin:0 0 6px;font-size:15px;color:#1e293b;font-weight:600">Hello ${name},</p>
    <p style="margin:0 0 24px;font-size:14px;color:#475569;line-height:1.6">Unfortunately, your admin account request has been <strong style="color:#dc2626">rejected</strong> by the super admin. If you believe this is a mistake, please contact the site owner directly.</p>
    `
  );
}

async function sendMail({ to, subject, html }) {
  if (!transporter || !process.env.MAIL_USER) {
    console.warn("Mail not configured — skipping email to", to);
    return;
  }
  try {
    await transporter.sendMail({
      from: `"Portfolio Admin" <${process.env.MAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to}: ${subject}`);
  } catch (err) {
    console.warn("Failed to send email:", err.message);
  }
}

async function notifySuperAdmin({ name, email, registeredAt }) {
  await sendMail({
    to: process.env.MAIL_USER,
    subject: `New Admin Registration — ${name}`,
    html: approvalRequestEmail({ name, email, registeredAt }),
  });
}

async function notifyApproved({ name, email }) {
  await sendMail({
    to: email,
    subject: "Your Admin Account Has Been Approved",
    html: approvedEmail({ name, email }),
  });
}

async function notifyRejected({ name, email }) {
  await sendMail({
    to: email,
    subject: "Your Admin Account Request Was Rejected",
    html: rejectedEmail({ name, email }),
  });
}

module.exports = { notifySuperAdmin, notifyApproved, notifyRejected };
