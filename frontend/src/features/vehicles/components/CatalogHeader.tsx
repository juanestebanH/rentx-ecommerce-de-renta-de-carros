import { CatalogSortSelect, type CatalogSortValue } from './CatalogSortSelect';

interface CatalogHeaderProps {
  total: number;
  resultsReady: boolean;
  sort: CatalogSortValue;
  onSortChange: (value: CatalogSortValue) => void;
}

export function CatalogHeader({
  total,
  resultsReady,
  sort,
  onSortChange,
}: CatalogHeaderProps) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <div className="max-w-xl">
        <h1 className="my-0 text-lg font-semibold tracking-tight">
          Catálogo de carros
        </h1>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          Filtra por marca, categoría, transmisión y tarifa, y ordena por
          precio.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2">
        {resultsReady && (
          <p
            role="status"
            aria-live="polite"
            className="shrink-0 text-sm tabular-nums text-muted-foreground"
          >
            {total.toLocaleString('es-CO')} {total === 1 ? 'carro' : 'carros'}
          </p>
        )}
        <CatalogSortSelect value={sort} onValueChange={onSortChange} />
      </div>
    </header>
  );
}