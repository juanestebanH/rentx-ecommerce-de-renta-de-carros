---
target: Home page (src/pages/home/HomePage.tsx)
total_score: 22
max_score: 32
na_heuristics: 7,10
p0_count: 0
p1_count: 2
target_identity: "file:D:\\rentx\\frontend\\src\\pages\\home\\HomePage.tsx"
target_fingerprint: "sha256:6c03033e5ca29fb0c0243f3aae585a2f2becd4fe554041d6f936e17b40a36dc4"
target_path: "D:\\rentx\\frontend\\src\\pages\\home\\HomePage.tsx"
timestamp: 2026-09-15T21-28-33Z
slug: src-pages-home-homepage-tsx
---
# Impeccable Critique — RentX Home (`/`)

⚠️ DEGRADED: single-context (no sub-agent/Task tool exposed); assessments A (design review) and B (detector) ran sequentially inline.

## Design Health Score

| # | Heurística | Score | Issue clave |
|---|-----------|-------|-------------|
| 1 | Visibility of System Status | 2 | Selección parcial de fechas (solo inicio) se descarta en silencio al navegar; nada indica que el CTA ignora la selección |
| 2 | Match System / Real World | 3 | Copia es-HN natural ("carros", "viaje") |
| 3 | User Control and Freedom | 3 | Volver claro; fechas opcionales como camino seguro; sin control explícito de "limpiar" en el popover |
| 4 | Consistency and Standards | 2 | "Términos" `href="#"` muerto; "Ver todos →" vs "Ver el catálogo completo →" mismo destino, dos etiquetas; retry en catálogo ausente en destacados |
| 5 | Error Prevention | 3 | Fechas pasadas deshabilitadas; opcionalidad bien etiquetada |
| 6 | Recognition Rather Than Recall | 4 | Todo visible, sin menús ocultos ni jerga |
| 7 | Flexibility and Efficiency of Use | n/a | Superficie landing — aceleradores no aplican |
| 8 | Aesthetic and Minimalist Design | 3 | Composición limpia y de foco único; andamiaje convencional |
| 9 | Error Recovery | 2 | Error de destacados da consejo pero sin retry (catálogo sí tiene) |
| 10 | Help and Documentation | n/a | Superficie landing — sin expectativa de docs |
| **Total** | | **22/32 (69%)** | **Acceptable** |

(0 P0 · 2 P1 · 2 P2 · 1 P3)

## Design Specificity Verdict

**LLM assessment**: La decisión mechanism-first es específica del producto — el rango de fechas como primer acto y "El viaje empieza aquí" pertenecen a una renta de carros, no a un SaaS genérico. Pero el andamiaje de ejecución (hero centrado + destacados + rail de tres pasos + footer) es intercambiable entre categorías; casi cualquier marca de movilidad podría publicarlo igual. La mayor oportunidad perdida: el momento prometido ("aterrizas en un catálogo ya filtrado") es invisible — ocurre tras la navegación, en la URL. La superficie sabe dónde empieza el viaje pero no lo muestra empezando.

**Deterministic scan**: `impeccable detect --json` sobre los 6 archivos del Home → **0 findings** (limpio). El detector no detectó el enlace muerto, la brecha de fecha parcial, ni el riesgo de scroll en modal: son problemas de comportamiento, fuera de reglas estáticas de CSS/markup.

**Visual overlays**: No disponible — no hay herramienta de navegador expuesta en esta sesión; pasos de navegador omitidos con señal de fallback "no browser tool". Sin overlay visible fiable; evaluación basada en código fuente.

## Overall Impression

Un landing disciplinado y contenido que respeta el mundo crema/teal y mantiene un único CTA primario en el viewport — genuinamente limpio. Funciona, pero es seguro: la idea de "el viaje empieza aquí" vive en la copia, no en la composición. Los dos escapes funcionales reales (drop silencioso de fecha parcial, calendario de dos meses en móvil) están justo sobre la acción primaria, así que importan más que los detalles de pulido.

## What's Working

