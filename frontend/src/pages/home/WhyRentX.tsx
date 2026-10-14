import { useRef, type MouseEvent } from 'react';
import { motion, type Variants } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CalendarClock,
  MessagesSquare,
  ReceiptText,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';
import { useVehicles } from '@/features/vehicles/hooks/useVehicles';

const POINTS = [
  {
    icon: ShieldCheck,
    title: 'Seguro claro',
    text: 'Cada ficha indica si el carro incluye seguro antes de que reserves.',
  },
  {
    icon: CalendarClock,
    title: 'Cancelación simple',
    text: 'Cancela tu propia reserva desde Mis rentas mientras siga pendiente.',
  },
  {
    icon: ReceiptText,
    title: 'Sin costos ocultos',
    text: 'El precio por día que ves es el que pagas.',
  },
  {
    icon: MessagesSquare,
    title: 'Soporte en español',
    text: 'Escríbenos o llámanos: ayuda clara antes, durante y después.',
  },
];

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

interface PuntoCardProps {
  icon: LucideIcon;
  title: string;
  text: string;
}

function PuntoCard({ icon: Icon, title, text }: PuntoCardProps) {
  const ref = useRef<HTMLLIElement>(null);

  const handleMove = (event: MouseEvent<HTMLLIElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${event.clientX - rect.left}px`);
    el.style.setProperty('--my', `${event.clientY - rect.top}px`);
  };

  return (
    <li
      ref={ref}
      onMouseMove={handleMove}
      className="group relative flex flex-col gap-3 overflow-hidden bg-accent-band p-6 sm:p-7"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 motion-reduce:transition-none"
        style={{
          background:
            'radial-gradient(220px circle at var(--mx, 50%) var(--my, 50%), color-mix(in oklab, var(--color-card) 80%, transparent), transparent 72%)',
        }}
      />
      <span className="relative flex size-11 items-center justify-center rounded-full border border-[var(--accent-border)] bg-card text-primary transition-all duration-300 group-hover:-rotate-6 group-hover:scale-110 group-hover:border-transparent group-hover:bg-primary group-hover:text-primary-foreground motion-reduce:transition-none">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <h3 className="relative my-0 text-base font-semibold transition-colors duration-300 group-hover:text-primary">
        {title}
      </h3>
      <p className="relative my-0 text-sm leading-relaxed text-muted-foreground">
        {text}
      </p>
    </li>
  );
}

export function WhyRentX() {
  const { data, isLoading, isError } = useVehicles();
  const total = data?.length ?? 0;

  return (
    <section
      aria-labelledby="por-que-titulo"
      className="flex min-h-svh w-full flex-col bg-accent-band py-16 sm:py-20"
    >
      <motion.div
        className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 sm:px-6"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={container}
      >
        <motion.p
          variants={item}
          className="my-0 text-xs font-semibold uppercase tracking-[0.28em] text-accent-foreground"
        >
          La experiencia RentX
        </motion.p>
        <motion.h2
          variants={item}
          id="por-que-titulo"
          className="mt-3! text-3xl font-semibold tracking-tight sm:text-4xl"
        >
          Por qué RentX
        </motion.h2>
        <motion.p
          variants={item}
          className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base"
        >
          Lo que ves es lo que pagas y decides con la información completa antes
          de confirmar.
        </motion.p>

        <div className="my-auto">
          <motion.ul
            variants={item}
            className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-[var(--accent-border)] bg-[var(--accent-border)] sm:grid-cols-2 lg:grid-cols-4"
          >
            {POINTS.map((point) => (
              <PuntoCard key={point.title} {...point} />
            ))}
          </motion.ul>

          <motion.div
            variants={item}
            className="mt-12 flex flex-col gap-4 border-t border-[var(--accent-border)] pt-6 sm:flex-row sm:items-center sm:justify-between"
          >
            {isLoading ? (
              <span
                aria-hidden="true"
                className="h-5 w-60 animate-pulse rounded-md bg-[var(--accent-bg)]"
              />
            ) : (
              <p className="my-0 text-sm text-muted-foreground">
                {isError ? (
                  'Revisa el catálogo para ver los carros disponibles hoy.'
                ) : (
                  <>
                    <span className="font-semibold tabular-nums text-foreground">
                      {total}
                    </span>{' '}
                    vehículos en la flota, cada uno con su ficha, precio y
                    disponibilidad.
                  </>
                )}
              </p>
            )}

            <Link
              to="/contacto"
              className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-accent-foreground underline-offset-4 hover:underline"
            >
              ¿Tienes dudas? Escríbenos
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
