import { CalendarDays, Globe, ScrollText, ShieldCheck } from 'lucide-react';
import type { ClientRegisterInput } from '../types/auth.types';
import type { FieldErrors } from '../utils/auth.validation';
import { FormField } from './FormField';
import { SectionHeading } from './SectionHeading';

interface LicenseSectionProps {
  values: ClientRegisterInput;
  errors: FieldErrors<ClientRegisterInput>;
  setValue: (name: keyof ClientRegisterInput, value: string) => void;
}

export function LicenseSection({ values, errors, setValue }: LicenseSectionProps) {
  return (
    <section className="grid grid-cols-1 gap-4 border-t border-border pt-5 sm:grid-cols-2">
      <SectionHeading
        icon={<ShieldCheck className="size-4" aria-hidden="true" />}
      >
        Licencia de conducir
      </SectionHeading>

      <FormField
        id="numero_licencia"
        label="Número de licencia"
        icon={<ScrollText className="size-4" aria-hidden="true" />}
        value={values.numero_licencia}
        onChange={(e) => setValue('numero_licencia', e.target.value)}
        error={errors.numero_licencia}
      />
      <FormField
        id="pais_emision"
        label="País de emisión"
        placeholder="Chile"
        icon={<Globe className="size-4" aria-hidden="true" />}
        value={values.pais_emision}
        onChange={(e) => setValue('pais_emision', e.target.value)}
        error={errors.pais_emision}
      />
      <FormField
        id="fecha_vencimiento"
        label="Fecha de vencimiento"
        type="date"
        icon={<CalendarDays className="size-4" aria-hidden="true" />}
        className="sm:col-span-2"
        value={values.fecha_vencimiento}
        onChange={(e) => setValue('fecha_vencimiento', e.target.value)}
        error={errors.fecha_vencimiento}
      />
    </section>
  );
}