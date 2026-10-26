import React, { useCallback, useEffect, useRef, useState } from 'react';
import { getGsap } from '../utils/gsapGlobal';
import { AWARDS_LIST } from '../data/tekbrandifyData';
import CopyWrapper from './CopyWrapper';

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let reverbSendGain: GainNode | null = null;
const FREQUENCIES = [146.83, 164.81, 196, 220, 261.63, 293.66, 329.63, 392];
const FORMANT_FILTERS = [
  { frequency: 100, q: 1.2, gain: 0.5 },
  { frequency: 220, q: 2, gain: 0.3 },
];
let noteIndex = 0;

function playPluckSound(deflection: number) {
  try {
    const initAudio = () => {
      if (!audioCtx) {
        const Ctx = window.AudioContext ?? window.webkitAudioContext;
        if (!Ctx) return null;
        audioCtx = new Ctx();
        masterGain = audioCtx.createGain();
        masterGain.gain.value = 1;

        const compressor = audioCtx.createDynamicsCompressor();
        compressor.threshold.value = -14;
        compressor.knee.value = 12;
        compressor.ratio.value = 4;
        compressor.attack.value = 0.006;
        compressor.release.value = 0.22;
        masterGain.connect(compressor);
        compressor.connect(audioCtx.destination);

        const len = Math.floor(2.2 * audioCtx.sampleRate);
        const impulse = audioCtx.createBuffer(2, len, audioCtx.sampleRate);
        for (let ch = 0; ch < 2; ch += 1) {
          const data = impulse.getChannelData(ch);
          for (let i = 0; i < len; i += 1) {
            const p = i / len;
            data[i] = (2 * Math.random() - 1) * Math.pow(1 - p, 1.8);
          }
        }
        const convolver = audioCtx.createConvolver();
        convolver.buffer = impulse;
        reverbSendGain = audioCtx.createGain();
        reverbSendGain.gain.value = 0.42;
        reverbSendGain.connect(convolver);
        convolver.connect(masterGain);
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => {});
      }
      return audioCtx;
    };

    const ctx = initAudio();
    if (!ctx || !masterGain || !reverbSendGain) return;

    const intensity = Math.min(Math.abs(deflection) / 60, 1);
    if (intensity < 0.05) return;

    noteIndex = (noteIndex + 1 + Math.floor(2 * Math.random())) % FREQUENCIES.length;
    const detune = 1 + (2 * Math.random() - 1) * 0.004;
    const freq = FREQUENCIES[noteIndex] * detune;
    const sr = ctx.sampleRate;
    const delaySamples = Math.max(2, Math.floor(sr / freq));
    const totalSamples = Math.floor(3.2 * sr);
    const buffer = ctx.createBuffer(1, totalSamples, sr);
    const out = buffer.getChannelData(0);
    const ring = new Float32Array(delaySamples);

    let lp = 0;
    const smooth = 0.1 + 0.12 * intensity;
    for (let i = 0; i < delaySamples; i += 1) {
      const n = 2 * Math.random() - 1;
      lp += (n - lp) * smooth;
      const env = Math.min(1, i / (0.4 * delaySamples));
      ring[i] = lp * env;
    }

    const damping = 0.996 - (1 - intensity) * 0.003;
    let idx = 0;
    let prev = 0;
    for (let i = 0; i < totalSamples; i += 1) {
      const cur = ring[idx];
      const next = 0.75 * ((cur + ring[(idx + 1) % delaySamples]) * 0.5) + 0.25 * prev;
      prev = next;
      ring[idx] = next * damping;
      out[i] = cur;
      idx = (idx + 1) % delaySamples;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 750 + 700 * intensity;
    lowpass.Q.value = 0.5;

    const highpass = ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 70;

    source.connect(lowpass);
    lowpass.connect(highpass);

    const bodyMix = ctx.createGain();
    bodyMix.gain.value = 1;
    highpass.connect(bodyMix);

    FORMANT_FILTERS.forEach(({ frequency, q, gain }) => {
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = frequency;
      bp.Q.value = q;
      const g = ctx.createGain();
      g.gain.value = gain;
      highpass.connect(bp);
      bp.connect(g);
      g.connect(bodyMix);
    });

    const envGain = ctx.createGain();
    const peak = 0.16 + 0.34 * intensity;
    const now = ctx.currentTime;
    envGain.gain.setValueAtTime(1e-4, now);
    envGain.gain.exponentialRampToValueAtTime(peak, now + 0.025);
    envGain.gain.exponentialRampToValueAtTime(0.45 * peak, now + 0.6);
    envGain.gain.exponentialRampToValueAtTime(1e-4, now + 3.2);
    bodyMix.connect(envGain);

    const panner = ctx.createStereoPanner?.();
    if (panner) {
      panner.pan.value = (2 * Math.random() - 1) * 0.35;
      envGain.connect(panner);
      panner.connect(masterGain);
      panner.connect(reverbSendGain);
    } else {
      envGain.connect(masterGain);
      envGain.connect(reverbSendGain);
    }

    source.start(now);
    source.stop(now + 3.2);
    source.onended = () => {
      source.disconnect();
      lowpass.disconnect();
      highpass.disconnect();
      bodyMix.disconnect();
      envGain.disconnect();
      panner?.disconnect();
    };
  } catch {
    // Ignore audio context autoplay restrictions
  }
}

