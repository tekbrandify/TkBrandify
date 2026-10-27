import React, { useEffect, useRef, useState } from 'react';
import { getGsap } from '../utils/gsapGlobal';
import { SERVICE_PILLARS } from '../data/tekbrandifyData';
import {
  buildWhatsAppUrl,
  encodeNetlifyFormPayload,
  formatLagosDateTime,
  generateInquiryRef,
  validateInquiryPayload,
} from '../utils/copySplitter';
import TekBrandifyLogo from './TekBrandifyLogo';
import AnimatedButton from './AnimatedButton';
import { useGetInTouchModal } from './GetInTouchModal';

const SOCIAL_LINKS = [
  {
    label: 'Facebook',
    href: 'https://wa.me/2348067820332',
    icon: '/media/facebook.28b69odb44qoi.svg',
  },
  {
    label: 'Instagram',
    href: 'https://wa.me/2348067820332',
    icon: '/media/instagram.44_o2mpfxt9wp.svg',
  },
  {
    label: 'LinkedIn',
    href: 'https://wa.me/2348067820332',
    icon: '/media/linkedIn.3zxx2oqth41cz.svg',
  },
  {
    label: 'Twitter',
    href: 'https://wa.me/2348067820332',
    icon: '/media/twitter.0pg43yq6t12uk.svg',
  },
];

