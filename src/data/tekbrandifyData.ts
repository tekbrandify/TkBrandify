export interface CaseStudyProject {
  id: string;
  name: string;
  tags: string[];
  imgSrc: string;
  client: string;
  year: string;
  sprintDuration: string;
  roasMetric: string;
  retentionImpact: string;
  challenge: string;
  solution: string;
  deliverables: string[];
  liveUrl: string;
}

export const SHOWCASE_PROJECTS: CaseStudyProject[] = [
  {
    id: 'aurelia-botanicals',
    name: 'Aurelia Botanicals',
    tags: ['Brand Identity', 'Headless E-Commerce'],
    imgSrc: '/media/portfolio-img-1.006uvpvyjl7kz.webp',
    client: 'Aurelia Botanicals Luxury Skincare',
    year: '2026',
    sprintDuration: '48h Rapid Sprint',
    roasMetric: '4.8x Blended ROAS',
    retentionImpact: '+64% Repeat Purchase Velocity',
    challenge:
      'Aurelia Botanicals needed to transition from a regional apothecary into a global direct-to-consumer luxury skincare flagship with sub-second page transitions and tactile editorial storytelling.',
    solution:
      'Led by Michael Okpala, TekBrandify® engineered a bespoke visual identity system and a custom WebGL + Shopify Hydrogen storefront featuring sensory product rituals and automated AI replenishment flows.',
    deliverables: [
      'Complete Brand Identity & Packaging Architecture',
      'Headless E-Commerce Storefront & GSAP Motion System',
      'Conversion Rate Optimization & Checkout Funnel',
      'Automated Post-Purchase AI Concierge',
    ],
    liveUrl: '#footer',
  },
  {
    id: 'nexus-ai',
    name: 'Nexus AI',
    tags: ['AI Integration', 'Product UI/UX'],
    imgSrc: '/media/portfolio-img-2.2ys49j7gkfz7j.webp',
    client: 'Nexus Autonomous Systems Inc.',
    year: '2026',
    sprintDuration: '48h Rapid Sprint',
    roasMetric: '4.4x Blended ROAS',
    retentionImpact: '98% Enterprise Retention',
    challenge:
      'Nexus AI required a category-defining product interface and launch platform capable of demystifying multi-agent enterprise workflows for Fortune 500 technical buyers.',
    solution:
      'TekBrandify® architected a high-contrast kinetic design system, interactive telemetry sandboxes, and an AI-powered lead qualification engine that tripled enterprise demo velocity.',
    deliverables: [
      'Enterprise Design System & Component Token Library',
      'Interactive Workflow Canvas & Product UI/UX',
      'High-Velocity Marketing Flagship & 3D Motion',
      'LLM Lead Scoring & CRM Automation Pipeline',
    ],
    liveUrl: '#footer',
  },
  {
    id: 'kora-pay',
    name: 'Kora Pay',
    tags: ['Web Development', 'Brand Strategy'],
    imgSrc: '/media/portfolio-img-3.04bada5ydkt1h.webp',
    client: 'Kora Pan-African Treasury Network',
    year: '2026',
    sprintDuration: '48h Rapid Sprint',
    roasMetric: '4.6x Blended ROAS',
    retentionImpact: '$1.8B+ Annualized Volume',
    challenge:
      'Expanding cross-border settlement across 14 African and European corridors demanded institutional trust, developer-first documentation clarity, and a commanding new brand narrative.',
    solution:
      'We re-engineered the Kora Pay digital flagship from Lagos to London—unifying institutional positioning, interactive settlement calculators, and real-time API status architecture.',
    deliverables: [
      'Pan-African Brand Positioning & Visual Language',
      'Full-Stack Next-Gen Web Platform & API Explorer',
      'Interactive FX & Settlement Fee Simulator',
      'Growth Attribution & Performance Marketing Engine',
    ],
    liveUrl: '#footer',
  },
  {
    id: 'veloce-mobility',
    name: 'Veloce Mobility',
    tags: ['UI/UX Design', 'Interactive Experience'],
    imgSrc: '/media/portfolio-img-4.0wnkqlz-f5rcj.webp',
    client: 'Veloce Electric Performance',
    year: '2026',
    sprintDuration: '48h Rapid Sprint',
    roasMetric: '4.2x Blended ROAS',
    retentionImpact: '14,200+ Pre-Order Reservations',
    challenge:
      'Launching a flagship electric urban performance vehicle required an immersive configurator experience that captured aerodynamic precision without sacrificing mobile frame rates.',
    solution:
      'TekBrandify® crafted a 60fps scroll-driven vehicle showcase, bespoke cockpit UI/UX language, and an instant reservation flow integrated with automated WhatsApp & concierge onboarding.',
    deliverables: [
      'Vehicle Configurator UI/UX & HMI Design System',
      'Scroll-Scrubbed Cinematic Product Launch Site',
      'Reservation Checkout & Automated Concierge',
      'Go-To-Market Launch Strategy & Paid Acquisition',
    ],
    liveUrl: '#footer',
  },
];

