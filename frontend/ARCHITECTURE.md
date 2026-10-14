# Arquitectura — RentX Frontend

Guía para desarrolladores nuevos: qué es el proyecto, cómo está organizado,
qué flujos lo gobiernan y qué reglas no se rompen. Lee esto antes de tocar
código. La receta abreviada para agentes/IA vive en [`AGENTS.md`](./AGENTS.md).

---

## 1. Qué es este proyecto

SPA de alquiler de carros (RentX) con dos caras:

- **Sitio cliente** (`/`): home, catálogo, detalle de vehículo, flujo de
  reserva, mis rentas, contacto.
- **Panel admin** (`/admin/*`): dashboard, vehículos, clientes, rentas,
  catálogo (marcas/categorías), usuarios, reportes.

### Comandos

| Comando | Qué hace |
|---|---|
| `pnpm dev` | Dev server en `http://localhost:5173` |
| `pnpm exec tsc -b --force` | Typecheck completo (el verificado) |
| `pnpm exec oxlint src` | Lint |
| `pnpm build` | `tsc -b && vite build` — ⚠ puede fallar por memoria (OOM) en máquinas limitadas |
| `pnpm preview` | Vista previa del build |

> ⚠ `tsc --noEmit` en la raíz **no comprueba nada**: `tsconfig.json` tiene
> `"files": []` (project references). Usa siempre `pnpm exec tsc -b --force`.

- Backend esperado en `VITE_API_URL` (default `http://localhost:3000`).
- **No hay test runner**: la verificación es typecheck + lint + smoke por
  HTTP/navegador.

---

## 2. Stack

| Área | Elección | Nota clave |
|---|---|---|
| UI | React 19 + TypeScript 6 | `strict` en `tsconfig.app.json` |
| Build | Vite 8 | alias `@` → `src/` en `vite.config.ts` |
| Routing | React Router 7 | definido en `src/router.tsx`, no en `main.tsx` |
| Server state | TanStack Query 5 | config global en `src/shared/lib/queryClient.ts` |
| Client state | Zustand 5 | **sin** `persist`: el token vive solo en memoria |
| Estilos | Tailwind v4 CSS-first | config en `src/index.css` con `@theme`; **no existe** `tailwind.config.js` |
| Componentes | shadcn/ui | `src/shared/components/ui/` |
| Lint | oxlint | baseline: exactamente 3 warnings (§7) |
| Fechas/moneda | date-fns (locale `es`) | formato `es-CO`, COP |
| Gráficas | recharts | solo admin (carga lazy, nunca en el bundle cliente) |
| 3D | three + @react-three/fiber + drei | home y detalle |
| Motion | framer-motion | |
| Toasts | sonner | `<Toaster />` montado en `main.tsx` |
| Tipografía | Plus Jakarta Sans Variable | `@fontsource` — **nunca Inter** |

---

## 3. Mapa del código

```
src/
├── main.tsx            # QueryClientProvider > SessionBootstrap > RouterProvider (+ Toaster)
├── router.tsx          # rutas y layouts (§5.3)
├── index.css           # tokens de tema (claro + :root.dark), @theme de Tailwind
├── features/           # 9 dominios con arquitectura feature-based (§4)
│   ├── admin/          # shell del panel: AdminLayout, AdminSidebar, AdminDrawer
│   ├── auth/           # login/registro, sessionBootstrap, auth.store
│   ├── catalog/        # marcas y categorías (CRUD admin)
│   ├── clients/        # clientes + historial de rentas
│   ├── payments/       # métodos/estados de pago, comprobante
│   ├── rentals/        # rentas de cliente, cola/gestión admin, flujo de reserva
│   ├── reports/        # dashboard y reportes (KPIs, charts, CSV/PDF)
│   ├── users/          # usuarios con rol admin del sistema
│   └── vehicles/       # catálogo, disponibilidad, CRUD admin
├── pages/              # pantallas completas que orquestan features
│   ├── admin/          # páginas /admin/* (lazy)
│   ├── home/           # landing: hero, carrusel 3D, FAQ
│   └── reservar/       # flujo de reserva
└── shared/
    ├── components/ui/  # shadcn: button, card, dialog, select, chart...
    ├── components/     # Layout, Header, ProtectedRoute, ThemeToggle...
    ├── lib/            # apiClient, queryClient, date, utils (cn)
    ├── store/          # theme.store (tema claro/oscuro)
    ├── hooks/          # useMediaQuery, usePagination, useRetainedValue
    └── utils/          # SOLO helpers genéricos (≥2 features)
```

