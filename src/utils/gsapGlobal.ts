declare global {
  interface Window {
    gsap: any;
    ScrollTrigger: any;
    Lenis: any;
    webkitAudioContext?: typeof AudioContext;
  }
}

export function getGsap(): any {
  const g = typeof window !== 'undefined' ? window.gsap : null;
  const st = typeof window !== 'undefined' ? window.ScrollTrigger : null;
  if (g && st) {
    g.registerPlugin(st);
  }
  return g;
}

export function getScrollTrigger(): any {
  return typeof window !== 'undefined' ? window.ScrollTrigger : null;
}

export function getLenisClass(): any {
  return typeof window !== 'undefined' ? window.Lenis : null;
}
