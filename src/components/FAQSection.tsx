import React, {
  createContext,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { getGsap } from '../utils/gsapGlobal';
import { FAQ_LIST } from '../data/tekbrandifyData';
import CopyWrapper from './CopyWrapper';

interface FAQItemContextValue {
  isOpen: boolean;
  contentOuterRef: React.RefObject<HTMLDivElement | null>;
  contentInnerRef: React.RefObject<HTMLDivElement | null>;
  contentId: string;
  buttonId: string;
  titleClassName: string;
  contentClassName: string;
  iconClassName: string;
  iconSize: number;
  iconStrokeWidth: number;
}

const FAQItemContext = createContext<FAQItemContextValue | null>(null);

function useFAQItem() {
  const ctx = useContext(FAQItemContext);
  if (!ctx) throw new Error('FAQTitle and FAQContent must be used inside FAQWrapper.');
  return ctx;
}

function FAQWrapper({
  children,
  className = '',
  titleClassName = '',
  contentClassName = '',
  iconClassName = '',
  iconSize = 18,
  iconStrokeWidth = 2,
  duration = 0.45,
  defaultOpen = false,
  controlledOpen,
  onToggle,
}: {
  children: React.ReactNode;
  className?: string;
  titleClassName?: string;
  contentClassName?: string;
  iconClassName?: string;
  iconSize?: number;
  iconStrokeWidth?: number;
  duration?: number;
  defaultOpen?: boolean;
  controlledOpen?: boolean;
  onToggle?: (next: boolean) => void;
}) {
  const isControlled = typeof controlledOpen === 'boolean';
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isOpen = isControlled ? controlledOpen : uncontrolledOpen;

  const contentOuterRef = useRef<HTMLDivElement>(null);
  const contentInnerRef = useRef<HTMLDivElement>(null);
  const lastHeightRef = useRef(0);
  const reducedMotionRef = useRef(
    typeof window !== 'undefined' &&
      (window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false)
  );
  const contentId = useId();
  const buttonId = useId();

  useEffect(() => {
    const mql = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!mql) return;
    const onChange = (e: MediaQueryListEvent) => {
      reducedMotionRef.current = e.matches;
    };
    reducedMotionRef.current = mql.matches;
    mql.addEventListener?.('change', onChange);
    return () => mql.removeEventListener?.('change', onChange);
  }, []);

  const toggle = () => {
    if (isControlled) {
      onToggle?.(!controlledOpen);
    } else {
      setUncontrolledOpen((prev) => {
        const next = !prev;
        onToggle?.(next);
        return next;
      });
    }
  };

  useLayoutEffect(() => {
    const gsap = getGsap();
    if (!contentOuterRef.current || !contentInnerRef.current || !gsap) return;
    const outer = contentOuterRef.current;
    const inner = contentInnerRef.current;
    gsap.killTweensOf([outer, inner]);
    const dur = reducedMotionRef.current ? 0 : duration;

    if (isOpen) {
      gsap.set(outer, { overflow: 'hidden', height: 'auto' });
      const targetHeight = outer.scrollHeight;
      lastHeightRef.current = targetHeight;
      gsap.set(outer, { height: 0 });
      gsap.fromTo(
        outer,
        { height: 0 },
        {
          height: targetHeight,
          duration: dur,
          ease: 'power3.out',
          onComplete: () => {
            gsap.set(outer, { height: 'auto', overflow: 'visible' });
          },
        }
      );
    } else {
      gsap.set(outer, { overflow: 'hidden' });
      gsap.fromTo(
        outer,
        { height: lastHeightRef.current },
        { height: 0, duration: dur, ease: 'power3.out' }
      );
    }
  }, [isOpen, duration]);

  return (
    <FAQItemContext.Provider
      value={{
        isOpen,
        contentOuterRef,
        contentInnerRef,
        contentId,
        buttonId,
        titleClassName,
        contentClassName,
        iconClassName,
        iconSize,
        iconStrokeWidth,
      }}
    >
      <div
        className={`cursor-pointer ${className}`}
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        aria-controls={contentId}
        id={buttonId}
        onClick={(e) => {
          if (!(e.target as HTMLElement).closest('a, button, input, textarea, select')) {
            toggle();
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggle();
          }
        }}
      >
        {children}
      </div>
    </FAQItemContext.Provider>
  );
}