### Dónde va qué

| Quiero crear... | Va en |
|---|---|
| Componente de un dominio | `features/<dom>/components/` |
| Pantalla completa (una o varias features) | `pages/` |
| Función de fetch al backend | `features/<dom>/api/` |
| Query o mutación (TanStack) | `features/<dom>/hooks/` |
| Helper de dominio (format/validación) | `features/<dom>/utils/` |
| Helper genérico usado por ≥2 features | `shared/utils/` |
| Componente reutilizable entre dominios | `shared/components/` |
| Componente base shadcn | `shared/components/ui/` |

---

## 4. Arquitectura por feature

Cada feature vive en `src/features/<nombre>/` con estas capas, **en este
orden de dependencia** (una capa solo importa hacia arriba):

```
types/  →  api/  →  hooks/  →  components/
                ↘ utils/
```

### 4.1 `types/<nombre>.types.ts`

Interfaces que reflejan **exactamente** los campos del backend: mismo
idioma (español), mismos nombres, mismos tipos. **Nunca traducir campos a
inglés.** Ej.: `id_renta`, `total_pago`, `fecha_inicio`.

### 4.2 `api/<nombre>.api.ts`

Funciones puras de fetch con `apiClient` (`get`, `post`, `put`, `patch`,
`delete`). Sin estado, sin caché, sin React. Cada función = un endpoint.

```ts
export function getClients(estado?: ClienteEstado) {
  const qs = estado ? `?estado=${estado}` : '';
  return apiClient.get<Client[]>(`/api/clients${qs}`);
}
```

### 4.3 `hooks/use<Nombre>.ts`

Envuelven `api/` con TanStack Query. Convenciones:

- **Query key** constante por recurso: `const CLIENTS_QUERY_KEY = ['clients']`.
- Listas paginadas/filtrables: `placeholderData: keepPreviousData`.
- Consultas condicionales: `enabled: Boolean(id)`.
- Mutaciones: invalidar en `onSettled` (éxito **y** error → consistencia):

```ts
export function useUpdateClienteEstado() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, estado }: UpdateEstadoInput) => updateClienteEstado(id, estado),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: CLIENTS_QUERY_KEY });
    },
  });
}
```

### 4.4 `components/`

Presentación pura: reciben datos y callbacks por props. **No hacen fetch**
(ni `api/` ni hooks de data-fetching), salvo el componente contenedor de
más alto nivel de la feature. Si un componente supera ~150 líneas, mezcla
responsabilidades: extrae subcomponentes o lógica a un hook.

### 4.5 `utils/`

Helpers de dominio (format, validación, cálculos). Regla de extracción:

- Consumido por **1 feature** → se queda en `features/<dom>/utils/`.
- Consumido por **≥2 features** → se muda a `shared/utils/`.
- Prohibido importar `@/features/<otra>/utils/` para helpers genéricos
  (van a `shared/utils/`). Los **labels de dominio** (`RENTA_ESTADO_LABELS`,
  `METODO_PAGO_LABELS`, etc.) viven en la feature que los define.
- `src/pages/` **sí** puede importar utils de features (las orquesta).

Ejemplos reales: `shared/utils/format.ts` (`formatCop`, `formatNumero`,
`capitalizar`, `formatRango`, `mensajeError` — consumidos por 5 features) y
`shared/utils/catalogo.format.ts` (`categoriaLabel`).

---

## 5. Flujos

### 5.1 Flujo de datos

```
Componente (props + callbacks)
    ↓ usa
hook de features/<dom>/hooks  (useQuery / useMutation)
    ↓ llama
función de features/<dom>/api (pura)
    ↓ usa
apiClient (shared/lib)  →  fetch  →  backend
    ↑
TanStack Query cachea, revalida y vuelve a renderizar
```

Reglas del cache (`src/shared/lib/queryClient.ts`):

