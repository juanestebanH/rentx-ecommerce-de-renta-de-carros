import { useRef } from 'react';
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import { CalendarRange, KeyRound, Search, type LucideIcon } from 'lucide-react';

const STEPS = [
  {
    icon: CalendarRange,
    title: 'Elige tus fechas',
    text: 'El viaje arranca por decidir cuándo: pon el inicio y el fin de tu plan.',
  },
  {
    icon: Search,
    title: 'Encuentra tu carro disponible',
    text: 'El catálogo se filtra por esa disponibilidad desde el primer momento.',
  },
  {
    icon: KeyRound,
    title: 'Viaja tranquilo',
    text: 'Verifica que esté libre para tus fechas y sal a la carretera.',
  },
] satisfies Array<{ icon: LucideIcon; title: string; text: string }>;

interface TimelineStepProps {
  step: (typeof STEPS)[number];
  index: number;
  total: number;
  progress: MotionValue<number>;
}

function TimelineStep({ step, index, total, progress }: TimelineStepProps) {
  const start = index / total;
  const end = Math.min(1, start + 0.34);
  const opacity = useTransform(progress, [start, end], [0, 1]);
  const y = useTransform(progress, [start, end], [28, 0]);

  return (
    <motion.li
      style={{ opacity, y }}
      className="relative pb-10 pl-12 text-left last:pb-0 sm:grid sm:grid-cols-2 sm:items-center sm:pb-12 sm:pl-0 sm:last:pb-0"
    >
      <span className="absolute left-0 top-0 flex size-9 items-center justify-center rounded-full bg-[var(--accent-bg)] text-primary sm:left-1/2 sm:top-1/2 sm:-ml-[18px] sm:-mt-[18px]">
        <step.icon className="size-5" aria-hidden="true" />
      </span>
      <div
        className={
          index % 2 === 0
            ? 'sm:col-start-1 sm:pr-12 sm:text-right'
            : 'sm:col-start-2 sm:pl-12'
        }
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-accent-foreground">
          Paso {index + 1}
        </p>
        <h3 className="mt-1 text-base font-semibold">{step.title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          {step.text}
        </p>
      </div>
    </motion.li>
  );
}

export function HomeSteps() {
  const timelineRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ['start 80%', 'end 85%'],
  });
  const progress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 28,
    mass: 0.4,
  });
  const lineScale = useTransform(progress, [0, 1], [0, 1]);

  return (
    <section
      aria-labelledby="como-funciona-titulo"
      className="flex min-h-svh flex-col border-t border-border bg-card"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-14 sm:px-6">
        <h2
          id="como-funciona-titulo"
          className="my-0 text-2xl font-semibold tracking-tight sm:text-3xl"
        >
          Así funciona
        </h2>

        <div className="my-auto">
          <div
            ref={timelineRef}
            className="relative mx-auto mt-10 w-full max-w-3xl"
          >
            <div
              aria-hidden="true"
              className="absolute inset-y-0 left-[18px] w-px bg-[var(--accent-border)] sm:left-1/2 sm:-translate-x-1/2"
            />
            <motion.div
              aria-hidden="true"
              style={{ scaleY: lineScale, transformOrigin: 'top' }}
              className="absolute inset-y-0 left-[18px] w-px bg-primary sm:left-1/2 sm:-translate-x-1/2"
            />

            <ol className="relative list-none">
              {STEPS.map((step, index) => (
                <TimelineStep
                  key={step.title}
                  step={step}
                  index={index}
                  total={STEPS.length}
                  progress={progress}
                />
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}