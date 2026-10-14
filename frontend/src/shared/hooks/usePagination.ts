import { useCallback, useMemo, useState } from 'react';

interface ScrollTargetRef {
  current: HTMLElement | null;
}

interface UsePaginationOptions {
  pageSize?: number;
  /** Cambia cuando el filtro o la búsqueda cambian: vuelve a la página 1. */
  resetKey?: string;
  /** Al cambiar de página se hace scroll suave al inicio de este elemento. */
  scrollTargetRef?: ScrollTargetRef;
}

export interface UsePaginationResult<T> {
  page: number;
  totalPages: number;
  pageItems: T[];
  total: number;
  rangeStart: number;
  rangeEnd: number;
  goTo: (page: number) => void;
  next: () => void;
  prev: () => void;
}

const PAGE_SIZE_POR_DEFECTO = 10;

/**
 * Paginación en cliente: corta una lista ya cargada. No toca el servidor
 * (los endpoints devuelven el listado completo). Reinicia a la página 1 al
 * cambiar `resetKey` y clampa la página si la lista se encoge tras una
 * mutación o refetch.
 */
export function usePagination<T>(
  items: readonly T[],
  {
    pageSize = PAGE_SIZE_POR_DEFECTO,
    resetKey,
    scrollTargetRef,
  }: UsePaginationOptions = {},
): UsePaginationResult<T> {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const [page, setPage] = useState(1);
  const [resetKeyPrevio, setResetKeyPrevio] = useState(resetKey);

  // Ajuste durante el render (patrón recomendado por React) en vez de un
  // efecto: al cambiar el filtro o la búsqueda se vuelve a la página 1.
  if (resetKey !== resetKeyPrevio) {
    setResetKeyPrevio(resetKey);
    setPage(1);
  }

  // Si la lista se encoge, la página actual puede quedar fuera de rango.
  if (page > totalPages) {
    setPage(totalPages);
  }

  const paginaActual = Math.min(page, totalPages);

  const pageItems = useMemo(() => {
    const inicio = (paginaActual - 1) * pageSize;
    return items.slice(inicio, inicio + pageSize);
  }, [items, paginaActual, pageSize]);

  const goTo = useCallback(
    (destino: number) => {
      setPage(Math.min(Math.max(destino, 1), totalPages));
      scrollTargetRef?.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    },
    [totalPages, scrollTargetRef],
  );

  const next = useCallback(() => goTo(paginaActual + 1), [goTo, paginaActual]);
  const prev = useCallback(() => goTo(paginaActual - 1), [goTo, paginaActual]);

  const rangeStart = total === 0 ? 0 : (paginaActual - 1) * pageSize + 1;
  const rangeEnd = Math.min(paginaActual * pageSize, total);

  return {
    page: paginaActual,
    totalPages,
    pageItems,
    total,
    rangeStart,
    rangeEnd,
    goTo,
    next,
    prev,
  };
}
