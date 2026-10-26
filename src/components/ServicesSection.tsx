import React, { useEffect, useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { getGsap, getScrollTrigger } from '../utils/gsapGlobal';
import { usePrefersReducedMotion } from '../utils/usePrefersReducedMotion';
import { SERVICE_PILLARS } from '../data/tekbrandifyData';
import CopyWrapper from './CopyWrapper';
import { useGetInTouchModal } from './GetInTouchModal';

export default function ServicesSection() {
  const rowRef = useRef<HTMLDivElement>(null);
  const maskRefs = useRef<Array<HTMLDivElement | null>>([]);
  const arrowCircleRefs = useRef<Array<HTMLDivElement | null>>([]);
  const revealValuesRef = useRef(
    SERVICE_PILLARS.map((_, idx) => ({ value: idx === 0 ? 100 : -40 }))
  );
  const reducedMotion = usePrefersReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const { openModal } = useGetInTouchModal();

  useEffect(() => {
    const ScrollTrigger = getScrollTrigger();
    const raf = window.requestAnimationFrame(() => ScrollTrigger?.refresh());
    return () => window.cancelAnimationFrame(raf);
  }, [reducedMotion]);

  useEffect(() => {
    const gsap = getGsap();
    if (!gsap || !rowRef.current) return;

    if (reducedMotion) {
      gsap.set(rowRef.current, { clearProps: 'transform' });
      return;
    }

    let tween: any;
    if (globalThis.innerWidth > 1025) {
      tween = gsap.fromTo(
        rowRef.current,
        { xPercent: 70 },
        {
          xPercent: -33,
          ease: 'none',
          scrollTrigger: {
            trigger: '#services',
            start: 'top 20%',
            end: 'bottom bottom',
            scrub: true,
          },
        }
      );
    } else if (globalThis.innerWidth < 1025 && globalThis.innerWidth > 541) {
      tween = gsap.fromTo(
        rowRef.current,
        { xPercent: 50 },
        {
          xPercent: -65,
          ease: 'none',
          scrollTrigger: {
            trigger: '#services',
            start: 'top 20%',
            end: 'bottom bottom',
            scrub: true,
          },
        }
      );
    } else {
      tween = gsap.fromTo(
        rowRef.current,
        { xPercent: 50 },
        {
          xPercent: -77,
          ease: 'none',
          scrollTrigger: {
            trigger: '#services',
            start: 'top 20%',
            end: 'bottom bottom',
            scrub: true,
          },
        }
      );
    }

    return () => {
      tween?.scrollTrigger?.kill();
      tween?.kill();
    };
  }, [reducedMotion]);

  const handleCardEnter = (idx: number) => {
    if (idx === activeIndex) return;
    const gsap = getGsap();
    const dur = 0.45 * (reducedMotion ? 0 : 1);

    if (gsap) {
      const prevIdx = activeIndex;
      gsap.to(revealValuesRef.current[prevIdx], {
        value: -40,
        duration: dur,
        ease: 'power2.out',
        onUpdate: () => {
          maskRefs.current[prevIdx]?.style.setProperty(
            '--reveal',
            `${revealValuesRef.current[prevIdx].value}%`
          );
        },
      });
      gsap.to(revealValuesRef.current[idx], {
        value: 100,
        duration: dur,
        ease: 'power2.out',
        onUpdate: () => {
          maskRefs.current[idx]?.style.setProperty(
            '--reveal',
            `${revealValuesRef.current[idx].value}%`
          );
        },
      });
    }
    setActiveIndex(idx);
  };

  return (
    <section
      className={`services-section relative w-screen bg-[#070707] text-white ${
        reducedMotion ? '' : 'h-[275vh]'
      }`}
      id="services"
    >
      <div className="relative pt-[6vw] px-[4vw] w-[60%] max-[1025px]:w-[85%] max-md:w-full max-[1025px]:px-[5vw] max-[1025px]:pt-[15vw]">
        <CopyWrapper stagger={0.015}>
          <h2 className="text-[5.5vw] leading-[1.2] max-[1025px]:text-[7vw] max-md:text-[9vw]">
            Systems That Speak
            <br />
            to Your Market
          </h2>
        </CopyWrapper>

        <div className="w-[75%] max-[1025px]:w-full mt-[1.5vw] max-[1025px]:mt-[5vw]">
          <CopyWrapper splitBy="lines">
            <p className="text-[1.25vw] max-[1025px]:text-[2.5vw] max-md:text-[4.5vw]">
              Led by Michael Okpala in Lagos, TekBrandify® solves high-stakes commercial challenges with precision brand engineering. From iconic identity systems and high-speed custom web builds to autonomous AI workflows, our 5-pillar architecture compounds growth across every touchpoint.
            </p>
          </CopyWrapper>
        </div>
      </div>

      <div
        className={`services-sticky ${
          reducedMotion
            ? 'w-screen pb-[6vw]'
            : 'w-screen h-screen sticky top-0 overflow-hidden flex flex-col max-md:mt-[-30vw]'
        }`}
      >
        <div className={reducedMotion ? '' : 'relative flex-1 flex items-center'}>
          <div
            ref={rowRef}
            className={`services-row ${
              reducedMotion
                ? 'grid grid-cols-3 gap-[1.6vw] px-[4vw] pt-[5vw] max-[1025px]:grid-cols-2 max-md:grid-cols-1'
                : 'flex gap-[1.6vw] px-[4vw] will-change-transform max-[1025px]:gap-[2.5vw] max-md:gap-[6vw]'
            }`}
          >
            {SERVICE_PILLARS.map((pillar, idx) => (
              <a
                key={pillar.title}
                href={pillar.href}
                onClick={(e) => {
                  e.preventDefault();
                  openModal(pillar.title);
                }}
                onMouseEnter={() => handleCardEnter(idx)}
                className={`services-card ${
                  reducedMotion
                    ? 'relative rounded-lg p-[1.6vw] flex flex-col justify-between bg-[#161616] overflow-hidden min-h-[22vw] max-[1025px]:min-h-[32vw] max-[1025px]:p-[3vw] max-md:min-h-0 max-md:p-[5vw] border border-white/20'
                    : 'relative w-[27vw] h-[30vw] shrink-0 rounded-lg p-[1.6vw] flex flex-col justify-between bg-[#161616] overflow-hidden max-[1025px]:w-[55vw] max-[1025px]:h-[65vw] max-[1025px]:p-[3vw] max-md:w-[75vw] max-md:h-[85vw] max-md:p-[5vw] border border-white/20 group'
                }`}
              >
                <div
                  ref={(el) => {
                    maskRefs.current[idx] = el;
                    el?.style.setProperty('--reveal', `${revealValuesRef.current[idx].value}%`);
                  }}
                  className="absolute inset-0 bg-linear-to-r from-[#F16B0D] to-[#E61416] radial-mask-bg-fill"
                />

                <div className="relative flex justify-end">
                  <div
                    ref={(el) => {
                      arrowCircleRefs.current[idx] = el;
                    }}
                    className={`w-[3vw] h-[3vw] rounded-full flex items-center justify-center border-white/30 border max-[1025px]:w-[7vw] max-[1025px]:h-[7vw] max-md:w-[9vw] max-md:h-[9vw] duration-300 ease-out overflow-hidden relative ${
                      activeIndex === idx ? 'bg-white text-black' : 'text-white'
                    }`}
                  >
                    <div className="group-hover:translate-x-[150%] group-hover:translate-y-[-150%] duration-300 ease-out">
                      <ArrowUpRight size={20} />
                    </div>
                    <div className="absolute translate-x-[-150%] translate-y-[150%] group-hover:translate-x-0 group-hover:translate-y-0 duration-300 ease-out">
                      <ArrowUpRight size={20} />
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <h3 className="text-[2.3vw] font-normal mb-[1vw] max-[1025px]:text-[4.8vw] max-md:text-[6.2vw] leading-[1.15]">
                    {pillar.title}
                  </h3>
                  <ul className="space-y-[0.4vw] list-disc pl-[0.5vw] max-[1025px]:space-y-[1vw] max-md:space-y-[1.8vw]">
                    {pillar.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-[0.7vw] text-[1.25vw] text-white max-[1025px]:text-[3vw] max-md:text-[4vw]"
                      >
                        <span className="size-1.5 bg-white rounded-full shrink-0" />{' '}
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
