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
 * Deterministic UTC+1 (Africa/Lagos, WAT — no DST year-round) components helper.
 * Ensures exact Lagos World Clock time (6°27'N / 3°21'E, UTC+1) across all environments.
 */
export function getLagosTimeParts(date: Date = new Date()): {
  year: number;
  month: string;
  day: string;
  weekday: string;
  hours24: string;
  hours12: string;
  minutes: string;
  seconds: string;
  ampm: 'AM' | 'PM';
} {
  // Lagos, Nigeria is permanently WAT (UTC+1, +3600000ms) with no Daylight Saving Time.
  const watMs = date.getTime() + 3600 * 1000;
  const watDate = new Date(watMs);

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const year = watDate.getUTCFullYear();
  const month = months[watDate.getUTCMonth()] || 'Jan';
  const day = String(watDate.getUTCDate()).padStart(2, '0');
  const weekday = weekdays[watDate.getUTCDay()] || 'Mon';

  const h24 = watDate.getUTCHours();
  const m = watDate.getUTCMinutes();
  const s = watDate.getUTCSeconds();

  const ampm: 'AM' | 'PM' = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;

  return {
    year,
    month,
    day,
    weekday,
    hours24: String(h24).padStart(2, '0'),
    hours12: String(h12).padStart(2, '0'),
    minutes: String(m).padStart(2, '0'),
    seconds: String(s).padStart(2, '0'),
    ampm,
  };
}

/**
 * Formats a Date object into Lagos, Nigeria (WAT / Africa/Lagos, 6°27'N / 3°21'E, UTC+1) live World Clock string.
 */
export function formatLagosTime(date: Date = new Date()): string {
  try {
    const p = getLagosTimeParts(date);
    return `Lagos, NG (6°27'N, 3°21'E) — ${p.hours12}:${p.minutes}:${p.seconds} ${p.ampm} (${p.hours24}:${p.minutes}:${p.seconds} WAT • UTC+1)`;
  } catch {
    return 'Lagos, NG — WAT (UTC+1)';
  }
}

/**
 * Formats a full date + time stamp for Lagos, Nigeria (WAT / UTC+1) used in email receipts and logs.
 */
export function formatLagosDateTime(date: Date = new Date()): string {
  const p = getLagosTimeParts(date);
  return `${p.weekday}, ${p.day} ${p.month} ${p.year} • ${p.hours12}:${p.minutes}:${p.seconds} ${p.ampm} WAT (${p.hours24}:${p.minutes} UTC+1 • Lagos, Nigeria +234)`;
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
  replyTo?: string;
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
 * Sanitizes the From header so non-ASCII symbols like ® don't trigger spam filters.
 */
export function sanitizeFromHeader(rawFrom?: string): string {
  const trimmed = rawFrom?.trim();
  if (!trimmed) {
    return 'TekBrandify Studio <support@tekbrandify.com.ng>';
  }
  return trimmed.replace(/®/g, '').replace(/\s+/g, ' ').trim();
}

/**
 * Encodes inquiry fields as application/x-www-form-urlencoded for native Netlify Forms (`data-netlify="true"`).
 */
export function encodeNetlifyFormPayload(fields: Record<string, string>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(fields)) {
    params.append(key, value);
  }
  return params.toString();
}

/**
 * Pure builder for transactional email payload when a new 48h Rapid Sprint brief arrives.
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
    lagosTimestamp?: string;
  },
  options?: {
    fromEmail?: string;
    toEmail?: string | string[];
    includeReplyTo?: boolean;
  }
): ResendEmailPayload {
  const from = sanitizeFromHeader(options?.fromEmail);
  const rawTo = options?.toEmail;
  const toList = Array.isArray(rawTo)
    ? rawTo.map((e) => e.trim()).filter(Boolean)
    : rawTo?.trim()
      ? rawTo
          .split(',')
          .map((e) => e.trim())
          .filter(Boolean)
      : ['support@tekbrandify.com.ng'];

  const servicesLabel =
    inquiry.services && inquiry.services.length > 0
      ? inquiry.services.join(', ')
      : 'Custom 48h Sprint';
  const subject = `[${inquiry.referenceId}] New 48h Rapid Sprint Brief - ${inquiry.name}`;

  const parsedDate = inquiry.createdAt ? new Date(inquiry.createdAt) : new Date();
  const formattedLagosTime =
    inquiry.lagosTimestamp ||
    (Number.isNaN(parsedDate.getTime())
      ? inquiry.createdAt
      : formatLagosDateTime(parsedDate));

  const text = [
    `TekBrandify Studio — New 48h Rapid Sprint Inquiry`,
    `Reference ID: ${inquiry.referenceId}`,
    `Lagos Time (WAT / UTC+1): ${formattedLagosTime}`,
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
  const safeTime = escapeHtml(formattedLagosTime);

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

  const payload: ResendEmailPayload = {
    from,
    to: toList,
    subject,
    text,
    html,
  };

  if (options?.includeReplyTo !== false) {
    payload.replyTo = inquiry.email;
  }

  return payload;
}



