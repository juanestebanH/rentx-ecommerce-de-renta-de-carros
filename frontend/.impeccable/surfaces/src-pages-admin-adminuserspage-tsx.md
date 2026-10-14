---
version: 1
slug: "src-pages-admin-adminuserspage-tsx"
primary_target: "src/pages/admin/AdminUsersPage.tsx"
related_targets: ["src/features/users/types/users.types.ts","src/features/users/api/users.api.ts","src/features/users/hooks/useUsers.ts","src/features/users/components/UsersToolbar.tsx","src/features/users/components/UsersTable.tsx","src/features/users/components/UsersTableRow.tsx","src/features/users/components/UsuarioTarjetaMovil.tsx","src/features/users/components/UsuarioEstadoBadge.tsx","src/features/users/components/UserFormDrawer.tsx","src/features/users/components/ConfirmarDesactivacionUsuarioDialog.tsx","src/features/admin/components/AdminSidebar.tsx","src/router.tsx","src/shared/components/ui/SideDrawer.tsx"]
---

# Surface: Usuarios del sistema (`/admin/usuarios`)

- **Scope y modo:** pantalla interna de admin, protegida por `ProtectedRoute requiredRole="admin"` dentro de `AdminLayout`. Modo Operate: provisionar y administrar el acceso al panel. Herencia del mundo establecido; sin mundo visual nuevo ni cambios en `DESIGN.md`.
- **Audiencia/trabajo:** operador del panel que entra a **dar de alta a alguien que debe entrar al panel**, corregir sus datos, rotar su contraseña o quitarle el acceso. Frecuencia baja (decenas de veces al mes), por lo que pesan más la seguridad y la ausencia de errores que la velocidad. El propio operador aparece en la lista. Son las cuentas de la tabla `usuarios` (no clientes): todas `rol: 'admin'`.
- **Acción/prueba:** crear una cuenta (`id_usuario`, nombre, email, contraseña) y gestionarla —editar nombre/email, rotar contraseña, dar de baja—. Éxito = la cuenta entra por `/admin/login` con `id_usuario` + contraseña; la fila refleja el cambio sin recargar; dar de baja corta el acceso de verdad. Prueba: la operación termina con la credencial correcta y el estado real de la cuenta, no con una tabla decorada.
- **Verdad específica del producto:** el login admin **no es por email**, es por `id_usuario`; ese identificador es la identidad de acceso y es **inmutable de por vida**. `rol` siempre es `admin` porque el backend lo fija. Desactivar bloquea el login (403) y termina la sesión viva en la siguiente petición (401).
- **Anti-objetivos:** no inventar roles ni permisos, no "invitar por correo" (no hay servicio de correo), no recuperar contraseña por email, no borrar filas, no cambiar `rol`.

## Contrato real verificado en `D:\rentx\backend` (el builder no lo inventa)

- `GET /api/users` (admin) acepta **solo** `estado` (`activo`/`inactivo`) y devuelve `AdminUserView[]` = `{ id_usuario, nombre, email, rol, estado }`, ordenado por `nombre` asc. La búsqueda de texto es filtro de cliente: la API no la soporta.
- `GET /api/users/:id` (admin) → 404 si no existe.
- `POST /api/users` (admin) body `{ id_usuario, nombre, email, contrasena }` (contrasena ≥ 6) → 201. El backend fija `rol: 'admin'`; **no acepta `rol`**. 400 `"Ya existe un usuario con ese email"` si el email está repetido.
- `PUT /api/users/:id` (admin) body parcial `{ nombre?, email?, contrasena? }` (al menos uno; contrasena ≥ 6). **No acepta `id_usuario`** → el id es inmutable. 400 email duplicado, 404 si no existe.
- `PATCH /api/users/:id/estado` (admin) body `{ estado: 'activo' | 'inactivo' }` → 200. Guardas del backend: 400 `"No puedes desactivar tu propia cuenta"` (requester === target) y 400 `"No se puede desactivar el único administrador activo del sistema"` (activos ≤ 1). 404 si no existe.
- **No existe `DELETE`** y **no existe endpoint de cambio de rol**: "eliminar" es `PATCH /:id/estado` a `inactivo`. Por eso la pantalla no ofrece borrado ni edición de rol.
- `POST`/`PUT` de usuarios no devuelven `contrasena`. El formato de errores es el común del backend (`AppError` → `{ message }`).

