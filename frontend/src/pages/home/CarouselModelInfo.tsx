import type { FeaturedModel } from './featuredModels';

interface CarouselModelInfoProps {
  model: FeaturedModel;
  currentIndex: number;
  total: number;
  paused: boolean;
}

export function CarouselModelInfo({
  model,
  currentIndex,
  total,
  paused,
}: CarouselModelInfoProps) {
  return (
    <>
      <div className="pointer-events-none absolute bottom-12 left-4 z-10 flex max-w-[60%] flex-col gap-0.5 rounded-2xl bg-card/75 px-4 py-3 shadow-sm backdrop-blur-md sm:bottom-14 sm:left-6">
        <h3 className="my-0 text-xl font-medium tracking-tight sm:text-2xl">
          {model.nombre}
        </h3>
        <p className="my-0 text-sm text-muted-foreground">{model.detalle}</p>
      </div>
      <p role="status" aria-live="polite" className="sr-only">
        {model.nombre}, modelo {currentIndex + 1} de {total}.
        {paused ? ' Rotación automática pausada.' : ''}
      </p>
    </>
  );
}
