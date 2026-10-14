import { Eye, EyeOff } from 'lucide-react';

interface RevealPasswordButtonProps {
  show: boolean;
  onToggle: () => void;
}

export function RevealPasswordButton({
  show,
  onToggle,
}: RevealPasswordButtonProps) {
  return (
    <button
      type="button"
      aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
      onClick={onToggle}
      className="flex size-7 items-center justify-center rounded-full text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40"
    >
      {show ? (
        <EyeOff className="size-4" aria-hidden="true" />
      ) : (
        <Eye className="size-4" aria-hidden="true" />
      )}
    </button>
  );
}