## Dirección elegida y momento memorable

- **Autoridad visual:** se hereda, no se reemplaza. RentX claro, `AdminLayout`, y la estructura gemela de `/admin/clientes`. Sin cambios en `DESIGN.md` ni `PRODUCT.md`.
- **Tesis estructural:** esta pantalla es **provisión de credenciales**, no una tabla más. Cada fila es una identidad de acceso con un estado, no un registro con campos.
- **Secuencia:** roster → toolbar (buscar / estado / contador / **Nuevo usuario**) → fila → menú de fila (Editar · Dar de baja) → `SideDrawer` (crear o editar) → diálogo de confirmación (baja) → toast + invalidación.
- **Momento focal:** el campo de contraseña del drawer —regla de 6 caracteres, botón revelar, nunca un valor existente— y la fila propia marcada **"Tú"**, para que la guarda de auto-baja sea evidente *antes* de que alguien haga clic.

## Layout e interacción

- **Cabecera:** "Usuarios" + una línea de contexto, misma anatomía que las demás pantallas del panel.
- **Toolbar en una fila:** búsqueda (nombre, email o id de usuario) → select de estado (Todos/Activos/Inactivos) → contador con `aria-live="polite"` → botón **Nuevo usuario** al final (patrón `FleetToolbar`).
- **Desktop:** tabla con Usuario (iniciales + nombre + email), **ID de usuario** (fuente mono, truncado con `title`), Estado (badge) y acciones. **Sin columna `rol`** (constante). **Móvil:** tarjeta, como `ClienteTarjetaMovil`.
- **Drawer:** `SideDrawer`; `eyebrow` "Nuevo usuario" / "Editar usuario", título = nombre, subtítulo = id + email. Campos: `id_usuario` (crear: editable y obligatorio; editar: solo lectura con nota "No se puede cambiar"), nombre, email, contraseña (crear: obligatoria; editar: opcional, placeholder "Sin cambios", con revelar). Acciones siempre visibles al pie.
- **Dar de baja vive en el menú de fila**, no dentro del drawer: mezclar una acción que corta el acceso con un guardado de datos arruina ambas.
- **Al guardar:** toast corto, cerrar, invalidar la lista; contador y tabla se actualizan solos.
- **Teclado:** el foco entra al primer campo del drawer; Escape cierra solo si no hay cambios pendientes.
- **Responsive:** mismo breakpoint que Clientes; `SideDrawer` ya cae a `w-full` en móvil.

## Estados y rangos

- **Roster:** mínimo 1 (tú), típico 2–8, máximo ~20. **Sin paginación** —a 10 por página se esconderían filas y se añadiría ruido; solo el contador. Desviación deliberada de `/admin/clientes`; `usePagination` no entra aquí.
- **`id_usuario`:** string libre (mín. 1) —puede ser `admin`, `ADMIN01` o algo largo → truncar con `title` y buscarlo.
- **Estados de pantalla:** cargando (skeleton de filas), error de carga con Reintentar, vacío por filtro ("Ningún usuario coincide" + limpiar filtros), vacío real con CTA "Nuevo usuario".
- **Errores en línea, no solo toast:** email duplicado (400) en el campo email; `id_usuario` duplicado → error de campo honesto y genérico; contraseña < 6 validada en cliente.
- **Guardas anticipadas en la UI:** no puedes desactivar tu propia cuenta; no puedes desactivar al único administrador activo. La acción se ofrece deshabilitada con su explicación, y el 400 se maneja igual por si llega por carrera (otro admin acaba de dar de baja a alguien).
- **Guardando:** drawer no cerrable, botones con spinner (patrón `ConfirmarDesactivacionDialog`).
- **Cerrar con cambios sin guardar** (o con una contraseña escrita) pide confirmación antes de descartar.

