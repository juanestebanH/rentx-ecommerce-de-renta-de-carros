import { useCallback, useMemo, useRef, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useRentasQueue } from '@/features/rentals/hooks/useRentasQueue';
import { useRentaAcciones } from '@/features/rentals/hooks/useRentaAcciones';
import { rentalErrorMensaje } from '@/features/rentals/utils/rental.format';
import { contarMotivos, type ResumenRenta } from '@/features/rentals/utils/renta.resumen';
import {
  FILTRO_VACIO,
  filtroActivo,
  filtrarRentas,
  porInicioAscendente,
  type FiltroRentas,
} from '@/features/rentals/utils/renta.filtro';
import {
  RentasSegmentos,
  type VistaRentas,
} from '@/features/rentals/components/admin/RentasSegmentos';
import {
  RentasToolbar,
  type EstadoFilter,
  type RangoFechas,
} from '@/features/rentals/components/admin/RentasToolbar';
import { RentasTable } from '@/features/rentals/components/admin/RentasTable';
import { RentalDetailDrawer } from '@/features/rentals/components/admin/RentalDetailDrawer';
import { PaginationBar } from '@/shared/components/PaginationBar';
import { usePagination } from '@/shared/hooks/usePagination';
import {
  ConfirmRentalActionDialog,
  type RentalActionTarget,
} from '@/features/rentals/components/admin/ConfirmRentalActionDialog';

