# ARCHITECTURE.md — Backend RentX

Documentación interna para desarrolladores nuevos. Todo lo descrito aquí se verificó
contra el código actual de `src/` (no hay diagramas inventados). Si algo se señaliza
como **nota**, es una observación deliberada sobre el estado real del código.

---

## 1. Resumen del proyecto

Backend REST para **RentX**, un e-commerce de renta de carros: un panel **admin**
(gestiona vehículos, clientes, rentas, pagos, usuarios y reportes) y una app de
**cliente** (registro, renta de vehículos, sus propios pagos).

Stack principal (ver `package.json` y `tsconfig.json`):

- **Node.js/Express 4** con **TypeScript strict** (`strict: true`, `module: NodeNext`,
  ESM puro — todos los imports usan extensión `.js`).
- **Supabase** (Postgres + Storage) accedido con `@supabase/supabase-js` vía la
  **service role key** (`src/config/supabase.ts`).
- **zod** para validación de body/query (`src/shared/middlewares/validate*.ts`).
- **JWT** (access + refresh) con `jsonwebtoken`, **bcryptjs** para hashing.
- **Vitest** para tests unitarios de los services.

Una frase por módulo:

| Módulo | Qué resuelve |
|--------|--------------|
| `auth` | Login/registro de clientes y admins, emisión/rotación de tokens, logout. |
| `vehicles` | CRUD de carros y subida de fotos a Supabase Storage; catálogo público filtrable. |
| `rentals` | Solicitud, confirmación, cancelación y disponibilidad de rentas. |
| `payments` | Registro de pagos de una renta y máquina de estados del pago. |
| `clients` | Consulta y (des)activación de clientes para el admin. |
| `catalog` | CRUD de marcas y categorías. |
| `users` | CRUD de administradores. |
| `reports` | Agregados de solo lectura para el dashboard (eran los endpoints de reportes). |

---

## 2. Arquitectura general

### Patrón module-based

Cada módulo es **autocontenido** en `src/modules/<nombre>/`, replicando siempre el
mismo esqueleto de archivos:

```
src/modules/auth/
├── auth.types.ts       # interfaces de entidades, inputs y filtros (y enums de estados)
├── auth.schema.ts      # schemas zod para body/query
├── auth.repository.ts  # ÚNICA capa que toca el cliente de Supabase
├── auth.service.ts     # lógica de negocio (nunca toca Express ni Supabase)
├── auth.controller.ts  # delgado: lee req, llama al service, responde
├── auth.routes.ts      # wireframe Express: middlewares + handlers
└── auth.service.test.ts # tests unitarios aislados (mock de repos)
```

Responsabilidad de cada capa:

- **types.ts** — contratos de datos del dominio: interfaces de filas de BD, inputs de
  creación/actualización, filtros de listado, y uniones de estados (`VehicleEstado`,
  `RentaEstado`, `PagoEstado`, etc.).
- **schema.ts** — schemas zod **sin wrapper** (el objeto raíz ES el body; no usan
  `{ body: ... }`). Sirven a `validateRequest`/`validateQuery`.
- **repository.ts** — solo aquí vive `import { supabase }`. Traduce filas de BD a los
  tipos del módulo, y para datos sensibles hace `select` de columnas explícitas
  (ej. `clients.repository.ts:4` y `users.repository.ts:10` omiten `contrasena`).
- **service.ts** — reglas de negocio. Orquesta repos (los propios y **los de otros
  módulos**), arroja `AppError` y nunca conoce Express ni la config de Supabase.
- **controller.ts** — delgado y repetitivo a propósito: extrae `req.params/query/body`,
  llama al service, fija el status code y responde; `catch (error) → next(error)`.
- **routes.ts** — ordena middlewares (`validateRequest` antes del controller) y las
  **rutas estáticas antes que `/:id`** (p. ej. `GET /mine` y `/check-availability`
  preceden a `GET /:id` en `rentals.routes.ts:18-25`).

### Flujo real de una request (ejemplo: `POST /api/auth/admin/login`)

1. **Routes** (`auth.routes.ts:16-21`): encadena `loginRateLimiter` →
   `validateRequest(adminLoginSchema)` → `authController.adminLogin`.
2. **Validación** (`validateRequest.ts:8`): `req.body = schema.parse(req.body)` — el
   body validado (con **defaults de zod ya aplicados**) reemplaza al original, y los
   errores se transforman en `AppError(400)`.
