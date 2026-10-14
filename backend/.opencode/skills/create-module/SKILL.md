---
name: create-module
description: Crea un módulo nuevo siguiendo la arquitectura module-based del proyecto (types, schema, service, controller, routes). Úsalo cuando se pida construir o migrar un módulo de dominio (auth, vehicles, rentals, clients, users, reports).
---

Al crear un módulo `<nombre>` en `src/modules/<nombre>/`, genera siempre:

- `<nombre>.types.ts` → interfaces y tipos del dominio
- `<nombre>.schema.ts` → schemas de zod para cada operación
- `<nombre>.repository.ts` → único lugar que toca Supabase/BD para este módulo
- `<nombre>.service.ts` → lógica de negocio pura, SIEMPRE a través del repository,  nunca importa el cliente de Supabase directamente
- `<nombre>.controller.ts` → solo recibe req/res, valida con schema, llama al service
- `<nombre>.routes.ts` → define endpoints, aplica middlewares (authenticate, authorize, rate limit donde aplique)

Reglas:

- El controller nunca contiene lógica de negocio
- Todo endpoint que modifique datos requiere `authenticate` + `authorize(roles)` salvo que sea explícitamente público
- Nunca devolver hashes de password ni tokens internos en las respuestas
