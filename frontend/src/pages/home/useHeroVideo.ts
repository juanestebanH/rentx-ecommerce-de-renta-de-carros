import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

/**
 * Control del video de fondo de la hero de Home:
 * - lo pausa cuando la hero sale de pantalla (IntersectionObserver)
 * - lo pausa siempre que el usuario prefiera movimiento reducido
 */
export function useHeroVideo() {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const section = sectionRef.current;
    if (!video || !section) return;
    // React no refleja `muted` de forma fiable en el primer render; sin él
    // algunos navegadores bloquean el autoplay.
    video.muted = true;
    if (reduceMotion) {
      video.pause();
      return;
    }
    if (typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) video.play().catch(() => {});
          else video.pause();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, [reduceMotion]);

  return { reduceMotion, sectionRef, videoRef };
}
