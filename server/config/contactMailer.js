const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const getFromAddress = () => process.env.EMAIL_FROM || process.env.EMAIL_USER;

const sendContactConfirmationEmail = async ({ toEmail, name, query }) => {
  await transporter.sendMail({
    from: `"UrbanEase" <${getFromAddress()}>`,
    to: toEmail,
    subject: "UrbanEase - We received your query",
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:16px;background:#ffffff;">
        <h2 style="margin:0 0 16px;color:#1d4ed8;">UrbanEase</h2>
        <p style="margin:0 0 12px;color:#111827;">Hello <strong>${name}</strong>,</p>
        <p style="margin:0 0 12px;color:#374151;line-height:1.6;">
          Your query has been sent successfully. We will reply to it soon. Please be with us.
        </p>
        <div style="margin:20px 0;padding:16px;border-radius:12px;background:#eff6ff;border:1px solid #bfdbfe;">
          <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#2563eb;">Your message</p>
          <p style="margin:0;color:#1f2937;line-height:1.6;white-space:pre-wrap;">${query}</p>
        </div>
        <p style="margin:0;color:#6b7280;font-size:14px;">Thank you for reaching out to UrbanEase.</p>
      </div>
    `,
  });
};

const sendContactNotificationEmail = async ({ name, email, query }) => {
  await transporter.sendMail({
    from: `"UrbanEase" <${getFromAddress()}>`,
    to: getFromAddress(),
    subject: `New contact query from ${name}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:16px;background:#ffffff;">
        <h2 style="margin:0 0 16px;color:#1d4ed8;">New Contact Query</h2>
        <p style="margin:0 0 8px;color:#111827;"><strong>Name:</strong> ${name}</p>
        <p style="margin:0 0 8px;color:#111827;"><strong>Email:</strong> ${email}</p>
        <div style="margin-top:16px;padding:16px;border-radius:12px;background:#f8fafc;border:1px solid #e5e7eb;">
          <p style="margin:0;color:#1f2937;line-height:1.6;white-space:pre-wrap;">${query}</p>
        </div>
      </div>
    `,
  });
};

module.exports = {
  sendContactConfirmationEmail,
  sendContactNotificationEmail,
};
