export interface SplitToken {
  type: 'word' | 'space' | 'br';
  text?: string;
  chars?: string[];
}

/**
 * Pure tokenizer that breaks an HTML/text line with <br> markers into words, spaces, and <br> tokens
 * so words can be wrapped in `inline-block whitespace-nowrap` with natural spaces to prevent mid-word breaks.
 */
export function tokenizeCopyText(input: string): SplitToken[] {
  const tokens: SplitToken[] = [];
  const parts = input.split(/(<br\s*\/?>)/gi);

  for (const part of parts) {
    if (!part) continue;
    if (/^<br\s*\/?>$/i.test(part)) {
      tokens.push({ type: 'br' });
      continue;
    }

    const segments = part.split(/(\s+)/);
    for (const seg of segments) {
      if (!seg) continue;
      if (/^\s+$/.test(seg)) {
        tokens.push({ type: 'space', text: ' ' });
      } else {
        tokens.push({
          type: 'word',
          text: seg,
          chars: Array.from(seg),
        });
      }
    }
  }

  return tokens;
}

/**
 * Formats a Date object into Lagos, Nigeria (WAT / Africa/Lagos) live clock string.
 */
export function formatLagosTime(date: Date = new Date()): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Africa/Lagos',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    return `Lagos, NG — ${formatter.format(date)} WAT`;
  } catch {
    return 'Lagos, NG — WAT';
  }
}

/**
 * Builds a pre-filled WhatsApp chat URL for TekBrandify® (+2348067820332).
 */
export function buildWhatsAppUrl(params: {
  name?: string;
  email?: string;
  services?: string[];
  message?: string;
}): string {
  const base = 'https://wa.me/2348067820332';
  const lines: string[] = ['Hello Michael @ TekBrandify®,'];
  if (params.name?.trim()) lines.push(`Name: ${params.name.trim()}`);
  if (params.email?.trim()) lines.push(`Email: ${params.email.trim()}`);
  if (params.services && params.services.length > 0) {
    lines.push(`Services: ${params.services.join(', ')}`);
  }
  if (params.message?.trim()) lines.push(`Project Brief: ${params.message.trim()}`);

  if (lines.length === 1) {
    return `${base}?text=${encodeURIComponent('Hello Michael @ TekBrandify®, I would like to discuss a project.')}`;
  }
  return `${base}?text=${encodeURIComponent(lines.join('\n'))}`;
}

export interface InquiryPayload {
  name: string;
  email: string;
  phone?: string;
  services: string[];
  message: string;
}

export interface InquiryValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Pure validator for project brief inquiries.
 */
export function validateInquiryPayload(payload: Partial<InquiryPayload>): InquiryValidationResult {
  const name = payload.name?.trim() || '';
  const email = payload.email?.trim() || '';
  const message = payload.message?.trim() || '';

  if (!name || !email || !message) {
    return {
      valid: false,
      error: 'Please enter your name, email address, and project brief.',
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      valid: false,
      error: 'Please enter a valid email address.',
    };
  }

  return { valid: true };
}

/**
 * Generates a deterministic-format TekBrandify® 48h sprint reference ID.
 */
export function generateInquiryRef(timestampMs: number = Date.now()): string {
  const suffix = Math.abs(timestampMs % 1000000)
    .toString(36)
    .toUpperCase()
    .padStart(4, '0');
  return `TEK-48H-${suffix}`;
}

export interface ResendEmailPayload {
  from: string;
  to: string[];
  replyTo: string;
  subject: string;
  text: string;
  html: string;
}

function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Pure builder for Resend transactional email payload when a new 48h Rapid Sprint brief arrives.
 */
export function buildResendInquiryEmailPayload(
  inquiry: {
    referenceId: string;
    name: string;
    email: string;
    phone?: string;
    services: string[];
    message: string;
    createdAt: string;
  },
  options?: {
    fromEmail?: string;
    toEmail?: string;
  }
): ResendEmailPayload {
  const from =
    options?.fromEmail?.trim() || 'TekBrandify® <onboarding@resend.dev>';
  const to = [options?.toEmail?.trim() || 'michael@tekbrandify.com'];
  const servicesLabel =
    inquiry.services && inquiry.services.length > 0
      ? inquiry.services.join(', ')
      : 'Custom 48h Sprint';
  const subject = `[${inquiry.referenceId}] New 48h Rapid Sprint Brief — ${inquiry.name}`;

  const text = [
    `TekBrandify® — New 48h Rapid Sprint Inquiry`,
    `Reference ID: ${inquiry.referenceId}`,
    `Submitted At: ${inquiry.createdAt}`,
    ``,
    `Client Name: ${inquiry.name}`,
    `Client Email: ${inquiry.email}`,
    ...(inquiry.phone ? [`Phone / WhatsApp: ${inquiry.phone}`] : []),
    `Selected Pillars: ${servicesLabel}`,
    ``,
    `Project Brief:`,
    inquiry.message,
  ].join('\n');

  const safeName = escapeHtml(inquiry.name);
  const safeEmail = escapeHtml(inquiry.email);
  const safePhone = inquiry.phone ? escapeHtml(inquiry.phone) : 'Not provided';
  const safeServices = escapeHtml(servicesLabel);
  const safeMessage = escapeHtml(inquiry.message).replace(/\n/g, '<br/>');
  const safeRef = escapeHtml(inquiry.referenceId);

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #070707; color: #ffffff; padding: 32px; border-radius: 16px; max-width: 640px; margin: 0 auto; border: 1px solid rgba(255,255,255,0.15);">
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.12); padding-bottom: 16px; margin-bottom: 24px;">
        <h1 style="margin: 0; font-size: 20px; font-weight: 600; color: #ffffff;">TekBrandify® — 48h Rapid Sprint Brief</h1>
        <span style="background: rgba(241,107,13,0.18); color: #F16B0D; border: 1px solid rgba(241,107,13,0.4); padding: 4px 10px; border-radius: 999px; font-size: 12px; font-family: monospace;">${safeRef}</span>
      </div>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px;">
        <tr>
          <td style="padding: 8px 0; color: rgba(255,255,255,0.6); width: 140px;">Client Name</td>
          <td style="padding: 8px 0; color: #ffffff; font-weight: 500;">${safeName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: rgba(255,255,255,0.6);">Email Address</td>
          <td style="padding: 8px 0;"><a href="mailto:${safeEmail}" style="color: #F16B0D; text-decoration: none;">${safeEmail}</a></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: rgba(255,255,255,0.6);">Phone / WhatsApp</td>
          <td style="padding: 8px 0; color: #ffffff;">${safePhone}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: rgba(255,255,255,0.6);">Service Pillars</td>
          <td style="padding: 8px 0; color: #F16B0D; font-weight: 500;">${safeServices}</td>
        </tr>
      </table>
      <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 16px; margin-bottom: 24px;">
        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(255,255,255,0.5); margin-bottom: 8px;">Project Brief &amp; Timeline</div>
        <div style="font-size: 14px; line-height: 1.6; color: rgba(255,255,255,0.9);">${safeMessage}</div>
      </div>
      <div style="font-size: 12px; color: rgba(255,255,255,0.45); border-top: 1px solid rgba(255,255,255,0.1); padding-top: 16px;">
        Dispatched via TekBrandify® Studio Engine • Lagos, Nigeria (WAT) • 48h Rapid Sprint Architecture
      </div>
    </div>
  `.trim();

  return {
    from,
    to,
    replyTo: inquiry.email,
    subject,
    text,
    html,
  };
}


