import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { capitalizar } from '@/shared/utils/format';
import { useAdminVehicles } from '@/features/vehicles/hooks/useAdminVehicles';
import { CatalogTabs } from '@/features/catalog/components/CatalogTabs';
import { CatalogTable } from '@/features/catalog/components/CatalogTable';
import { CatalogEntryDialog } from '@/features/catalog/components/CatalogEntryDialog';
import {
  ConfirmDeleteCatalogDialog,
  type CatalogDeleteTarget,
} from '@/features/catalog/components/ConfirmDeleteCatalogDialog';
import {
  useCategorias,
  useCreateCategoria,
  useCreateMarca,
  useDeleteCategoria,
  useDeleteMarca,
  useMarcas,
  useUpdateCategoria,
  useUpdateMarca,
} from '@/features/catalog/hooks/useCatalog';
import {
  CATALOG_LABELS,
  catalogErrorMensaje,
} from '@/features/catalog/utils/catalog.format';
import type {
  CatalogEntry,
  CatalogTipo,
} from '@/features/catalog/types/catalog.types';

interface DialogState {
  modo: 'crear' | 'editar';
  tipo: CatalogTipo;
  nombreActual: string;
}

function AdminCatalogPage() {
  const [tipo, setTipo] = useState<CatalogTipo>('marcas');
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [nombreInput, setNombreInput] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<CatalogDeleteTarget | null>(
    null,
  );

  const marcasQuery = useMarcas();
  const categoriasQuery = useCategorias();
  const vehiclesQuery = useAdminVehicles();

  const crearMarca = useCreateMarca();
  const editarMarca = useUpdateMarca();
  const borrarMarca = useDeleteMarca();
  const crearCategoria = useCreateCategoria();
  const editarCategoria = useUpdateCategoria();
  const borrarCategoria = useDeleteCategoria();

  const vehicles = vehiclesQuery.data;

  const usoMarcas = useMemo(() => {
    const map = new Map<string, number>();
    for (const vehicle of vehicles ?? []) {
      map.set(vehicle.id_marca, (map.get(vehicle.id_marca) ?? 0) + 1);
    }
    return map;
  }, [vehicles]);

  const usoCategorias = useMemo(() => {
    const map = new Map<string, number>();
    for (const vehicle of vehicles ?? []) {
      map.set(vehicle.id_categoria, (map.get(vehicle.id_categoria) ?? 0) + 1);
    }
    return map;
  }, [vehicles]);

  const esMarcas = tipo === 'marcas';
  const query = esMarcas ? marcasQuery : categoriasQuery;
  const counts = esMarcas ? usoMarcas : usoCategorias;
  const entries: CatalogEntry[] = query.data ?? [];
  const labels = CATALOG_LABELS[tipo];

  const countsReady = !vehiclesQuery.isPending && !vehiclesQuery.error;

  const accionesEnVuelo =
    crearMarca.isPending ||
    editarMarca.isPending ||
    borrarMarca.isPending ||
    crearCategoria.isPending ||
    editarCategoria.isPending ||
    borrarCategoria.isPending;

  const dialogMutation = dialog
    ? dialog.tipo === 'marcas'
      ? dialog.modo === 'crear'
        ? crearMarca
        : editarMarca
      : dialog.modo === 'crear'
        ? crearCategoria
        : editarCategoria
    : null;

  const deleteMutation = deleteTarget
    ? deleteTarget.tipo === 'marcas'
      ? borrarMarca
      : borrarCategoria
    : null;

  const resetearDialogMutations = () => {
    crearMarca.reset();
    editarMarca.reset();
    crearCategoria.reset();
    editarCategoria.reset();
  };

  const abrirCrear = () => {
    resetearDialogMutations();
    setNombreInput('');
    setDialog({ modo: 'crear', tipo, nombreActual: '' });
  };

  const abrirEditar = (entry: CatalogEntry) => {
    resetearDialogMutations();
    setNombreInput(entry.nombre);
    setDialog({ modo: 'editar', tipo, nombreActual: entry.nombre });
  };

  const cerrarDialogo = () => {
    if (dialogMutation?.isPending) return;
    setDialog(null);
  };

  const enviarDialogo = () => {
    if (!dialog) return;
    const nombre = nombreInput.trim();
    if (!nombre) return;

    const etiqueta = CATALOG_LABELS[dialog.tipo];
    const onSuccess = () => {
      toast.success(
        dialog.modo === 'crear'
          ? `${capitalizar(etiqueta.singular)} creada.`
          : `${capitalizar(etiqueta.singular)} actualizada.`,
      );
      setDialog(null);
    };
    const onError = (error: unknown) => {
      toast.error(
        catalogErrorMensaje(
          error,
          `No se pudo guardar ${etiqueta.singularConArticulo}.`,
        ),
      );
    };

    if (dialog.tipo === 'marcas') {
      if (dialog.modo === 'crear') {
        crearMarca.mutate(nombre, { onSuccess, onError });
      } else {
        editarMarca.mutate(
          { nombreActual: dialog.nombreActual, nombre },
          { onSuccess, onError },
        );
      }
    } else if (dialog.modo === 'crear') {
      crearCategoria.mutate(nombre, { onSuccess, onError });
    } else {
      editarCategoria.mutate(
        { nombreActual: dialog.nombreActual, nombre },
        { onSuccess, onError },
      );
    }
  };

  const abrirBorrar = (entry: CatalogEntry) => {
    borrarMarca.reset();
    borrarCategoria.reset();
    setDeleteTarget({ tipo, nombre: entry.nombre });
  };

  const cerrarBorrar = () => {
    if (deleteMutation?.isPending) return;
    setDeleteTarget(null);
  };

  const confirmarBorrado = () => {
    if (!deleteTarget) return;

    const etiqueta = CATALOG_LABELS[deleteTarget.tipo];
    const onSuccess = () => {
      toast.success(`${capitalizar(etiqueta.singular)} eliminada.`);
      setDeleteTarget(null);
    };
    const onError = (error: unknown) => {
      toast.error(
        catalogErrorMensaje(
          error,
          `No se pudo eliminar ${etiqueta.singularConArticulo}.`,
        ),
      );
    };

    if (deleteTarget.tipo === 'marcas') {
      borrarMarca.mutate(deleteTarget.nombre, { onSuccess, onError });
    } else {
      borrarCategoria.mutate(deleteTarget.nombre, { onSuccess, onError });
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="my-0 text-3xl font-semibold tracking-tight">Catálogo</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Administra las marcas y categorías disponibles al registrar o editar
          un vehículo.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <CatalogTabs
          tipo={tipo}
          onTipoChange={setTipo}
          conteos={{
            marcas: marcasQuery.data?.length ?? 0,
            categorias: categoriasQuery.data?.length ?? 0,
          }}
        />
        <Button onClick={abrirCrear} disabled={accionesEnVuelo}>
          <Plus className="size-4" aria-hidden="true" />
          {`Nueva ${labels.singular}`}
        </Button>
      </div>

      <CatalogTable
        tipo={tipo}
        entries={entries}
        counts={counts}
        countsReady={countsReady}
        isLoading={query.isPending}
        error={query.error}
        onRetry={() => void query.refetch()}
        actionsDisabled={accionesEnVuelo}
        onEdit={abrirEditar}
        onDelete={abrirBorrar}
      />

      <CatalogEntryDialog
        open={dialog !== null}
        modo={dialog?.modo ?? 'crear'}
        tipo={dialog?.tipo ?? tipo}
        nombre={nombreInput}
        onNombreChange={setNombreInput}
        isPending={Boolean(dialogMutation?.isPending)}
        error={dialogMutation?.error ?? null}
        onSubmit={enviarDialogo}
        onOpenChange={(open) => {
          if (!open) cerrarDialogo();
        }}
      />

      <ConfirmDeleteCatalogDialog
        target={deleteTarget}
        isPending={Boolean(deleteMutation?.isPending)}
        error={deleteMutation?.error ?? null}
        onConfirm={confirmarBorrado}
        onOpenChange={(open) => {
          if (!open) cerrarBorrar();
        }}
      />
    </div>
  );
}

export default AdminCatalogPage;
