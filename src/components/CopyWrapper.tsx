import React, { useEffect, useRef } from 'react';
import { getGsap } from '../utils/gsapGlobal';
import { tokenizeCopyText } from '../utils/copySplitter';

interface CopyWrapperProps {
  children?: React.ReactNode;
  animateOnScroll?: boolean;
  delay?: number;
  className?: string;
  scrub?: boolean;
  direction?: 'top' | 'bottom' | 'left' | 'right';
  splitBy?: 'chars' | 'lines';
  stagger?: number;
  duration?: number;
  onComplete?: () => void;
  completeOverlap?: number;
  start?: boolean;
}

const DIRECTION_MAP = {
  top: { yPercent: -110, xPercent: 0, rotate: 0 },
  bottom: { yPercent: 110, xPercent: 0, rotate: 0 },
  left: { yPercent: 0, xPercent: -110, rotate: 0 },
  right: { yPercent: 0, xPercent: 110, rotate: 0 },
};

function serializeElementWithBr(el: HTMLElement): string {
  let result = '';
  el.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      result += node.textContent || '';
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const tag = (node as HTMLElement).tagName.toLowerCase();
      if (tag === 'br') {
        result += '<br/>';
      } else {
        result += serializeElementWithBr(node as HTMLElement);
      }
    }
  });
  return result;
}