function StringLine({
  strokeColor = '#111111',
  strokeWidth = 2,
  sound = true,
}: {
  strokeColor?: string;
  strokeWidth?: number;
  sound?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const pullRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const phaseRef = useRef(Math.PI / 2);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const raf = window.requestAnimationFrame(() => setReducedMotion(mql.matches));
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mql.addEventListener('change', onChange);
    return () => {
      window.cancelAnimationFrame(raf);
      mql.removeEventListener('change', onChange);
    };
  }, []);

  const updatePath = useCallback((offsetY: number) => {
    const pathEl = pathRef.current;
    const wrapEl = containerRef.current;
    if (!pathEl || !wrapEl) return;
    const width = wrapEl.offsetWidth;
    pathEl.setAttributeNS(null, 'd', `M 0 50 Q ${0.5 * width} ${50 + offsetY} ${width} 50`);
  }, []);

  useEffect(() => {
    updatePath(reducedMotion ? 0 : pullRef.current);
    const onResize = () => updatePath(reducedMotion ? 0 : pullRef.current);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [reducedMotion, updatePath]);

  const onEnter = () => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      phaseRef.current = Math.PI / 2;
    }
  };

  const animateBounce = () => {
    updatePath(pullRef.current * Math.sin(phaseRef.current));
    pullRef.current = 0.95 * pullRef.current;
    phaseRef.current += 0.5;
    if (Math.abs(pullRef.current) > 0.1) {
      rafRef.current = requestAnimationFrame(animateBounce);
    } else {
      phaseRef.current = Math.PI / 2;
      pullRef.current = 0;
      updatePath(0);
    }
  };

  return (
    <div ref={containerRef} className="w-full">
      <div className="string-line lineDraw">
        <span
          onMouseEnter={reducedMotion ? undefined : onEnter}
          onMouseLeave={
            reducedMotion
              ? undefined
              : () => {
                  if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
                  if (sound) playPluckSound(pullRef.current);
                  animateBounce();
                }
          }
          onMouseMove={
            reducedMotion
              ? undefined
              : (e) => {
                  pullRef.current += e.movementY / 2;
                  updatePath(pullRef.current);
                }
          }
          className="box"
        />
        <svg width="100%" height={100}>
          <path ref={pathRef} strokeWidth={strokeWidth} fill="none" style={{ stroke: strokeColor }} />
        </svg>
      </div>
    </div>
  );
}

