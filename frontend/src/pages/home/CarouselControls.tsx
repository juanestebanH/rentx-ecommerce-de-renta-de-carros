import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

interface CarouselControlsProps {
  paused: boolean;
  onTogglePause: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export function CarouselControls({
  paused,
  onTogglePause,
  onPrev,
  onNext,
}: CarouselControlsProps) {
  return (
    <>
      <button
        type="button"
        aria-label="Modelo anterior"
        onClick={onPrev}
        className="absolute left-3 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-card/80 text-foreground shadow-sm backdrop-blur-md transition-colors duration-200 hover:bg-card sm:left-5"
      >
        <ChevronLeft className="size-5" aria-hidden="true" />
      </button>
      <button
        type="button"
        aria-label="Modelo siguiente"
        onClick={onNext}
        className="absolute right-3 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-card/80 text-foreground shadow-sm backdrop-blur-md transition-colors duration-200 hover:bg-card sm:right-5"
      >
        <ChevronRight className="size-5" aria-hidden="true" />
      </button>
      <button
        type="button"
        aria-label={
          paused ? 'Reanudar rotación automática' : 'Pausar rotación automática'
        }
        aria-pressed={paused}
        onClick={onTogglePause}
        className="absolute right-3 top-3 z-10 flex size-10 items-center justify-center rounded-full bg-card/80 text-foreground shadow-sm backdrop-blur-md transition-colors duration-200 hover:bg-card sm:right-5 sm:top-5"
      >
        {paused ? (
          <Play className="size-5" aria-hidden="true" />
        ) : (
          <Pause className="size-5" aria-hidden="true" />
        )}
      </button>
    </>
  );
}