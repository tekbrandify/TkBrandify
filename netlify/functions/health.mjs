function getLagosTimeParts(date = new Date()) {
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
  const ampm = h24 >= 12 ? 'PM' : 'AM';
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

export const handler = async () => {
  const now = new Date();
  const p = getLagosTimeParts(now);
  const lagosTime = `Lagos, NG (6°27'N, 3°21'E) — ${p.hours12}:${p.minutes}:${p.seconds} ${p.ampm} (${p.hours24}:${p.minutes}:${p.seconds} WAT • UTC+1)`;
  const lagosDateTime = `${p.weekday}, ${p.day} ${p.month} ${p.year} • ${p.hours12}:${p.minutes}:${p.seconds} ${p.ampm} WAT (${p.hours24}:${p.minutes} UTC+1 • Lagos, Nigeria +234)`;

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      status: 'ok',
      brand: 'TekBrandify®',
      sprintWindow: '48h Rapid Sprint',
      location: 'Lagos, Nigeria (WAT)',
      serverTimeUtcMs: now.getTime(),
      lagosTime,
      lagosDateTime,
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
      emailProvider: 'resend',
      resendConfigured: Boolean(process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'MY_RESEND_API_KEY'),
    }),
  };
};