3. **Controller** (`auth.controller.ts:8-20`): llama `authService.adminLogin(req.body)`.
4. **Service** (`auth.service.ts:21-60`): valida estado del usuario, compara el hash
   con `bcrypt`, genera el par de tokens (`generateTokens`) y persiste el refresh.
5. **Repository** (`auth.repository.ts:12-21`): `supabase.from('usuarios')...` — única
   línea donde se toca la BD. El service queda ajeno a eso.
6. Errores: cualquier `AppError` (o error inesperado → 500) converge en el
   `errorHandler` global (`app.ts:48`), que responde `{ message }` sin exponer stack.

### Regla de oro

> **El service nunca importa el cliente de Supabase.** Todo acceso a datos pasa por
> su repository. Los tests unitarios lo explotan: mockean los repositories con
> `vi.mock` y el service corre sin BD (ver `auth.service.test.ts`, `rentals.service.test.ts`,
> `payments.service.test.ts`).

---

## 3. Mapa de módulos

### `auth` → `/api/auth`
Login/registro y ciclo de vida de tokens. Utiliza **solo** su propio repository
(`findAdminById`, `findClientByEmail`, `emailExists`, `insertClient`,
refresh_tokens CRUD). Ninguna dependencia de otros módulos.

- `POST /admin/login` · `POST /client/login` (rate-limited) · `POST /client/register`
- `POST /refresh` (rota el refresh token de la cookie httpOnly)
- `POST /logout` (requiere `authenticate`)

### `vehicles` → `/api/vehicles`
Catálogo de carros. Endpoints de lectura son públicos; mutaciones son admin-only.
Sube fotos a Storage **bucket `carros`** vía multer (`vehicles.repository.ts:77-87`).
No depende de otros módulos.

- `GET /` (filtros: marca, categoría, transmisión, combustible, estado, rango de tarifa) · `GET /:id`
- `POST /` · `PUT /:id` · `DELETE /:id` · `PATCH /:id/estado` · `POST /upload-photo`

### `rentals` → `/api/rentals`
Flujo de rentas. **Depende de `vehicles.repository`** (`findTarifaAndEstado`) para
validar que el carro exista, no esté en mantenimiento y calcular el total días×tarifa.

- `POST /` (client) crea la renta en estado `pendiente`
- `GET /` (admin, filtrable) · `GET /mine` (client) · `GET /:id` (autenticado, scoped)
- `GET /check-availability` (público, query `id_carro` + fechas)
- `PATCH /:id/estado` (admin) · `PATCH /:id/cancelar` (autenticado, reglas por rol)

### `payments` → `/api/payments`
Pagos de rentas. **Depende de `rentals.repository`** (estado de la renta) y de
**`vehicles.repository`** (`findTarifaAndEstado` para el total esperado de la renta).

- `GET /renta/:id_renta` (autenticado; client solo ve rentas propias)
- `POST /` (autenticado) — estado inicial derivado del método de pago
- `PATCH /:id/estado` (admin)

### `clients` → `/api/clients`
Todo admin-only. **Depende de `rentals.repository`** (`listByClient` para el
historial y para bloquear la desactivación con rentas activas).

- `GET /` · `GET /:id` · `GET /:id/rentals` · `PATCH /:id/estado`

### `catalog` → `/api/catalog`
Marcas y categorías (tablas con PK = `nombre`). Lectura pública; mutaciones
admin-only. **Depende de `vehicles.repository`** (`countVehiclesByMarca`/
`countVehiclesByCategoria`) para impedir borrar entradas en uso.

- `GET|POST|PUT|DELETE /marcas[/:nombre]` · `GET|POST|PUT|DELETE /categorias[/:nombre]`

### `users` → `/api/users`
CRUD de administradores (`usuarios`). Todo admin-only. No depende de otros módulos
(usa bcrypt y su propio repository con email único y columnas públicas sin password).

- `GET /` · `GET /:id` · `POST /` · `PUT /:id` · `PATCH /:id/estado`

### `reports` → `/api/reports`
Agregados de solo lectura para el dashboard. Reutiliza repos de `rentals`, `vehicles`
(`rentas-recientes`) y `clients`, más su `reports.repository` propio para los conteos.
Todo admin-only.

- `GET /dashboard` · `GET /rentas-recientes` · `GET /ingresos-mensuales?meses=N` · `GET /estado-flota`

