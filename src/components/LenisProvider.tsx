import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { getGsap, getScrollTrigger, getLenisClass } from '../utils/gsapGlobal';

interface LenisInstance {
  start: () => void;
  stop: () => void;
  raf: (time: number) => void;
  destroy: () => void;
  scrollTo: (target: any, options?: any) => void;
  on: (event: string, cb: (...args: any[]) => void) => void;
}

const LenisContext = createContext<LenisInstance | null>(null);

export function LenisProvider({ children }: { children: React.ReactNode }) {
  const [lenis, setLenis] = useState<LenisInstance | null>(null);
  const reqIdRef = useRef<number | null>(null);

  useEffect(() => {
    const LenisClass = getLenisClass();
    const gsap = getGsap();
    const ScrollTrigger = getScrollTrigger();

    if (!LenisClass) return;

    const instance: LenisInstance = new LenisClass({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    if (ScrollTrigger && instance.on) {
      instance.on('scroll', ScrollTrigger.update);
    }

    if (gsap && gsap.ticker) {
      const update = (time: number) => {
        instance.raf(time * 1000);
      };
      gsap.ticker.add(update);
      gsap.ticker.lagSmoothing(0);
      setLenis(instance);
      return () => {
        gsap.ticker.remove(update);
        instance.destroy();
      };
    } else {
      const raf = (time: number) => {
        instance.raf(time);
        reqIdRef.current = requestAnimationFrame(raf);
      };
      reqIdRef.current = requestAnimationFrame(raf);
      setLenis(instance);
      return () => {
        if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
        instance.destroy();
      };
    }
  }, []);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}

export function useLenis() {
  return useContext(LenisContext);
}