export const SERVICE_PILLARS = [
  {
    title: 'Brand Identity',
    items: [
      'Visual Identity Systems',
      'Brand Guidelines & DNA',
      'Editorial Typography',
      'Art Direction & Packaging',
    ],
    href: '#footer',
  },
  {
    title: 'Web Development',
    items: [
      'React & Next.js Flagships',
      'GSAP & WebGL Motion',
      'Headless E-Commerce',
      'High-Speed Custom Builds',
    ],
    href: '#footer',
  },
  {
    title: 'UI/UX Design',
    items: [
      'Design Systems & Tokens',
      'Interactive Prototyping',
      'Conversion Architecture',
      'Product Interface Craft',
    ],
    href: '#footer',
  },
  {
    title: 'Brand Strategy & Marketing',
    items: [
      'Market Positioning',
      '4.4x Blended ROAS Funnels',
      'Growth & Launch Campaigns',
      'Category Narrative Design',
    ],
    href: '#footer',
  },
  {
    title: 'AI Integration & Automation',
    items: [
      'Custom AI Agents & Workflows',
      'CRM & Pipeline Automation',
      'Intelligent Lead Engines',
      'LLM Product Integration',
    ],
    href: '#footer',
  },
];

export const WHY_WORK_CARDS = [
  {
    iconName: 'rocket' as const,
    title: '48h Rapid Sprint Delivery',
    description:
      'Ship flagship brand systems and high-converting custom web platforms into production in as little as 48 hours—engineered in Lagos for global velocity.',
  },
  {
    iconName: 'sparkles' as const,
    title: '85+ Shipped & 98% Retention',
    description:
      'Over 85 category-defining digital products launched with a 98% partner retention rate, directed by Michael Okpala with obsessive typographic and motion precision.',
  },
  {
    iconName: 'zap' as const,
    title: '4.4x Blended ROAS & AI Scale',
    description:
      'Every pixel and autonomous workflow is architected for commercial impact—combining award-winning creative direction with 4.4x blended ROAS performance.',
  },
];

export const AWARDS_LIST = [
  {
    title: 'Site of the Day — Aurelia Botanicals',
    meta: '2026 - AWWWARDS • 48H RAPID SPRINT',
    imgSrc: '/media/portfolio-img-1.006uvpvyjl7kz.webp',
  },
  {
    title: 'Best AI Product Experience — Nexus AI',
    meta: '2026 - FWA OF THE DAY • 85+ SHIPPED',
    imgSrc: '/media/portfolio-img-2.2ys49j7gkfz7j.webp',
  },
  {
    title: 'Fintech Platform Excellence — Kora Pay',
    meta: '2026 - WEBBY OFFICIAL SELECTION • 4.4X ROAS',
    imgSrc: '/media/portfolio-img-3.04bada5ydkt1h.webp',
  },
  {
    title: 'Agency Partner Leadership — TekBrandify®',
    meta: '2026 - AFRICAN DIGITAL SUMMIT • 98% RETENTION',
    imgSrc: '/media/portfolio-img-4.0wnkqlz-f5rcj.webp',
  },
];

