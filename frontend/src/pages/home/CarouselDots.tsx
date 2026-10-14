import { FEATURED_MODELS } from './featuredModels';

interface CarouselDotsProps {
  current: number;
  onNavigate: (target: number) => void;
}

export function CarouselDots({ current, onNavigate }: CarouselDotsProps) {
  return (
    <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5">
      {FEATURED_MODELS.map((item, itemIndex) => (
        <button
          key={item.id}
          type="button"
          aria-label={`Ver ${item.nombre}`}
          aria-current={itemIndex === current}
          onClick={() => onNavigate(itemIndex)}
          className="flex size-8 items-center justify-center"
        >
          <span
            className={
              itemIndex === current
                ? 'h-2 w-6 rounded-full bg-primary transition-all duration-300'
                : 'size-2 rounded-full bg-foreground/25 transition-all duration-300 hover:bg-foreground/40'
            }
          />
        </button>
      ))}
    </div>
  );
}