export default function CopyWrapper({
  children,
  animateOnScroll = true,
  delay = 0,
  className = '',
  scrub = false,
  direction = 'bottom',
  splitBy = 'chars',
  stagger,
  duration = 0.5,
  onComplete,
  completeOverlap = 0,
  start = true,
}: CopyWrapperProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const revertFnsRef = useRef<Array<() => void>>([]);
  const targetsRef = useRef<HTMLElement[]>([]);

  useEffect(() => {
    const gsap = getGsap();
    if (!wrapperRef.current || !start || !gsap) return;

    revertFnsRef.current = [];
    targetsRef.current = [];

    const container = wrapperRef.current;
    const childElements = container.hasAttribute('data-copy-wrapper')
      ? (Array.from(container.children) as HTMLElement[])
      : [container];

    const prefersReduced =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let ctx: any;
    let timerId: number | undefined;
    let observer: IntersectionObserver | null = null;
    let cancelled = false;

    const runAnimation = () => {
      if (cancelled || !wrapperRef.current) return;

      ctx = gsap.context(() => {
        childElements.forEach((el) => {
          const originalHtml = el.innerHTML;
          revertFnsRef.current.push(() => {
            el.innerHTML = originalHtml;
          });

          const rawText = serializeElementWithBr(el);
          const tokens = tokenizeCopyText(rawText);

          el.innerHTML = '';

          if (splitBy === 'lines') {
            // Split by explicit <br> lines or wrap the whole block in a line mask while keeping words intact
            let currentLineMask = document.createElement('span');
            currentLineMask.style.display = 'inline-block';
            currentLineMask.style.overflow = 'hidden';
            currentLineMask.style.verticalAlign = 'bottom';

            let currentLineInner = document.createElement('span');
            currentLineInner.className = 'line1 inline-block will-change-transform';
            currentLineMask.appendChild(currentLineInner);
            el.appendChild(currentLineMask);
            targetsRef.current.push(currentLineInner);

            tokens.forEach((token) => {
              if (token.type === 'br') {
                el.appendChild(document.createElement('br'));
                currentLineMask = document.createElement('span');
                currentLineMask.style.display = 'inline-block';
                currentLineMask.style.overflow = 'hidden';
                currentLineMask.style.verticalAlign = 'bottom';

                currentLineInner = document.createElement('span');
                currentLineInner.className = 'line1 inline-block will-change-transform';
                currentLineMask.appendChild(currentLineInner);
                el.appendChild(currentLineMask);
                targetsRef.current.push(currentLineInner);
              } else if (token.type === 'space') {
                currentLineInner.appendChild(document.createTextNode(' '));
              } else if (token.type === 'word' && token.text) {
                const wordSpan = document.createElement('span');
                wordSpan.className = 'inline-block whitespace-nowrap';
                wordSpan.textContent = token.text;
                currentLineInner.appendChild(wordSpan);
              }
            });
            return;
          }

          // splitBy === 'chars'
          // Preserve all <br> tags and wrap words in inline-block whitespace-nowrap with natural spaces
          tokens.forEach((token) => {
            if (token.type === 'br') {
              el.appendChild(document.createElement('br'));
            } else if (token.type === 'space') {
              el.appendChild(document.createTextNode(' '));
            } else if (token.type === 'word' && token.chars) {
              const wordSpan = document.createElement('span');
              wordSpan.className = 'inline-block whitespace-nowrap';

              token.chars.forEach((ch, idx) => {
                const maskSpan = document.createElement('span');
                maskSpan.style.display = 'inline-block';
                maskSpan.style.overflow = 'hidden';
                maskSpan.style.verticalAlign = 'bottom';
                maskSpan.style.paddingInline = '0.04em';
                maskSpan.style.marginInline = '-0.04em';
                maskSpan.style.boxSizing = 'content-box';

                const charSpan = document.createElement('span');
                charSpan.className = `char${idx + 1} inline-block will-change-transform`;
                charSpan.textContent = ch;

                maskSpan.appendChild(charSpan);
                wordSpan.appendChild(maskSpan);
                targetsRef.current.push(charSpan);
              });

              el.appendChild(wordSpan);
            }
          });
        });

        if (prefersReduced) {
          gsap.set(targetsRef.current, { yPercent: 0, xPercent: 0, rotate: 0, opacity: 1 });
          gsap.set(container, { opacity: 0, y: 24 });
          const toVars: any = {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
            delay,
          };
          if (onComplete) {
            const totalTime = delay + 0.8;
            gsap.delayedCall(Math.max(totalTime - completeOverlap, 0), onComplete);
          }
          if (animateOnScroll) {
            gsap.to(container, {
              ...toVars,
              scrollTrigger: {
                trigger: container,
                start: 'top 85%',
                once: true,
              },
            });
          } else {
            gsap.to(container, toVars);
          }
          return;
        }

        const dirVars = DIRECTION_MAP[direction] ?? DIRECTION_MAP.bottom;
        gsap.set(container, { opacity: 1 });
        const fromVars = { ...dirVars, willChange: 'transform' };
        const resolvedStagger = stagger ?? (splitBy === 'lines' ? 0.1 : 0.03);
        const toVars: any = {
          yPercent: 0,
          xPercent: 0,
          rotate: 0,
          opacity: 1,
          duration,
          stagger: resolvedStagger,
          ease: 'power3.out',
          delay,
        };

        if (onComplete) {
          const totalTime =
            delay + resolvedStagger * Math.max(targetsRef.current.length - 1, 0) + duration;
          gsap.delayedCall(Math.max(totalTime - completeOverlap, 0), onComplete);
        }

        if (animateOnScroll) {
          gsap.fromTo(targetsRef.current, fromVars, {
            ...toVars,
            scrollTrigger: {
              trigger: container,
              start: 'top 85%',
              end: 'bottom 68%',
              scrub,
            },
          });
        } else {
          gsap.fromTo(targetsRef.current, fromVars, toVars);
        }
      }, container);
    };

    const waitForFontsAndRun = () => {
      let didRun = false;
      const done = () => {
        if (!didRun) {
          didRun = true;
          if (timerId) window.clearTimeout(timerId);
          runAnimation();
        }
      };
      const fonts = document.fonts;
      if (!fonts) {
        runAnimation();
        return;
      }
      try {
        const { fontFamily, fontWeight, fontSize } = getComputedStyle(container);
        fonts.load(`${fontWeight} ${fontSize} ${fontFamily}`).then(done, done);
      } catch {
        fonts.ready.then(done, done);
      }
      timerId = window.setTimeout(done, 300);
    };

    const rect = container.getBoundingClientRect();
    if (rect.top < 1.5 * window.innerHeight && rect.bottom > -window.innerHeight) {
      waitForFontsAndRun();
    } else {
      observer = new IntersectionObserver(
        ([entry], obs) => {
          if (entry.isIntersecting) {
            obs.disconnect();
            observer = null;
            waitForFontsAndRun();
          }
        },
        { rootMargin: '200% 0px' }
      );
      observer.observe(container);
    }

    return () => {
      cancelled = true;
      if (timerId) window.clearTimeout(timerId);
      observer?.disconnect();
      if (ctx) ctx.revert();
      revertFnsRef.current.forEach((fn) => fn());
    };
  }, [
    animateOnScroll,
    delay,
    scrub,
    direction,
    splitBy,
    stagger,
    duration,
    onComplete,
    completeOverlap,
    start,
  ]);

  return (
    <div ref={wrapperRef} data-copy-wrapper="true" className={`opacity-0 ${className}`}>
      {children}
    </div>
  );
}