export const TESTIMONIALS_LIST = [
  {
    quote:
      "Partnering with Michael Okpala and TekBrandify® completely transformed Aurelia Botanicals' global launch. Within weeks of our 48h rapid sprint, conversions surged and we achieved a 4.8x blended ROAS. They don't just build websites—they engineer category authority.",
    name: 'Amara Nwosu',
    role: 'CMO, Aurelia Botanicals',
    image: '/media/testimonial-1.1n9zd7_gpp9li.webp',
  },
  {
    quote:
      'Michael has an extraordinary command of both creative direction and technical architecture. TekBrandify® took our complex multi-agent AI platform and turned it into an intuitive, kinetic flagship that enterprise buyers immediately trust.',
    name: 'Marcus Reed',
    role: 'Founder & CEO, Nexus AI',
    image: '/media/testimonial-5.1p4twu_lvqrj9.webp',
  },
  {
    quote:
      'We came in with an aggressive pan-African expansion deadline. TekBrandify® unified our brand strategy, rebuilt our developer experience, and shipped a flagship platform that outperformed every quarterly growth benchmark.',
    name: 'Tunde Bakare',
    role: 'VP Growth, Kora Pay',
    image: '/media/testimonial-2.2mihuvuv56utd.webp',
  },
  {
    quote:
      'What sets TekBrandify® apart is the seamless fusion of brand strategy, GSAP motion craft, and AI automation. Every design decision was backed by clear commercial rationale—explaining why they maintain a 98% client retention rate.',
    name: 'Daniel Ortiz',
    role: 'Head of Product, Veloce Mobility',
    image: '/media/testimonial-3.25i3vd2ma4kps.webp',
  },
  {
    quote:
      'Our previous digital presence felt static. What Michael Okpala and the TekBrandify® team engineered feels like a living product—session duration doubled, qualified pipeline grew 3.6x, and our brand finally matches our ambition.',
    name: 'Hannah Kim',
    role: 'Managing Partner, Volterra Ventures',
    image: '/media/testimonial-4.0mqg9hibqoxgk.webp',
  },
];

export const FAQ_LIST = [
  {
    question: 'Who is behind TekBrandify® and what projects do you take on?',
    answer:
      'TekBrandify® is a premier creative and technical brand engineering studio headquartered in Lagos, Nigeria, founded and led by Michael Okpala (Founder & Creative/Technical Director). With 85+ shipped products and a 98% client retention rate, we partner with ambitious founders and global enterprises across Brand Identity, Web Development, UI/UX Design, Brand Strategy & Marketing, and AI Integration & Automation.',
  },
  {
    question: 'How does your signature 48h Rapid Sprint delivery work?',
    answer:
      'Our 48h Rapid Sprint compresses weeks of agency overhead into a hyper-focused 48-hour execution window for high-impact brand launches, landing flagships, and interactive prototypes. For comprehensive multi-page ecosystems, custom headless builds, and full AI automation pipelines, engagements typically span 2 to 4 weeks with daily milestone deployments.',
  },
  {
    question: 'How do you achieve a 4.4x Blended ROAS across client engagements?',
    answer:
      'We refuse to separate visual aesthetics from revenue architecture. Every TekBrandify® build pairs editorial typography and choreographed GSAP motion with sub-second load performance, conversion-engineered UX flows, and automated AI lead capture—driving a verified 4.4x blended ROAS across our partner portfolio.',
  },
  {
    question: 'Can you integrate AI workflows and automation into our existing stack?',
    answer:
      'Yes. Beyond brand identity and custom React/Next.js or Webflow engineering, we architect custom LLM agents, automated WhatsApp & CRM qualification pipelines, and internal operational automations that plug directly into your existing product and marketing infrastructure.',
  },
  {
    question: 'How do we kick off a project or book a sprint with Michael Okpala?',
    answer:
      'Select your required service pillars in the inquiry form below or click the instant WhatsApp chat button (+234 806 782 0332) to connect directly with Michael Okpala and lock in your sprint window.',
  },
];
