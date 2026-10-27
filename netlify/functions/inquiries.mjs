import nodemailer from 'nodemailer';

function getLagosDateTime(date = new Date()) {
  const watMs = date.getTime() + 3600 * 1000;
  const watDate = new Date(watMs);
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const year = watDate.getUTCFullYear();
  const month = months[watDate.getUTCMonth()] || 'Jan';
  const day = String(watDate.getUTCDate()).padStart(2, '0');
  const weekday = weekdays[watDate.getUTCDay()] || 'Mon';
  const h24 = watDate.getUTCHours();
  const m = String(watDate.getUTCMinutes()).padStart(2, '0');
  const s = String(watDate.getUTCSeconds()).padStart(2, '0');
  const ampm = h24 >= 12 ? 'PM' : 'AM';
  const h12 = String(h24 % 12 === 0 ? 12 : h24 % 12).padStart(2, '0');
  const hours24 = String(h24).padStart(2, '0');

  return `${weekday}, ${day} ${month} ${year} • ${h12}:${m}:${s} ${ampm} WAT (${hours24}:${m} UTC+1 • Lagos, Nigeria +234)`;
}

function escapeHtml(raw = '') {
  return String(raw)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildEmailPayload(inquiry, { fromEmail, toEmail, includeReplyTo = true } = {}) {
  const from = (fromEmail || 'TekBrandify Studio <support@tekbrandify.com.ng>')
    .replace(/®/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  const to = Array.isArray(toEmail) ? toEmail : [toEmail || 'support@tekbrandify.com.ng'];
  const servicesLabel =
    Array.isArray(inquiry.services) && inquiry.services.length > 0
      ? inquiry.services.join(', ')
      : 'Custom 48h Sprint';
  const subject = `[${inquiry.referenceId}] New 48h Rapid Sprint Brief - ${inquiry.name}`;

  const text = [
    `TekBrandify Studio — New 48h Rapid Sprint Inquiry`,
    `Reference ID: ${inquiry.referenceId}`,
    `Lagos Time (WAT / UTC+1): ${inquiry.lagosTimestamp}`,
    ``,
    `Client Name: ${inquiry.name}`,
    `Client Email: ${inquiry.email}`,
    ...(inquiry.phone ? [`Phone / WhatsApp: ${inquiry.phone}`] : []),
    `Selected Pillars: ${servicesLabel}`,
    ``,
    `Project Brief:`,
    inquiry.message,
    ``,
    `Direct Reply: mailto:${inquiry.email}`,
  ].join('\n');

  const safeName = escapeHtml(inquiry.name);
  const safeEmail = escapeHtml(inquiry.email);
  const safePhone = inquiry.phone ? escapeHtml(inquiry.phone) : 'Not provided';
  const safeServices = escapeHtml(servicesLabel);
  const safeMessage = escapeHtml(inquiry.message).replace(/\n/g, '<br/>');
  const safeRef = escapeHtml(inquiry.referenceId);
  const safeTime = escapeHtml(inquiry.lagosTimestamp);

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f7f8; color: #111111; padding: 28px; border-radius: 12px; max-width: 640px; margin: 0 auto; border: 1px solid #e5e7eb;">
      <div style="background-color: #0d0d0d; color: #ffffff; padding: 20px 24px; border-radius: 10px; margin-bottom: 20px;">
        <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #F16B0D; margin-bottom: 6px;">TekBrandify Studio • Lagos, Nigeria (+234)</div>
        <h1 style="margin: 0; font-size: 20px; font-weight: 600; color: #ffffff;">New 48h Rapid Sprint Brief (${safeRef})</h1>
        <div style="margin-top: 6px; font-size: 12px; color: #a1a1aa;">${safeTime}</div>
      </div>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px; background: #ffffff; border-radius: 10px; padding: 16px; border: 1px solid #e5e7eb;">
        <tr>
          <td style="padding: 10px 14px; color: #52525b; width: 150px; border-bottom: 1px solid #f4f4f5;">Client Name</td>
          <td style="padding: 10px 14px; color: #111111; font-weight: 600; border-bottom: 1px solid #f4f4f5;">${safeName}</td>
        </tr>
        <tr>
          <td style="padding: 10px 14px; color: #52525b; border-bottom: 1px solid #f4f4f5;">Client Email</td>
          <td style="padding: 10px 14px; border-bottom: 1px solid #f4f4f5;"><a href="mailto:${safeEmail}" style="color: #F16B0D; font-weight: 600; text-decoration: none;">${safeEmail}</a></td>
        </tr>
        <tr>
          <td style="padding: 10px 14px; color: #52525b; border-bottom: 1px solid #f4f4f5;">Phone / WhatsApp</td>
          <td style="padding: 10px 14px; color: #111111; border-bottom: 1px solid #f4f4f5;">${safePhone}</td>
        </tr>
        <tr>
          <td style="padding: 10px 14px; color: #52525b;">Service Pillars</td>
          <td style="padding: 10px 14px; color: #F16B0D; font-weight: 600;">${safeServices}</td>
        </tr>
      </table>
      <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px; margin-bottom: 20px;">
        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #71717a; margin-bottom: 8px;">Project Brief &amp; 48h Sprint Scope</div>
        <div style="font-size: 14px; line-height: 1.6; color: #18181b;">${safeMessage}</div>
      </div>
      <div style="margin-bottom: 20px;">
        <a href="mailto:${safeEmail}?subject=Re:%20TekBrandify%2048h%20Rapid%20Sprint%20Brief%20(${safeRef})" style="display: inline-block; background-color: #F16B0D; color: #ffffff; font-weight: 600; font-size: 13px; padding: 10px 18px; border-radius: 999px; text-decoration: none;">Reply Directly to ${safeName} (${safeEmail})</a>
      </div>
      <div style="font-size: 12px; color: #71717a; border-top: 1px solid #e5e7eb; padding-top: 12px;">
        Dispatched via TekBrandify Studio Engine • Lagos, Nigeria (6°27'N, 3°21'E • WAT UTC+1 • NGN • +234)
      </div>
    </div>
  `.trim();

  return {
    from,
    to,
    ...(includeReplyTo ? { replyTo: inquiry.email } : {}),
    subject,
    text,
    html,
  };
}

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true, inquiries: [] }),
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const name = (body.name || '').trim();
    const email = (body.email || '').trim();
    const phone = (body.phone || '').trim();
    const message = (body.message || '').trim();
    const services =
      Array.isArray(body.services) && body.services.length > 0
        ? body.services.map(String)
        : ['Custom 48h Sprint'];

    if (!name || !email || !message) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ok: false,
          error: 'Please enter your name, email address, and project brief.',
        }),
      };
    }

    const now = new Date();
    const suffix = Math.abs(now.getTime() % 1000000)
      .toString(36)
      .toUpperCase()
      .padStart(4, '0');
    const referenceId = `TEK-48H-${suffix}`;

    const record = {
      referenceId,
      name,
      email,
      phone: phone || undefined,
      services,
      message,
      createdAt: now.toISOString(),
      lagosTimestamp: getLagosDateTime(now),
    };

    const smtpHost = (process.env.SMTP_HOST || 'mail.mailbux.com').trim();
    const smtpPort = Number(process.env.SMTP_PORT || 465);
    const smtpUser = (process.env.SMTP_USER || 'support@tekbrandify.com.ng').trim();
    const smtpPass = (process.env.SMTP_PASS || '').trim();
    const mailTo = (process.env.MAIL_TO || 'support@tekbrandify.com.ng').trim();

    let emailDelivery = {
      provider: 'netlify-forms',
      sent: true,
      deliveredTo: ['support@tekbrandify.com.ng'],
      from: 'TekBrandify Studio <support@tekbrandify.com.ng>',
      note: 'Captured via Netlify Forms for support@tekbrandify.com.ng.',
    };

    if (smtpPass && smtpPass !== 'YOUR_MAILBUX_PASSWORD') {
      try {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpPort === 465,
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });

        const payload = buildEmailPayload(record, {
          fromEmail: `TekBrandify Studio <${smtpUser}>`,
          toEmail: [mailTo],
          includeReplyTo: true,
        });

        const info = await transporter.sendMail({
          from: payload.from,
          to: payload.to.join(', '),
          replyTo: payload.replyTo,
          subject: payload.subject,
          text: payload.text,
          html: payload.html,
        });

        let clientSent = false;
        try {
          await transporter.sendMail({
            from: payload.from,
            to: record.email,
            replyTo: 'support@tekbrandify.com.ng',
            subject: `We received your 48h Rapid Sprint Brief (${record.referenceId}) - TekBrandify Studio`,
            text: [
              `Hi ${record.name},`,
              ``,
              `Thank you for reaching out to Michael Okpala & TekBrandify Studio in Lagos, Nigeria.`,
              `Your 48h Rapid Sprint project brief (${record.referenceId}) has been logged at ${record.lagosTimestamp}.`,
              ``,
              `Selected Pillars: ${record.services.join(', ')}`,
              `Direct WhatsApp Line: +234 806 782 0332`,
              `Studio Email: support@tekbrandify.com.ng`,
              ``,
              `We will respond within 2 hours (WAT / UTC+1).`,
            ].join('\n'),
            html: payload.html,
          });
          clientSent = true;
        } catch {
          // Non-blocking client confirmation email
        }

        const deliveredTo = clientSent
          ? Array.from(new Set([mailTo, record.email]))
          : [mailTo];

        emailDelivery = {
          provider: 'mailbux-smtp',
          sent: true,
          emailId: info.messageId,
          deliveredTo,
          from: payload.from,
          note: `Delivered directly via Mailbux (${smtpHost}) to ${deliveredTo.join(', ')}.`,
        };
      } catch (smtpErr) {
        emailDelivery = {
          provider: 'mailbux-smtp',
          sent: false,
          error: smtpErr instanceof Error ? smtpErr.message : 'Mailbux SMTP error',
        };
      }
    }

    return {
      statusCode: 201,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ok: true,
        inquiry: { ...record, emailDelivery },
        emailDelivery,
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ok: false,
        error: err instanceof Error ? err.message : 'Server error',
      }),
    };
  }
};
