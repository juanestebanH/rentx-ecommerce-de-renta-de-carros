import { useEffect, useRef, type RefObject } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { AdminSidebar } from './AdminSidebar';

interface AdminDrawerProps {
  open: boolean;
  onClose: () => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
}

export function AdminDrawer({ open, onClose, triggerRef }: AdminDrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (open) {
      wasOpenRef.current = true;
      panelRef.current?.focus();

      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') onClose();
      };
      document.addEventListener('keydown', onKeyDown);

      return () => {
        document.removeEventListener('keydown', onKeyDown);
      };
    }

    // Solo se devuelve el foco al botón que abrió el drawer, nunca en el
    // montaje inicial (robaría el foco al cargar la página).
    if (wasOpenRef.current) {
      wasOpenRef.current = false;
      triggerRef.current?.focus();
    }
  }, [open, onClose, triggerRef]);

  return (
    <AnimatePresence>
      {open && (
        <div className="lg:hidden">
          <motion.div
            aria-hidden="true"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-0 z-50 bg-black/50"
          />

          <motion.div
            ref={panelRef}
            id="admin-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Navegación de administración"
            tabIndex={-1}
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
            className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] border-r border-border bg-card shadow-[0_0_48px_-8px_rgba(43,36,30,0.35)] outline-none"
          >
            <button
              type="button"
              aria-label="Cerrar menú"
              onClick={onClose}
              className="absolute top-4 right-3 z-10 flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              <X className="size-4" aria-hidden="true" />
            </button>

            <AdminSidebar collapsed={false} onNavigate={onClose} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
