import test from 'node:test';
import assert from 'node:assert/strict';
import {
  tokenizeCopyText,
  formatLagosTime,
  buildWhatsAppUrl,
  validateInquiryPayload,
  generateInquiryRef,
  buildResendInquiryEmailPayload,
  encodeNetlifyFormPayload,
} from './copySplitter';

test('tokenizeCopyText preserves <br> tags and splits words and spaces accurately', () => {
  const tokens = tokenizeCopyText('Creative<br/>Web Designer');
  assert.equal(tokens.length, 5);
  assert.deepEqual(tokens[0], {
    type: 'word',
    text: 'Creative',
    chars: ['C', 'r', 'e', 'a', 't', 'i', 'v', 'e'],
  });
  assert.deepEqual(tokens[1], { type: 'br' });
  assert.deepEqual(tokens[2], {
    type: 'word',
    text: 'Web',
    chars: ['W', 'e', 'b'],
  });
  assert.deepEqual(tokens[3], { type: 'space', text: ' ' });
  assert.deepEqual(tokens[4], {
    type: 'word',
    text: 'Designer',
    chars: ['D', 'e', 's', 'i', 'g', 'n', 'e', 'r'],
  });
});

test('formatLagosTime outputs Lagos, NG (6°27\'N, 3°21\'E) with 12h AM/PM and 24h WAT (UTC+1)', () => {
  const fixedDate = new Date('2026-10-20T12:00:00Z'); // 13:00:00 WAT (01:00:00 PM UTC+1)
  const formatted = formatLagosTime(fixedDate);
  assert.equal(
    formatted,
    "Lagos, NG (6°27'N, 3°21'E) — 01:00:00 PM (13:00:00 WAT • UTC+1)"
  );
});

test('buildWhatsAppUrl encodes selected service pills and inquiry details for +2348067820332', () => {
  const url = buildWhatsAppUrl({
    name: 'Adaobi Okafor',
    email: 'adaobi@kora.africa',
    services: ['Brand Identity', 'Web Development'],
    message: 'Need a 48h rapid sprint launch.',
  });
  assert.ok(url.startsWith('https://wa.me/2348067820332?text='));
  const decoded = decodeURIComponent(url.replace('https://wa.me/2348067820332?text=', ''));
  assert.ok(decoded.includes('Adaobi Okafor'));
  assert.ok(decoded.includes('Brand Identity, Web Development'));
  assert.ok(decoded.includes('Need a 48h rapid sprint launch.'));
});

test('validateInquiryPayload rejects missing fields or invalid email and accepts valid brief', () => {
  assert.equal(validateInquiryPayload({ name: '', email: 'a@b.co', message: 'Hi' }).valid, false);
  assert.equal(
    validateInquiryPayload({ name: 'Tunde', email: 'not-an-email', message: 'Launch sprint' }).valid,
    false
  );
  assert.equal(
    validateInquiryPayload({
      name: 'Tunde Bakare',
      email: 'tunde@veloce.africa',
      services: ['Web Development'],
      message: '48h WebGL launch needed',
    }).valid,
    true
  );
});

test('generateInquiryRef returns a formatted TEK-48H sprint code', () => {
  const ref = generateInquiryRef(1760961600000);
  assert.match(ref, /^TEK-48H-[A-Z0-9]{4,}$/);
});

test('buildResendInquiryEmailPayload formats 48h Rapid Sprint inquiry email and sanitizes From header', () => {
  const payload = buildResendInquiryEmailPayload(
    {
      referenceId: 'TEK-48H-ABCD',
      name: 'Chidi <Founder>',
      email: 'chidi@nexus.ai',
      phone: '+2348067820332',
      services: ['Brand Identity', 'AI Integration & Automation'],
      message: 'Need a 48h Rapid Sprint before Monday.',
      createdAt: '2026-10-26T14:00:00.000Z',
    },
    {
      fromEmail: 'TekBrandify® <support@tekbrandify.com.ng>',
      toEmail: 'support@tekbrandify.com.ng',
    }
  );

  assert.equal(payload.from, 'TekBrandify <support@tekbrandify.com.ng>');
  assert.deepEqual(payload.to, ['support@tekbrandify.com.ng']);
  assert.equal(payload.replyTo, 'chidi@nexus.ai');
  assert.equal(payload.subject, '[TEK-48H-ABCD] New 48h Rapid Sprint Brief - Chidi <Founder>');
  assert.ok(payload.html.includes('Chidi &lt;Founder&gt;'));
  assert.ok(payload.html.includes('48h Rapid Sprint Brief'));
  assert.ok(payload.text.includes('Need a 48h Rapid Sprint before Monday.'));
  assert.ok(payload.text.includes('03:00:00 PM WAT'));
});

test('encodeNetlifyFormPayload serializes form-name and inquiry fields for Netlify Forms', () => {
  const encoded = encodeNetlifyFormPayload({
    'form-name': 'tekbrandify-sprint-inquiry',
    name: 'Michael Okpala',
    email: 'support@tekbrandify.com.ng',
  });
  assert.ok(encoded.includes('form-name=tekbrandify-sprint-inquiry'));
  assert.ok(encoded.includes('email=support%40tekbrandify.com.ng'));
});