---

## 4. Reglas de negocio importantes (no obvias)

1. **Normalización de identificadores.** Todos los identificadores tipeados por un
   humano (`id_carro`, `id_marca`, `id_categoria`, `id_cliente`/`numero_licencia`,
   nombres de marcas/categorías, y filtros como `transmision`/`combustible`) se
   normalizan con `normalizeIdentifier()` = **trim + lowercase** antes de guardarse o
   filtrarse (`src/shared/utils/normalize.ts:1`). **Excepción**: los IDs generados por
   el sistema (`id_renta = RENTA-<timestamp>`, `id_pago = PAGO-<timestamp>`) NO se
   normalizan, y `id_usuario` (admin) tampoco lo es en `auth.adminLogin`.
2. **Rango de fechas inclusivo en rentas.** `dias_duracion = (fin − inicio en ms)/86400000 + 1`
   (`rentals.service.ts:84-86`): una renta de 10-ene a 14-ene dura **5 días**, no 4.
3. **Traslape de fechas.** Una renta nueva colisiona si existe otra del mismo carro en
   `['pendiente','confirmada','en_curso']` y `existing.fecha_fin >= nuevo_inicio` y
   `existing.fecha_inicio <= nuevo_fin` (`rentals.repository.ts:71-77`). Los estados
   `finalizada`/`cancelada` se ignoran porque ya no ocupan el carro.
4. **Mantenimiento bloquea todo.** No se crea una renta sobre un carro en
   `estado === 'mantenimiento'` (409) ni `check-availability` lo reporta disponible
   (`rentals.service.ts:70-72` y `142-145`).
5. **Estado inicial del pago según método de pago** (`payments.service.ts:23-27`):
   `tarjeta → 'completado'`, `efectivo`/`transferencia → 'pendiente'`. El `estado`
   **nunca** lo decide el body (el schema de creación ni siquiera lo acepta) — sólo
   `PATCH /:id/estado` (admin) lo cambia.
6. **Saldo pendiente vs confirmación** (`payments.service.ts:51-81`): el saldo se
   calcula restando la suma de pagos `['completado','pendiente']` — los pagos
   pendientes **consumen saldo** (evita sobrepagar). La confirmación automática de la
   renta a `'confirmada'` ocurre **solo** cuando `sum(completado) >= total_esperado`
   **y** la renta sigue en `'pendiente'`; un pago que nace pendiente, aunque cubra todo
   el total, no confirma nada.
7. **Auto-protección de admins** (`users.service.ts:74-82`): un admin no puede
   desactivar su propia cuenta, y no se permite desactivar al **único** admin activo
   (`countActive() <= 1`).
8. **Cliente con rentas activas no se desactiva** (`clients.service.ts:40-49`): se
   bloquea `estado → 'inactivo'` si tiene rentas en `RENTA_ESTADOS_ACTIVOS`.
9. **Catálogo en uso no se elimina** (`catalog.service.ts:42-46`, `84-88`): borrar una
   marca/categoría referenciada por vehículos devuelve **409**. Renombrar valida que
   el nombre destino no exista ya (400).
10. **Root admin sin password (legacy).** Si `clientes.contrasena IS NULL`, el login de
    cliente responde 403 pidiendo registrar contraseña y **nunca** llama a `bcrypt.compare`
    (evita comparar contra `null`) (`auth.service.ts:69-71`).
11. **KPI de "mes" en UTC** (`reports.repository.ts:21-28`): el mes corriente y los
    rangos de `pagos.fecha_pago` se calculan con `getUTCFullYear/getUTCMonth/Date.UTC`
    y strings `YYYY-MM-DD`, para que el resultado no dependa del timezone del servidor.
12. **`/ingresos-mensuales` siempre devuelve todos los meses pedidos**, incluyendo los
    que tienen `total: 0` (`reports.repository.ts:104-112`). Default `meses=6`, máximo 12.

---

## 5. Autenticación y autorización

**Access + refresh JWT.**

- `authenticate` (`src/shared/middlewares/authenticate.ts`): exige `Authorization: Bearer <token>`,
  verifica contra `JWT_ACCESS_SECRET` y setea `req.user = { id, rol }` (globalmente
  tipado en Express via `declare global`). Errores: sin header → 401 `No token provided`;
  `TokenExpiredError` → `Token expired`; token inválido → `Invalid token`.
