import { motion, type Variants } from 'framer-motion';
import { Quote } from 'lucide-react';
import { TESTIMONIOS } from './testimonios';

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

export function Testimonials() {
  if (TESTIMONIOS.length === 0) return null;

  return (
    <section
      aria-labelledby="opiniones-titulo"
      className="flex min-h-svh w-full flex-col bg-background py-16 sm:py-20"
    >
      <motion.div
        className="mx-auto w-full max-w-6xl px-4 sm:px-6"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={container}
      >
        <motion.p
          variants={item}
          className="my-0 text-xs font-semibold uppercase tracking-[0.28em] text-accent-foreground"
        >
          Opiniones
        </motion.p>
        <motion.h2
          variants={item}
          id="opiniones-titulo"
          className="mt-3! text-2xl font-semibold tracking-tight sm:text-3xl"
        >
          Lo que dicen nuestros clientes
        </motion.h2>
        <motion.p
          variants={item}
          className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base"
        >
          Opiniones de quienes ya viajaron con RentX.
        </motion.p>
      </motion.div>

      <div className="my-auto">
        <motion.ul
          className="mx-auto mt-10 grid w-full max-w-6xl list-none gap-5 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={container}
        >
          {TESTIMONIOS.map((testimonio) => (
            <motion.li key={testimonio.contexto} variants={item} className="h-full">
              <figure className="flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-sm">
                <Quote
                  className="size-6 text-accent-foreground/50"
                  aria-hidden="true"
                />
                <blockquote className="mt-4 text-base leading-relaxed text-foreground sm:text-lg">
                  {testimonio.texto}
                </blockquote>
                <figcaption className="mt-auto pt-5">
                  <cite className="text-sm not-italic text-muted-foreground">
                    {testimonio.contexto}
                  </cite>
                </figcaption>
              </figure>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
