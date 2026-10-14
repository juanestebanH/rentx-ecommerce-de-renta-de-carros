import type {
  AdminLoginInput,
  ClientLoginInput,
  ClientRegisterInput,
} from '../types/auth.types';

export type FieldErrors<T> = Partial<Record<keyof T, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function required(value: string, label: string): string | undefined {
  return value.trim() ? undefined : `${label} es requerido.`;
}

function isValidEmail(email: string): string | undefined {
  if (!email.trim()) return 'El email es requerido.';
  if (!EMAIL_RE.test(email)) return 'Ingresa un email válido.';
  return undefined;
}

function compact<T>(errors: Record<keyof T, string | undefined>): FieldErrors<T> {
  const result: FieldErrors<T> = {};
  (Object.keys(errors) as Array<keyof T>).forEach((key) => {
    const message = errors[key];
    if (message) result[key] = message;
  });
  return result;
}

export function validateClientLogin(
  values: ClientLoginInput,
): FieldErrors<ClientLoginInput> {
  return compact<ClientLoginInput>({
    email: isValidEmail(values.email),
    contrasena: required(values.contrasena, 'La contraseña'),
  });
}

export function validateAdminLogin(
  values: AdminLoginInput,
): FieldErrors<AdminLoginInput> {
  return compact<AdminLoginInput>({
    id_usuario: required(values.id_usuario, 'El id de usuario'),
    contrasena: required(values.contrasena, 'La contraseña'),
  });
}

export function validateClientRegister(
  values: ClientRegisterInput,
): FieldErrors<ClientRegisterInput> {
  const contrasenaError = required(values.contrasena, 'La contraseña');
  const errors: Record<keyof ClientRegisterInput, string | undefined> = {
    nombres: required(values.nombres, 'El nombre'),
    apellidos: required(values.apellidos, 'El apellido'),
    email: isValidEmail(values.email),
    contrasena: contrasenaError,
    telefono: required(values.telefono, 'El teléfono'),
    fecha_nacimiento: required(
      values.fecha_nacimiento,
      'La fecha de nacimiento',
    ),
    numero_licencia: required(
      values.numero_licencia,
      'El número de licencia',
    ),
    pais_emision: required(values.pais_emision, 'El país de emisión'),
    fecha_vencimiento: required(
      values.fecha_vencimiento,
      'La fecha de vencimiento',
    ),
  };

  if (!errors.contrasena && values.contrasena.length < 6) {
    errors.contrasena = 'La contraseña debe tener al menos 6 caracteres.';
  }

  return compact(errors);
}