1. **Viewport de acción única**: un CTA teal, fechas opcionales claramente etiquetadas como "Opcional" — los primerizos no pueden fallar.
2. **Fechas como mecanismo**: elegir un rango y aterrizar con la URL pre-filtrada es el movimiento propio del producto, y `buildCatalogHref` lo mantiene compartible.
3. **Disciplina visual**: teal-sobre-superficie consistente, radios de 10px, Plus Jakarta, neutros cálidos; las celdas compactas de 36px afinan la única superficie densa.

## Priority Issues

**[P1] El único CTA ignora en silencio una selección parcial de fechas**
- Qué: seleccionar solo el inicio y el botón sigue diciendo "Buscar carros disponibles", pero `buildCatalogHref` devuelve `/catalogo` pelado (filtro descartado sin aviso).
- Por qué: promete resultado filtrado y entrega el catálogo sin filtrar; un resultado "silenciosamente incorrecto" erosiona la confianza en el mecanismo central.
- Fix: deshabilitar/renombrar el CTA hasta completar el rango ("Elige el fin antes de buscar") o reinterpretar la entrada parcial ("Desde el 15 sep en adelante") con pista visible en el trigger.
- Suggested command: /impeccable clarify

**[P1] El calendario de dos meses probablemente desborda pantallas pequeñas**
- Qué: `numberOfMonths={2}` con celdas de 36px ≈ 500px+ de ancho dentro de un popover en viewports de ~360–390px.
- Por qué: Casey a una mano se detiene cuando el calendario queda fuera de viewport y entra el scroll horizontal; el acto de las fechas es toda la premisa del home.
- Fix: un mes apilado en móvil (`matchMedia`/hook) o calendario como bottom-sheet bajo `sm:`.
- Suggested command: /impeccable adapt

**[P2] "Términos" es un enlace muerto** — `HomeFooter` apunta a `href="#"`. En una landing de primerizos, un ancla de confianza rota se lee como inacabada. Fix: quitarlo o apuntar a una ruta real. /impeccable harden

**[P2] El estado de error de destacados no tiene retry** — Destacados le dice al usuario que revise la conexión pero no ofrece reintento, mientras el catálogo muestra "Reintentar". Misma falla, dos modelos de recuperación. Fix: mismo botón (`useVehicles().refetch()`). /impeccable harden

**[P3] La copia del paso 3 sobrepromete el flujo** — "Reserva el carro que va contigo y sal a la carretera" afirma un paso de reserva que aún no existe; el Principio 5 exige honestidad de alcance. Fix: suavizar a "Asegúralo y sal..." o ligarlo a la verificación de disponibilidad de la página de detalle. /impeccable clarify

## Persona Red Flags

**Jordan (First-Timer)**: Enlace muerto "Términos" añade duda al escaneo. El auto-focus del popover del calendario es agresivo para un primer clic. Por lo demás, el CTA único + etiqueta "Opcional" lo mantiene a salvo.

**Riley (Stress Tester)**: Selecciona solo el inicio → el CTA produce catálogo sin filtrar sin explicación: una interacción que parece funcionar pero devuelve un resultado distinto al prometido. Además tantea "Términos" → nada.

**Casey (Distracted Mobile)**: El popover aguanta dos meses y probablemente excede el ancho del viewport al tocar; el CTA primario está a media página bajo el pliegue en vez de anclado al pulgar, pero es full-width y >44px — aceptable. Imágenes lazy, bien en 3G.

## Minor Observations

- "Catálogo" aparece tres veces (nav header, enlaces de destacados, footer) — el eco del footer es ruido.
- "Ver todos →" (desktop) vs "Ver el catálogo completo →" (móvil) — mismo destino, dos etiquetas.
- Copyright con "Todos los derechos reservados" — correcto para un demo.
- Detector limpio en los targets del home; los issues son de comportamiento, no detect-driven.

## Questions to Consider

- ¿Qué pasaría si el popover mostrara disponibilidad por día en vez de diferirla al catálogo — necesita el home dos pasos para probar el mecanismo?
- ¿Cómo se vería la composición si el calendario mismo (no un hero más una tarjeta de calendario) fuera el viewport?
- ¿El andamiaje hero-centrado se gana su lugar o es el movimiento por defecto?
