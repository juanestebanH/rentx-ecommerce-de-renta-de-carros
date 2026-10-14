# Proyecto: RentX Frontend

**Arquitectura, flujos y reglas COMPLETAS: [`ARCHITECTURE.md`](./ARCHITECTURE.md)**
— léelo antes de tocar código. Este archivo es solo el índice rápido.

## Comandos

- `pnpm dev` — dev server (http://localhost:5173)
- `pnpm exec tsc -b --force` — typecheck verificado (**no** usar
  `tsc --noEmit`: no comprueba nada)
- `pnpm exec oxlint src` — lint (baseline: exactamente 3 warnings, no añadir más)
- `pnpm build` — ⚠ puede fallar por OOM

## Punteros

- **Stack** → ARCHITECTURE.md §2
- **Mapa del código y dónde va qué** → §3
- **Receta por feature** (types/api/hooks/components/utils) → §4 +
  skill `.opencode/skills/create-feature/SKILL.md`
- **Flujos** (datos, auth, routing, errores, tema) → §5
- **Reglas duras (checklist)** → §6
- **Verificación y baseline** → §7
- **Archivos clave a leer** → §8
- **Añadir una feature nueva** → §9

## Regla #1

Los tipos de entidades usan los MISMOS nombres de campo en español que el
backend (nunca traducir), y toda la UI está en español (`es-CO`, COP).
