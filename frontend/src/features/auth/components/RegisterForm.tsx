import { useState, type FormEvent } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { useAuthForm } from '../hooks/useAuthForm';
import { useClientRegister } from '../hooks/useAuth';
import { validateClientRegister } from '../utils/auth.validation';
import type { ClientRegisterInput } from '../types/auth.types';
import { FormError } from './FormError';
import { LicenseSection } from './LicenseSection';
import { PersonalDataSection } from './PersonalDataSection';
import { StepsIndicator } from './StepsIndicator';
import { REGISTER_STEPS } from './steps';

const EMPTY_REGISTER: ClientRegisterInput = {
  nombres: '',
  apellidos: '',
  email: '',
  contrasena: '',
  telefono: '',
  fecha_nacimiento: '',
  numero_licencia: '',
  pais_emision: '',
  fecha_vencimiento: '',
};

const STEP_1_FIELDS: Array<keyof ClientRegisterInput> = [
  'nombres',
  'apellidos',
  'email',
  'contrasena',
  'telefono',
  'fecha_nacimiento',
];

export function RegisterForm() {
  const register = useClientRegister();
  const [step, setStep] = useState<1 | 2>(1);
  const [showPassword, setShowPassword] = useState(false);
  const { values, errors, setValue, attemptSubmit } = useAuthForm<ClientRegisterInput>(
    EMPTY_REGISTER,
    validateClientRegister,
  );

  const handleContinue = () => {
    if (attemptSubmit(STEP_1_FIELDS)) setStep(2);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (attemptSubmit()) register.mutate(values);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <FormError error={register.error} />

      <StepsIndicator step={step} steps={REGISTER_STEPS} />

      {step === 1 ? (
        <PersonalDataSection
          values={values}
          errors={errors}
          setValue={setValue}
          showPassword={showPassword}
          onToggleShowPassword={() => setShowPassword((v) => !v)}
        />
      ) : (
        <LicenseSection values={values} errors={errors} setValue={setValue} />
      )}

      {step === 1 ? (
        <Button type="button" size="lg" className="w-full" onClick={handleContinue}>
          Continuar
          <ArrowRight aria-hidden="true" />
        </Button>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => setStep(1)}
          >
            Atrás
          </Button>
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={register.isPending}
          >
            {register.isPending ? 'Creando cuenta…' : 'Crear cuenta'}
            <ArrowRight aria-hidden="true" />
          </Button>
        </div>
      )}

      <p className="text-center text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{' '}
        <Link
          to="/login"
          className="font-medium text-accent-foreground underline-offset-4 hover:underline"
        >
          Iniciar sesión
        </Link>
      </p>
    </form>
  );
}