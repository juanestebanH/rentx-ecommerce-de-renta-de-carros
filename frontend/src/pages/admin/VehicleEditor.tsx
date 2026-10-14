import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Ban, CarFront, Loader2, Wrench } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { ApiError } from '@/shared/lib/apiClient';
import { VehicleFormSections } from '@/features/vehicles/components/admin/VehicleFormSections';
import { VehiclePhotoField } from '@/features/vehicles/components/admin/VehiclePhotoField';
import { InactivateVehicleDialog } from '@/features/vehicles/components/admin/InactivateVehicleDialog';
import {
  initialFormValues,
  fromFormValues,
  type VehicleFormValues,
} from '@/features/vehicles/utils/vehicleForm';
import {
  leerDimensionesUrl,
  validarFotoVehiculo,
  type FotoDimensiones,
} from '@/features/vehicles/utils/vehiclePhoto';
import { vehicleErrorMensaje } from '@/features/vehicles/utils/vehicle.format';
import {
  useCategorias,
  useMarcas,
  useVehicle,
} from '@/features/vehicles/hooks/useVehicles';
import {
  useCreateVehicle,
  useUpdateVehicle,
  useUpdateVehicleEstado,
  useUploadVehiclePhoto,
} from '@/features/vehicles/hooks/useAdminVehicles';
import type { Vehicle } from '@/features/vehicles/types/vehicle.types';

interface VehicleEditorProps {
  mode: 'create' | 'edit';
}

export function VehicleEditor({ mode }: VehicleEditorProps) {
  const isCreate = mode === 'create';
  const { id } = useParams();
  const navigate = useNavigate();

  const vehicleQuery = useVehicle(isCreate ? undefined : id);
  const marcasQuery = useMarcas();
  const categoriasQuery = useCategorias();
  const createMutation = useCreateVehicle();
  const updateMutation = useUpdateVehicle();
  const inactivateMutation = useUpdateVehicleEstado();
  const uploadPhotoMutation = useUploadVehiclePhoto();

  const marcas = useMemo(
    () => marcasQuery.data?.map((entry) => entry.nombre) ?? [],
    [marcasQuery.data],
  );
  const categorias = useMemo(
    () => categoriasQuery.data?.map((entry) => entry.nombre) ?? [],
    [categoriasQuery.data],
  );
  const catalogoLoading = marcasQuery.isLoading || categoriasQuery.isLoading;

  const backToList = useCallback(() => navigate('/admin/vehiculos'), [navigate]);

  const handleCreate = (input: Vehicle) => {
    createMutation.mutate(input, {
      onSuccess: (vehicle) => {
        toast.success(`${vehicle.nombre} registrado.`);
        backToList();
      },
      onError: (error) => {
        toast.error(
          vehicleErrorMensaje(error, 'No se pudo crear el vehículo.'),
        );
      },
    });
  };

  const handleUpdate = (input: Omit<Vehicle, 'id_carro'>) => {
    if (!id) return;
    updateMutation.mutate(
      { id, input },
      {
        onSuccess: (vehicle) => {
          toast.success(`${vehicle.nombre} actualizado.`);
          backToList();
        },
        onError: (error) => {
          toast.error(
            vehicleErrorMensaje(error, 'No se pudo actualizar el vehículo.'),
          );
        },
      },
    );
  };

  const handleMarkInactive = () => {
    if (!id) return;
    inactivateMutation.mutate(
      { id, estado: 'inactivo' },
      {
        onSuccess: () => {
          toast.success(
            `${vehicleQuery.data?.nombre ?? 'Vehículo'} marcado como inactivo.`,
          );
          backToList();
        },
        onError: (error) => {
          toast.error(
            vehicleErrorMensaje(
              error,
              'No se pudo marcar el vehículo como inactivo.',
            ),
          );
        },
      },
    );
  };

  const handleUploadPhoto = (file: File) =>
    uploadPhotoMutation.mutateAsync(file).then((result) => result.url);

  if (isCreate) {
    return (
      <VehicleEditorForm
        mode="create"
        initialValues={initialFormValues(null)}
        marcas={marcas}
        categorias={categorias}
        catalogoLoading={catalogoLoading}
        isSaving={createMutation.isPending}
        onCancel={backToList}
        onSubmitCreate={handleCreate}
        onUploadPhoto={handleUploadPhoto}
      />
    );
  }

  if (vehicleQuery.isLoading) {
    return <EditSkeleton />;
  }

  const notFound =
    vehicleQuery.isError &&
    vehicleQuery.error instanceof ApiError &&
    vehicleQuery.error.status === 404;

  if (notFound) {
    return (
      <PageMessage
        icon={<CarFront className="size-6" aria-hidden="true" />}
        title="Vehículo no encontrado"
        description="El vehículo que intentas editar no existe o ya fue eliminado."
        ctaHref="/admin/vehiculos"
        ctaLabel="Volver a la flota"
      />
    );
  }

  if (vehicleQuery.isError || !vehicleQuery.data) {
    return (
      <PageMessage
        icon={<Wrench className="size-6" aria-hidden="true" />}
        title="No se pudieron cargar los datos del vehículo"
        description="Si el problema persiste, revisa tu conexión a internet."
        retry={() => vehicleQuery.refetch()}
        ctaHref="/admin/vehiculos"
        ctaLabel="Volver a la flota"
      />
    );
  }

  const vehicle = vehicleQuery.data;

  return (
    <VehicleEditorForm
      key={vehicle.id_carro}
      mode="edit"
      initialValues={initialFormValues(vehicle)}
      marcas={marcas}
      categorias={categorias}
      catalogoLoading={catalogoLoading}
      isSaving={updateMutation.isPending}
      vehicle={vehicle}
      savedPhotoUrl={vehicle.foto}
      isInactivating={inactivateMutation.isPending}
      inactivateError={inactivateMutation.error}
      onMarkInactive={handleMarkInactive}
      onCancel={backToList}
      onSubmitUpdate={handleUpdate}
      onUploadPhoto={handleUploadPhoto}
    />
  );
}

