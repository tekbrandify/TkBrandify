import React, { useCallback, useEffect, useRef, useState } from 'react';
import { getGsap } from '../utils/gsapGlobal';
import { TESTIMONIALS_LIST } from '../data/tekbrandifyData';
import CopyWrapper from './CopyWrapper';

function TestimonialQuoteCard({
  item,
  onSwipe,
}: {
  item: (typeof TESTIMONIALS_LIST)[0];
  onSwipe: (dir: 'prev' | 'next') => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const pointerStartXRef = useRef<number | null>(null);

  useEffect(() => {
    const gsap = getGsap();
    if (!gsap || !cardRef.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(cardRef.current, { opacity: 1, y: 0 });
      return;
    }
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out' }
    );
  }, [item]);

  return (
    <div
      ref={cardRef}
      onPointerDown={(e) => {
        pointerStartXRef.current = e.clientX;
      }}
      onPointerUp={(e) => {
        if (pointerStartXRef.current !== null) {
          const deltaX = e.clientX - pointerStartXRef.current;
          if (deltaX > 100) onSwipe('prev');
          else if (deltaX < -100) onSwipe('next');
          pointerStartXRef.current = null;
        }
      }}
      className="pt-[8vw] pb-[4vw] px-[6vw] w-full h-full flex flex-col items-center justify-center gap-[2.5vw] text-center max-[1025px]:pt-[14vw] max-[1025px]:px-[8vw] max-[1025px]:gap-[4vw] max-md:pt-[22vw] max-md:px-[7vw] max-md:pb-[8vw] max-md:gap-[6vw] select-none"
    >
      <div className="flex flex-col gap-[0.4vw] max-md:gap-2">
        <p className="text-[2.6vw] text-[#ff6b00] max-[1025px]:text-[4vw] max-md:text-[6vw]">
          {item.name}
        </p>
        <p className="text-[1.145vw] text-white max-[1025px]:text-[2.2vw] max-md:text-[3.6vw]">
          {item.role}
        </p>
      </div>
      <p className="text-[1.145vw] leading-[1.6] text-white/70 w-[82%] max-[1025px]:text-[2.2vw] max-[1025px]:w-full max-md:text-[3.6vw]">
        “{item.quote}”
      </p>
    </div>
  );
}

export default function TestimonialsSection() {
  const [activeIdx, setActiveIdx] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const total = TESTIMONIALS_LIST.length;

  useEffect(() => {
    const gsap = getGsap();
    if (!gsap || !sectionRef.current) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const elements = gsap.utils.toArray('.testimonial-fade');
    if (reduced) {
      gsap.set(elements, { opacity: 1, y: 0 });
      return;
    }
    const tween = gsap.fromTo(
      elements,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
          once: true,
        },
      }
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  const handleNext = useCallback(() => {
    setActiveIdx((prev) => (prev + 1) % total);
  }, [total]);

  const handlePrev = useCallback(() => {
    setActiveIdx((prev) => (prev - 1 + total) % total);
  }, [total]);

  return (
    <section
      ref={sectionRef}
      className="w-screen bg-[#070707] py-[7vw] px-[4vw] max-[1025px]:px-[5vw] max-[1025px]:py-[12vw]"
      id="testimonials"
    >
      <div className="w-full flex flex-col gap-[6vw] max-[1025px]:gap-[12vw]">
        <div className="w-[65%] mx-auto max-[1025px]:w-full">
          <CopyWrapper stagger={0.015}>
            <h2 className="text-[5.2vw] leading-[1.2]! text-center max-[1025px]:text-[7vw] max-md:text-[9vw]">
              Don&apos;t Take It from Us, Take It from Our Clients
            </h2>
          </CopyWrapper>
        </div>

        <div className="relative max-md:mt-10">
          <div className="testimonial-fade opacity-0 relative w-3/5 mx-auto rounded-[2vw] border border-white/10 bg-white/5 overflow-hidden max-[1025px]:w-full max-[1025px]:rounded-[5vw] h-[30vw] max-[1025px]:h-[52vw] max-md:h-[95vw]">
            <TestimonialQuoteCard
              key={TESTIMONIALS_LIST[activeIdx].name}
              item={TESTIMONIALS_LIST[activeIdx]}
              onSwipe={(dir) => {
                if (dir === 'next') handleNext();
                if (dir === 'prev') handlePrev();
              }}
            />
          </div>

          <div className="testimonial-fade opacity-0 flex w-full justify-center items-center absolute -top-[2vw] left-1/2 -translate-x-1/2 max-md:-top-[6vw]">
            {TESTIMONIALS_LIST.map((item, idx) => {
              const half = Math.floor(total / 2);
              const mod = (idx - activeIdx + total) % total;
              const offset = mod <= half ? mod : mod - total;
              const isCurrent = offset === 0;

              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setActiveIdx(idx)}
                  aria-label={`Show testimonial from ${item.name}`}
                  aria-current={isCurrent}
                  style={{
                    order: offset,
                    zIndex: isCurrent ? 10 : total - Math.abs(offset),
                    transform: isCurrent ? 'scale(1.6)' : 'scale(1)',
                    transition: 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
                  }}
                  className={`w-[5vw] h-[5vw] rounded-full overflow-hidden [clip-path:circle(50%)] cursor-pointer max-[1025px]:w-[9vw] max-[1025px]:h-[9vw] max-md:w-[12vw] max-md:h-[12vw] ${
                    isCurrent
                      ? 'bg-linear-to-r from-[#F16B0D] to-[#E61416] p-[0.3vw] mx-[2vw] max-md:mx-[4vw]'
                      : `opacity-60 hover:opacity-100 ${offset < 0 ? '-mr-[1vw]' : '-ml-[1vw]'}`
                  }`}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    width={120}
                    height={120}
                    className="w-full h-full object-cover object-top rounded-full"
                  />
                </button>
              );
            })}
          </div>

          <div className="testimonial-fade opacity-0 flex justify-center gap-3 mt-[3vw] max-md:mt-[8vw]">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous testimonial"
              className="size-12 rounded-full border border-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer relative group overflow-hidden max-md:size-10"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                className="relative z-2"
              >
                <path
                  d="M19 12H5M5 12L12 19M5 12L12 5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="absolute inset-0 w-full h-full bg-linear-to-r from-[#F16B0D] to-[#E61416] group-hover:scale-100 scale-0 ease-in-out origin-center rounded-full duration-300" />
            </button>

            <button
              type="button"
              onClick={handleNext}
              aria-label="Next testimonial"
              className="size-12 rounded-full border border-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer relative group overflow-hidden max-md:size-10"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                className="relative z-2"
              >
                <path
                  d="M5 12H19M19 12L12 5M19 12L12 19"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="absolute inset-0 w-full h-full bg-linear-to-r from-[#F16B0D] to-[#E61416] group-hover:scale-100 scale-0 ease-in-out origin-center rounded-full duration-300" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
