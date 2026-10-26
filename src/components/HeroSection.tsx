import React, { useEffect, useRef, useState } from 'react';
import { getGsap } from '../utils/gsapGlobal';
import { useLenis } from './LenisProvider';
import CopyWrapper from './CopyWrapper';

const p1 = '/media/portfolio-img-1.006uvpvyjl7kz.webp';
const p2 = '/media/portfolio-img-2.2ys49j7gkfz7j.webp';
const p3 = '/media/portfolio-img-3.04bada5ydkt1h.webp';
const p4 = '/media/portfolio-img-4.0wnkqlz-f5rcj.webp';

const col1Desktop = [p1, p3, p1, p3];
const col2Desktop = [p2, p4, p2, p4];
const colMobile = [p1, p2, p3, p4, p1, p2, p3, p4];

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const stickyContainerRef = useRef<HTMLDivElement>(null);
  const innerImgParallaxRef = useRef<HTMLDivElement>(null);
  const textParallaxRef = useRef<HTMLDivElement>(null);
  const maskRevealContainerRef = useRef<HTMLDivElement>(null);
  const marqueeBgRef = useRef<HTMLDivElement>(null);
  const didInitRef = useRef(false);

  const [isTabletOrMobile, setIsTabletOrMobile] = useState(false);
  const [startH1, setStartH1] = useState(false);
  const [startSubhead, setStartSubhead] = useState(false);

  const lenis = useLenis();
  const lenisRef = useRef(lenis);

  useEffect(() => {
    lenisRef.current = lenis;
  }, [lenis]);

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 1025px)');
    const update = () => setIsTabletOrMobile(mql.matches);
    update();
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    lenis?.stop();
  }, [lenis]);

  // Initial load timeline: --reveal mask expansion (-40% to 125%), H1 at 1.0s, subhead at 1.5s, header drop at 1.8s
  useEffect(() => {
    if (didInitRef.current) return;
    const gsap = getGsap();
    if (!gsap) return;
    didInitRef.current = true;

    const state = { reveal: -40 };
    const tl = gsap.timeline();

    tl.to(
      state,
      {
        reveal: 125,
        duration: 3.5,
        ease: 'power2.out',
        onUpdate: () => {
          maskRevealContainerRef.current?.style.setProperty('--reveal', `${state.reveal}%`);
        },
      },
      0
    )
      .fromTo(
        maskRevealContainerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 1.5, ease: 'power2.out' },
        0
      )
      .call(() => setStartH1(true), undefined, 1)
      .call(() => setStartSubhead(true), undefined, 1.5)
      .call(
        () => {
          const headerEl = document.getElementById('header');
          const logoEl = document.getElementById('header-logo');
          gsap.fromTo(
            [headerEl, logoEl].filter(Boolean),
            { yPercent: -50, opacity: 0 },
            {
              yPercent: 0,
              opacity: 1,
              duration: 0.8,
              ease: 'power3.out',
              onComplete: () => lenisRef.current?.start(),
            }
          );
        },
        undefined,
        1.8
      );

    return () => {
      tl.kill();
      didInitRef.current = false;
      setStartH1(false);
      setStartSubhead(false);
    };
  }, []);

  // Scroll scrub: Container scales down to 0.5x while unblurring the background dual-marquee
  useEffect(() => {
    const gsap = getGsap();
    if (!stickyContainerRef.current || !sectionRef.current || !gsap) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        invalidateOnRefresh: true,
      },
    });

    tl.to(
      stickyContainerRef.current,
      {
        scale: 0.5,
        ease: 'power2.inOut',
        duration: 1,
      },
      0
    );

    if (marqueeBgRef.current) {
      gsap.set(marqueeBgRef.current, { filter: 'blur(24px)', opacity: 0.35 });
      tl.to(
        marqueeBgRef.current,
        {
          filter: 'blur(0px)',
          opacity: 1,
          ease: 'power2.out',
          duration: 0.18,
        },
        0.32
      );
    }

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, []);

  // Mousemove parallax on desktop targeting the inner image container (do not overwrite CSS positioning)
  useEffect(() => {
    let rafId: number;
    const gsap = getGsap();
    if (
      globalThis.innerWidth <= 1024 ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      !gsap
    ) {
      return;
    }

    const pos = {
      targetImgX: 0,
      currentImgX: 0,
      targetTextX: 0,
      currentTextX: 0,
      targetImgY: 0,
      currentImgY: 0,
      targetTextY: 0,
      currentTextY: 0,
    };

    const onMouseMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      pos.targetImgX = -(30 * nx);
      pos.targetTextX = -(12 * nx);
      pos.targetImgY = -(30 * ny);
      pos.targetTextY = -(12 * ny);
    };

    window.addEventListener('mousemove', onMouseMove);

    const tick = () => {
      pos.currentImgX += (pos.targetImgX - pos.currentImgX) * 0.08;
      pos.currentTextX += (pos.targetTextX - pos.currentTextX) * 0.08;
      pos.currentImgY += (pos.targetImgY - pos.currentImgY) * 0.08;
      pos.currentTextY += (pos.targetTextY - pos.currentTextY) * 0.08;

      if (innerImgParallaxRef.current) {
        gsap.set(innerImgParallaxRef.current, { x: pos.currentImgX, y: pos.currentImgY });
      }
      if (textParallaxRef.current) {
        gsap.set(textParallaxRef.current, { x: pos.currentTextX, y: pos.currentTextY });
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative w-screen h-[300vh]" id="hero">
      <div
        ref={stickyContainerRef}
        className="w-screen h-screen sticky top-0 flex justify-between items-center hero-container px-[4vw] z-2 max-[1025px]:px-[5vw] max-[1025px]:items-start max-[1025px]:pt-[30vw] overflow-hidden"
        style={{
          backgroundColor: '#180d08',
          backgroundImage: `
            radial-gradient(65% 55% at 92% 6%, #F0640D 0%, rgba(240,100,13,0) 65%),
            radial-gradient(60% 55% at 4% 82%, #EC690F 0%, rgba(236,105,15,0) 65%),
            radial-gradient(75% 80% at 48% 42%, #B01205 0%, rgba(176,18,5,0) 70%),
            linear-gradient(180deg, #D8470A 0%, #C0300A 28%, #B01205 46%, #7A1C08 68%, #2A1108 88%, #180D08 100%)
          `,
        }}
      >
        <div
          ref={textParallaxRef}
          className="w-full h-fit flex justify-between max-[1025px]:flex-col max-[1025px]:gap-8 relative z-10"
        >
          <div className="w-[45%] leading-30! max-[1025px]:w-[62%] max-md:w-full">
            <CopyWrapper stagger={0.015} start={startH1} animateOnScroll={false}>
              <h1 className="text-[7.5vw] text-white max-[1025px]:text-[12vw] max-md:text-[15vw] leading-[1.1]!">
                Engineering Iconic Brands in Motion
              </h1>
            </CopyWrapper>
          </div>

          <div className="w-[14%] flex flex-col justify-between text-end text-[1.25vw] leading-[1.15] py-[2vw] max-[1025px]:w-[48%] max-[1025px]:text-[3.5vw] max-[1025px]:text-start max-[1025px]:flex-col-reverse max-md:w-full max-md:text-[4.5vw] max-md:gap-[7vw] max-[1025px]:gap-20 max-md:py-0">
            <CopyWrapper splitBy="lines" start={startSubhead} animateOnScroll={false}>
              <p className="text-white">
                48h Rapid Sprint
                <br />
                85+ Shipped • 4.4x ROAS
              </p>
            </CopyWrapper>
            <CopyWrapper splitBy="lines" start={startSubhead} animateOnScroll={false}>
              <p className="text-white">
                Michael Okpala
                <br />
                Creative/Tech Director
              </p>
            </CopyWrapper>
          </div>
        </div>

        <div
          ref={maskRevealContainerRef}
          className="absolute bottom-[-64%] left-1/2 translate-x-[-49.5%] size-[180%] max-[1025px]:w-full max-[1025px]:translate-x-[-40%] max-md:w-[160%] max-md:top-auto max-md:bottom-[-30%] max-md:h-auto max-md:translate-x-[-40%] hero-av-img hero-mask-reveal opacity-0"
        >
          <div ref={innerImgParallaxRef} className="w-full h-full">
            <img
              src="/media/michael-hero-relit.webp"
              alt="Michael Okpala — TekBrandify Creative & Technical Direction"
              className="w-full h-full object-contain select-none pointer-events-none"
              draggable={false}
              loading="eager"
              fetchPriority="high"
            />
          </div>
        </div>
      </div>

      {/* Dual Marquee Background revealed on scroll scrub */}
      <div ref={marqueeBgRef} className="absolute inset-0 w-full h-full bg-[#070707]">
        <div className="w-full h-screen sticky top-0 px-[4vw] flex gap-[2.5vw] overflow-hidden">
          <div className="w-[50%] h-fit flex flex-col gap-[2.5vw] marquee-1">
            {(isTabletOrMobile ? colMobile : col1Desktop).map((src, idx) => (
              <div
                key={idx}
                className="w-full h-[27vw] max-[1025px]:h-[45vw] max-md:h-[55vw] overflow-hidden"
              >
                <img
                  src={src}
                  alt="TekBrandify portfolio preview"
                  width={700}
                  height={500}
                  className="w-full h-full overflow-hidden object-cover"
                />
              </div>
            ))}
          </div>
          <div className="w-[50%] h-fit flex flex-col gap-[2.5vw] marquee-2">
            {(isTabletOrMobile ? colMobile : col2Desktop).map((src, idx) => (
              <div
                key={idx}
                className="w-full h-[27vw] max-[1025px]:h-[45vw] max-md:h-[55vw] overflow-hidden"
              >
                <img
                  src={src}
                  alt="TekBrandify portfolio preview"
                  width={700}
                  height={500}
                  className="w-full h-full overflow-hidden object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
