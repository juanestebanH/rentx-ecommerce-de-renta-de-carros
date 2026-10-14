---
name: create-feature
description: Crea una feature nueva siguiendo la arquitectura feature-based del proyecto (types, api, hooks, components). Úsalo cuando se pida construir una feature de dominio (vehicles, rentals, payments, auth, admin).
---

Al crear una feature `<nombre>` en src/features/<nombre>/, genera:

- types/<nombre>.types.ts → interfaces que reflejan EXACTAMENTE los
  campos del backend (mismo idioma, mismos nombres)
- api/<nombre>.api.ts → funciones puras que usan apiClient (get, post,
  put, patch, delete) - sin lógica de estado ni caché aquí
- hooks/use<Nombre>.ts → hooks de TanStack Query (useQuery/useMutation)
  que envuelven las funciones de api/. Las mutaciones invalidan las
  queries relacionadas al tener éxito (queryClient.invalidateQueries)
- components/ → componentes de presentación puros, reciben datos y
  callbacks vía props, nunca llaman a hooks de data-fetching ellos mismos
  salvo el componente contenedor de más alto nivel de la feature

Reglas:
- Un componente de "página" (src/pages/) puede combinar componentes de
  varias features - los componentes DENTRO de una feature no deberían
  importar de otra feature salvo que sea claramente necesario (ej.
  rentals puede necesitar mostrar datos de vehicles)
- Todo dato mostrado que venga de una lista paginada o filtrable pasa
  por un hook de TanStack Query, nunca useEffect + fetch manual