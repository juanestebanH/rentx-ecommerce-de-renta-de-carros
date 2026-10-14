import { useState } from 'react';
import { Rotate3d } from 'lucide-react';
import { FEATURED_MODELS } from '@/pages/home/featuredModels';
import type { FeaturedModel } from '@/pages/home/featuredModels';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';
import { SingleModelViewer } from './viewer/SingleModelViewer';

const kia = FEATURED_MODELS.find(
  (model) => model.id === 'kia',
) as FeaturedModel;
const KIA_MODEL: FeaturedModel = { ...kia, rotationY: Math.PI / 4 };

function prefersReducedMotion(): boolean {
  return (
    typeof window === 'undefined' ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export function AuthVisualPanel() {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [paused, setPaused] = useState(false);
  const [reduceMotion] = useState(prefersReducedMotion);

  const autoRotate = isDesktop && !reduceMotion && !paused;

  const statusLabel = reduceMotion
    ? 'Rotación automática desactivada por tu configuración de movimiento reducido. Arrastra o usa las flechas para girar el modelo.'
    : paused
      ? 'Rotación automática pausada. Arrastra o usa las flechas para girar el modelo.'
      : 'Rotación automática activa. Arrastra o usa las flechas para girar el modelo.';

  return (
    <aside
      aria-label="Modelo 3D del Kia Sportage"
      className="relative hidden flex-col overflow-hidden bg-background md:flex"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[min(78svh,640px)] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.02) 55%, transparent 72%)',
        }}
      />

      <div className="relative z-10 flex max-w-xl flex-col items-start gap-1.5 px-10 pt-9 lg:px-14">
        <p className="my-0 text-xs font-semibold uppercase tracking-[0.22em] text-accent-foreground">
          Tu próxima aventura
        </p>
        <h1 className="my-0 text-3xl font-bold tracking-tight lg:text-4xl">
          <span className="block text-foreground">Renta fácil,</span>
          <span className="block text-accent-foreground">vive más.</span>
        </h1>
        <p className="mt-2 max-w-md text-base leading-relaxed text-muted-foreground">
          Tu próximo carro está a solo un par de clicks de distancia.
        </p>
      </div>

      <div className="relative z-10 mt-2 flex min-h-0 flex-1 flex-col">
        {isDesktop && (
          <SingleModelViewer
            model={KIA_MODEL}
            autoRotate={autoRotate}
            onInteract={() => setPaused(true)}
            onInteractEnd={() => setPaused(false)}
            className="h-full w-full"
          />
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center">
          <span className="flex items-center gap-2 rounded-full border border-[var(--accent-border)] bg-card/80 px-3.5 py-1.5 text-xs font-medium text-accent-foreground shadow-sm backdrop-blur-md">
            <Rotate3d className="size-3.5 shrink-0" aria-hidden="true" />
            360° · Arrastra para rotar
          </span>
        </div>
      </div>

      <p role="status" aria-live="polite" className="sr-only">
        {statusLabel}
      </p>
    </aside>
  );
}