export default function FooterSection() {
  const footerRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const { openModal } = useGetInTouchModal();

  // Embedded Inquiry Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([
    'Brand Identity',
    'Web Development',
  ]);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [referenceId, setReferenceId] = useState('');
  const [lagosTimestamp, setLagosTimestamp] = useState('');
  const [deliveryStatus, setDeliveryStatus] = useState<{
    sent: boolean;
    emailId?: string;
    deliveredTo?: string[];
    note?: string;
    error?: string;
  } | null>(null);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const gsap = getGsap();
    if (!gsap || !cardRef.current || !footerRef.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(cardRef.current, { opacity: 1, yPercent: 0 });
      return;
    }
    if (globalThis.innerWidth <= 1025) return;

    const tween = gsap.fromTo(
      cardRef.current,
      { yPercent: 20 },
      {
        yPercent: 0,
        ease: 'power1.out',
        scrollTrigger: {
          trigger: footerRef.current,
          start: 'top 60%',
          end: 'bottom bottom',
          scrub: true,
        },
      }
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  const toggleService = (title: string) => {
    setSelectedServices((prev) =>
      prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title]
    );
  };

  const handleDirectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const check = validateInquiryPayload({
      name,
      email,
      services: selectedServices,
      message,
    });
    if (!check.valid) {
      setFormError(check.error || 'Please enter your name, email address, and project brief.');
      return;
    }

    setFormError('');
    setSubmitting(true);
    let refCode = generateInquiryRef();
    let serverLagosTime = formatLagosDateTime(new Date());
    let emailInfo: typeof deliveryStatus = null;

    // 1. Submit to native Netlify Forms (`data-netlify="true"`) so Netlify captures & notifies support@tekbrandify.com.ng with zero API keys
    try {
      await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encodeNetlifyFormPayload({
          'form-name': 'tekbrandify-sprint-inquiry',
          referenceId: refCode,
          name: name.trim(),
          email: email.trim(),
          phone: '',
          services: selectedServices.join(', ') || 'Custom 48h Sprint',
          message: message.trim(),
          lagosTimestamp: serverLagosTime,
        }),
      });
    } catch {
      // Non-blocking when not running behind Netlify CDN
    }

    // 2. Submit to Studio API / Mailbux SMTP handler
    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          services: selectedServices,
          message: message.trim(),
        }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data?.inquiry?.referenceId) {
          refCode = data.inquiry.referenceId;
        }
        if (data?.inquiry?.lagosTimestamp) {
          serverLagosTime = data.inquiry.lagosTimestamp;
        }
        if (data?.emailDelivery) {
          emailInfo = data.emailDelivery;
        }
      }
    } catch {
      // Fallback to local reference ID if offline
    }

    try {
      const existing = JSON.parse(localStorage.getItem('tekbrandify_inquiries') || '[]');
      existing.unshift({
        referenceId: refCode,
        name: name.trim(),
        email: email.trim(),
        services: selectedServices,
        message: message.trim(),
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem('tekbrandify_inquiries', JSON.stringify(existing.slice(0, 20)));
    } catch {
      // Ignore storage quota errors
    }

    setReferenceId(refCode);
    setLagosTimestamp(serverLagosTime);
    setDeliveryStatus(emailInfo);
    setSubmitting(false);
    setSubmitted(true);
  };

  const whatsappUrl = buildWhatsAppUrl({
    name,
    email,
    services: selectedServices,
    message,
  });

  return (
    <footer
      className="relative overflow-hidden px-[4vw] pt-[10vw] max-[1025px]:px-[5vw] max-md:pt-[20vw]"
      id="footer"
      ref={footerRef}
    >
      <img
        src="/media/footer-bg.2y6ggh6bp2suk.svg"
        width={1920}
        height={900}
        alt="Footer Background"
        loading="lazy"
        className="absolute -bottom-20 left-0 right-0 w-full max-md:scale-[5] max-md:bottom-0 pointer-events-none"
      />

      <div className="relative z-[1]">
        <div
          className="rounded-4xl bg-black/5 border border-white/30 backdrop-blur-2xl px-12 py-12 flex flex-col gap-14 justify-between max-[1025px]:flex-col max-[1025px]:items-center max-[1025px]:gap-10 max-[1025px]:px-8 max-[1025px]:py-12 max-md:px-6 max-md:gap-8"
          ref={cardRef}
        >
          {/* Top Row: Brand Logo + Headline + Get in Touch Button */}
          <div className="flex justify-between items-start gap-24 footer-content max-[1025px]:gap-10 max-md:gap-12 max-[1025px]:flex-col-reverse max-[1025px]:items-center">
            <TekBrandifyLogo className="w-[22vw] max-[1025px]:w-[34vw] max-md:w-[46vw] h-auto" />

            <div className="flex flex-col gap-[2vw] items-end max-[1025px]:items-center max-[1025px]:text-center max-md:gap-[6vw]">
              <p className="text-[3.4vw] text-end w-[80%] leading-[1.15] max-[1025px]:text-[5vw] max-[1025px]:w-full max-[1025px]:text-center max-md:text-[7.5vw]">
                Ready to Engineer Your Brand in 48 Hours?
              </p>
              <AnimatedButton
                btnText="Get in Touch"
                href="#footer-inquiry"
                onClick={(e) => {
                  e.preventDefault();
                  openModal();
                }}
                textClassName="font-normal text-[1.15vw] max-[1025px]:text-[3vw] max-md:text-[4.2vw]"
                bgColor="#ffffff"
                dotColor="#070707"
                hoverTextColor="#ffffff"
                textColor="#111111"
              />
            </div>
          </div>

          {/* Embedded Inquiry Form inside Footer Card */}
          <div
            id="footer-inquiry"
            aria-live="polite"
            className="w-full pt-8 border-t border-white/15 get-in-touch-form"
          >
            {submitted ? (
              <div className="rounded-3xl bg-white/10 border border-[#F16B0D]/50 p-8 text-left space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h4 className="text-[2vw] max-[1025px]:text-[3.5vw] max-md:text-[5.5vw] text-white">
                    Brief Dispatched to Michael Okpala
                  </h4>
                  {referenceId && (
                    <span className="text-xs font-mono px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[#F16B0D]">
                      Sprint Ref: {referenceId}
                    </span>
                  )}
                </div>
                <p className="text-[1.15vw] max-[1025px]:text-[2.2vw] max-md:text-[3.8vw] text-white/80">
                  Thank you, <span className="text-white font-medium">{name}</span>. Your{' '}
                  <span className="text-[#F16B0D]">
                    {selectedServices.join(' + ') || 'Custom Sprint'}
                  </span>{' '}
                  inquiry is logged. Expect a response within 2 hours (Lagos WAT), or launch an
                  instant WhatsApp thread right now.
                </p>
                {lagosTimestamp && (
                  <p className="text-xs text-white/60 font-mono">
                    Logged (Lagos WAT): {lagosTimestamp}
                  </p>
                )}
                {deliveryStatus && (
                  <div className="rounded-2xl bg-black/40 border border-white/15 p-4 text-xs space-y-1.5">
                    <p className="text-white font-medium">
                      {deliveryStatus.sent
                        ? `Inbox Notification Dispatched ✓ ${deliveryStatus.emailId ? `(ID: ${deliveryStatus.emailId})` : ''}`
                        : `Email Dispatch Notice: ${deliveryStatus.error || 'Queued'}`}
                    </p>
                    {deliveryStatus.deliveredTo && deliveryStatus.deliveredTo.length > 0 && (
                      <p className="text-[#F16B0D]">
                        Destination Mailbox: {deliveryStatus.deliveredTo.join(', ')}
                      </p>
                    )}
                    {deliveryStatus.note && (
                      <p className="text-white/65 leading-relaxed">{deliveryStatus.note}</p>
                    )}
                  </div>
                )}
                <div className="flex flex-wrap gap-4 pt-2">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 rounded-full bg-linear-to-r from-[#F16B0D] to-[#E61416] text-white text-sm font-medium"
                  >
                    Instant WhatsApp Chat (+234 806 782 0332)
                  </a>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="px-5 py-3 rounded-full border border-white/25 text-white text-sm cursor-pointer"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleDirectSubmit} className="space-y-6 text-left" noValidate>
                <div className="flex flex-col gap-3">
                  <span className="text-xs uppercase tracking-widest text-white/70">
                    Select Service Pillars (Multi-Select)
                  </span>
                  <div className="flex flex-wrap gap-2.5">
                    {SERVICE_PILLARS.map((pillar) => {
                      const active = selectedServices.includes(pillar.title);
                      return (
                        <button
                          key={pillar.title}
                          type="button"
                          onClick={() => toggleService(pillar.title)}
                          aria-pressed={active}
                          className={`px-4 py-2 rounded-full text-xs md:text-sm transition-all cursor-pointer border whitespace-nowrap ${
                            active
                              ? 'bg-linear-to-r from-[#F16B0D] to-[#E61416] text-white border-transparent'
                              : 'bg-white/10 text-white/80 border-white/20 hover:border-white/50'
                          }`}
                        >
                          {pillar.title}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 max-[1025px]:grid-cols-1">
                  <input
                    type="text"
                    placeholder="Your Name*"
                    aria-label="Footer Inquiry Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-5 py-3.5 rounded-full bg-white/15 border border-white/20 text-white text-sm focus:outline-none focus:border-[#F16B0D]"
                  />
                  <input
                    type="email"
                    placeholder="Email Address*"
                    aria-label="Footer Inquiry Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-5 py-3.5 rounded-full bg-white/15 border border-white/20 text-white text-sm focus:outline-none focus:border-[#F16B0D]"
                  />
                  <input
                    type="text"
                    placeholder="Project Brief & Target Launch*"
                    aria-label="Footer Inquiry Brief"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-5 py-3.5 rounded-full bg-white/15 border border-white/20 text-white text-sm focus:outline-none focus:border-[#F16B0D]"
                  />
                </div>

                {formError && (
                  <p className="text-xs text-[#F16B0D]" role="alert">
                    {formError}
                  </p>
                )}

                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-7 py-3.5 rounded-full bg-linear-to-r from-[#F16B0D] to-[#E61416] text-white text-sm font-medium cursor-pointer hover:opacity-95 transition-opacity disabled:opacity-60"
                    >
                      {submitting ? 'Dispatching Brief...' : 'Submit Project Inquiry'}
                    </button>
                    <a
                      href="https://wa.me/2348067820332"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-3.5 rounded-full border border-white/30 bg-white/10 hover:bg-white hover:text-[#111111] text-white text-sm font-normal transition-colors"
                    >
                      Instant WhatsApp Chat
                    </a>
                  </div>
                  <p className="text-xs text-white/60 tabular-nums">
                    48h Rapid Sprint • 85+ Shipped • 4.4x Blended ROAS • 98% Retention
                  </p>
                </div>
              </form>
            )}
          </div>

          {/* Bottom Row inside Footer Card: Reach Out + Social Icons */}
          <div className="flex w-full items-end justify-between gap-36 h-auto footer-content max-[1025px]:w-full max-[1025px]:items-center max-[1025px]:text-center max-[1025px]:gap-10 max-md:gap-10 max-[1025px]:flex-col">
            <div className="w-fit text-white">
              <h6 className="uppercase mb-5 text-[1.25vw] max-[1025px]:text-[2.4vw] max-md:text-[4vw]">
                Reach Out — Lagos, Nigeria
              </h6>
              <ul className="space-y-2 text-[1.25vw] max-[1025px]:text-[2.4vw] max-md:text-[4vw]">
                <li className="under-multi-parent">
                  <a
                    href="https://wa.me/2348067820332"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="under-multi content-p"
                  >
                    +234 806 782 0332
                  </a>
                </li>
                <li className="under-multi-parent">
                  <a href="mailto:support@tekbrandify.com.ng" className="under-multi content-p">
                    support@tekbrandify.com.ng
                  </a>
                </li>
              </ul>
            </div>

            <div className="flex flex-col justify-between h-fit">
              <ul className="flex gap-4">
                {SOCIAL_LINKS.map((social) => (
                  <li key={social.label} className="group">
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className="rounded-full relative block p-2.5 border overflow-hidden bg-white/5 transition-all duration-300 ease-in-out group-hover:scale-[0.95]"
                    >
                      <div className="w-5 h-5 flex items-center justify-center">
                        <img
                          src={social.icon}
                          alt={social.label}
                          className="w-full h-full object-contain group-hover:invert transition-all duration-300 ease-in-out"
                        />
                      </div>
                      <div className="w-full h-full absolute inset-0 origin-center scale-0 group-hover:scale-100 bg-white rounded-full duration-300 ease-in-out z-[-1]" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="flex justify-between py-8 pt-12 text-lg text-white max-md:flex-col max-md:gap-2 max-md:text-sm max-md:text-center max-md:py-6 max-md:pt-8">
          <p>Copyright © TekBrandify® 2026 — Lagos, Nigeria</p>
          <p>
            Directed by:{' '}
            <a
              href="https://wa.me/2348067820332"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-[#F16B0D] transition-colors"
            >
              Michael Okpala
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
