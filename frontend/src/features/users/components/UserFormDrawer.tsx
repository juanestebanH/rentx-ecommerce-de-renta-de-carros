import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { SideDrawer } from '@/shared/components/ui/SideDrawer';
import type {
  ActualizarUsuarioInput,
  CrearUsuarioInput,
  Usuario,
} from '../types/users.types';
import { esEmailDuplicado, usuarioErrorMensaje } from '../utils/users.format';
import {
  UserFormFields,
  type UserFormErrors,
} from './UserFormFields';

interface UserFormDrawerProps {
  open: boolean;
  modo: 'crear' | 'editar';
  usuario: Usuario | null;
  isPending: boolean;
  error: unknown;
  onClose: () => void;
  onSubmitCreate: (input: CrearUsuarioInput) => void;
  onSubmitUpdate: (id: string, input: ActualizarUsuarioInput) => void;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function UserFormDrawer({
  open,
  modo,
  usuario,
  isPending,
  error,
  onClose,
  onSubmitCreate,
  onSubmitUpdate,
}: UserFormDrawerProps) {
  const esCrear = modo === 'crear';
  const [idInput, setIdInput] = useState(usuario?.id_usuario ?? '');
  const [nombre, setNombre] = useState(usuario?.nombre ?? '');
  const [email, setEmail] = useState(usuario?.email ?? '');
  const [contrasena, setContrasena] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errores, setErrores] = useState<UserFormErrors>({});
  const [confirmarDescarte, setConfirmarDescarte] = useState(false);

  const dirty = esCrear
    ? Boolean(idInput || nombre || email || contrasena)
    : nombre !== (usuario?.nombre ?? '') ||
      email !== (usuario?.email ?? '') ||
      contrasena.length > 0;

  const emailDuplicado = esEmailDuplicado(error);
  const errorGeneral =
    error && !emailDuplicado
      ? usuarioErrorMensaje(error, 'No se pudo guardar el usuario.')
      : null;

  const intentarCerrar = () => {
    if (isPending) return;
    if (dirty) {
      setConfirmarDescarte(true);
      return;
    }
    onClose();
  };

  const validar = (): UserFormErrors => {
    const errs: UserFormErrors = {};
    if (esCrear) {
      const id = idInput.trim();
      if (!id) errs.id_usuario = 'El id de usuario es obligatorio.';
      else if (/\s/.test(id))
        errs.id_usuario = 'El id de usuario no puede tener espacios.';
      else if (id.length > 40) errs.id_usuario = 'Máximo 40 caracteres.';
    }
    if (!nombre.trim()) errs.nombre = 'El nombre es obligatorio.';
    if (!email.trim()) errs.email = 'El email es obligatorio.';
    else if (!EMAIL_RE.test(email.trim()))
      errs.email = 'Ingresa un email válido.';
    if (esCrear) {
      if (contrasena.length < 6)
        errs.contrasena = 'La contraseña debe tener al menos 6 caracteres.';
    } else if (contrasena.length > 0 && contrasena.length < 6) {
      errs.contrasena = 'La contraseña debe tener al menos 6 caracteres.';
    }
    return errs;
  };

  const enviar = () => {
    const errs = validar();
    setErrores(errs);
    if (Object.keys(errs).length > 0) return;

    if (esCrear) {
      onSubmitCreate({
        id_usuario: idInput.trim(),
        nombre: nombre.trim(),
        email: email.trim(),
        contrasena,
      });
      return;
    }

    if (!usuario) return;
    const input: ActualizarUsuarioInput = {};
    if (nombre.trim() !== usuario.nombre) input.nombre = nombre.trim();
    if (email.trim() !== usuario.email) input.email = email.trim();
    if (contrasena.length > 0) input.contrasena = contrasena;
    if (Object.keys(input).length === 0) {
      onClose();
      return;
    }
    onSubmitUpdate(usuario.id_usuario, input);
  };

  const title = esCrear
    ? nombre.trim() || 'Alta de usuario'
    : usuario?.nombre ?? 'Editar usuario';
  const subtitle = esCrear
    ? 'El panel inicia sesión con id de usuario + contraseña.'
    : `${usuario?.id_usuario ?? ''} · ${usuario?.email ?? ''}`;

  const footer = confirmarDescarte ? (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Tienes cambios sin guardar.
      </p>
      <div className="flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setConfirmarDescarte(false)}
        >
          Seguir editando
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={onClose}
        >
          Descartar
        </Button>
      </div>
    </div>
  ) : (
    <div className="flex items-center justify-end gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={intentarCerrar}
        disabled={isPending}
      >
        Cancelar
      </Button>
      <Button type="button" onClick={enviar} disabled={isPending}>
        {isPending ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : null}
        {esCrear ? 'Crear usuario' : 'Guardar cambios'}
      </Button>
    </div>
  );

  return (
    <SideDrawer
      open={open}
      onClose={intentarCerrar}
      eyebrow={esCrear ? 'Nuevo usuario' : 'Editar usuario'}
      title={title}
      subtitle={subtitle}
      footer={footer}
    >
      {errorGeneral ? (
        <p
          role="alert"
          className="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {errorGeneral}
        </p>
      ) : null}

      <UserFormFields
        esCrear={esCrear}
        idInput={idInput}
        nombre={nombre}
        email={email}
        contrasena={contrasena}
        showPassword={showPassword}
        disabled={isPending}
        errores={errores}
        emailDuplicado={emailDuplicado}
        onIdChange={setIdInput}
        onNombreChange={setNombre}
        onEmailChange={setEmail}
        onContrasenaChange={setContrasena}
        onTogglePassword={() => setShowPassword((prev) => !prev)}
      />
    </SideDrawer>
  );
}
