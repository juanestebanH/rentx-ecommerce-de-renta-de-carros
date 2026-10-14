import type { ReactNode } from 'react';
import { ShieldCheck } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '@/shared/components/ui/card';

interface AdminAuthShellProps {
  children: ReactNode;
}

/**
 * Layout sobrio para pantallas internas (administración). A diferencia de
 * AuthSplitScreen no incluye el visor 3D ni copy de marketing, y a diferencia
 * de AuthLayout no monta el header con el logo: la pantalla se declara sola
 * y ocupa el viewport completo.
 */
export function AdminAuthShell({ children }: AdminAuthShellProps) {
  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center px-4 py-10 sm:py-14">
      <Card className="w-full max-w-sm gap-5 border-border bg-card shadow-[0_12px_32px_-20px_rgba(43,36,30,0.4)]">
        <CardHeader className="gap-3 text-center">
          <span className="mx-auto flex size-9 items-center justify-center rounded-lg bg-[var(--accent-bg)] text-primary">
            <ShieldCheck className="size-5" aria-hidden="true" />
          </span>
          <h1 className="my-0 text-2xl font-semibold leading-tight tracking-tight text-foreground">
            Panel de administración
          </h1>
          <CardDescription className="mx-auto max-w-xs leading-relaxed">
            Ingresa para gestionar vehículos, clientes y rentals de RentX.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">{children}</CardContent>
      </Card>
    </div>
  );
}
