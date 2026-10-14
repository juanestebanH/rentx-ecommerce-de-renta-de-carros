import { useEffect, useState, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { bootstrapSession } from '../lib/sessionBootstrap';

interface SessionBootstrapProps {
  children: ReactNode;
}

export function SessionBootstrap({ children }: SessionBootstrapProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    void bootstrapSession().then(() => {
      if (active) setReady(true);
    });
    return () => {
      active = false;
    };
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-3 bg-background">
        <Loader2 className="size-8 animate-spin text-primary" aria-hidden="true" />
        <p className="text-sm font-medium text-accent-foreground">Cargando…</p>
      </div>
    );
  }

  return <>{children}</>;
}