import React, { useEffect, useRef } from 'react';
import { getGsap } from '../utils/gsapGlobal';
import CopyWrapper from './CopyWrapper';

const CLIENT_LOGOS = [
  { src: '/media/clients-1.2x6o6jq8f5_bm.webp', alt: 'Global Partner 1' },
  { src: '/media/clients-2.1l6jm5-3cnwvg.webp', alt: 'Global Partner 2' },
  { src: '/media/clients-3.0-x8av3q__ih4.webp', alt: 'Global Partner 3' },
  { src: '/media/clients-4.1tgn231h0a-zf.webp', alt: 'Global Partner 4' },
  { src: '/media/clients-5.1h0spsdpfo9zr.webp', alt: 'Global Partner 5' },
  { src: '/media/clients-6.1_xtm6aakyuxq.webp', alt: 'Global Partner 6' },
];

const ALL_CLIENT_LOGOS = [...CLIENT_LOGOS, ...CLIENT_LOGOS];

export default function ClientBlurSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const gsap = getGsap();
    const gridEl = gridRef.current;
    if (!gridEl || !sectionRef.current || !gsap) return;

    const items = Array.from(gridEl.querySelectorAll('.grid__item')) as HTMLElement[];
    const count = items.length;
    if (count === 0) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 20%',
          end: 'bottom center',
          scrub: true,
        },
      });

      const isDesktop = globalThis.innerWidth > 1024;
      const inDur = isDesktop ? 1.5 : 4;
      const outDur = isDesktop ? 1.5 : 3.5;
      const groupStep = inDur + 0.4;
      const itemStagger = isDesktop ? 0.4 : 0.5;

      const batches: number[][] = [];
      for (let i = 0; i < count; ) {
        const size = Math.min(count - i, gsap.utils.random(2, 3, 1));
        batches.push(Array.from({ length: size }, (_, k) => i + k));
        i += size;
      }

      batches.forEach((batch, bIdx) => {
        const batchStart = bIdx * groupStep;
        batch.forEach((itemIdx, k) => {
          const el = items[itemIdx];
          const startAt = batchStart + k * itemStagger;

          gsap.set(el, {
            transformOrigin: '0% 0%',
            opacity: 0,
            x: isDesktop ? gsap.utils.random(-180, 180) : 0,
            y: gsap.utils.random(-180, 180),
            filter: 'blur(10px)',
            z: isDesktop ? gsap.utils.random(-2200, -1600) : gsap.utils.random(-550, -400),
          });

          tl.to(
            el,
            {
              z: 0,
              opacity: 1,
              filter: 'blur(0px)',
              duration: inDur,
            },
            startAt
          ).to(
            el,
            {
              filter: 'blur(10px)',
              opacity: 0,
              z: isDesktop ? gsap.utils.random(1400, 1800) : gsap.utils.random(500, 700),
              duration: outDur,
            },
            startAt + inDur
          );
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="clientblur"
      className="relative w-screen h-[240vh] text-center z-2 bg-[#070707]"
    >
      <div className="sticky w-full top-0 h-screen flex items-center justify-center">
        <div className="w-3/5 max-lg:w-4/5">
          <CopyWrapper stagger={0.015}>
            <h3 className="text-[5.5vw] text-white leading-[1.2] max-lg:text-[7vw] max-md:text-[8vw]">
              Trusted by Founders and Enterprises, Engineered for Category Leaders.
            </h3>
          </CopyWrapper>
        </div>
      </div>

      <div className="left-0 sticky mt-[-100vh] top-0 z-20 h-screen w-screen overflow-hidden flex items-center justify-center pointer-events-none">
        <div
          ref={gridRef}
          className="grid grid-cols-5 gap-[3vw] perspective-[350vw] max-md:grid-cols-3 max-md:gap-[6vw]"
        >
          {ALL_CLIENT_LOGOS.map((logo, idx) => (
            <div
              key={idx}
              className="grid__item flex h-[8vw] w-[14vw] items-center justify-center max-md:h-[22vw] max-md:w-[26vw]"
            >
              <img
                className="h-[4vw] w-full object-contain max-md:h-[11vw]"
                src={logo.src}
                alt={logo.alt}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
