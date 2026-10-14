import { CheckCircle2, X } from 'lucide-react';

interface CancelSuccessNoticeProps {
  onClose: () => void;
}

export function CancelSuccessNotice({ onClose }: CancelSuccessNoticeProps) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
      <div
        role="status"
        className="pointer-events-auto flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm font-medium shadow-lg"
      >
        <CheckCircle2 className="size-4 text-primary" aria-hidden="true" />
        Renta cancelada correctamente
        <button
          type="button"
          aria-label="Cerrar notificación"
          onClick={onClose}
          className="ml-1 rounded-full p-0.5 text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}