import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Car3DViewer, type Car3DViewerHandle } from './car3d/Car3DViewer';
import { CarouselControls } from './CarouselControls';
import { CarouselDots } from './CarouselDots';
import { CarouselModelInfo } from './CarouselModelInfo';
import { FEATURED_MODELS } from './featuredModels';

const AUTO_ADVANCE_MS = 6000;
const TOTAL = FEATURED_MODELS.length;

function wrap(index: number) {
  return ((index % TOTAL) + TOTAL) % TOTAL;
}

export function FeaturedVehicles() {
  const [virtualIndex, setVirtualIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const carouselRef = useRef<Car3DViewerHandle>(null);
  const manualPausedRef = useRef(false);
  const index = wrap(virtualIndex);
  const model = FEATURED_MODELS[index];

  useEffect(() => {
    if (paused) return;
    const timer = window.setTimeout(() => {
      carouselRef.current?.advance(1);
    }, AUTO_ADVANCE_MS);
    return () => window.clearTimeout(timer);
  }, [paused, virtualIndex]);

  const goTo = (target: number) => {
    let delta = wrap(target - index);
    if (delta > TOTAL / 2) delta -= TOTAL;
    if (delta === 0) return;
    carouselRef.current?.advance(delta);
  };

  const togglePause = () => {
    manualPausedRef.current = !paused;
    setPaused(!paused);
  };

  return (
    <section aria-labelledby="destacados-titulo" className="w-full pb-14">
      <div className="mx-auto flex w-full max-w-6xl items-end justify-between gap-4 px-4 sm:px-6">
        <div>
          <h2
            id="destacados-titulo"
            className="mt-12! text-2xl font-semibold tracking-tight sm:text-3xl"
          >
            Vehículos destacados
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Desliza para cambiar de carro · arrastra el coche para girarlo en 3D
          </p>
        </div>
        <Link
          to="/catalogo"
          className="hidden shrink-0 text-sm font-semibold text-accent-foreground underline-offset-4 hover:underline sm:inline"
        >
          Ver todos →
        </Link>
      </div>

      <div
        role="group"
        aria-roledescription="carrusel"
        aria-label="Vehículos destacados en 3D"
        className="relative mt-6 h-[68svh] min-h-[420px] w-full cursor-grab touch-pan-y select-none active:cursor-grabbing sm:mt-8 sm:h-svh sm:min-h-[560px]"
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => {
          if (!manualPausedRef.current) setPaused(false);
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowLeft') carouselRef.current?.advance(-1);
          if (event.key === 'ArrowRight') carouselRef.current?.advance(1);
        }}
        tabIndex={0}
      >
        <Car3DViewer
          ref={carouselRef}
          models={FEATURED_MODELS}
          index={virtualIndex}
          className="h-full w-full"
          onInteract={() => setPaused(true)}
          onSwipe={(delta) => setVirtualIndex((current) => current + delta)}
        />

        <CarouselModelInfo
          model={model}
          currentIndex={index}
          total={TOTAL}
          paused={paused}
        />

        <CarouselControls
          paused={paused}
          onTogglePause={togglePause}
          onPrev={() => carouselRef.current?.advance(-1)}
          onNext={() => carouselRef.current?.advance(1)}
        />

        <CarouselDots current={index} onNavigate={goTo} />
      </div>

      <div className="mt-4 text-center sm:hidden">
        <Link
          to="/catalogo"
          className="text-sm font-semibold text-accent-foreground underline-offset-4 hover:underline"
        >
          Ver el catálogo completo →
        </Link>
      </div>
    </section>
  );
}
