import { motion, type Variants } from 'framer-motion';
import { HomeDatePicker } from './HomeDatePicker';
import { useHeroVideo } from './useHeroVideo';

const POSTER_URL = '/corsa.jpg';
const VIDEO_URL = '/cinematic-corsa-1d34d7297f43.mp4';

const heroContainer: Variants = {
  visible: { transition: { staggerChildren: 0.15 } },
};

const heroItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

export function HeroSection() {
  const { reduceMotion, sectionRef, videoRef } = useHeroVideo();

  return (
    <section
      ref={sectionRef}
      aria-label="RentX - Renta de carros en Colombia"
      className="relative flex min-h-svh w-full flex-col justify-center overflow-hidden bg-petroleum select-none"
    >
      {/* Capa cinematográfica: póster (fallback) + video + gradiente */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <img
          src={POSTER_URL}
          alt=""
          loading="eager"
          decoding="async"
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <video
          ref={videoRef}
          className="hero-video absolute inset-0 h-full w-full scale-[1.02] object-cover object-center"
          src={VIDEO_URL}
          poster={POSTER_URL}
          autoPlay
          loop
          muted
          playsInline
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,29,40,0.7)_0%,rgba(11,29,40,0.3)_35%,rgba(11,29,40,0.35)_60%,rgba(11,29,40,0.85)_100%)]" />
      </div>

      {/* Contenido centrado: eyebrow → título display → subtítulo → buscador */}
      <motion.div
        variants={heroContainer}
        initial={reduceMotion ? false : 'hidden'}
        animate="visible"
        className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center px-6 pt-24 pb-14 text-center sm:px-10 lg:px-16"
      >
        <motion.p
          variants={heroItem}
          className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-[#8FD9CE] [text-shadow:0_2px_8px_rgba(0,0,0,0.4)]"
        >
          Renta de carros en Colombia
        </motion.p>
        <motion.h1
          variants={heroItem}
          className="my-0! text-ivory text-balance text-[clamp(3rem,9vw,8rem)]! font-extrabold! uppercase! leading-[0.9]! tracking-[-0.02em]! [text-shadow:0_2px_8px_rgba(0,0,0,0.4)]"
        >
          El viaje empieza aquí
        </motion.h1>
        <motion.p
          variants={heroItem}
          className="mt-8 max-w-lg text-lg leading-snug text-ivory [text-shadow:0_1px_6px_rgba(0,0,0,0.35)] sm:text-xl"
        >
          Encuentra el carro ideal para moverte por Colombia.
        </motion.p>

        <motion.div variants={heroItem} className="mt-10 w-full max-w-3xl">
          <HomeDatePicker />
        </motion.div>
      </motion.div>
    </section>
  );
}
