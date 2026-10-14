import { Moon, Sun } from 'lucide-react';
import { cn } from 'cn';
import { useThemeStore } from '@/shared/store/theme.store';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
  labelClassName?: string;
}

export function ThemeToggle({
  className,
  showLabel = false,
  labelClassName,
}: ThemeToggleProps) {
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      className={cn(
        'flex items-center gap-3 outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
        className,
      )}
    >
      {isDark ? (
        <Sun className="size-4 shrink-0" aria-hidden="true" />
      ) : (
        <Moon className="size-4 shrink-0" aria-hidden="true" />
      )}
      {showLabel && (
        <span className={labelClassName}>
          {isDark ? 'Modo claro' : 'Modo oscuro'}
        </span>
      )}
    </button>
  );
}
