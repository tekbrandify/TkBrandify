import React, { useEffect, useRef, useState } from 'react';

interface AnimatedButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  btnText?: string;
  href?: string;
  className?: string;
  textClassName?: string;
  bgColor?: string;
  textColor?: string;
  hoverTextColor?: string;
  dotColor?: string;
}

export default function AnimatedButton({
  btnText = '',
  href = '#',
  className = '',
  textClassName = '',
  bgColor = '#ff6b00',
  textColor = '#ffffff',
  hoverTextColor = '#ff6b00',
  dotColor = '#ffffff',
  ...rest
}: AnimatedButtonProps) {
  const textRef = useRef<HTMLSpanElement>(null);
  const [hovered, setHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    const text = btnText || '';
    el.innerHTML = '';
    [...text].forEach((ch, idx) => {
      const span = document.createElement('span');
      span.textContent = ch;
      span.style.transitionDelay = reducedMotion ? '0s' : `${0.01 * idx}s`;
      if (ch === ' ') {
        span.style.whiteSpace = 'pre';
      }
      el.appendChild(span);
    });
  }, [btnText, reducedMotion]);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    Array.from(el.children || []).forEach((child) => {
      const span = child as HTMLElement;
      span.style.display = 'inline-block';
      span.style.position = 'relative';
      span.style.textShadow = '0px 1.3em currentColor';
      span.style.transform = 'translateY(0em) rotate(0.001deg)';
      span.style.transition = reducedMotion
        ? 'none'
        : 'transform 0.6s cubic-bezier(0.625, 0.05, 0, 1), color 0.6s cubic-bezier(0.625, 0.05, 0, 1)';
      span.style.willChange = 'transform';
    });
  }, [btnText, reducedMotion]);

  useEffect(() => {
    const mql = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      setReducedMotion('matches' in e ? e.matches : false);
    };
    if (mql) {
      handler(mql);
      mql.addEventListener('change', handler);
    }
    return () => mql?.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 639px)');
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile('matches' in e ? e.matches : false);
    };
    handler(mql);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  const triggerEnter = () => {
    const el = textRef.current;
    if (el) {
      Array.from(el.children).forEach((child) => {
        (child as HTMLElement).style.transform = 'translateY(-1.3em) rotate(0.001deg)';
      });
    }
    setHovered(true);
  };

  const triggerLeave = () => {
    const el = textRef.current;
    if (el) {
      Array.from(el.children).forEach((child) => {
        (child as HTMLElement).style.transform = 'translateY(0em) rotate(0.001deg)';
      });
    }
    setHovered(false);
  };

  return (
    <a
      href={href}
      {...rest}
      onMouseEnter={() => {
        if (!isMobile) triggerEnter();
      }}
      onMouseLeave={() => {
        if (!isMobile) triggerLeave();
      }}
      onPointerDown={(e) => {
        rest.onPointerDown?.(e);
        if (isMobile && e.pointerType !== 'mouse') {
          if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
          triggerEnter();
          timeoutRef.current = window.setTimeout(() => {
            triggerLeave();
            timeoutRef.current = null;
          }, 1000);
        }
      }}
      className={`group relative flex w-fit items-center justify-center gap-[0.9vw] h-[3.5vw] px-[2vw] rounded-full overflow-hidden whitespace-nowrap no-underline font-medium text-[1.5vw] transition-colors border-white/20! duration-500 motion-reduce:transition-none max-[1025px]:gap-[1.6vw] max-[1025px]:h-[8vw] max-[1025px]:px-[3.5vw] max-[1025px]:text-[3vw] max-[1025px]:font-normal max-[1025px]:motion-reduce:transition-none max-md:gap-[2.4vw] max-md:h-[12vw] max-md:px-[5vw] max-md:text-[4.2vw] max-md:motion-reduce:transition-none ${className}`}
      style={{ background: bgColor, color: hovered ? hoverTextColor : textColor }}
    >
      <span
        aria-hidden={true}
        className="relative z-10 flex shrink-0 items-center justify-center w-[0.5vw] h-[0.5vw] max-[1025px]:w-[1.5vw] max-[1025px]:h-[1.5vw] max-md:w-[2.3vw] max-md:h-[2.3vw]"
        style={{ marginTop: '0.08em' }}
      >
        <span
          className="absolute inset-0 rounded-full transition-transform duration-400 ease-in-out motion-reduce:transition-none max-[1025px]:motion-reduce:transition-none max-md:motion-reduce:transition-none"
          style={{
            background: dotColor,
            transform: hovered ? 'scale(120)' : 'scale(1)',
            transitionTimingFunction: 'cubic-bezier(0.785, 0.135, 0.15, 0.86)',
          }}
        />
      </span>
      <span aria-hidden="true" className={`invisible block h-[1.3em] leading-[1.3] ${textClassName}`}>
        {btnText}
      </span>
      <span
        className={`absolute left-1/2 top-1/2 z-20 block h-[1.3em] -translate-x-1/2 -translate-y-1/2 overflow-hidden ${textClassName}`}
        style={{ marginTop: '0.08em' }}
      >
        <span ref={textRef} className="block leading-[1.3]" aria-hidden={false}>
          {btnText}
        </span>
      </span>
      <span
        aria-hidden="true"
        className="block shrink-0 w-[0.5vw] max-[1025px]:w-[1.5vw] max-md:w-[2.3vw]"
      />
    </a>
  );
}
