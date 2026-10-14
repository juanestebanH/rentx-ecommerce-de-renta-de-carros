import { useState } from 'react';
import { CarFront } from 'lucide-react';
import { cn } from 'cn';

interface VehicleThumbProps {
  foto: string | null;
  inactive?: boolean;
  className?: string;
}

export function VehicleThumb({ foto, inactive = false, className }: VehicleThumbProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = Boolean(foto) && !imgFailed;

  return (
    <span
      className={cn(
        'relative block shrink-0 overflow-hidden rounded-md bg-accent/40 text-accent-foreground',
        className,
      )}
    >
      {showImage ? (
        <img
          src={foto ?? undefined}
          alt=""
          loading="lazy"
          onError={() => setImgFailed(true)}
          className={cn('absolute inset-0 h-full w-full object-cover', inactive && 'grayscale')}
        />
      ) : (
        <CarFront className="absolute inset-0 m-auto size-5" aria-hidden="true" />
      )}
    </span>
  );
}