function AdminRentalsPage() {
  const [vista, setVista] = useState<VistaRentas>('accionables');
  const [estadoFilter, setEstadoFilter] = useState<EstadoFilter>('todos');
  const [filtro, setFiltro] = useState<FiltroRentas>(FILTRO_VACIO);
  const [idSeleccion, setIdSeleccion] = useState<string | null>(null);
  const [target, setTarget] = useState<RentalActionTarget | null>(null);
  const [errorDialogo, setErrorDialogo] = useState<string | null>(null);

  // El estado se filtra en el servidor; el texto y las fechas, no.
  const cola = useRentasQueue(estadoFilter === 'todos' ? undefined : estadoFilter);
  const acciones = useRentaAcciones();

  const accionables = useMemo(
    () => cola.resumenes.filter((resumen) => resumen.motivos.length > 0),
    [cola.resumenes],
  );
  const conteo = useMemo(() => contarMotivos(accionables), [accionables]);

  const visibles = useMemo(() => {
    const base = vista === 'accionables' ? accionables : cola.resumenes;
    const filtrados = filtrarRentas(base, filtro);
    // En la cola manda el vencimiento; en "Todas" se respeta el orden del
    // servidor.
    return vista === 'accionables' ? [...filtrados].sort(porInicioAscendente) : filtrados;
  }, [accionables, cola.resumenes, filtro, vista]);

  const tablaRef = useRef<HTMLDivElement>(null);
  const paginacion = usePagination(visibles, {
    pageSize: 10,
    resetKey: `${vista}|${estadoFilter}|${filtro.query}|${filtro.desde}|${filtro.hasta}`,
    scrollTargetRef: tablaRef,
  });

  const hayFiltro = filtroActivo(filtro, estadoFilter);

  // El drawer se deriva del roster fetched, no del filtrado: escribir en la
  // búsqueda no debe cerrar la ficha que el administrador está leyendo.
  const seleccionada =
    cola.resumenes.find((resumen) => resumen.renta.id_renta === idSeleccion) ?? null;

  const cerrarDialogo = useCallback(() => {
    setTarget(null);
    setErrorDialogo(null);
  }, []);

  const handleSelect = useCallback((id: string) => {
    setIdSeleccion((previo) => (previo === id ? null : id));
  }, []);

  const handleAccionFila = useCallback((resumen: ResumenRenta) => {
    const accion = resumen.accion;

    if (accion === null) {
      setIdSeleccion(resumen.renta.id_renta);
      return;
    }

    // Con varios pagos por confirmar no hay un "el pago" al que apuntar: la
    // fila lleva al panel, que nombra monto y método de cada uno.
    if (accion === 'confirmar_pago' && resumen.pagosPorConfirmar.length > 1) {
      setIdSeleccion(resumen.renta.id_renta);
      return;
    }

    setErrorDialogo(null);
    setTarget({
      accion,
      resumen,
      pago: accion === 'confirmar_pago' ? (resumen.pagosPorConfirmar[0] ?? null) : null,
    });
  }, []);

  const handleAccionDrawer = useCallback(
    (accion: RentalActionTarget['accion']) => {
      if (!seleccionada) return;
      setErrorDialogo(null);
      setTarget({ accion, resumen: seleccionada, pago: null });
    },
    [seleccionada],
  );

  const handleConfirm = useCallback(() => {
    if (!target) return;

    if (target.accion === 'confirmar_pago' && target.pago) {
      acciones.confirmarPago(target.pago, target.resumen, {
        onOk: cerrarDialogo,
        onError: setErrorDialogo,
      });
      return;
    }

    acciones.ejecutarEstado(target.accion, target.resumen, {
      onOk: cerrarDialogo,
      onError: setErrorDialogo,
    });
  }, [acciones, cerrarDialogo, target]);

  const handleCloseConfirm = useCallback(
    (open: boolean) => {
      const enVuelo = acciones.idRentaPendiente !== null || acciones.pagoMutation.isPending;
      if (!open && !enVuelo) cerrarDialogo();
    },
    [acciones, cerrarDialogo],
  );

  const handleConfirmarPagoEnPanel = useCallback(
    (pago: Parameters<typeof acciones.confirmarPago>[0]) => {
      if (!seleccionada) return;
      acciones.confirmarPago(pago, seleccionada);
    },
    [acciones, seleccionada],
  );

  const handleRegistrarPago = useCallback(
    (input: Parameters<typeof acciones.registrarPago>[1]) => {
      if (!seleccionada) return Promise.resolve(false);
      return acciones.registrarPago(seleccionada, input);
    },
    [acciones, seleccionada],
  );

  const onRangoChange = useCallback((rango: RangoFechas) => {
    setFiltro((previo) => ({ ...previo, desde: rango.desde, hasta: rango.hasta }));
  }, []);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="my-0 text-3xl font-semibold tracking-tight">Rentas</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Confirma los pagos y mueve cada renta por su ciclo hasta dejarla
          cerrada.
        </p>
      </div>

      <RentasSegmentos
        vista={vista}
        onVistaChange={setVista}
        conteo={conteo}
        totalRentas={cola.resumenes.length}
      />

      <RentasToolbar
        searchQuery={filtro.query}
        onSearchChange={(query) => setFiltro((previo) => ({ ...previo, query }))}
        estadoFilter={estadoFilter}
        onEstadoFilterChange={setEstadoFilter}
        rango={{ desde: filtro.desde, hasta: filtro.hasta }}
        onRangoChange={onRangoChange}
        shownCount={visibles.length}
        totalCount={vista === 'accionables' ? accionables.length : cola.resumenes.length}
        filterActive={hayFiltro || vista === 'accionables'}
      />

      {cola.pagosError != null && (
        <div
          role="status"
          className="flex flex-wrap items-center gap-3 rounded-lg border border-amber-200/70 bg-amber-50 px-3.5 py-2.5 text-sm text-amber-900"
        >
          <AlertTriangle className="size-4 shrink-0" aria-hidden="true" />
          <span className="min-w-0 flex-1">
            {rentalErrorMensaje(
              cola.pagosError,
              'No se pudieron cargar los pagos de algunas rentas.',
            )}{' '}
            El conteo de «Requieren acción» puede estar incompleto.
          </span>
          <Button variant="outline" size="sm" onClick={cola.refetch}>
            Reintentar
          </Button>
        </div>
      )}

      <div ref={tablaRef} className="scroll-mt-4 space-y-4">
        <RentasTable
          resumenes={paginacion.pageItems}
          isLoading={cola.isLoading}
          isLoadingPagos={cola.isLoadingPagos}
          error={cola.error}
          onRetry={cola.refetch}
          vista={vista}
          filterActive={hayFiltro}
          totalRentas={cola.resumenes.length}
          idRentaSeleccionada={idSeleccion}
          idRentaPendiente={acciones.idRentaPendiente}
          onSelect={handleSelect}
          onAccion={handleAccionFila}
          onVerTodas={() => setVista('todas')}
        />
        <PaginationBar
          page={paginacion.page}
          totalPages={paginacion.totalPages}
          rangeStart={paginacion.rangeStart}
          rangeEnd={paginacion.rangeEnd}
          total={paginacion.total}
          itemLabel={paginacion.total === 1 ? 'renta' : 'rentas'}
          onPageChange={paginacion.goTo}
        />
      </div>

      <RentalDetailDrawer
        resumen={seleccionada}
        pagos={{
          isLoading: cola.isLoadingPagos,
          error: cola.pagosError,
          onRetry: cola.refetch,
          pagoConfirmandoId: acciones.pagoConfirmandoId,
          registrando: acciones.crearPagoMutation.isPending,
        }}
        accionPendiente={
          acciones.idRentaPendiente === seleccionada?.renta.id_renta
            ? (seleccionada.accion ?? null)
            : null
        }
        onConfirmarPago={handleConfirmarPagoEnPanel}
        onRegistrarPago={handleRegistrarPago}
        onAccion={handleAccionDrawer}
        onClose={() => setIdSeleccion(null)}
      />

      <ConfirmRentalActionDialog
        target={target}
        isPending={acciones.idRentaPendiente !== null || acciones.pagoMutation.isPending}
        error={errorDialogo}
        onConfirm={handleConfirm}
        onOpenChange={handleCloseConfirm}
      />
    </div>
  );
}

export default AdminRentalsPage;
