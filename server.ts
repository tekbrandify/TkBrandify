import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { Resend } from 'resend';
import { createServer as createViteServer } from 'vite';
import {
  validateInquiryPayload,
  generateInquiryRef,
  buildResendInquiryEmailPayload,
} from './src/utils/copySplitter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface EmailDeliveryStatus {
  provider: 'resend';
  sent: boolean;
  emailId?: string;
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
  emailDelivery?: EmailDeliveryStatus;
}

const inquiriesStore: StoredInquiry[] = [];

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_RESEND_API_KEY') {
    return null;
  }
  return new Resend(apiKey);
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.disable('x-powered-by');
  app.use(express.json({ limit: '64kb' }));

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      brand: 'TekBrandify®',
      sprintWindow: '48h Rapid Sprint',
      location: 'Lagos, Nigeria (WAT)',
      emailProvider: 'resend',
      resendConfigured: Boolean(getResendClient()),
      inquiriesCount: inquiriesStore.length,
    });
  });

  // Project sprint inquiry endpoint with Resend email integration
  app.post('/api/inquiries', async (req, res) => {
    const { name, email, phone, services, message } = req.body ?? {};
    const validation = validateInquiryPayload({ name, email, phone, services, message });

    if (!validation.valid) {
      res.status(400).json({ ok: false, error: validation.error });
      return;
    }

    const referenceId = generateInquiryRef();
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
      createdAt: new Date().toISOString(),
    };

    const resend = getResendClient();
    if (resend) {
      try {
        const emailPayload = buildResendInquiryEmailPayload(record, {
          fromEmail: process.env.RESEND_FROM_EMAIL,
          toEmail: process.env.RESEND_TO_EMAIL,
        });
        const { data, error } = await resend.emails.send({
          from: emailPayload.from,
          to: emailPayload.to,
          replyTo: emailPayload.replyTo,
          subject: emailPayload.subject,
          text: emailPayload.text,
          html: emailPayload.html,
        });

        if (error) {
          record.emailDelivery = {
            provider: 'resend',
            sent: false,
            error: error.message,
          };
        } else {
          record.emailDelivery = {
            provider: 'resend',
            sent: true,
            emailId: data?.id,
          };
        }
      } catch (err) {
        record.emailDelivery = {
          provider: 'resend',
          sent: false,
          error: err instanceof Error ? err.message : 'Resend dispatch error',
        };
      }
    } else {
      record.emailDelivery = {
        provider: 'resend',
        sent: false,
        error: 'RESEND_API_KEY not configured yet',
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
