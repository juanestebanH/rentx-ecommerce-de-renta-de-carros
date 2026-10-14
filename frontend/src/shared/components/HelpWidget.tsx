import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageCircleMore, X } from 'lucide-react';
import { FaqAccordion, type FaqItem } from './HelpFaqList';

const FAQS: FaqItem[] = [
  {
    q: '¿Cómo reservo un carro?',
    a: 'Elige tus fechas en el catálogo o en la ficha del vehículo, verifica la disponibilidad y, si está libre, confirma la reserva y elige tu método de pago. Necesitas tener la sesión iniciada para reservar.',
  },
  {
    q: '¿Qué métodos de pago aceptan?',
    a: 'Tarjeta, efectivo o transferencia. Con tarjeta la reserva se confirma al instante; con efectivo o transferencia queda pendiente hasta que un administrador confirme el pago.',
  },
  {
    q: '¿Puedo cancelar mi reserva?',
    a: (
      <>
        Solo si tu reserva está en estado pendiente. Entra a{' '}
        <Link
          to="/mis-rentas"
          className="font-semibold underline underline-offset-4"
        >
          Mis rentas
        </Link>{' '}
        y usa la opción Cancelar.
      </>
    ),
  },
  {
    q: '¿Necesito una cuenta para explorar el catálogo?',
    a: 'No. Puedes navegar el catálogo y revisar las fichas sin cuenta; solo la necesitas para reservar.',
  },
  {
    q: '¿Qué incluye el seguro?',
    a: 'No todos los vehículos lo incluyen. Cada ficha lo indica en su sección de Especificaciones: seguro incluido o no incluido.',
  },
  {
    q: '¿Cómo contacto al soporte?',
    a: (
      <>
        Visita nuestra{' '}
        <Link
          to="/contacto"
          className="font-semibold underline underline-offset-4"
        >
          página de contacto
        </Link>{' '}
        para escribirnos o llamarnos.
      </>
    ),
  },
];

export function HelpWidget() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: globalThis.PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef}>
      <motion.button
        type="button"
        aria-label={open ? 'Cerrar ayuda' : 'Abrir ayuda'}
        aria-expanded={open}
        aria-controls="help-faq-panel"
        whileTap={{ scale: 0.94 }}
        onClick={() => setOpen((value) => !value)}
        className="fixed bottom-4 left-4 z-50 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/40 transition-colors duration-200 hover:bg-primary/90 sm:bottom-6 sm:left-6"
      >
        {open ? (
          <X className="size-6" aria-hidden="true" />
        ) : (
          <MessageCircleMore className="size-6" aria-hidden="true" />
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            id="help-faq-panel"
            role="dialog"
            aria-label="Preguntas frecuentes"
            initial={{ opacity: 0, scale: 0.94, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 10 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            style={{ transformOrigin: 'bottom left' }}
            className="fixed bottom-32 left-4 z-50 w-[min(calc(100vw-2rem),22rem)] overflow-hidden rounded-2xl border border-border bg-card shadow-[0_24px_60px_-12px_rgba(43,36,30,0.28)] sm:bottom-36 sm:left-6"
          >
            <div className="flex items-start justify-between gap-4 border-b border-border p-5">
              <div>
                <p className="text-base font-semibold">
                  ¿En qué podemos ayudarte?
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Preguntas frecuentes sobre RentX.
                </p>
              </div>
              <button
                type="button"
                aria-label="Cerrar ayuda"
                onClick={() => setOpen(false)}
                className="flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>

            <div className="max-h-[50vh] overflow-y-auto px-5">
              <FaqAccordion items={FAQS} />
            </div>

            <div className="border-t border-border bg-muted/40 px-5 py-3">
              <p className="text-sm text-muted-foreground">
                ¿Buscas otra respuesta?{' '}
                <Link
                  to="/contacto"
                  className="font-semibold text-primary underline-offset-4 hover:underline"
                >
                  Escríbenos
                </Link>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}