interface VehicleEditorFormProps {
  mode: 'create' | 'edit';
  initialValues: VehicleFormValues;
  marcas: string[];
  categorias: string[];
  catalogoLoading: boolean;
  isSaving: boolean;
  vehicle?: Vehicle | null;
  /** Foto ya guardada: se mide al cargar para bloquear si no cumple el estándar. */
  savedPhotoUrl?: string | null;
  isInactivating?: boolean;
  inactivateError?: unknown;
  onMarkInactive?: () => void;
  onCancel: () => void;
  onSubmitCreate?: (input: Vehicle) => void;
  onSubmitUpdate?: (input: Omit<Vehicle, 'id_carro'>) => void;
  onUploadPhoto: (file: File) => Promise<string>;
}

function VehicleEditorForm({
  mode,
  initialValues,
  marcas,
  categorias,
  catalogoLoading,
  isSaving,
  vehicle,
  savedPhotoUrl,
  isInactivating = false,
  inactivateError,
  onMarkInactive,
  onCancel,
  onSubmitCreate,
  onSubmitUpdate,
  onUploadPhoto,
}: VehicleEditorFormProps) {
  const isCreate = mode === 'create';
  const [values, setValues] = useState<VehicleFormValues>(initialValues);
  const [formError, setFormError] = useState<string | null>(null);
  const [inactivateOpen, setInactivateOpen] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [photoDims, setPhotoDims] = useState<FotoDimensiones | null>(null);

  const patch = useCallback((update: Partial<VehicleFormValues>) => {
    setValues((prev) => ({ ...prev, ...update }));
    setFormError(null);
  }, []);

  const handlePhotoAccepted = useCallback(
    (dims: FotoDimensiones | null) => {
      setPhotoError(null);
      setPhotoDims(dims);
    },
    [],
  );

  // Al editar, la foto que ya está guardada también debe cumplir el estándar:
  // si no, no se permite guardar ningún cambio hasta reemplazarla.
  useEffect(() => {
    if (!savedPhotoUrl) return;
    let vigente = true;
    void leerDimensionesUrl(savedPhotoUrl).then((dims) => {
      if (!vigente || !dims) return;
      const validacion = validarFotoVehiculo({ dimensiones: dims });
      setPhotoDims(dims);
      setPhotoError(validacion.ok ? null : validacion.mensaje);
    });
    return () => {
      vigente = false;
    };
  }, [savedPhotoUrl]);

  const handleSubmit = () => {
    if (photoError) {
      setFormError(
        'Corrige la foto antes de guardar: no cumple el estándar de imagen.',
      );
      return;
    }
    const result = fromFormValues(values);
    if (result.error) {
      setFormError(result.error);
      return;
    }
    if (isCreate && !result.idCarro) {
      setFormError('La placa es obligatoria.');
      return;
    }
    setFormError(null);
    if (isCreate) {
      onSubmitCreate?.({ ...result.input, id_carro: result.idCarro });
    } else {
      onSubmitUpdate?.(result.input);
    }
  };

  return (
    <div className="min-h-0 flex-1">
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <Link
          to="/admin/vehiculos"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-accent-foreground underline-offset-4 hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Volver a la flota
        </Link>

        <h1 className="my-0 mt-3 text-3xl font-semibold tracking-tight">
          {isCreate ? 'Registrar vehículo' : `Editar ${values.nombre}`}
        </h1>
        {!isCreate && (
          <p className="mt-1 text-sm text-muted-foreground">
            {vehicle?.id_carro}{' '}
            {vehicle ? `· Modelo ${vehicle.ano} · ${vehicle.id_marca}` : ''}
          </p>
        )}

        <div className="mt-8 grid gap-6">
          <VehicleFormSections
            values={values}
            onChange={patch}
            marcas={marcas}
            categorias={categorias}
            catalogoLoading={catalogoLoading}
            idCarroEditable={isCreate}
            disabled={isSaving}
          />

          <VehiclePhotoField
            foto={values.foto}
            dimensiones={photoDims}
            nombre={values.nombre}
            disabled={isSaving}
            aviso={photoError}
            onPhotoRejected={setPhotoError}
            onPhotoAccepted={handlePhotoAccepted}
            onChange={(foto) => patch({ foto })}
            onUploadPhoto={onUploadPhoto}
          />

          {formError && (
            <p role="alert" className="text-sm font-medium text-destructive">
              {formError}
            </p>
          )}
        </div>

        <footer className="mt-8 flex items-center gap-3 border-t border-border pt-4 pb-2">
          {!isCreate && (
            <Button
              variant="outline"
              disabled={isSaving || isInactivating}
              onClick={() => setInactivateOpen(true)}
              className="border-amber-600/40 text-amber-700 hover:bg-amber-600/10 hover:text-amber-700"
            >
              <Ban className="size-4" aria-hidden="true" />
              Marcar como inactivo
            </Button>
          )}

          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="ghost"
              disabled={isSaving || isInactivating}
              onClick={onCancel}
            >
              Cancelar
            </Button>
            <Button
              disabled={isSaving || isInactivating || photoError !== null}
              title={
                photoError
                  ? 'Corrige la foto antes de guardar.'
                  : undefined
              }
              onClick={handleSubmit}
            >
              {isSaving && (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              )}
              {isCreate ? 'Guardar carro' : 'Guardar cambios'}
            </Button>
          </div>
        </footer>
      </div>

      {!isCreate && (
        <InactivateVehicleDialog
          open={inactivateOpen}
          vehicle={vehicle ?? null}
          isPending={isInactivating}
          error={inactivateOpen ? inactivateError : null}
          onConfirm={() => onMarkInactive?.()}
          onOpenChange={(open) => {
            if (!open && !isInactivating) setInactivateOpen(false);
          }}
        />
      )}
    </div>
  );
}

function EditSkeleton() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="mt-4 h-9 w-72" />
      <div className="mt-8 grid gap-6">
        <Skeleton className="h-52 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-44 w-full rounded-xl" />
      </div>
    </div>
  );
}

interface PageMessageProps {
  icon: ReactNode;
  title: string;
  description: string;
  ctaHref?: string;
  ctaLabel?: string;
  retry?: () => void;
}

function PageMessage({
  icon,
  title,
  description,
  ctaHref,
  ctaLabel,
  retry,
}: PageMessageProps) {
  return (
    <div className="flex h-full min-h-[60svh] items-center justify-center p-4">
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed px-10 py-14 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-accent/50 text-accent-foreground">
          {icon}
        </span>
        <p className="text-lg font-semibold">{title}</p>
        <p className="max-w-md text-sm text-muted-foreground">{description}</p>
        <div className="mt-2 flex gap-2">
          {retry && (
            <Button variant="outline" onClick={retry}>
              Reintentar
            </Button>
          )}
          {ctaHref && ctaLabel && (
            <Button asChild>
              <Link to={ctaHref}>{ctaLabel}</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}