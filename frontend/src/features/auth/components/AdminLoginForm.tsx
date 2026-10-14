import { useState, type FormEvent } from 'react';
import { Lock, UserRound } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useAuthForm } from '../hooks/useAuthForm';
import { useAdminLogin } from '../hooks/useAuth';
import { validateAdminLogin } from '../utils/auth.validation';
import type { AdminLoginInput } from '../types/auth.types';
import { FormError } from './FormError';
import { FormField } from './FormField';
import { RevealPasswordButton } from '@/shared/components/RevealPasswordButton';

const EMPTY_ADMIN_LOGIN: AdminLoginInput = { id_usuario: '', contrasena: '' };

export function AdminLoginForm() {
  const login = useAdminLogin();
  const [showPassword, setShowPassword] = useState(false);
  const { values, errors, setValue, attemptSubmit } = useAuthForm<AdminLoginInput>(
    EMPTY_ADMIN_LOGIN,
    validateAdminLogin,
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (attemptSubmit()) login.mutate(values);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <FormError error={login.error} />

      <FormField
        id="id_usuario"
        label="Identificación"
        autoComplete="username"
        placeholder="admin01"
        icon={<UserRound className="size-4" aria-hidden="true" />}
        value={values.id_usuario}
        onChange={(e) => setValue('id_usuario', e.target.value)}
        error={errors.id_usuario}
      />
      <FormField
        id="contrasena"
        label="Contraseña"
        type={showPassword ? 'text' : 'password'}
        autoComplete="current-password"
        placeholder="••••••••"
        icon={<Lock className="size-4" aria-hidden="true" />}
        endAdornment={
          <RevealPasswordButton
            show={showPassword}
            onToggle={() => setShowPassword((v) => !v)}
          />
        }
        value={values.contrasena}
        onChange={(e) => setValue('contrasena', e.target.value)}
        error={errors.contrasena}
      />

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={login.isPending}
      >
        {login.isPending ? 'Iniciando sesión…' : 'Iniciar sesión'}
      </Button>
    </form>
  );
}