- `authorize(...roles)` (`authorize.ts`): después de `authenticate`, valida que
  `req.user.rol` esté entre los roles permitidos; si no → 403 `Insufficient permissions`.
  Convención: `adminOnly = [authenticate, authorize('admin')]`,
  `clientOnly = [authenticate, authorize('client')]`.
- **Cookies.** El refresh token viaja en cookie `httpOnly` (`refresh_token`),
  `sameSite: 'strict'`, `secure` en producción (`auth.controller.ts:74-91` y `env.ts:17-22`).
  El access token viaja en el body de la respuesta de login y se manda en el header en
  cada request posterior.
- **Emisión.** `auth.service.ts` (`generateTokens`, `storeRefreshToken`): access = 15m,
  refresh = 7d (`env.ts:11-16`). El refresh se guarda en la tabla `refresh_tokens` con
  `expires_at` derivado del `exp` del JWT (`jwt.decode`) o un fallback de 7 días.
- **Rotación** (`auth.service.ts:147-182`): `POST /refresh` sólo existe si hay cookie;
  verifica el token (`400` si no hay cookie, `401` si `jwt.verify` falla), confirma que
  esté en `refresh_tokens` (si no → `401`), borra el row si su `expires_at < now` (→ `401`
  "Refresh token expired"), borra el actual, genera uno nuevo y lo guarda (rotación).
- **Uso de `req.user` en controllers.** Patrón `getRequester(req)` en `rentals.controller.ts:7-9`
  y `payments.controller.ts:6-8`: `(req.user as JwtPayload) ?? { id: '', rol: 'client' }`.
  `users.controller.ts:46` usa `req.user.id` directamente (la ruta es admin-only, así que
  el user siempre existe). Los services reciben el requester para **scope**: un client
  sólo ve/edita rentas y pagos donde `id_cliente === normalizeIdentifier(requester.id)`
  (`rentals.service.ts:46-48`, `payments.service.ts:27-29`).

---

## 6. Base de datos

El esquema **vive en Supabase** (el repo no contiene SQL de migraciones).
Las tablas se infieren del uso real en `src/*/repository.ts`; el `AUDIT.md` antiguo
contiene un esquema heredado a modo de referencia (algunos estados difieren, ver notas).

Tablas y relaciones (FKs deducidos del código):

```
marcas(nombre PK) ──────────┐
                            ├── carros(id_carro PK, id_marca FK→marcas.nombre,
categorias(nombre PK) ──────┘              id_categoria FK→categorias.nombre,
                            estado: 'activo'|'mantenimiento'|'inactivo' (columna texto
                            SIN CHECK constraint en BD; 'inactivo' = retirado de la
                            flota, soft delete que conserva la fila y su historial)
                            foto: URL de Supabase Storage bucket 'carros')

carros ─┐
        ├── rentas(id_renta PK "RENTA-<ts>", id_carro FK→carros,
        │              id_cliente FK→clientes, estado en
clientes(id_cliente PK,     'pendiente'|'confirmada'|'en_curso'|'finalizada'|'cancelada')
 contrasena nullable) ─┘
        │
        └── rentas ── pagos(id_pago PK "PAGO-<ts>", id_renta FK→rentas,
                            estado en 'pendiente'|'completado'|'fallido'|'reembolsado',
                            metodo_pago en 'tarjeta'|'efectivo'|'transferencia')

usuarios(id_usuario PK, contrasena bcrypt, rol, estado 'activo'|'inactivo')

refresh_tokens(token PK, user_id, user_type 'admin'|'client', expires_at)
   — el código no permite confirmar una FK declarada; user_id referencia
     a usuarios o clientes según user_type (nota abajo)
```

Storage: bucket `carros` de Supabase Storage para fotos de vehículos
(`vehicles.repository.ts:77-95`).

---

## 7. Cómo correr el proyecto

### Variables de entorno (nombres; valores en `.env` local, no versionado)

`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_ACCESS_SECRET` (15m), `JWT_REFRESH_SECRET` (7d),
`NODE_ENV`, y opcionales: `PORT` (default 3000), `COOKIE_DOMAIN`, `FRONTEND_URL`
(sólo usado para CORS en producción).

> **Nota:** no existe `.env.example` en el repo. Los nombres se documentan aquí; cualquier
> contribución que agregue variables debe documentarlas igual.

