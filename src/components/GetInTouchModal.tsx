import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { CaseStudyProject, SERVICE_PILLARS } from '../data/tekbrandifyData';
import {
  buildWhatsAppUrl,
  encodeNetlifyFormPayload,
  formatLagosDateTime,
  generateInquiryRef,
  validateInquiryPayload,
} from '../utils/copySplitter';
import { useLenis } from './LenisProvider';

interface ModalContextValue {
  openModal: (defaultService?: string) => void;
  openCaseStudy: (project: CaseStudyProject) => void;
}

const ModalContext = createContext<ModalContextValue | null>(null);

function CloseCircleButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Close"
      className="relative shrink-0 size-14 rounded-full overflow-hidden flex items-center justify-center cursor-pointer max-[1025px]:size-11 max-md:size-9 group"
    >
      <div className="absolute inset-0 w-full h-full bg-linear-to-r from-[#F16B0D] to-[#E61416]" />
      <span className="absolute h-0.5 z-2 w-4 rounded-full bg-white rotate-45 max-md:w-3 group-hover:rotate-225 duration-500 ease-in-out" />
      <span className="absolute h-0.5 z-2 w-4 rounded-full bg-white -rotate-45 max-md:w-3 group-hover:rotate-135 duration-500 ease-in-out" />
    </button>
  );
}

