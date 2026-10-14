import type { ReactNode } from 'react';
import { cn } from 'cn';
import { Input } from '@/shared/components/ui/input';
import { RevealPasswordButton } from '@/shared/components/RevealPasswordButton';

export interface UserFormErrors {
  id_usuario?: string;
  nombre?: string;
  email?: string;
  contrasena?: string;
}

interface UserFormFieldsProps {
  esCrear: boolean;
  idInput: string;
  nombre: string;
  email: string;
  contrasena: string;
  showPassword: boolean;
  disabled: boolean;
  errores: UserFormErrors;
  emailDuplicado: boolean;
  onIdChange: (value: string) => void;
  onNombreChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onContrasenaChange: (value: string) => void;
  onTogglePassword: () => void;
}

interface CampoProps {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}

function Campo({ id, label, hint, error, children }: CampoProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
      {error ? (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

export function UserFormFields({
  esCrear,
  idInput,
  nombre,
  email,
  contrasena,
  showPassword,
  disabled,
  errores,
  emailDuplicado,
  onIdChange,
  onNombreChange,
  onEmailChange,
  onContrasenaChange,
  onTogglePassword,
}: UserFormFieldsProps) {
  return (
    <div className="space-y-4">
      <Campo
        id="usuario-id"
        label="Id de usuario"
        hint={
          esCrear
            ? 'Se usa para iniciar sesión y no podrá cambiarse después.'
            : 'No se puede cambiar.'
        }
        error={errores.id_usuario}
      >
        <Input
          id="usuario-id"
          value={idInput}
          readOnly={!esCrear}
          disabled={disabled}
          autoFocus
          maxLength={40}
          autoComplete="off"
          placeholder="Ej. admin01"
          aria-invalid={Boolean(errores.id_usuario)}
          onChange={(event) => onIdChange(event.target.value)}
          className={cn(
            'font-mono',
            !esCrear && 'bg-muted text-muted-foreground',
          )}
        />
      </Campo>

      <Campo id="usuario-nombre" label="Nombre" error={errores.nombre}>
        <Input
          id="usuario-nombre"
          value={nombre}
          disabled={disabled}
          maxLength={80}
          autoComplete="name"
          placeholder="Nombre y apellido"
          aria-invalid={Boolean(errores.nombre)}
          onChange={(event) => onNombreChange(event.target.value)}
        />
      </Campo>

      <Campo
        id="usuario-email"
        label="Email"
        error={emailDuplicado ? 'Ya existe un usuario con ese email.' : errores.email}
      >
        <Input
          id="usuario-email"
          type="email"
          value={email}
          disabled={disabled}
          maxLength={120}
          autoComplete="email"
          placeholder="correo@rentx.co"
          aria-invalid={Boolean(errores.email) || emailDuplicado}
          onChange={(event) => onEmailChange(event.target.value)}
        />
      </Campo>

      <Campo
        id="usuario-contrasena"
        label="Contraseña"
        hint={
          esCrear
            ? 'Mínimo 6 caracteres.'
            : 'Déjala vacía para conservar la contraseña actual.'
        }
        error={errores.contrasena}
      >
        <div className="relative">
          <Input
            id="usuario-contrasena"
            type={showPassword ? 'text' : 'password'}
            value={contrasena}
            disabled={disabled}
            autoComplete="new-password"
            placeholder={esCrear ? 'Mínimo 6 caracteres' : 'Sin cambios'}
            aria-invalid={Boolean(errores.contrasena)}
            onChange={(event) => onContrasenaChange(event.target.value)}
            className="pr-10"
          />
          <div className="absolute inset-y-0 right-1 flex items-center">
            <RevealPasswordButton
              show={showPassword}
              onToggle={onTogglePassword}
            />
          </div>
        </div>
      </Campo>
    </div>
  );
}
