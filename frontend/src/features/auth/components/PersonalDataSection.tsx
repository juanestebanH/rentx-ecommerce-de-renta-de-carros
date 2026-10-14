import { CalendarDays, Lock, Mail, Phone, User } from 'lucide-react';
import type { ClientRegisterInput } from '../types/auth.types';
import type { FieldErrors } from '../utils/auth.validation';
import { FormField } from './FormField';
import { RevealPasswordButton } from '@/shared/components/RevealPasswordButton';
import { SectionHeading } from './SectionHeading';

interface PersonalDataSectionProps {
  values: ClientRegisterInput;
  errors: FieldErrors<ClientRegisterInput>;
  setValue: (name: keyof ClientRegisterInput, value: string) => void;
  showPassword: boolean;
  onToggleShowPassword: () => void;
}

export function PersonalDataSection({
  values,
  errors,
  setValue,
  showPassword,
  onToggleShowPassword,
}: PersonalDataSectionProps) {
  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <SectionHeading icon={<User className="size-4" aria-hidden="true" />}>
        Datos personales
      </SectionHeading>

      <FormField
        id="nombres"
        label="Nombres"
        autoComplete="given-name"
        placeholder="Roberto"
        icon={<User className="size-4" aria-hidden="true" />}
        value={values.nombres}
        onChange={(e) => setValue('nombres', e.target.value)}
        error={errors.nombres}
      />
      <FormField
        id="apellidos"
        label="Apellidos"
        autoComplete="family-name"
        placeholder="García"
        icon={<User className="size-4" aria-hidden="true" />}
        value={values.apellidos}
        onChange={(e) => setValue('apellidos', e.target.value)}
        error={errors.apellidos}
      />
      <FormField
        id="email"
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="tucorreo@ejemplo.com"
        icon={<Mail className="size-4" aria-hidden="true" />}
        className="sm:col-span-2"
        value={values.email}
        onChange={(e) => setValue('email', e.target.value)}
        error={errors.email}
      />
      <FormField
        id="contrasena"
        label="Contraseña"
        type={showPassword ? 'text' : 'password'}
        autoComplete="new-password"
        placeholder="••••••••"
        hint="Mínimo 6 caracteres."
        icon={<Lock className="size-4" aria-hidden="true" />}
        endAdornment={
          <RevealPasswordButton
            show={showPassword}
            onToggle={onToggleShowPassword}
          />
        }
        className="sm:col-span-2"
        value={values.contrasena}
        onChange={(e) => setValue('contrasena', e.target.value)}
        error={errors.contrasena}
      />
      <FormField
        id="telefono"
        label="Teléfono"
        type="tel"
        autoComplete="tel"
        placeholder="+56 9 1234 5678"
        icon={<Phone className="size-4" aria-hidden="true" />}
        value={values.telefono}
        onChange={(e) => setValue('telefono', e.target.value)}
        error={errors.telefono}
      />
      <FormField
        id="fecha_nacimiento"
        label="Fecha de nacimiento"
        type="date"
        icon={<CalendarDays className="size-4" aria-hidden="true" />}
        value={values.fecha_nacimiento}
        onChange={(e) => setValue('fecha_nacimiento', e.target.value)}
        error={errors.fecha_nacimiento}
      />
    </section>
  );
}