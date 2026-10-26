import React, { useEffect, useRef, useState } from 'react';
import { getGsap } from '../utils/gsapGlobal';
import { SHOWCASE_PROJECTS } from '../data/tekbrandifyData';
import CopyWrapper from './CopyWrapper';
import { useGetInTouchModal } from './GetInTouchModal';

export default function PortfolioSection() {
  const dotRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const circleClipRef = useRef<HTMLDivElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const reducedMotionRef = useRef(false);
  const { openCaseStudy } = useGetInTouchModal();

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotionRef.current = mql.matches;
    const raf = window.requestAnimationFrame(() => setReducedMotion(mql.matches));
    const onChange = (e: MediaQueryListEvent) => {
      reducedMotionRef.current = e.matches;
      setReducedMotion(e.matches);
    };
    mql.addEventListener('change', onChange);
    return () => {
      window.cancelAnimationFrame(raf);
      mql.removeEventListener('change', onChange);
    };
  }, []);

  useEffect(() => {
    const gsap = getGsap();
    if (!gsap) return;

    const steps = SHOWCASE_PROJECTS.length - 1; // 3 (so snapTo: 1/3)
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '#portfolio',
        start: '10% top',
        end: 'bottom bottom',
        scrub: true,
        ...(reducedMotionRef.current
          ? {}
          : {
              snap: {
                snapTo: 1 / steps,
                duration: { min: 0.2, max: 0.6 },
                ease: 'power1.inOut',
              },
            }),
      },
    });

    gsap.set(progressBarRef.current, { scaleY: 0 });
    if (dotRefs.current[0]) {
      gsap.set(dotRefs.current[0], { backgroundColor: '#ffffff', borderColor: '#ffffff' });
    }
    dotRefs.current.slice(1).forEach((dot) => {
      if (dot) {
        gsap.set(dot, { backgroundColor: '#F06A0E', borderColor: 'rgba(255,255,255,0.5)' });
      }
    });

    gsap.set(cardRefs.current.filter(Boolean), { filter: 'brightness(1)' });

    if (reducedMotionRef.current) {
      cardRefs.current.slice(1).forEach((card) => {
        if (card) gsap.set(card, { opacity: 0 });
      });
    } else {
      cardRefs.current.slice(1).forEach((card) => {
        if (card) gsap.set(card, { yPercent: 100 });
      });
    }

    tl.to(progressBarRef.current, { scaleY: 1, ease: 'none', duration: steps }, 0);

    for (let i = 0; i < steps; i += 1) {
      const nextCard = cardRefs.current[i + 1];
      const currentCard = cardRefs.current[i];
      const nextDot = dotRefs.current[i + 1];

      if (reducedMotionRef.current) {
        if (nextCard) tl.to(nextCard, { opacity: 1, ease: 'none', duration: 1 }, i);
      } else {
        if (nextCard) tl.to(nextCard, { yPercent: 0, ease: 'power2.inOut', duration: 1 }, i);
      }

      if (currentCard) {
        tl.to(currentCard, { filter: 'brightness(0.3)', ease: 'power2.inOut', duration: 1 }, i);
      }
      if (nextDot) {
        tl.set(nextDot, { backgroundColor: '#ffffff', borderColor: '#ffffff' }, i + 1);
      }
    }

    let clipTween1: any;
    let clipTween2: any;

    if (!reducedMotionRef.current) {
      if (globalThis.innerWidth > 1024) {
        clipTween1 = gsap.to('.circle-clip', {
          yPercent: -70,
          ease: 'none',
          scrollTrigger: {
            trigger: '#portfolio',
            start: 'top bottom',
            end: '30% bottom',
            scrub: true,
          },
        });
      } else {
        clipTween1 = gsap.to('.circle-clip', {
          yPercent: -50,
          ease: 'none',
          scrollTrigger: {
            trigger: '#portfolio',
            start: 'top bottom',
            end: '30% bottom',
            scrub: true,
          },
        });
      }

      gsap.set(circleClipRef.current, { clipPath: 'ellipse(150% 100% at 50% 100%)' });
      clipTween2 = gsap.to(circleClipRef.current, {
        clipPath: 'ellipse(60% 100% at 50% 100%)',
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '#portfolio',
          start: 'top bottom',
          end: '30% bottom',
          scrub: true,
        },
      });
    }

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
      clipTween1?.scrollTrigger?.kill();
      clipTween1?.kill();
      clipTween2?.scrollTrigger?.kill();
      clipTween2?.kill();
    };
  }, []);

  return (
    <section
      className={`relative w-screen h-[360vh] text-white ${
        reducedMotion ? 'pt-[8vw]' : 'pt-[8vw] max-[1025px]:pt-[30vw]'
      }`}
      id="portfolio"
    >
      <div
        ref={circleClipRef}
        className="w-full h-[50vh] absolute top-0 left-0 z-2 bg-linear-to-r from-[#F16B0D] to-[#E61416] circle-clip will-change-[clip-path]"
      />

      <div className="w-screen h-screen sticky top-0 z-3 flex flex-col items-center justify-center px-[4vw] gap-[5vw] overflow-hidden bg-linear-to-r from-[#F16B0D] to-[#E61416] max-md:gap-[10vw] max-[1025px]:gap-10 max-[1025px]:px-[5vw]">
        <CopyWrapper stagger={0.015}>
          <h2 className="text-[5.5vw] text-center max-[1025px]:text-[6.5vw] max-md:text-[9vw]">
            Award Winning Work
          </h2>
        </CopyWrapper>

        <div className="w-full flex items-center gap-[4vw] max-[1025px]:flex-col max-md:gap-[8vw] max-[1025px]:items-start max-[1025px]:gap-10">
          <div className="w-[32%] relative max-md:w-full max-[1025px]:w-[55%]">
            <div className="absolute left-1 bg-white/20 top-[2.5vw] max-[1025px]:top-[1vw] h-[21vw] max-[1025px]:h-[33vw] max-md:h-[54vw] w-px" />
            <div
              ref={progressBarRef}
              className="absolute left-1 bg-white origin-top top-[2.5vw] max-[1025px]:top-[1vw] h-[21vw] max-[1025px]:h-[33vw] max-md:h-[54vw] w-px"
            />

            <div className="flex flex-col max-[1025px]:gap-[3vw] max-md:gap-[8vw]">
              {SHOWCASE_PROJECTS.map((project, idx) => (
                <div
                  key={project.name}
                  onClick={() => openCaseStudy(project)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      openCaseStudy(project);
                    }
                  }}
                  aria-label={`View ${project.name} Case Study`}
                  className="relative flex items-center gap-[1.2vw] max-md:gap-[5vw] cursor-pointer group"
                  style={{ height: '7vw' }}
                >
                  <span
                    ref={(el) => {
                      dotRefs.current[idx] = el;
                    }}
                    className="w-[10px] h-[10px] mt-[-1.5vw] bg-[#F06A0E] rounded-full border shrink-0 max-md:mt-[-4vw] max-[1025px]:mt-[-3vw]"
                  />
                  <div>
                    <h3 className="text-[1.5vw] font-normal max-[1025px]:text-[3.5vw] max-md:text-[5.2vw] group-hover:underline">
                      {project.name}
                    </h3>
                    <p className="text-[1vw] max-[1025px]:text-[2.4vw] max-md:text-[3.8vw] text-white/90">
                      {project.tags.join('  •  ')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full h-[38vw] relative rounded-xl overflow-hidden max-[1025px]:w-full max-[1025px]:h-[48vw] max-md:h-[52vw] max-[1025px]:rounded-lg">
            {SHOWCASE_PROJECTS.map((project, idx) => (
              <div
                key={project.name}
                ref={(el) => {
                  cardRefs.current[idx] = el;
                }}
                onClick={() => openCaseStudy(project)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openCaseStudy(project);
                  }
                }}
                aria-label={`Open ${project.name} Quick-View Modal`}
                className="absolute inset-0 bg-[#F4EFE9] flex items-center justify-center rounded-xl overflow-hidden max-[1025px]:rounded-lg cursor-pointer group"
                style={{ zIndex: idx + 1 }}
              >
                <img
                  src={project.imgSrc}
                  alt={project.name}
                  width={800}
                  height={400}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
                <div className="absolute top-4 right-4 bg-black/75 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-normal border border-white/20 flex items-center gap-2">
                  <span>Quick-View Case Study</span>
                  <span className="text-[#F16B0D]">→</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute w-screen h-[60vh] bottom-[-10%] left-0 overflow-hidden max-[1025px]:bottom-[-13%] pointer-events-none">
        <div className="w-[115%] h-[40vh] absolute bottom-[35%] left-[-7.5%] z-2 bg-linear-to-r from-[#F16B0D] to-[#E61416] blur-2xl max-[1025px]:bottom-[50%] max-[1025px]:w-[120%] max-[1025px]:left-[-10%] max-[1025px]:blur-lg" />
      </div>
    </section>
  );
}