function FAQTitle({
  children,
  className = '',
  showIcon = true,
  iconPosition = 'right',
  iconMode = 'rotate',
}: {
  children: React.ReactNode;
  className?: string;
  showIcon?: boolean;
  iconPosition?: 'left' | 'right';
  iconMode?: 'rotate' | 'rotate-left-down';
}) {
  const { isOpen, titleClassName, iconClassName, iconSize, iconStrokeWidth } = useFAQItem();
  const iconEl = showIcon ? (
    <div className={`shrink-0 ${iconClassName}`}>
      {iconMode === 'rotate-left-down' ? (
        <ChevronRight
          size={iconSize}
          strokeWidth={iconStrokeWidth}
          className={`transition-transform duration-300 ease-out motion-reduce:transition-none ${
            isOpen ? 'rotate-90' : 'rotate-0'
          }`}
          aria-hidden="true"
        />
      ) : (
        <ChevronDown
          size={iconSize}
          strokeWidth={iconStrokeWidth}
          className={`transition-transform duration-300 ease-out motion-reduce:transition-none ${
            isOpen ? 'rotate-180' : 'rotate-0'
          }`}
          aria-hidden="true"
        />
      )}
    </div>
  ) : null;

  return (
    <div className={`flex w-full items-center justify-between gap-6 ${titleClassName} ${className}`}>
      {iconPosition === 'left' ? (
        <>
          {iconEl}
          <div className="flex-1">{children}</div>
        </>
      ) : (
        <>
          <div className="flex-1">{children}</div>
          {iconEl}
        </>
      )}
    </div>
  );
}

function FAQContent({
  children,
  className = '',
  innerClassName = '',
}: {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
}) {
  const { isOpen, contentOuterRef, contentInnerRef, contentId, buttonId, contentClassName } =
    useFAQItem();
  return (
    <div
      id={contentId}
      ref={contentOuterRef}
      role="region"
      aria-labelledby={buttonId}
      style={{ height: isOpen ? 'auto' : 0, overflow: isOpen ? 'visible' : 'hidden' }}
      className={contentClassName}
    >
      <div ref={contentInnerRef} className={className}>
        <div className={innerClassName}>{children}</div>
      </div>
    </div>
  );
}

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const raf = window.requestAnimationFrame(() => setReducedMotion(mql.matches));
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mql.addEventListener('change', onChange);
    return () => {
      window.cancelAnimationFrame(raf);
      mql.removeEventListener('change', onChange);
    };
  }, []);

  useEffect(() => {
    const gsap = getGsap();
    if (!gsap) return;
    const els = itemRefs.current.filter(Boolean);
    if (reducedMotion) {
      gsap.set(els, { opacity: 1, y: 0 });
      return;
    }
    const tweens = els.map((el) =>
      gsap.fromTo(
        el,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      )
    );
    return () => {
      tweens.forEach((t) => t.scrollTrigger?.kill());
      tweens.forEach((t) => t.kill());
    };
  }, [reducedMotion]);

  return (
    <section
      className="w-screen py-[6vw] px-[10vw] relative bg-[#070707] text-white max-[1025px]:px-[5vw]"
      id="faq"
    >
      <CopyWrapper stagger={0.015}>
        <h2 className="text-[5.5vw] text-center mb-[6vw] max-[1025px]:text-[7vw] max-md:text-[9vw]">
          Frequently Asked Questions
        </h2>
      </CopyWrapper>

      <div className="w-full mx-auto">
        {FAQ_LIST.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={item.question}
              ref={(el) => {
                itemRefs.current[idx] = el;
              }}
              className="opacity-0"
            >
              <FAQWrapper
                controlledOpen={isOpen}
                onToggle={() => setOpenIndex((prev) => (prev === idx ? -1 : idx))}
                className="border-b border-white/10 py-8 group max-md:py-5"
                duration={0.5}
              >
                <FAQTitle showIcon={false}>
                  <div className="flex items-center justify-between gap-6 w-full max-md:gap-4">
                    <span className="text-[1.5vw] font-normal max-[1025px]:text-[2.6vw] max-md:text-[4.2vw]">
                      {item.question}
                    </span>

                    <div className="relative shrink-0 size-14 rounded-full overflow-hidden flex items-center justify-center transition-colors duration-300 ease-out border border-white/20 max-[1025px]:size-11 max-md:size-9">
                      <span className="absolute h-[2px] z-2 w-4 rounded-full bg-white max-md:w-3" />
                      <span
                        className={`absolute h-[2px] z-2 w-4 rounded-full bg-white transition-transform duration-300 ease-out max-md:w-3 ${
                          isOpen ? 'rotate-0' : 'rotate-90'
                        }`}
                      />
                      <div
                        className={`absolute inset-0 w-full h-full bg-linear-to-r from-[#F16B0D] to-[#E61416] group-hover:scale-100 scale-0 ease-in-out origin-center rounded-full duration-300 ${
                          isOpen ? 'scale-100' : 'scale-0'
                        }`}
                      />
                    </div>
                  </div>
                </FAQTitle>

                <FAQContent className="pt-4 pr-[3vw] w-[80%] max-[1025px]:w-full max-[1025px]:pr-0 max-md:w-full max-md:pr-0">
                  <p className="text-[1.25vw] leading-[1.6] text-white/80 max-[1025px]:text-[2.2vw] max-md:text-[3.8vw]">
                    {item.answer}
                  </p>
                </FAQContent>
              </FAQWrapper>
            </div>
          );
        })}
      </div>
    </section>
  );
}
