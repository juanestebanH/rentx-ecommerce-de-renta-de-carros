import { Link, Outlet } from 'react-router-dom';
import { CarFront } from 'lucide-react';

export function AuthLayout() {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="flex justify-center pt-4">
        <Link
          to="/"
          className="flex items-center gap-1.5"
          aria-label="RentX - inicio"
        >
          <span className="flex size-8 items-center justify-center rounded-full bg-[var(--accent-bg)] text-primary">
            <CarFront className="size-4" aria-hidden="true" />
          </span>
          <span className="text-base font-semibold tracking-tight">RentX</span>
        </Link>
      </header>
      <main className="flex w-full flex-1 flex-col">
        <Outlet />
      </main>
    </div>
  );
}