### Comandos (`package.json`)

```bash
npm run dev      # tsx watch src/app.ts  (arranca y recarga en caliente)
npm run build    # tsc  → dist/
npm start        # node dist/app.js
npm test         # vitest run
npm run test:watch
```

Al arrancar (no-producción), `src/config/supabase.ts` verifica la conexión consultando
`carros`. `GET /health` en el puerto configurado responde `{ status: 'ok' }`.

### Tests

Los unit tests mockean los repositories (y bcrypt/jwt en auth) con
`vi.hoisted` + `vi.mock`, así que corren **sin** Supabase ni `.env`:
`auth.service.test.ts`, `rentals.service.test.ts`, `payments.service.test.ts`.

> **Nota:** los `.test.ts` viven dentro de `src/` y `tsconfig` incluye `src/**/*`, así que
> `npm run build` los compila a `dist/`. Si eso incomoda, conviene excluir `**/*.test.ts`
> del build.

---

## 8. Convenciones del proyecto

Lo esencial para escribir código nuevo — el detalle completo está en `AGENTS.md`.

- **Módulos autocontenidos** bajo `src/modules/<nombre>/` con el esqueleto
  types → schema → repository → service → controller → routes.
- **Nunca mezclar lógica de negocio en controllers** — vive en `*.service.ts`.
- **Todo input de request se valida con zod** antes del controller
  (`validateRequest`/`validateQuery` reasignan `req.body`/`req.query` con el parseado,
  por eso los defaults de zod llegan al service).
- **Normalización**: identificadores humanos → `normalizeIdentifier()`; IDs de sistema
  → no normalizar. Ver sección 4, punto 1.
- **Errores con `AppError`** (`src/shared/utils/AppError.ts`): propiedad `statusCode`
  (no `status`). El `errorHandler` responde `{ message }`; nunca exponer `error.message`
  crudo de dependencias en la respuesta.
- **Servicios nunca importan Supabase** (regla de oro, sección 2).
- Roles válidos: `'admin' | 'client'`; siempre montar `adminOnly`/`clientOnly` en rutas.
- **Nunca devolver `contrasena`** en responses: repositories que exponen usuarios o
  clientes usan selects de columnas explícitas que la excluyen.
- Controllers delgados con `try/catch → next(error)`; rutas estáticas antes de `/:id`.

### Notas/observaciones deliberadas (estado real, no agarres automático)

- `carros.estado` **no tiene CHECK constraint** en Supabase (verificado por sondeo:
  un INSERT con `estado = 'valor_invalido_xyz'` es aceptado). La única validación
  de los tres valores (`activo`/`mantenimiento`/`inactivo`) es el enum de zod en
  `vehicles.schema.ts`, alimentado por `VEHICLE_ESTADOS` (`vehicles.types.ts:1`).
- `DELETE /vehicles/:id` es un **soft delete**: marca `estado = 'inactivo'` y NO
  borra la fila ni su foto (`vehicles.service.ts` `remove()` → `vehiclesRepository.deactivate()`).
  El borrado físico existe sólo como `vehiclesRepository.hardDelete()`, que exige
  que el vehículo nunca haya tenido ninguna renta (`'has_history'` si la tuvo) y
  **no está expuesto en ninguna ruta HTTP**.
- `POST /refresh` valida `req.body.cookies.refresh_token` (`auth.schema.ts:25-29`), pero
  el controller lee el token de **`req.cookies`**; el campo del body es prácticamente
  siempre vacío. Es un esquema vestigial.
- El "hoy" de `rentals.service.ts` (`toDateString` local, `getFullYear`) usa timezone del
  servidor, mientras `reports` usa UTC — comportamiento con zona horaria mezclado.
- `id_renta`/`id_pago` se generan con `Date.now()` (`RENTA-<ts>`, `PAGO-<ts>`): no son
  colisión-safe si se insertan dos en el mismo ms.
- El script `lint` (`"lint": "eslint src --ext .ts"`) referencia **eslint**, que **no está
  en `devDependencies`** — `npm run lint` fallará a menos que se instale.
- `AUDIT.md` describe el sistema **anterior** (MVC duplicado pre-migración): sus estados
  de BD viejos (`carros: 'renta'/'desactivado'`, `pagos: 'realizado'`) **no** coinciden
  con los estados actuales que usa el código nuevo. No usarlo como fuente de verdad del
  esquema.