- `staleTime: 5 min`, `refetchOnWindowFocus: false`,
  `refetchOnMount: 'always'`.
- **No reintentar** errores 4xx (son del cliente); hasta 3 reintentos en 5xx.
- Mutaciones: `retry: false`.
- **Prohibido** `useEffect` + `fetch` manual: todo dato remoto pasa por un
  hook de TanStack Query.

### 5.2 Flujo de autenticación

```
Arranque (main.tsx)
  SessionBootstrap → bootstrapSession()   [una sola vez, promise compartida]
      POST /api/auth/refresh  (cookie httpOnly, credentials: include)
        ├─ ok  → accessToken → GET /api/auth/me → setSession(token, user)
        └─ error → clearSession()  →  usuario anónimo

Cada request (apiClient.request)
  Authorization: Bearer <accessToken en memoria>
      ├─ 401 y NO es ruta exenta → refresh (single-flight: un solo
      │    refreshPromise para todas las peticiones concurrentes)
      │      ├─ ok  → reintentar el request original con el token nuevo
      │      └─ error → clearSession() + lanzar error
      └─ parse → 204 = undefined; error no-2xx = ApiError(message, status)

Rutas protegidas (ProtectedRoute requiredRole="client|admin")
  sin user o rol ≠ requerido → <Navigate to="/login" | "/admin/login"
                                    state={{ from: pathname+search }} />
```

- **El token nunca se persiste** (ni localStorage ni cookies de JS): el
  refresh vive en una cookie httpOnly que maneja el backend.
- Rutas exentas de refresh: `client/login`, `admin/login`,
  `client/register`, `refresh`.
- Store: `features/auth/store/auth.store.ts` (zustand, en memoria).

### 5.3 Routing (`src/router.tsx`)

Tres layouts, jerarquía de rutas:

| Layout | Rutas | Notas |
|---|---|---|
| `Layout` (cliente) | `/`, `/catalogo`, `/contacto`, `/carros/:id`, `/mis-rentas`, `/reservar` | `mis-rentas` y `reservar` protegidas con `requiredRole="client"` |
| `AdminLayout` | `/admin`, `/admin/vehiculos(/nuevo|/:id/editar)`, `/admin/clientes`, `/admin/rentas`, `/admin/catalogo`, `/admin/usuarios`, `/admin/reportes` | **Todas** con `requiredRole="admin"` y páginas `lazy` + `Suspense` (recharts no entra al bundle cliente) |
| `AuthLayout` | `/login`, `/registro` | pantallas de autenticación |

- `/admin/login` está **fuera** de `AdminLayout` (no lleva sidebar/header).
- `*` → redirect a `/`.
- El panel vive fuera de `Layout` a propósito: no aplica el header de
  cliente, footer de marketing ni widget de FAQs.

### 5.4 Manejo de errores

- Todo error de red llega como `ApiError` (`message` + `status`) desde
  `apiClient`.
- Mostrar al usuario: `mensajeError(error, fallback)` de
  `shared/utils/format.ts` (maneja `ApiError` y `Error`).
- Estados de error en listas: componente `ErrorState` con `onRetry`
  (reintentar la query).
- Éxito de mutaciones: toasts con `sonner` (`toast.success/error`).
- Los helpers de dominio con mensajes específicos viven en su feature
  (`rentalErrorMensaje`, `catalogErrorMensaje`, …).

### 5.5 Tema (claro/oscuro)

- **Por defecto CLARO**: crema `#FAF7F2` + grafito `#2B241E`.
- La clase `.dark` vive en `<html>`: script anti-FOUC en `index.html` +
  `shared/store/theme.store.ts` (zustand, persistencia manual
  `rentx:theme` en localStorage con try/catch).
- **Nunca** por `prefers-color-scheme`. Tokens oscuros en `:root.dark`
  (`src/index.css`); `dark:` de Tailwind reacciona a la misma clase.
- Al estar en la raíz, los portales (dialogs, selects, toasts) heredan el
  tema. Toggle: header del sitio cliente y footer del sidebar admin
  (`shared/components/ThemeToggle.tsx`).

---

## 6. Reglas duras (checklist)

**Datos y código**

