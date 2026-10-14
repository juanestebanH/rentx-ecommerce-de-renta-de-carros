import { useState } from 'react';
import type { ReactNode } from 'react';
import { CarFront } from 'lucide-react';
import { cn } from 'cn';

interface VehiclePhotoFrameProps {
  src?: string | null;
  alt: string;
  className?: string;
  fallback?: ReactNode;
  overlay?: ReactNode;
  onError?: () => void;
}

/**
 * Caja 16:9 para fotos de vehículo. La imagen va con `object-contain` sobre un
 * fondo desenfocado de la misma foto, así que cualquier proporción se ve
 * completa en vez de recortada. Sin foto (o si falla la carga) muestra el
 * ícono; `overlay` queda para la barra de acciones del formulario.
 */
export function VehiclePhotoFrame({
  src,
  alt,
  className,
  fallback,
  overlay,
  onError,
}: VehiclePhotoFrameProps) {
  const [fallbackVisible, setFallbackVisible] = useState(false);
  const showImage = Boolean(src) && !fallbackVisible;

  return (
    <div
      className={cn(
        'relative aspect-[16/9] w-full overflow-hidden bg-muted/60',
        className,
      )}
    >
      {showImage && (
        <>
          <img
            aria-hidden="true"
            src={src ?? undefined}
            alt=""
            className="absolute inset-0 size-full scale-[1.15] object-cover opacity-55 blur-2xl"
          />
          <img
            src={src ?? undefined}
            alt={alt}
            loading="lazy"
            decoding="async"
            onError={() => {
              setFallbackVisible(true);
              onError?.();
            }}
            className="absolute inset-0 size-full object-contain"
          />
        </>
      )}

      {!showImage && (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
          {fallback ?? (
            <div className="flex flex-col items-center gap-2 text-sm">
              <CarFront className="size-14" aria-hidden="true" />
              <span className="text-xs font-medium">Sin foto</span>
            </div>
          )}
        </div>
      )}

      {overlay}
    </div>
  );
}