## Rutas y hooks

- `/admin/usuarios` en la rama `AdminLayout` con `lazy` + `Suspense` + `ProtectedRoute requiredRole="admin"`, y link "Usuarios" en `ADMIN_LINKS` con icono propio (`UserCog`; `Users` ya lo usa Clientes).
- Feature `src/features/users/` (types, api, hooks, components). Tipos propuestos en español espejando el backend: `Usuario`, `UsuarioEstado`, `CrearUsuarioInput`, `ActualizarUsuarioInput` (campos literales del backend).
- Hooks TanStack Query: `useUsers(estado?)` (`['users', estado ?? 'todos']`, `keepPreviousData`), `useCreateUsuario`, `useUpdateUsuario`, `useUpdateUsuarioEstado`, invalidando `['users']`.

## Decisiones abiertas

- **Pie del drawer:** `SideDrawer` no tiene slot de pie. O se le añade una prop `footer` opcional (compatible con los drawers existentes), o la barra de acción va pegajosa dentro del cuerpo.
- **`RevealPasswordButton`:** vive en `features/auth`; mover a `shared/components` o duplicar el mínimo.
- **Nombres de tipo:** `Usuario` / `UsuarioEstado` / `CrearUsuarioInput` / `ActualizarUsuarioInput` (español, coherente con `features/rentals` y el copy) frente a la convención en inglés de `features/clients` (`Client`). Recomendado: español.
- **"Último admin activo":** calcular en cliente contando los activos de la lista, sin endpoint; usar el 400 solo como red de seguridad.

## Direction contract

**THESIS:** esta pantalla es **provisión de credenciales**, no un listado de registros — rechaza la tabla de campos intercambiables y trata cada fila como una identidad de acceso con un estado que corta o habilita la entrada. El foco está en la credencial (id inmutable + contraseña controlada), no en el perfil.

**OWN-WORLD:** herencia del mundo del panel en código — fondo crema `#FAF7F2`, grafito `#2B241E`, acento teal `#0F766E` solo en superficies/bordes/iconos, `#F4FAF9` sobre acento; Plus Jakarta Sans; `Card`/`Badge`/`Button`/`Input`/`Select`/`Dialog` de `shared/components/ui`; badge de estado reutilizando el patrón de clientes; `SideDrawer` (`Radix Dialog` + `tw-animate-css`, `bg-card`, `backdrop` `bg-black/50`); `tabular-nums` donde aplique; `aria-live="polite"` en el contador de la toolbar.

**STORY:** el operador abre "Usuarios" y ve quién puede entrar al panel y quién no; crea una credencial, ve la regla de contraseña mientras la escribe, corrige datos o rota una contraseña sin tocar el `id_usuario`, y da de baja a alguien desde la fila con una confirmación que nombra a la persona y su consecuencia. Su propia fila dice "Tú" y la baja se ofrece deshabilitada con su porqué antes de que la intente.

**FIRST VIEWPORT:** encabezado "Usuarios" con subtítulo de una línea; debajo la toolbar (búsqueda, estado, contador, **Nuevo usuario**); debajo la tabla densa, con cada fila mostrando identidad de acceso (nombre + email), `id_usuario` en mono y su badge de estado; la fila propia marcada "Tú". Ninguna gráfica, ninguna tarjeta de KPI.

**FORM:** extensión de superficie operativa dentro de un mundo establecido; hereda la estructura probada de las pantallas hermanas (encabezado + toolbar + tabla densa + drawer + un diálogo de confirmación) y resuelve propósito, contenido, jerarquía y estados. No se ejecutó concept-seed porque la petición fija la estructura al patrón de Clientes/Vehículos.

**FINISH:** unreviewed and undocumented is unfinished; la build termina con capturas desktop/mobile, el detector, el finish review y el documento de extensión tras la revisión visual del usuario.
