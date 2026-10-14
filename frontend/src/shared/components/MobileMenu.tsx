import { Link } from 'react-router-dom';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import {
  CarFront,
  House,
  LogOut,
  MessagesSquare,
  UserRound,
} from 'lucide-react';
import type { AuthUser } from '@/features/auth/types/auth.types';
import { Button } from '@/shared/components/ui/button';
import { ThemeToggle } from './ThemeToggle';

const container: Variants = {
  hidden: { opacity: 0, y: -8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: 'easeOut', staggerChildren: 0.05 },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.18, ease: 'easeIn' },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: -4 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
  exit: { opacity: 0, transition: { duration: 0.12 } },
};

const NAV_LINKS = [
  { to: '/', label: 'Inicio', icon: House },
  { to: '/catalogo', label: 'Catálogo', icon: CarFront },
  { to: '/contacto', label: 'Contacto', icon: MessagesSquare },
] as const;

const ROW_CLASS =
  'flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors';

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  user: AuthUser | null;
  onLogout: () => void;
}

export function MobileMenu({ open, onClose, user, onLogout }: MobileMenuProps) {
  // El menú móvil público es del mundo cliente: una sesión de admin ve el
  // mismo estado que un visitante sin sesión. El panel de administración
  // tiene su propio header en AdminLayout.
  const isClient = user?.rol === 'client';

  const handleLogout = () => {
    onClose();
    onLogout();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id="mobile-menu"
          variants={container}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="absolute inset-x-0 top-full z-50 border-b border-border bg-card shadow-[0_24px_48px_-16px_rgba(43,36,30,0.25)] md:hidden"
        >
          <nav
            aria-label="Principal"
            className="mx-auto w-full max-w-6xl overflow-y-auto px-2 py-2 sm:px-6"
          >
            {NAV_LINKS.map(({ to, label, icon: Icon }) => (
              <motion.div key={to} variants={item}>
                <Link
                  to={to}
                  onClick={onClose}
                  className={`${ROW_CLASS} text-foreground hover:bg-accent hover:text-accent-foreground`}
                >
                  <Icon
                    className="size-4 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                  {label}
                </Link>
              </motion.div>
            ))}

            <motion.div
              variants={item}
              aria-hidden="true"
              className="mx-3 my-2 h-px bg-border"
            />

            <motion.div variants={item}>
              <ThemeToggle
                showLabel
                className={`${ROW_CLASS} text-foreground hover:bg-accent hover:text-accent-foreground`}
              />
            </motion.div>

            {isClient ? (
              <>
                <motion.div variants={item}>
                  <Link
                    to="/mis-rentas"
                    onClick={onClose}
                    className={`${ROW_CLASS} text-foreground hover:bg-accent hover:text-accent-foreground`}
                  >
                    <UserRound
                      className="size-4 shrink-0 text-muted-foreground"
                      aria-hidden="true"
                    />
                    Mis rentas
                  </Link>
                </motion.div>
                <motion.div variants={item}>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className={`${ROW_CLASS} text-destructive hover:bg-destructive/10`}
                  >
                    <LogOut className="size-4 shrink-0" aria-hidden="true" />
                    Cerrar sesión
                  </button>
                </motion.div>
              </>
            ) : (
              <motion.div variants={item} className="px-3 pb-3 pt-1">
                <Button asChild className="w-full">
                  <Link to="/login" onClick={onClose}>
                    Iniciar sesión
                  </Link>
                </Button>
              </motion.div>
            )}
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
}