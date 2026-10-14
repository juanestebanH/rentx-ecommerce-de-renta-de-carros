import { motion, type Variants } from 'framer-motion';
import {
  Camera,
  Clock,
  Mail,
  MapPin,
  MessagesSquare,
  Phone,
  Share2,
  ThumbsUp,
} from 'lucide-react';

const DIRECT = [
  {
    icon: Mail,
    label: 'Correo electrónico',
    value: 'contacto@rentx.com',
  },
  {
    icon: Phone,
    label: 'Teléfono',
    value: '+57 300 123 4567',
  },
  {
    icon: MapPin,
    label: 'Dirección',
    value: 'Bogotá, Colombia',
  },
] as const;

const REDES = [
  { icon: Camera, label: '@rentx' },
  { icon: ThumbsUp, label: '/rentx' },
] as const;

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

const CARD_SHADOW = '0 1px 3px rgba(43, 36, 30, 0.06)';

export function ContactPage() {
  return (
    <div className="relative overflow-hidden pb-20 pt-12 sm:pt-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 size-[26rem] rounded-full bg-[var(--accent-bg)] opacity-70 blur-3xl"
      />
      <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={container}
        >
          <motion.div variants={item} className="max-w-2xl">
            <h1 className="my-0 text-3xl font-semibold tracking-tight sm:text-4xl">
              Contáctanos
            </h1>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
              Estamos listos para ayudarte antes, durante y después de tu renta.
            </p>
          </motion.div>

          <div className="mt-10 grid gap-6 lg:grid-cols-5">
            <motion.div variants={item} className="lg:col-span-3">
              <div
                style={{ boxShadow: CARD_SHADOW }}
                className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-card p-6 sm:p-8"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-12 -top-12 size-40 rounded-full bg-[var(--accent-bg)] opacity-60"
                />
                <div className="flex items-center gap-3 border-b border-border pb-5">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[var(--accent-bg)] text-primary">
                    <MessagesSquare className="size-5" aria-hidden="true" />
                  </span>
                  <h2 className="my-0 text-lg font-semibold">Vías de contacto</h2>
                </div>
                <ul className="divide-y divide-border">
                  {DIRECT.map(({ icon: Icon, label, value }) => (
                    <li
                      key={label}
                      className="flex items-center gap-4 py-5 first:pt-6"
                    >
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[var(--accent-bg)] text-primary">
                        <Icon className="size-5" aria-hidden="true" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                          {label}
                        </span>
                        <span className="mt-0.5 block break-words text-base font-semibold">
                          {value}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            <div className="flex flex-col gap-6 lg:col-span-2">
              <motion.div variants={item} className="flex-1">
                <div
                  style={{ boxShadow: CARD_SHADOW }}
                  className="flex h-full flex-col rounded-3xl bg-card p-6 sm:p-7"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex size-11 items-center justify-center rounded-full bg-[var(--accent-bg)] text-primary">
                      <Clock className="size-5" aria-hidden="true" />
                    </span>
                    <h2 className="my-0 text-base font-semibold">
                      Horario de atención
                    </h2>
                  </div>
                  <p className="mt-4 text-lg font-semibold">Lunes a viernes</p>
                  <p className="mt-1 text-sm text-muted-foreground">8 am – 6 pm</p>
                </div>
              </motion.div>

              <motion.div variants={item} className="flex-1">
                <div
                  style={{ boxShadow: CARD_SHADOW }}
                  className="flex h-full flex-col rounded-3xl bg-card p-6 sm:p-7"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex size-11 items-center justify-center rounded-full bg-[var(--accent-bg)] text-primary">
                      <Share2 className="size-5" aria-hidden="true" />
                    </span>
                    <h2 className="my-0 text-base font-semibold">Síguenos</h2>
                  </div>
                  <div className="mt-4 flex flex-col gap-2">
                    {REDES.map(({ icon: Icon, label }) => (
                      <span
                        key={label}
                        className="inline-flex items-center gap-2 rounded-full bg-[var(--accent-bg)] px-4 py-2 text-sm font-semibold text-primary"
                      >
                        <Icon className="size-4" aria-hidden="true" />
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default ContactPage;