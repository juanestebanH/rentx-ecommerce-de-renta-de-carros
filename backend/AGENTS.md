# Proyecto: RentX Backend

Migración de MVC duplicado (admin/cliente) a arquitectura module-based con TypeScript.

## Stack

- Express + TypeScript (strict mode)
- Supabase (Postgres)
- zod para validación
- JWT (access + refresh) para auth
- bcryptjs para hashing

## Convenciones

- Cada módulo vive en `src/modules/<nombre>/` y es autocontenido
- Nunca mezclar lógica de negocio en controllers - va en `*.service.ts`
- Todo input de request se valida con zod antes de llegar al controller
- No exponer `error.message` crudo en responses
- Roles válidos: 'admin' | 'client'

## Convenciones de datos

- País/moneda del sistema: **Colombia**, **Peso colombiano (COP)**, símbolo `$`.
  El backend devuelve montos como enteros crudos (sin símbolo ni locale); el
  formateo de moneda y fecha (locale `es-CO`) vive en el frontend.
- Identificadores tipeados por un humano y usados para relacionar/filtrar
  tablas (id_marca, id_categoria, id_carro, id_cliente/numero_licencia)
  se normalizan con `normalizeIdentifier()` (trim + lowercase) antes de
  guardarse o filtrarse.
- IDs generados internamente por el sistema (ej. id_renta, id_pago con
  formato PREFIJO-timestamp) NO se normalizan - el sistema controla su
  formato de punta a punta y nunca son reescritos a mano por un usuario.
