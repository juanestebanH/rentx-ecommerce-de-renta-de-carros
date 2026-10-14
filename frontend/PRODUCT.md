# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Clients**: Spanish-speaking customers who browse the vehicle catalog, compare filters, check availability, and rent a car for a date range; they can view "mis rentas" (their rentals). The renting customer is the primary audience.
- **Admins**: staff who manage the fleet (vehicles), clients, and rentals from an admin area behind protected routes.

## Product Purpose

RentX is a car-rental web app being built as a demo/learning project to practice a full-stack architecture: React + Vite frontend against a live backend API with real vehicle inventory. Success means the complete client flow (browse → check availability → rent) and the admin flow (manage vehicles and clients) work end to end.

## Positioning

A learning/demo project; no commercial, revenue, or differentiated-market claims are made or implied. The product's value to its builders is exercising a clean feature-based frontend architecture with server state, auth, and strict typing.

## Operating Context

- SPA (React Router v7) talking to a backend API at the URL in `VITE_API_URL` (default `http://localhost:3000`).
- Authentication: access token held only in memory (Zustand), refresh endpoint called automatically on 401 via `apiClient.ts`; session persists across the SPA only.
- All interface copy is Spanish; prices are in Colombian Pesos (COP), formatted for the `es-CO` locale.
- Backend field names are Spanish and the frontend types mirror them verbatim.

## Capabilities and Constraints

Confirmed capabilities (in code, in various stages of completion):

- Vehicle catalog with filters: categoría, marca, transmisión, combustible, estado, range de tarifa (`VehicleCatalogPage` + `VehicleFilters`).
- Vehicle detail route (`/carros/:id`) and availability check against `/api/rentals/check-availability`.
- Auth feature (login/register routes) and role-protected routes: `client` → `/mis-rentas`; `admin` → `/admin`, `/admin/vehiculos`, `/admin/clientes`.
- Catalog endpoints `/api/catalog/marcas` and `/api/catalog/categorias`.
- Home landing (`/`): full-page hero with date-picker capsule driving availability, featured-vehicles carousel with an interactive 3D turntable (react-three-fiber), category shortcuts, steps rail, and footer (documented in the Home surface brief).
- Featured 3D models are temporary/generic assets from the author (`carro1-4.png`, Sketchfab GLBs), pending replacement with real fleet models.

Known gaps (deliberately undecided, not yet implemented): vehicle detail content (`VehicleDetailPage` is a placeholder), login/register forms, "mis rentas" screen, and all admin screens are stubs; a rental-create/payment flow does not exist yet. The frontend `src/features/rentals/` and `src/features/payments/` folders exist only as empty skeletons (no types/api/hooks/components implemented) — the backend supports those flows, but the frontend has no UI for them.

Technical constraints: React + Vite + TypeScript strict, feature-based architecture under `src/features/`; TanStack Query for server state; Zustand in memory for client state (no persist middleware); shadcn/ui with Tailwind v4; Spanish entity field names must stay as-is.

## Brand Commitments

- Brand name: **RentX**.
- UI language: Spanish; currency: Colombian Pesos (COP).
- Two access roles: `client` and `admin`, enforced by `ProtectedRoute` `requiredRole`.

## Evidence on Hand

- Working frontend code for the catalog/vehicle flow, the apiClient auth/refresh layer, and the fully built Home page.
- Vehicle domain types mirroring the backend contract (`vehicle.types.ts`).
- Temporary author-authored 3D models and hero imagery, pending real fleet assets.
- No production imagery, customer testimonials, or real-world case studies exist; future work must not fabricate them.

## Product Principles

1. **Client first, admin supports**: the renting customer is the primary audience; admin surfaces exist to keep the catalog and operations truthful.
2. **Server is the single source of truth**: fleet/rental state always comes from the API through TanStack Query; the access token lives only in memory.
3. **Contract fidelity**: Spanish backend field names are authoritative and must never be translated or renamed in the frontend types.
4. **Local correctness is binding**: Spanish copy and COP pricing apply everywhere.
5. **Stay honest about scope**: this is a demo project; never introduce claims a real marked product would need evidence to back.