export default function AwardsSection() {
  const previewCardRef = useRef<HTMLDivElement>(null);
  const previewWrapRef = useRef<HTMLDivElement>(null);
  const imgItemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const rowRefs = useRef<Array<HTMLDivElement | null>>([]);
  const lineWrapRefs = useRef<Array<HTMLDivElement | null>>([]);
  const topZRef = useRef(AWARDS_LIST.length);
  const reducedMotionRef = useRef(false);
  const activeIdxRef = useRef<number | null>(null);
  const mousePosRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotionRef.current = mql.matches;
    const onChange = (e: MediaQueryListEvent) => {
      reducedMotionRef.current = e.matches;
    };
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    const gsap = getGsap();
    if (!gsap) return;
    gsap.set(previewCardRef.current, { y: 0 });
    gsap.set(imgItemRefs.current.filter(Boolean), { opacity: 1 });
    imgItemRefs.current.forEach((el, idx) => {
      if (el) gsap.set(el, { zIndex: idx + 1 });
    });
    if (imgItemRefs.current[0]) {
      gsap.set(imgItemRefs.current[0], { scale: 1.05 });
    }
    imgItemRefs.current.slice(1).forEach((el) => {
      if (el) gsap.set(el, { scale: 0 });
    });
  }, []);

  useEffect(() => {
    const gsap = getGsap();
    if (!gsap) return;
    const lines = lineWrapRefs.current.filter(Boolean);
    if (reducedMotionRef.current) {
      gsap.set(lines, { scaleX: 1 });
      return;
    }
    const tweens = lines.map((line) =>
      gsap.to(line, {
        scaleX: 1,
        duration: 0.8,
        ease: 'power2.inOut',
        scrollTrigger: {
          trigger: line,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      })
    );
    return () => {
      tweens.forEach((t) => t.scrollTrigger?.kill());
      tweens.forEach((t) => t.kill());
    };
  }, []);

  const activateRow = useCallback((idx: number) => {
    const gsap = getGsap();
    if (!gsap) return;
    const rowEl = rowRefs.current[idx];
    const cardEl = previewCardRef.current;

    if (rowEl && cardEl) {
      const currentY = Number(gsap.getProperty(cardEl, 'y')) || 0;
      const cardRect = cardEl.getBoundingClientRect();
      const baseCenterY = cardRect.top + cardRect.height / 2 - currentY;
      const rowRect = rowEl.getBoundingClientRect();
      const targetY = rowRect.top + rowRect.height / 2 - baseCenterY;

      if (reducedMotionRef.current) {
        gsap.set(cardEl, { y: targetY });
      } else {
        gsap.to(cardEl, { y: targetY, duration: 0.65, ease: 'back.out(1.6)' });
      }
    }

    const imgEl = imgItemRefs.current[idx];
    if (imgEl) {
      topZRef.current += 1;
      gsap.set(imgEl, { zIndex: topZRef.current });
      gsap.killTweensOf(imgEl);
      if (reducedMotionRef.current) {
        gsap.set(imgEl, { scale: 1.05 });
      } else {
        gsap.set(imgEl, { scale: 0 });
        gsap.to(imgEl, { scale: 1.05, duration: 0.45, ease: 'power2.out' });
      }
    }
  }, []);

  const checkHit = useCallback(
    (clientX: number, clientY: number) => {
      const rows = rowRefs.current;
      let hit: number | null = null;
      for (let i = 0; i < rows.length; i += 1) {
        const rect = rows[i]?.getBoundingClientRect();
        if (
          rect &&
          clientY >= rect.top &&
          clientY < rect.bottom &&
          clientX >= rect.left &&
          clientX < rect.right
        ) {
          hit = i;
          break;
        }
      }
      if (hit !== null && hit !== activeIdxRef.current) {
        activeIdxRef.current = hit;
        activateRow(hit);
      }
    },
    [activateRow]
  );

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY };
      checkHit(e.clientX, e.clientY);
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, [checkHit]);

  useEffect(() => {
    const onScroll = () => {
      const pos = mousePosRef.current;
      if (pos) checkHit(pos.x, pos.y);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [checkHit]);

  return (
    <section className="relative w-screen bg-[#070707] text-white py-[7vw]" id="awards">
      <div className="w-screen flex items-center px-[4vw] gap-[4vw] max-[1025px]:px-[5vw]">
        <div className="w-full">
          <CopyWrapper stagger={0.015}>
            <h2 className="text-[5.5vw] leading-[1.2] mb-[4vw] max-[1025px]:text-[7vw] max-md:text-[9vw]">
              Awards and Industry
              <br />
              Recognition
            </h2>
          </CopyWrapper>

          <div
            onMouseEnter={() => {
              const gsap = getGsap();
              gsap?.to(previewWrapRef.current, {
                opacity: 1,
                duration: 0.4 * (reducedMotionRef.current ? 0 : 1),
                ease: 'power2.out',
              });
            }}
            onMouseLeave={() => {
              activeIdxRef.current = null;
              const gsap = getGsap();
              gsap?.to(previewWrapRef.current, {
                opacity: 0,
                duration: 0.4 * (reducedMotionRef.current ? 0 : 1),
                ease: 'power2.out',
              });
            }}
          >
            {AWARDS_LIST.map((award, idx) => (
              <React.Fragment key={award.title}>
                {idx !== 0 && (
                  <div
                    ref={(el) => {
                      lineWrapRefs.current[idx - 1] = el;
                    }}
                    className="relative h-px w-full origin-left scale-x-0"
                  >
                    <StringLine strokeColor="rgba(255, 255, 255, 0.4)" />
                  </div>
                )}

                <div
                  ref={(el) => {
                    rowRefs.current[idx] = el;
                  }}
                  className="relative py-8 awards-container"
                >
                  <CopyWrapper splitBy="lines">
                    <h3 className="text-[1.8vw] font-normal max-[1025px]:text-[3.4vw] max-md:text-[5.5vw]">
                      {award.title}
                    </h3>
                  </CopyWrapper>
                  <CopyWrapper splitBy="lines">
                    <p className="text-[1.25vw] tracking-wide text-white/30 mt-3 max-[1025px]:text-[2.2vw] max-md:text-[3.6vw]">
                      {award.meta}
                    </p>
                  </CopyWrapper>
                </div>
              </React.Fragment>
            ))}

            <div
              ref={(el) => {
                lineWrapRefs.current[AWARDS_LIST.length - 1] = el;
              }}
              className="relative h-px w-full origin-left scale-x-0"
            >
              <StringLine strokeColor="rgba(255, 255, 255, 0.4)" />
            </div>
          </div>
        </div>

        <div
          ref={previewWrapRef}
          className="w-[40vw] flex justify-center absolute right-[10%] pointer-events-none opacity-0 max-[1025px]:hidden image-container"
        >
          <div
            ref={previewCardRef}
            className="w-[40vw] h-[22vw] relative bg-[#070707] rounded-lg overflow-hidden shadow-2xl will-change-transform"
          >
            {AWARDS_LIST.map((award, idx) => (
              <div
                key={award.title}
                ref={(el) => {
                  imgItemRefs.current[idx] = el;
                }}
                className="absolute inset-0"
              >
                <img
                  src={award.imgSrc}
                  alt={award.title}
                  className="w-full h-full object-cover rounded-lg"
                  width={600}
                  height={400}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
