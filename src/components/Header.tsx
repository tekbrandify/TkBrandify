import React, { useEffect, useRef, useState } from 'react';
import { getGsap } from '../utils/gsapGlobal';
import { formatLagosTime } from '../utils/copySplitter';
import TekBrandifyLogo from './TekBrandifyLogo';
import AnimatedButton from './AnimatedButton';
import { useGetInTouchModal } from './GetInTouchModal';

export default function Header() {
  const [blurred, setBlurred] = useState(false);
  const clockOffsetRef = useRef<number>(0);
  const [watTime, setWatTime] = useState(() => formatLagosTime(new Date()));
  const { openModal } = useGetInTouchModal();
  const headerRef = useRef<HTMLElement>(null);
  const lastScrollRef = useRef(0);
  const hiddenRef = useRef(false);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotionRef.current = mql.matches;
    const handler = (e: MediaQueryListEvent) => {
      reducedMotionRef.current = e.matches;
    };
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    let active = true;

    const syncAuthoritativeClock = async () => {
      try {
        const t0 = Date.now();
        const res = await fetch('/api/health', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          const t1 = Date.now();
          const rttHalf = Math.round((t1 - t0) / 2);
          if (typeof data?.serverTimeUtcMs === 'number' && active) {
            clockOffsetRef.current = data.serverTimeUtcMs + rttHalf - t1;
            setWatTime(formatLagosTime(new Date(Date.now() + clockOffsetRef.current)));
          }
        }
      } catch {
        // Fallback to local system UTC if offline
      }
    };

    syncAuthoritativeClock();
    const interval = window.setInterval(() => {
      setWatTime(formatLagosTime(new Date(Date.now() + clockOffsetRef.current)));
    }, 1000);
    const resyncInterval = window.setInterval(syncAuthoritativeClock, 60000);

    return () => {
      active = false;
      window.clearInterval(interval);
      window.clearInterval(resyncInterval);
    };
  }, []);

  useEffect(() => {
    lastScrollRef.current = window.scrollY;
    const onScroll = () => {
      const currentY = window.scrollY;
      setBlurred(currentY > 0.4 * window.innerHeight);

      if (!reducedMotionRef.current) {
        const gsap = getGsap();
        const delta = currentY - lastScrollRef.current;
        if (delta > 0 && currentY > 0 && !hiddenRef.current) {
          hiddenRef.current = true;
          gsap?.to(headerRef.current, {
            yPercent: -100,
            duration: 0.5,
            ease: 'power3.out',
          });
        } else if (delta < 0 && hiddenRef.current) {
          hiddenRef.current = false;
          gsap?.to(headerRef.current, {
            yPercent: 0,
            duration: 0.5,
            ease: 'power3.out',
          });
        }
      }
      lastScrollRef.current = currentY;
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      ref={headerRef}
      className={`w-screen h-fit py-[1.5vw] flex items-center justify-between px-[4vw] fixed inset-0 z-99 opacity-0 transition-[backdrop-filter] duration-500 ease-out max-[1025px]:py-[3vw] max-[1025px]:px-[5vw] max-md:py-4 ${
        blurred ? 'backdrop-blur-lg' : 'backdrop-blur-none'
      }`}
      id="header"
    >
      <a
        className="flex flex-col items-start gap-0.5 shrink-0"
        href="#hero"
        aria-label="TekBrandify Home"
      >
        <TekBrandifyLogo
          id="header-logo"
          className="w-[14vw] max-[1025px]:w-[28vw] max-md:w-[34vw] h-auto"
        />
        <span
          className="md:hidden text-[2.4vw] text-white/80 font-normal tracking-wide tabular-nums whitespace-nowrap"
          aria-label="Live Lagos WAT Time Mobile"
        >
          {watTime}
        </span>
      </a>

      <div
        className="hidden md:flex items-center gap-[0.6vw] text-[0.95vw] max-[1025px]:text-[1.8vw] text-white/85 font-normal tracking-wide tabular-nums whitespace-nowrap"
        aria-label="Live Lagos WAT Time"
      >
        <span>{watTime}</span>
      </div>

      <AnimatedButton
        btnText="Get in Touch"
        href="#footer"
        onClick={(e) => {
          e.preventDefault();
          openModal();
        }}
        className="border border-white/20!"
        textClassName="font-normal text-[1.15vw] max-[1025px]:text-[3vw] max-md:text-[4.2vw]"
        bgColor="#ffffff"
        dotColor="#070707"
        hoverTextColor="#ffffff"
        textColor="#111111"
      />
    </header>
  );
}