1. Tipos de entidades = campos **en español**, idénticos al backend.
2. Todo dato remoto pasa por TanStack Query — **nunca** `useEffect` + fetch.
3. `api/` puro (sin estado), `hooks/` TanStack, `components/` solo props.
4. Imports entre features solo cuando es claramente necesario (ej.
   rentals mostrando datos de vehicles); helpers genéricos → `shared/utils`.
5. `utils/` por feature para dominio; `shared/utils/` solo si ≥2 features
   lo consumen (ver §4.5).
6. Componentes ≤ ~150 líneas: si lo superan, extrae subcomponentes o
   lógica a hooks.

**UI y diseño**

7. Todo elemento nuevo debe verse bien en **ambos temas**: usar tokens
   (`bg-card`, `bg-background`, `text-*`, `border-*`), nunca `bg-white` ni
   hex fijos.
8. Contraste WCAG AA: texto primario sobre el acento es `#F4FAF9` (5.2:1);
   el acento nunca como texto sobre fondo claro — usar
   `--color-accent-foreground` / `--accent-bg` con `color-mix()`.
9. Acento teal `--color-primary` (#0F766E) para fondos, bordes y CTAs.
10. Evitar cards anidadas (card dentro de card).
11. Tipografía: Plus Jakarta Sans Variable. **Nunca Inter**.
12. Filtros de catálogo en sidebar lateral, no en barra horizontal.
13. UI en español, moneda COP formato `es-CO`.

**Rutas y roles**

14. Rutas protegidas siempre con `<ProtectedRoute requiredRole="admin|client">`.
15. Rutas admin nuevas: página `lazy()` + `Suspense` dentro de
    `ProtectedRoute` (ver §5.3).

---

## 7. Verificación y baseline

Antes de dar un cambio por terminado:

```bash
pnpm exec tsc -b --force   # debe salir 0 (sin salida)
pnpm exec oxlint src       # debe mantener el baseline de 3 warnings
```

**Baseline de lint (conocido, preexistente — no lo "arregles" sin comentarlo):**

- `src/shared/components/ui/button.tsx:63` — `only-export-components`
- `src/shared/components/ui/badge.tsx:47` — `only-export-components`
- `src/shared/hooks/useMediaQuery.ts:12` — `set-state-in-effect`

Smoke test opcional: el dev server sirve cualquier módulo por ruta
(`GET http://localhost:5173/src/<ruta>` → 200) — sirve para comprobar que
Vite resuelve imports y alias.

---

## 8. Archivos clave (léelos en este orden)

1. `src/router.tsx` — mapa de rutas, layouts, protección, lazy loading.
2. `src/shared/lib/apiClient.ts` — fetch base, `ApiError`, refresh 401.
3. `src/shared/lib/queryClient.ts` — política de cache/reintentos.
4. `src/features/auth/store/auth.store.ts` + `src/features/auth/lib/sessionBootstrap.ts`
   — sesión en memoria y su restauración.
5. `src/shared/components/ProtectedRoute.tsx` — guard por rol.
6. `src/index.css` — tokens de tema y configuración de Tailwind.
7. `src/shared/store/theme.store.ts` — tema claro/oscuro.
8. `AGENTS.md` — índice rápido de comandos y punteros.

---

## 9. Cómo añadir una feature nueva

1. **Tipos** en `features/<dom>/types/<dom>.types.ts` — copiar los nombres
   de campo exactos de la respuesta del backend.
2. **API** en `features/<dom>/api/<dom>.api.ts` — funciones puras con
   `apiClient`.
3. **Hooks** en `features/<dom>/hooks/` — `useQuery` con query key
   constante; mutaciones con `invalidateQueries` en `onSettled`.
4. **Componentes** en `features/<dom>/components/` — presentación pura,
   ≤150 líneas, tokens de tema.
5. **Página** en `src/pages/` orquestando los componentes.
6. **Ruta** en `src/router.tsx`: dentro del layout correspondiente, con
   `ProtectedRoute requiredRole=...`; si es admin, `lazy()` + `Suspense`.
7. **Verificar**: `pnpm exec tsc -b --force` + `pnpm exec oxlint src`
   (baseline) + smoke en navegador.

También existe el skill `.opencode/skills/create-feature/SKILL.md` que
genera el esqueleto siguiendo esta receta.
