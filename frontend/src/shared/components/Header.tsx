import { useEffect, useState } from 'react';
import { CarFront, LogOut, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { MobileMenu } from './MobileMenu';
import { ThemeToggle } from './ThemeToggle';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useLogout } from '@/features/auth/hooks/useAuth';
import { useThemeStore } from '@/shared/store/theme.store';

const FILM_BG = 'rgba(0, 0, 0, 0)';
const SCROLL_THRESHOLD = 80;
const HEADER_TRANSITION = { duration: 0.35, ease: 'easeOut' } as const;

type HeaderProps = {
  transparent?: boolean;
};

export function Header({ transparent = false }: HeaderProps) {
  const user = useAuthStore((state) => state.user);
  const theme = useThemeStore((state) => state.theme);
  // Tonos del header al scrollear: derivan de --color-background y
  // --color-border de index.css en cada tema (framer-motion necesita
  // strings concretos, no var()).
  const glassBg =
    theme === 'dark' ? 'rgba(14, 15, 17, 0.95)' : 'rgba(250, 247, 242, 0.95)';
  const solidBorder =
    theme === 'dark' ? 'rgb(42, 44, 49)' : 'rgb(229 225 220)';
  const clearBorder =
    theme === 'dark' ? 'rgba(42, 44, 49, 0)' : 'rgba(229, 225, 220, 0)';
  // El header público pertenece al mundo cliente: una sesión de admin se
  // comporta como una visita sin sesión. El panel de administración vive
  // en AdminLayout, con su propio header (ver features/admin/components).
  const isClient = user?.rol === 'client';
  const logout = useLogout();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (latest) => {
    if (!transparent) return;
    setScrolled(latest > SCROLL_THRESHOLD);
  });

  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (event: globalThis.PointerEvent) => {
      if (
        event.target instanceof Element &&
        !event.target.closest('[data-header-root]')
      ) {
        setMenuOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  const navLinkClass =
    transparent && !scrolled
      ? 'transition-colors duration-300 text-white hover:bg-white/15 hover:text-white [text-shadow:0_1px_8px_rgba(0,0,0,0.5)]'
      : undefined;

  const content = (
    <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
      <Link to="/" className="flex items-center gap-2" aria-label="RentX - inicio">
        <span
          className={`flex size-9 items-center justify-center rounded-full transition-colors duration-300 ${
            transparent && !scrolled
              ? 'bg-white/10 text-[#8FD9CE]'
              : 'bg-[var(--accent-bg)] text-primary'
          }`}
        >
          <CarFront className="size-5" aria-hidden="true" />
        </span>
        <span
          className={`transition-colors duration-300 ${
            transparent && !scrolled
              ? 'text-white [text-shadow:0_1px_8px_rgba(0,0,0,0.5)]'
              : ''
          }`}
        >
          RentX
        </span>
      </Link>
      <nav className="hidden items-center gap-1 md:flex" aria-label="Principal">
          <Button asChild variant="ghost" size="sm" className={navLinkClass}>
            <Link to="/">Inicio</Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className={navLinkClass}>
            <Link to="/catalogo">Catálogo</Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className={navLinkClass}>
            <Link to="/contacto">Contacto</Link>
          </Button>
          <ThemeToggle
            className={`size-9 justify-center rounded-full transition-colors duration-300 ${
              transparent && !scrolled
                ? 'text-white hover:bg-white/15'
                : 'text-foreground hover:bg-accent'
            }`}
          />
          {isClient ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm">Mi cuenta</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to="/mis-rentas">Mis rentas</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => {
                  void logout();
                }}
              >
                <LogOut aria-hidden="true" />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button asChild size="sm">
            <Link to="/login">Iniciar sesión</Link>
          </Button>
        )}
      </nav>
      <button
        type="button"
        aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
        aria-expanded={menuOpen}
        aria-controls="mobile-menu"
        onClick={() => setMenuOpen((value) => !value)}
        className={`flex size-10 items-center justify-center rounded-full transition-colors duration-300 md:hidden ${
          transparent && !scrolled
            ? 'text-white hover:bg-white/15'
            : 'text-foreground hover:bg-accent'
        }`}
      >
        {menuOpen ? (
          <X className="size-5" aria-hidden="true" />
        ) : (
          <Menu className="size-5" aria-hidden="true" />
        )}
      </button>
    </div>
  );

  if (!transparent) {
    return (
      <header
        data-header-root
        className="relative border-b border-border bg-card"
      >
        {content}
        <MobileMenu
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          user={user}
          onLogout={logout}
        />
      </header>
    );
  }

  return (
    <motion.header
      data-header-root
      className={`fixed inset-x-0 top-0 z-40 ${scrolled ? 'backdrop-blur-md' : ''}`}
      initial={false}
      animate={{
        backgroundColor: scrolled ? glassBg : FILM_BG,
        borderBottomColor: scrolled ? solidBorder : clearBorder,
        boxShadow: scrolled
          ? '0 1px 4px rgba(43, 36, 30, 0.08)'
          : '0 0 0 rgba(43, 36, 30, 0)',
      }}
      transition={HEADER_TRANSITION}
      style={{ borderBottomWidth: '1px', borderBottomStyle: 'solid' }}
    >
      {content}
      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        user={user}
        onLogout={logout}
      />
    </motion.header>
  );
}