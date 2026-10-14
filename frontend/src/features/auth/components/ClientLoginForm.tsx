import { useState, type FormEvent } from 'react';
import { ArrowRight, Lock, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { useAuthForm } from '../hooks/useAuthForm';
import { useClientLogin } from '../hooks/useAuth';
import { validateClientLogin } from '../utils/auth.validation';
import type { ClientLoginInput } from '../types/auth.types';
import { FormError } from './FormError';
import { FormField } from './FormField';
import { RevealPasswordButton } from '@/shared/components/RevealPasswordButton';

const EMPTY_LOGIN: ClientLoginInput = { email: '', contrasena: '' };

export function ClientLoginForm() {
  const login = useClientLogin();
  const [showPassword, setShowPassword] = useState(false);
  const { values, errors, setValue, attemptSubmit } = useAuthForm<ClientLoginInput>(
    EMPTY_LOGIN,
    validateClientLogin,
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (attemptSubmit()) login.mutate(values);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <FormError error={login.error} />

      <FormField
        id="email"
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="tucorreo@ejemplo.com"
        icon={<Mail className="size-4" aria-hidden="true" />}
        value={values.email}
        onChange={(e) => setValue('email', e.target.value)}
        error={errors.email}
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
        <ArrowRight aria-hidden="true" />
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        ¿No tienes cuenta?{' '}
        <Link
          to="/registro"
          className="font-medium text-accent-foreground underline-offset-4 hover:underline"
        >
          Crear cuenta
        </Link>
      </p>
    </form>
  );
}