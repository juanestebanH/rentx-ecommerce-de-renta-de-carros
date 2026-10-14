import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/shared/components/ui/pagination';

interface PaginationBarProps {
  page: number;
  totalPages: number;
  rangeStart: number;
  rangeEnd: number;
  total: number;
  itemLabel: string;
  onPageChange: (page: number) => void;
}

function rangoPaginas(actual: number, total: number): (number | 'gap')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const inicio = Math.max(2, actual - 1);
  const fin = Math.min(total - 1, actual + 1);
  const paginas: (number | 'gap')[] = [1];

  if (inicio > 2) paginas.push('gap');
  for (let pagina = inicio; pagina <= fin; pagina += 1) paginas.push(pagina);
  if (fin < total - 1) paginas.push('gap');
  paginas.push(total);

  return paginas;
}

export function PaginationBar({
  page,
  totalPages,
  rangeStart,
  rangeEnd,
  total,
  itemLabel,
  onPageChange,
}: PaginationBarProps) {
  if (totalPages <= 1) return null;

  const paginas = rangoPaginas(page, totalPages);

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Mostrando{' '}
        <span className="font-medium text-foreground">
          {rangeStart}–{rangeEnd}
        </span>{' '}
        de {total} {itemLabel}
      </p>
      <Pagination className="mx-0 w-auto justify-center">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
            />
          </PaginationItem>
          {paginas.map((pagina, index) =>
            pagina === 'gap' ? (
              <PaginationItem key={`gap-${index}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={pagina}>
                <PaginationLink
                  isActive={pagina === page}
                  onClick={() => onPageChange(pagina)}
                >
                  {pagina}
                </PaginationLink>
              </PaginationItem>
            ),
          )}
          <PaginationItem>
            <PaginationNext
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
