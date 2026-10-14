import { cn } from 'cn';
import { Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Card, CardContent } from '@/shared/components/ui/card';
import { categoriaLabel } from '@/shared/utils/catalogo.format';
import {
  combustibleLabel,
  FEATURE_LABELS,
  transmisionLabel,
} from '../../utils/vehicle.format';
import { VEHICLE_FEATURES } from '../../types/vehicle.types';
import type { VehicleFeature } from '../../types/vehicle.types';
import type { VehicleFormValues } from '../../utils/vehicleForm';

const TRANSMISIONES = ['manual', 'automatica'] as const;
const COMBUSTIBLES = ['gasolina', 'diesel', 'electrico', 'hibrido'] as const;

interface VehicleFormSectionsProps {
  values: VehicleFormValues;
  onChange: (update: Partial<VehicleFormValues>) => void;
  marcas: string[];
  categorias: string[];
  catalogoLoading: boolean;
  idCarroEditable: boolean;
  disabled: boolean;
}

export function VehicleFormSections({
  values,
  onChange,
  marcas,
  categorias,
  catalogoLoading,
  idCarroEditable,
  disabled,
}: VehicleFormSectionsProps) {
  const setFeature = (feature: VehicleFeature, active: boolean) => {
    onChange({ features: { ...values.features, [feature]: active } });
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardContent className="grid gap-4">
          <div>
            <h3 className="text-base font-semibold tracking-tight">
              Datos generales
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Identificación básica del vehículo.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {idCarroEditable ? (
              <Field label="Placa">
                <Input
                  value={values.id_carro}
                  onChange={(e) =>
                    onChange({ id_carro: e.target.value.toUpperCase().trim() })
                  }
                  placeholder="EJ. ABC-111"
                  aria-label="Placa del vehículo"
                  disabled={disabled}
                  className="font-mono"
                />
              </Field>
            ) : null}

            <Field label="Nombre del vehículo">
              <Input
                value={values.nombre}
                onChange={(e) => onChange({ nombre: e.target.value })}
                placeholder="Ej. Toyota Corolla"
                aria-label="Nombre del vehículo"
                disabled={disabled}
              />
            </Field>

            <Field label="Modelo (año)">
              <Input
                type="number"
                min={1990}
                max={new Date().getFullYear() + 1}
                value={values.ano}
                onChange={(e) => onChange({ ano: e.target.value })}
                aria-label="Año del vehículo"
                disabled={disabled}
              />
            </Field>

            <Field label="Marca">
              <CatalogSelect
                value={values.id_marca}
                loading={catalogoLoading}
                disabled={disabled}
                onValueChange={(value) => onChange({ id_marca: value })}
                placeholder="Elegir marca"
                ariaLabel="Marca del vehículo"
                items={marcas}
                display={(nombre) => nombre}
              />
            </Field>

            <Field label="Categoría">
              <CatalogSelect
                value={values.id_categoria}
                loading={catalogoLoading}
                disabled={disabled}
                onValueChange={(value) => onChange({ id_categoria: value })}
                placeholder="Elegir categoría"
                ariaLabel="Categoría del vehículo"
                items={categorias}
                display={categoriaLabel}
              />
            </Field>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="grid gap-4">
          <div>
            <h3 className="text-base font-semibold tracking-tight">
              Especificaciones
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Características técnicas y tarifa.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <Field label="Transmisión">
              <Select
                value={values.transmision}
                onValueChange={(value) => onChange({ transmision: value })}
              >
                <SelectTrigger
                  size="sm"
                  aria-label="Transmisión"
                  className="w-full"
                  disabled={disabled}
                >
                  <SelectValue placeholder="Elegir transmisión" />
                </SelectTrigger>
                <SelectContent>
                  {opcionesConActual(values.transmision, TRANSMISIONES).map(
                    (opcion) => (
                      <SelectItem key={opcion} value={opcion}>
                        {transmisionLabel(opcion)}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Combustible">
              <Select
                value={values.combustible}
                onValueChange={(value) => onChange({ combustible: value })}
              >
                <SelectTrigger
                  size="sm"
                  aria-label="Combustible"
                  className="w-full"
                  disabled={disabled}
                >
                  <SelectValue placeholder="Elegir combustible" />
                </SelectTrigger>
                <SelectContent>
                  {opcionesConActual(values.combustible, COMBUSTIBLES).map(
                    (opcion) => (
                      <SelectItem key={opcion} value={opcion}>
                        {combustibleLabel(opcion)}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Capacidad (pasajeros)">
              <Input
                type="number"
                min={1}
                value={values.capacidad}
                onChange={(e) => onChange({ capacidad: e.target.value })}
                aria-label="Capacidad de pasajeros"
                disabled={disabled}
              />
            </Field>

            <Field label="Tarifa ($/día)">
              <Input
                type="number"
                min={1}
                step={100}
                value={values.tarifa}
                onChange={(e) => onChange({ tarifa: e.target.value })}
                aria-label="Tarifa por día"
                disabled={disabled}
              />
            </Field>

            <div className="flex items-end">
              <button
                type="button"
                aria-pressed={values.seguro}
                onClick={() => onChange({ seguro: !values.seguro })}
                disabled={disabled}
                className={cn(
                  'h-9 w-full rounded-md border bg-card px-3 text-sm font-medium transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
                  values.seguro
                    ? 'border-[var(--accent-border)] bg-[var(--accent-bg)] text-accent-foreground'
                    : 'border-input text-muted-foreground',
                )}
              >
                Seguro incluido
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="grid gap-4">
          <div>
            <h3 className="text-base font-semibold tracking-tight">
              Equipamiento
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Elementos incluidos en el vehículo.
            </p>
          </div>

          <fieldset disabled={disabled} className="grid gap-2">
            <legend className="sr-only">Equipamiento del vehículo</legend>
            <div className="flex flex-wrap gap-2">
              {VEHICLE_FEATURES.map((feature) => {
                const active = values.features[feature] === true;
                return (
                  <button
                    key={feature}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setFeature(feature, !active)}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
                      active
                        ? 'border-[var(--accent-border)] bg-[var(--accent-bg)] text-accent-foreground'
                        : 'border-border text-muted-foreground',
                    )}
                  >
                    {FEATURE_LABELS[feature]}
                  </button>
                );
              })}
            </div>
          </fieldset>
        </CardContent>
      </Card>
    </div>
  );
}

interface FieldProps {
  label: string;
  hint?: string;
  children: ReactNode;
}

function Field({ label, hint, children }: FieldProps) {
  return (
    <div className="grid gap-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      {children}
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </div>
  );
}

function opcionesConActual(
  actual: string,
  fijas: readonly string[],
): string[] {
  if (!actual || fijas.includes(actual)) return [...fijas];
  return [actual, ...fijas];
}

interface CatalogSelectProps {
  value: string;
  loading: boolean;
  disabled: boolean;
  onValueChange: (value: string) => void;
  placeholder: string;
  ariaLabel: string;
  items: string[];
  display: (value: string) => string;
}

function CatalogSelect({
  value,
  loading,
  disabled,
  onValueChange,
  placeholder,
  ariaLabel,
  items,
  display,
}: CatalogSelectProps) {
  if (loading) {
    return (
      <div className="flex h-9 items-center gap-2 rounded-md border border-border bg-card px-3 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        Cargando…
      </div>
    );
  }
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger
        size="sm"
        aria-label={ariaLabel}
        className="w-full"
        disabled={disabled}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {items.map((nombre) => (
          <SelectItem key={nombre} value={nombre}>
            {display(nombre)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}