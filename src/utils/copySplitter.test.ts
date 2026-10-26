import test from 'node:test';
import assert from 'node:assert/strict';
import {
  tokenizeCopyText,
  formatLagosTime,
  buildWhatsAppUrl,
  validateInquiryPayload,
  generateInquiryRef,
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

test('formatLagosTime outputs Lagos, NG — HH:MM:SS WAT format', () => {
  const fixedDate = new Date('2026-10-20T12:00:00Z'); // 13:00:00 WAT (UTC+1)
  const formatted = formatLagosTime(fixedDate);
  assert.match(formatted, /^Lagos, NG — 13:00:00 WAT$/);
});

test('buildWhatsAppUrl encodes selected service pills and inquiry details for +2348067820332', () => {
  const url = buildWhatsAppUrl({
    name: 'Adaobi Okafor',
    email: 'adaobi@kora.africa',
    services: ['Brand Identity', 'Web Development'],
    message: 'Need a 72h rapid sprint launch.',
  });
  assert.ok(url.startsWith('https://wa.me/2348067820332?text='));
  const decoded = decodeURIComponent(url.replace('https://wa.me/2348067820332?text=', ''));
  assert.ok(decoded.includes('Adaobi Okafor'));
  assert.ok(decoded.includes('Brand Identity, Web Development'));
  assert.ok(decoded.includes('Need a 72h rapid sprint launch.'));
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
      message: '72h WebGL launch needed',
    }).valid,
    true
  );
});

test('generateInquiryRef returns a formatted TEK-72H sprint code', () => {
  const ref = generateInquiryRef(1760961600000);
  assert.match(ref, /^TEK-72H-[A-Z0-9]{4,}$/);
});

