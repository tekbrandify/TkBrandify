import React, { useEffect, useRef } from 'react';
import { Rocket, Sparkles, Zap } from 'lucide-react';
import { getGsap } from '../utils/gsapGlobal';
import { usePrefersReducedMotion } from '../utils/usePrefersReducedMotion';
import { WHY_WORK_CARDS } from '../data/tekbrandifyData';
import CopyWrapper from './CopyWrapper';

const ACCENT_COLOR = '#E8620F';

const ICON_MAP = {
  rocket: Rocket,
  sparkles: Sparkles,
  zap: Zap,
};

export default function WhyWorkWithMeSection() {
  const lineRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const gsap = getGsap();
    if (!gsap) return;
    gsap.set(lineRefs.current.filter(Boolean), {
      scaleX: 0,
      transformOrigin: 'left center',
    });
  }, []);

  useEffect(() => {
    const gsap = getGsap();
    if (!gsap) return;
    if (reducedMotion) {
      gsap.set('.work-card', { opacity: 1, yPercent: 0 });
      return;
    }
    const tween = gsap.fromTo(
      '.work-card',
      { opacity: 0, yPercent: 10 },
      {
        opacity: 1,
        yPercent: 0,
        stagger: 0.05,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '#work-with-me',
          start: 'top top',
        },
      }
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [reducedMotion]);

  return (
    <section
      className="relative w-screen bg-[#070707] text-white pt-[25vw] pb-[10vw] max-[1025px]:pt-[65vw]"
      id="work-with-me"
    >
      <div className="text-center mb-[5vw] max-md:mb-[10vw]">
        <CopyWrapper stagger={0.015}>
          <h2 className="text-[5.5vw] max-[1025px]:text-[7vw] max-md:text-[9vw]">
            Why Work With Me?
          </h2>
        </CopyWrapper>
        <CopyWrapper splitBy="lines">
          <p className="text-[1.25vw] text-white mt-[1.5vw] max-[1025px]:text-[2.5vw] max-md:text-[4.5vw] max-md:mt-[2vw]">
            48h Rapid Sprint • 85+ Shipped • 4.4x Blended ROAS • 98% Retention
          </p>
        </CopyWrapper>
      </div>

      <div className="grid grid-cols-3 max-[1025px]:grid-cols-1">
        {WHY_WORK_CARDS.map((card, idx) => {
          const IconComponent = ICON_MAP[card.iconName];
          return (
            <div
              key={card.title}
              onMouseEnter={() => {
                const gsap = getGsap();
                const line = lineRefs.current[idx];
                if (line && gsap) {
                  gsap.killTweensOf(line);
                  gsap.set(line, { transformOrigin: 'left center' });
                  gsap.to(line, { scaleX: 1, duration: 0.55, ease: 'power2.out' });
                }
              }}
              onMouseLeave={() => {
                const gsap = getGsap();
                const line = lineRefs.current[idx];
                if (line && gsap) {
                  gsap.killTweensOf(line);
                  gsap.set(line, { transformOrigin: 'right center' });
                  gsap.to(line, { scaleX: 0, duration: 0.55, ease: 'power2.out' });
                }
              }}
              className="relative px-[4vw] pt-[2vw] pb-[3vw] h-[32vw] flex flex-col justify-between work-card max-[1025px]:h-auto max-[1025px]:py-[6vw] max-[1025px]:px-[5vw]"
            >
              <div>
                <IconComponent
                  size={50}
                  color={ACCENT_COLOR}
                  strokeWidth={1.5}
                  className="mb-[2.5vw] max-[1025px]:mb-[4vw]"
                />
                <h3 className="text-[2vw] font-normal mb-[2.5vw] max-[1025px]:text-[4.2vw] max-md:text-[5.8vw] max-[1025px]:mb-[2vw]">
                  {card.title}
                </h3>
                <p className="text-[1.25vw] leading-normal text-white/80 max-[1025px]:text-[2.8vw] max-md:text-[4vw]">
                  {card.description}
                </p>
              </div>
              <div className="relative mt-[3vw] h-px w-full bg-white/20">
                <span
                  ref={(el) => {
                    lineRefs.current[idx] = el;
                  }}
                  className="absolute inset-0 h-px w-full will-change-transform work-card-underline"
                  style={{ backgroundColor: ACCENT_COLOR }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
