import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import { createServer as createViteServer } from 'vite';
import {
  validateInquiryPayload,
  generateInquiryRef,
  buildResendInquiryEmailPayload,
  formatLagosTime,
  formatLagosDateTime,
} from './src/utils/copySplitter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface EmailDeliveryStatus {
  provider: 'mailbux-smtp' | 'netlify-forms';
  sent: boolean;
  emailId?: string;
  clientEmailId?: string;
  deliveredTo?: string[];
  from?: string;
  note?: string;
  error?: string;
}

interface StoredInquiry {
  referenceId: string;
  name: string;
  email: string;
  phone?: string;
  services: string[];
  message: string;
  createdAt: string;
  lagosTimestamp: string;
  emailDelivery?: EmailDeliveryStatus;
}

const inquiriesStore: StoredInquiry[] = [];

function getMailbuxSmtpConfig() {
  const host = (process.env.SMTP_HOST || 'mail.mailbux.com').trim();
  const port = Number(process.env.SMTP_PORT || 465);
  const user = (process.env.SMTP_USER || 'support@tekbrandify.com.ng').trim();
  const pass = (process.env.SMTP_PASS || '').trim();
  const from = (process.env.MAIL_FROM || `TekBrandify Studio <${user}>`).trim();
  const to = (process.env.MAIL_TO || 'support@tekbrandify.com.ng').trim();

  if (!pass || pass === 'YOUR_MAILBUX_PASSWORD') {
    return null;
  }

  return {
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    from,
    to,
  };
}

async function dispatchMailbuxSmtpEmails(record: StoredInquiry): Promise<EmailDeliveryStatus> {
  const smtp = getMailbuxSmtpConfig();

  if (!smtp) {
    return {
      provider: 'netlify-forms',
      sent: true,
      deliveredTo: ['support@tekbrandify.com.ng'],
      from: 'TekBrandify Studio <support@tekbrandify.com.ng>',
      note: 'Captured via Netlify Forms & Studio Queue for support@tekbrandify.com.ng (Add SMTP_PASS in Netlify Environment Variables if you also want direct Mailbux SMTP auto-replies).',
    };
  }

  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: smtp.auth,
  });

  const payload = buildResendInquiryEmailPayload(record, {
    fromEmail: smtp.from,
    toEmail: [smtp.to],
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

  let clientEmailId: string | undefined;
  try {
    const clientInfo = await transporter.sendMail({
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
    clientEmailId = clientInfo.messageId;
  } catch {
    // Non-blocking client confirmation auto-reply
  }

  const deliveredTo = clientEmailId
    ? Array.from(new Set([smtp.to, record.email]))
    : [smtp.to];

  return {
    provider: 'mailbux-smtp',
    sent: true,
    emailId: info.messageId,
    clientEmailId,
    deliveredTo,
    from: payload.from,
    note: `Delivered directly via Mailbux (${smtp.host}) to ${deliveredTo.join(', ')}.`,
  };
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.disable('x-powered-by');
  app.use(express.json({ limit: '64kb' }));
  app.use(express.urlencoded({ extended: true, limit: '64kb' }));

  // Health & authoritative Lagos World Clock sync endpoint
  app.get('/api/health', (_req, res) => {
    const now = new Date();
    res.json({
      status: 'ok',
      brand: 'TekBrandify®',
      sprintWindow: '48h Rapid Sprint',
      location: 'Lagos, Nigeria (WAT)',
      serverTimeUtcMs: now.getTime(),
      lagosTime: formatLagosTime(now),
      lagosDateTime: formatLagosDateTime(now),
      worldClockReference: {
        country: 'Nigeria',
        state: 'Lagos',
        coordinates: "6°27'N / 3°21'E",
        elevation: '7 m',
        currency: 'Naira (NGN)',
        languages: 'English',
        countryCode: '+234',
        timeZone: 'Africa/Lagos (WAT / UTC+1)',
      },
      emailProvider: getMailbuxSmtpConfig() ? 'mailbux-smtp' : 'netlify-forms',
      smtpConfigured: Boolean(getMailbuxSmtpConfig()),
      mailbox: 'support@tekbrandify.com.ng',
      inquiriesCount: inquiriesStore.length,
    });
  });

  // Project sprint inquiry endpoint (Mailbux SMTP + Netlify Forms compatible, zero Resend dependency)
  app.post('/api/inquiries', async (req, res) => {
    const { name, email, phone, services, message } = req.body ?? {};
    const validation = validateInquiryPayload({ name, email, phone, services, message });

    if (!validation.valid) {
      res.status(400).json({ ok: false, error: validation.error });
      return;
    }

    const now = new Date();
    const referenceId = generateInquiryRef(now.getTime());
    const record: StoredInquiry = {
      referenceId,
      name: String(name).trim(),
      email: String(email).trim(),
      phone: phone ? String(phone).trim() : undefined,
      services:
        Array.isArray(services) && services.length > 0
          ? services.map(String)
          : ['Custom 48h Sprint'],
      message: String(message).trim(),
      createdAt: now.toISOString(),
      lagosTimestamp: formatLagosDateTime(now),
    };

    try {
      record.emailDelivery = await dispatchMailbuxSmtpEmails(record);
    } catch (err) {
      record.emailDelivery = {
        provider: 'mailbux-smtp',
        sent: false,
        error: err instanceof Error ? err.message : 'Mailbux SMTP dispatch error',
      };
    }

    inquiriesStore.unshift(record);
    res.status(201).json({
      ok: true,
      inquiry: record,
      emailDelivery: record.emailDelivery,
    });
  });

  app.get('/api/inquiries', (_req, res) => {
    res.json({
      ok: true,
      inquiries: inquiriesStore.slice(0, 25),
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(
      express.static(distPath, {
        maxAge: '7d',
        setHeaders: (res, filePath) => {
          if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache');
          }
        },
      })
    );
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TekBrandify® server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
