import { CarFront } from 'lucide-react';
import { Link } from 'react-router-dom';

export function HomeFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-6 px-4 py-10 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-full bg-[var(--accent-bg)] text-primary">
            <CarFront className="size-5" aria-hidden="true" />
          </span>
          <span className="text-lg font-semibold tracking-tight">RentX</span>
        </div>
        <nav className="flex items-center gap-6" aria-label="Secundario">
          <Link
            to="/catalogo"
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Catálogo
          </Link>
          <Link
            to="/contacto"
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Contacto
          </Link>
        </nav>
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} RentX. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}