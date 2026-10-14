import { AlertTriangle, RotateCw } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
  className?: string;
}

export function ErrorState({ message, onRetry, className }: ErrorStateProps) {
  return (
    <div
      className={`flex min-h-[200px] flex-col items-center justify-center gap-3 text-center ${className ?? ''}`}
    >
      <AlertTriangle
        className="size-5 text-muted-foreground"
        aria-hidden="true"
      />
      <div>
        <p className="text-sm font-medium">No se pudo cargar esta sección</p>
        <p className="mt-1 text-sm text-muted-foreground">{message}</p>
      </div>
      <Button variant="outline" size="sm" onClick={onRetry}>
        <RotateCw className="size-4" aria-hidden="true" />
        Reintentar
      </Button>
    </div>
  );
}