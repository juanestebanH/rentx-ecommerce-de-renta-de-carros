# Extension check — Home surface (`/`)

**Mode:** ORDINARY EXTENSION of the incumbent visual world. No `DESIGN.md` exists and none is created here (extension preserves the incumbent system; evidence reported). No `.impeccable/design.json` sidecar written.

**Note:** The degraded documenter ran inline (no subagent harness); the parent-agent contract was produced below and acted on here.

**Ground truth:** shipped artifacts + `src/index.css` tokens (`@theme` / `:root`) + `AGENTS.md` + surface brief `.impeccable/surfaces/src-pages-home-homepage-tsx.md`. Every claim below is evidenced by build code, per the degraded documenter protocol.

## Evidence list

### Tokens (src/index.css)
- `--color-background` `oklch(0.9771 0.0074 80.7)` (**crema #FAF7F2**) — index.css:25
- `--color-foreground` `oklch(0.2662 0.0152 62.7)` (**grafito #2B241E**) — index.css:26; also card-foreground/popover-foreground :27–30
- `--color-primary` `oklch(0.5109 0.0861 186.4)` (**teal #0F766E**) — index.css:31
- `--color-primary-foreground` `oklch(0.9803 0.0065 185.3)` (**#F4FAF9, 5.2:1 AA**) — index.css:32
- `--color-accent` `oklch(0.9429 0.0212 189.6)` / `--color-accent-foreground` `oklch(0.437 0.0705 188.2)` (teal oscurecido para texto legible sobre claro) — index.css:37–38
- `--color-muted-foreground` arena `oklch(0.549 0.0247 69.5)` — index.css:36
- `--accent-bg` / `--accent-border` `color-mix()` con primary 12%/45% — index.css:65–66
- `--radius: 10px` base; escala derivada (sm 6 / md 8 / lg 10 / xl 12) — index.css:48–51, 55
- Base tipográfica `18px/145%` (16px ≤1024px); h1 `56px`→`36px`, h2 `24px`→`20px`; `--sans = Plus Jakarta Sans Variable`; `dark:` solo bajo ancestro `.dark` — index.css:8, 68, 137–153

### New artifacts vs the world (Own-World conformance)
- Header sobre `bg-card` con `border-b border-border` — Header.tsx:11 (cumple OWN-WORLD)
- Círculo de icono teal: `bg-[var(--accent-bg)] text-primary` (teal **icono** sobre círculo tintado = uso nativo permitido) — Header.tsx:14, HomeSteps.tsx:31, HomeFooter.tsx:9
- Tarjeta única no anidada `rounded-xl bg-card shadow-sm` ~432px contenedor — HomePage.tsx:22, HomeDatePicker.tsx:52
- Icono teal `CalendarIcon text-primary` (icono, permitido; no texto) — HomeDatePicker.tsx:55
- Trigger con rango activo: `border-[var(--accent-border)] text-accent-foreground` (teal oscurecido sobre claro, no pleno) — HomeDatePicker.tsx:68, mismo patrón incumbente en FechaRangeInputs.tsx:58
- CTA primario a lo ancho `bg-primary text-primary-foreground` (#F4FAF9 sobre teal, AA) — HomeDatePicker.tsx:98–103
- Calendario compacto incumbente: celdas 36px (--rdp-day-width/height 36px), dos meses, locale `es` — calendar.tsx:44–45, HomeDatePicker.tsx:89–90, FechaRangeInputs.tsx:81–82
- "Ver todos" / "Ver el catálogo completo": `text-accent-foreground` con `hover:underline` (prohibición "teal pleno nunca sobre claro" respetada) — FeaturedVehicles.tsx:25, 63
- Estado de error de destacados y empty-state del catálogo: `bg-accent/50 text-accent-foreground` (baldosas tonales, sin texto pleno-teal) — FeaturedVehicles.tsx:39, VehicleCatalogPage.tsx:219 (incumbente)
- Seed de fechas desde URL validado por regex `\d{4}-\d{2}-\d{2}` — VehicleCatalogPage.tsx:39–46; FechaRangeInputs.tsx:42–45 refactor neutro que importa `toISODate` (date.ts:1–4) — mismos bytes de formato, sin cambio visual

### Deliberate keep (no canonizado)
- **"Paso 1/2/3"** en HomeSteps.tsx:35 (`text-xs uppercase text-accent-foreground`): secuencia-carrying numbers del rail de pasos. Se registra como INTENCIONAL. Ni el ban del surface brief (hero sin kicker/eyebrow) ni este label se elevan a regla de sistema: no se prohibe ni se estiliza el kicker como casa estilo.

## Five-line system summary

1. **Palette:** fondo crema/hueso #FAF7F2 (oklch .9771 .0074 80.7), superficie tarjeta #FCFBFA (card/popover), texto grafito cálido #2B241E (foreground), neutros arena (muted .9378 75.3; muted-foreground .549 69.5), acento teal #0F766E (primary) con texto sobre acento #F4FAF9 (AA 5.2:1) y variante oscurecida accent-foreground (oklch .437 70.5 188.2) para texto teal legible sobre claro; tintes de acento vía `color-mix` 12%/45% (--accent-bg/--accent-border).
2. **Type ramp:** Plus Jakarta Sans Variable por defecto, base `18px/145%` (16px ≤1024px); h1 `56px→36px` (hero home `60px/36px` bold tracking-tight), h2 `24px→20px` (títulos de sección `text-2xl→text-3xl` en superficie), cuerpo `text-base`, subtexto/labels `text-sm`/`text-xs` (uppercase tracking-wide para micro-estiquetas), botones `text-sm`, datos numéricos `tabular-nums` (precios `text-xl bold`), icons lucide `size-4/5`.
3. **The Teal-on-Surface Rule.** El acento #0F766E se usa solo en superficies, bordes e iconos; nunca texto pleno-teal sobre claro (enlaces → `text-accent-foreground` oscurecido); el texto sobre acento va siempre en #F4FAF9 (AA 5.2:1).
4. **The Light-World Rule.** Tema claro forzado: `dark:` solo dentro de un ancestro `.dark` (toggle manual futuro), nunca por `prefers-color-scheme`; diseñar siempre en claro.
5. **The Cream-Paper / Rounded-10 Rules.** Superficies planas crema sobre fondo crema, línea `border-border` de separación, sombras suaves de poca elevación (shadow-xs/sm, hover:shadow-md) — sin sombras duras; radios base 10px (sm 6 / md 8 / lg 10 / xl 12, botones md 8, calendario compacto celdas 36px) — nunca Inter.

## Defects / drift

- Sin defectos ni drift introducidos por este build; pre-existente no reparado: el h1 base de index.css:136–144 (56px, márgenes 32/20px) queda muerto porque todos los títulos de página lo sobrescriben con `my-0` y escalas propias (catálogo y home) — herencia aceptada, se reporta sin reparar.