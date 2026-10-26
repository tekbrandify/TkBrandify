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
 * Generates a deterministic-format TekBrandify® sprint reference ID.
 */
export function generateInquiryRef(timestampMs: number = Date.now()): string {
  const suffix = Math.abs(timestampMs % 1000000)
    .toString(36)
    .toUpperCase()
    .padStart(4, '0');
  return `TEK-72H-${suffix}`;
}

