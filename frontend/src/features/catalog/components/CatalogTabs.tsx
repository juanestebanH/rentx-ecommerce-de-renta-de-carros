import { cn } from 'cn';
import type { CatalogTipo } from '../types/catalog.types';
import { CATALOG_LABELS } from '../utils/catalog.format';

interface CatalogTabsProps {
  tipo: CatalogTipo;
  onTipoChange: (tipo: CatalogTipo) => void;
  conteos: Record<CatalogTipo, number>;
}

const ORDEN: CatalogTipo[] = ['marcas', 'categorias'];

export function CatalogTabs({ tipo, onTipoChange, conteos }: CatalogTabsProps) {
  return (
    <div
      role="group"
      aria-label="Tipo de catálogo"
      className="inline-flex items-center gap-1 rounded-lg border border-border bg-card p-1"
    >
      {ORDEN.map((item) => {
        const activo = item === tipo;
        return (
          <button
            key={item}
            type="button"
            aria-pressed={activo}
            onClick={() => onTipoChange(item)}
            className={cn(
              'flex items-center gap-2 rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors',
              'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
              activo
                ? 'bg-[var(--accent-bg)] text-accent-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            )}
          >
            {CATALOG_LABELS[item].tituloPlural}
            <span
              className={cn(
                'shrink-0 rounded-full px-1.5 py-0.5 text-xs font-semibold tabular-nums',
                activo
                  ? 'bg-card text-foreground'
                  : 'bg-muted text-muted-foreground',
              )}
            >
              {conteos[item]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