export function GetInTouchModalProvider({ children }: { children: React.ReactNode }) {
  const lenis = useLenis();
  const [isOpen, setIsOpen] = useState(false);
  const [activeProject, setActiveProject] = useState<CaseStudyProject | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>(['Brand Identity', 'Web Development']);
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
  const [errorMsg, setErrorMsg] = useState('');

  const openModal = useCallback((defaultService?: string) => {
    if (defaultService) {
      setSelectedServices((prev) =>
        prev.includes(defaultService) ? prev : [...prev, defaultService]
      );
    }
    setSubmitted(false);
    setDeliveryStatus(null);
    setErrorMsg('');
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const openCaseStudy = useCallback((project: CaseStudyProject) => {
    setActiveProject(project);
  }, []);

  const closeCaseStudy = useCallback(() => {
    setActiveProject(null);
  }, []);

  useEffect(() => {
    const anyModalOpen = isOpen || Boolean(activeProject);
    if (!anyModalOpen) {
      lenis?.start();
      return;
    }
    lenis?.stop();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isOpen) setIsOpen(false);
        if (activeProject) setActiveProject(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      lenis?.start();
    };
  }, [isOpen, activeProject, lenis]);

  const toggleService = (serviceTitle: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceTitle)
        ? prev.filter((s) => s !== serviceTitle)
        : [...prev, serviceTitle]
    );
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const check = validateInquiryPayload({
      name,
      email,
      phone,
      services: selectedServices,
      message,
    });
    if (!check.valid) {
      setErrorMsg(check.error || 'Please fill in your name, email, and project brief.');
      return;
    }

    setErrorMsg('');
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
          phone: phone.trim(),
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
          phone: phone.trim(),
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
        phone: phone.trim(),
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

  const value = useMemo(
    () => ({ openModal, openCaseStudy }),
    [openModal, openCaseStudy]
  );

  const whatsappHref = buildWhatsAppUrl({
    name,
    email,
    services: selectedServices,
    message,
  });

  return (
    <ModalContext.Provider value={value}>
      {children}

      {/* Get in Touch Modal (exact reference module 33855 layout) */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="get-in-touch-modal-title"
          className="fixed inset-0 z-[120] flex items-center justify-center px-[4vw] max-md:px-4 bg-black/80 backdrop-blur-md"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="relative w-full max-w-[75vw] max-h-[85vh] overflow-y-auto rounded-[2vw] bg-[#0d0d0d]/95 backdrop-blur-lg border border-white/15 text-white p-[3vw] max-[1025px]:max-w-[85vw] max-[1025px]:p-8 max-md:max-w-full max-md:p-6 max-md:rounded-3xl">
            <div className="absolute top-[2vw] right-[2vw] max-[1025px]:top-6 max-[1025px]:right-6 max-md:top-4 max-md:right-4">
              <CloseCircleButton onClick={closeModal} />
            </div>

            <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-[3vw] items-start max-[1025px]:grid-cols-1 max-[1025px]:gap-8 pt-[2vw]">
              <div>
                <h2
                  id="get-in-touch-modal-title"
                  className="text-[4.2vw] leading-[1.1]! max-[1025px]:text-[5vw] max-md:text-[8vw]"
                >
                  Start a Sprint
                </h2>
                <p className="mt-[1vw] text-[1.1vw] text-white/80 max-[1025px]:text-[2.4vw] max-md:text-[4vw]">
                  Partner with Michael Okpala &amp; TekBrandify® in Lagos, Nigeria. Launch in 48h with 4.4x blended ROAS architecture.
                </p>
                <div className="mt-[2vw] space-y-1.5 text-[0.95vw] text-white/70 max-[1025px]:text-[2.1vw] max-md:text-[3.5vw]">
                  <p>Direct Line: +234 806 782 0332</p>
                  <p>
                    Email:{' '}
                    <a
                      href="mailto:support@tekbrandify.com.ng"
                      className="text-white hover:text-[#F16B0D] underline transition-colors"
                    >
                      support@tekbrandify.com.ng
                    </a>
                  </p>
                  <p>Location: Lagos, Nigeria (6°27&apos;N / 3°21&apos;E • Elev. 7 m)</p>
                  <p>Time Zone: WAT (UTC+1) • Currency: Naira (NGN) • English</p>
                </div>
              </div>

              <div className="get-in-touch-form" aria-live="polite">
                {submitted ? (
                  <div className="rounded-2xl border border-[#F16B0D]/40 bg-white/5 p-6 space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-[1.8vw] max-[1025px]:text-[3.5vw] max-md:text-[5vw] text-[#F16B0D]">
                        Inquiry Received — Sprint Queued
                      </h3>
                      {referenceId && (
                        <span className="text-xs font-mono px-2.5 py-1 rounded bg-white/10 text-white/90">
                          {referenceId}
                        </span>
                      )}
                    </div>
                    <p className="text-[1.1vw] max-[1025px]:text-[2.4vw] max-md:text-[3.8vw] text-white/80">
                      Thank you, {name}. Michael Okpala&apos;s desk has received your brief for{' '}
                      {selectedServices.join(', ') || 'Custom Engagement'}.
                    </p>
                    {lagosTimestamp && (
                      <p className="text-xs text-white/60 font-mono">
                        Logged (Lagos WAT): {lagosTimestamp}
                      </p>
                    )}
                    {deliveryStatus && (
                      <div className="rounded-xl bg-white/5 border border-white/10 p-3.5 text-xs space-y-1">
                        <p className="text-white/90 font-medium">
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
                          <p className="text-white/60 leading-relaxed">{deliveryStatus.note}</p>
                        )}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-3 pt-2">
                      <a
                        href={whatsappHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-3 rounded-full bg-linear-to-r from-[#F16B0D] to-[#E61416] text-white text-sm font-medium"
                      >
                        Continue on WhatsApp (+234 806 782 0332)
                      </a>
                      <button
                        type="button"
                        onClick={() => setSubmitted(false)}
                        className="px-5 py-3 rounded-full border border-white/20 text-white text-sm"
                      >
                        Edit Brief
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleModalSubmit} className="space-y-4" noValidate>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-white/60 mb-2">
                        Select Service Pillars
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {SERVICE_PILLARS.map((pillar) => {
                          const active = selectedServices.includes(pillar.title);
                          return (
                            <button
                              key={pillar.title}
                              type="button"
                              onClick={() => toggleService(pillar.title)}
                              aria-pressed={active}
                              className={`px-3.5 py-1.5 rounded-full text-xs border transition-colors cursor-pointer whitespace-nowrap ${
                                active
                                  ? 'bg-linear-to-r from-[#F16B0D] to-[#E61416] border-transparent text-white'
                                  : 'bg-white/10 border-white/20 text-white/80 hover:border-white/50'
                              }`}
                            >
                              {pillar.title}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
                      <input
                        type="text"
                        placeholder="Your Name*"
                        aria-label="Your Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-5 py-3.5 rounded-full bg-white/15 border border-white/15 text-white text-sm focus:outline-none focus:border-[#F16B0D]"
                      />
                      <input
                        type="email"
                        placeholder="Email Address*"
                        aria-label="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-5 py-3.5 rounded-full bg-white/15 border border-white/15 text-white text-sm focus:outline-none focus:border-[#F16B0D]"
                      />
                    </div>

                    <input
                      type="tel"
                      placeholder="Phone / WhatsApp Number"
                      aria-label="Phone Number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-5 py-3.5 rounded-full bg-white/15 border border-white/15 text-white text-sm focus:outline-none focus:border-[#F16B0D]"
                    />

                    <textarea
                      rows={3}
                      placeholder="Your Project Brief, Goals & Timeline*"
                      aria-label="Your Message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full px-5 py-3.5 rounded-3xl bg-white/15 border border-white/15 text-white text-sm focus:outline-none focus:border-[#F16B0D]"
                    />

                    {errorMsg && (
                      <p className="text-xs text-[#F16B0D]" role="alert">
                        {errorMsg}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="px-7 py-3.5 rounded-full bg-linear-to-r from-[#F16B0D] to-[#E61416] text-white text-sm font-medium cursor-pointer hover:opacity-95 transition-opacity disabled:opacity-60"
                      >
                        {submitting ? 'Dispatching Brief...' : 'Send Project Brief'}
                      </button>
                      <a
                        href={whatsappHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-3.5 rounded-full border border-white/25 bg-white/5 hover:bg-white/15 text-white text-sm font-normal transition-colors"
                      >
                        Instant WhatsApp Chat
                      </a>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Case Study Quick-View Modal */}
      {activeProject && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="case-study-modal-title"
          className="fixed inset-0 z-[120] flex items-center justify-center px-[4vw] max-md:px-4 bg-black/85 backdrop-blur-md"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeCaseStudy();
          }}
        >
          <div className="relative w-full max-w-[78vw] max-h-[88vh] overflow-y-auto rounded-[2vw] bg-[#0b0b0b] border border-white/15 text-white p-[3vw] max-[1025px]:max-w-[90vw] max-[1025px]:p-6 max-md:max-w-full max-md:p-5 max-md:rounded-3xl">
            <div className="absolute top-[2vw] right-[2vw] max-[1025px]:top-5 max-[1025px]:right-5 z-10">
              <CloseCircleButton onClick={closeCaseStudy} />
            </div>

            <div className="grid grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-[3vw] items-start max-[1025px]:grid-cols-1">
              <div className="rounded-xl overflow-hidden bg-[#161616] border border-white/10">
                <img
                  src={activeProject.imgSrc}
                  alt={activeProject.name}
                  className="w-full h-[28vw] max-[1025px]:h-[45vw] max-md:h-[58vw] object-cover"
                />
              </div>

              <div className="space-y-5 pr-8 max-md:pr-0">
                <div className="text-xs uppercase tracking-widest text-[#F16B0D]">
                  {activeProject.tags.join('  •  ')} — {activeProject.year}
                </div>
                <h2
                  id="case-study-modal-title"
                  className="text-[3vw] leading-[1.1] max-[1025px]:text-[5vw] max-md:text-[7vw]"
                >
                  {activeProject.name}
                </h2>
                <p className="text-sm text-white/65">{activeProject.client}</p>

                <div className="grid grid-cols-3 gap-3 py-3 border-y border-white/10 tabular-nums">
                  <div>
                    <p className="text-xs text-white/50">Sprint Velocity</p>
                    <p className="text-sm font-medium text-white mt-0.5">
                      {activeProject.sprintDuration}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-white/50">Performance</p>
                    <p className="text-sm font-medium text-[#F16B0D] mt-0.5">
                      {activeProject.roasMetric}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-white/50">Commercial Outcome</p>
                    <p className="text-sm font-medium text-white mt-0.5">
                      {activeProject.retentionImpact}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs uppercase tracking-wider text-white/50">The Challenge</h4>
                  <p className="text-sm leading-relaxed text-white/80">{activeProject.challenge}</p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs uppercase tracking-wider text-white/50">
                    TekBrandify® Architecture
                  </h4>
                  <p className="text-sm leading-relaxed text-white/80">{activeProject.solution}</p>
                </div>

                <div>
                  <h4 className="text-xs uppercase tracking-wider text-white/50 mb-2">
                    Key Deliverables
                  </h4>
                  <ul className="grid grid-cols-2 gap-2 max-md:grid-cols-1">
                    {activeProject.deliverables.map((item) => (
                      <li key={item} className="text-xs text-white/85 flex items-center gap-2">
                        <span className="size-1.5 rounded-full bg-[#F16B0D] shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      const tag = activeProject.tags[0];
                      closeCaseStudy();
                      openModal(tag);
                    }}
                    className="px-6 py-3 rounded-full bg-linear-to-r from-[#F16B0D] to-[#E61416] text-white text-sm font-medium cursor-pointer"
                  >
                    Book Similar 48h Sprint
                  </button>
                  <a
                    href={`https://wa.me/2348067820332?text=${encodeURIComponent(
                      `Hello Michael @ TekBrandify®, I just reviewed the ${activeProject.name} case study and would love to discuss a project.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-3 rounded-full border border-white/20 text-white text-sm hover:bg-white/10 transition-colors"
                  >
                    Ask Michael on WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
}

export function useGetInTouchModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) {
    throw new Error('useGetInTouchModal must be used within GetInTouchModalProvider');
  }
  return ctx;
}
