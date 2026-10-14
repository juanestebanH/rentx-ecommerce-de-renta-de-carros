---
target: Home page (/)
total_score: 22
max_score: 32
na_heuristics: 7,10
p0_count: 0
p1_count: 1
p2_count: 3
p3_count: 1
target_identity: "file:D:\\rentx\\frontend\\src\\pages\\home\\HomePage.tsx"
target_fingerprint: "sha256:ae92fdde95bbe3d1e91ace539b595cdad449c36dafc327ba71a5ae4843d25257"
target_path: "D:\\rentx\\frontend\\src\\pages\\home\\HomePage.tsx"
timestamp: 2026-09-19T03-14-25Z
slug: src-pages-home-homepage-tsx
---
# Critique: Home page (/)

## Design Health Score

22/32 -> ~69% -> **Acceptable** (borderline Good). Heuristics 7 & 10 aren't applicable to a persuasive landing.

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Skeletons y crossfades informan bien; el pause del carrusel 3D al hover no tiene indicador visible |
| 2 | Match System / Real World | 2 | El hero dice "Colombia"; el producto es Honduras (es-HN, HNL). Mismatch de país = error de confianza |
| 3 | User Control and Freedom | 3 | Fechas limpiables, popovers cierran, carrusel pausable; sin atajos, pero no se necesitan aquí |
| 4 | Consistency and Standards | 3 | Contenedor max-w-6xl, radios, acento y kickers cohesivos; hero oscuro vs. estudio 3D claro rompen continuidad |
| 5 | Error Prevention | 3 | Devolución validada tras recogida, minDate, CTA nunca muerto (fallback a /catalogo) |
| 6 | Recognition Rather Than Recall | 3 | Pips + chevrons + hint cubren la navegación; el gesto swipe-vs-rotate no se descubre sin prueba y error |
| 7 | Flexibility and Efficiency | n/a | Landing persuasiva; sin power users |
| 8 | Aesthetic and Minimalist Design | 3 | Hero limpio y focalizado; el carro rotando + el stage 3D a viewport completo añaden peso |
| 9 | Error Recovery | 2 | Categorías desaparecen en silencio sin foto (grid agujereado); contador muestra '—' con copia inusual |
| 10 | Help and Documentation | n/a | Landing; la hint del 3D es suficiente |
| **Total** | | **22/32** | **Acceptable** |

## Design Specificity Verdict

**LLM:** Alto en lo estructural — el hero "empieza por las fechas", el turntable 3D de la flota real y el sistema crema/grafito/teal están escritos para RentX, no intercambiables. Dos rupturas de especificidad: la copia "Colombia" (contradice el país de la marca) y el carro de hero auto-rotando que revive un carrusel que el brief eliminó deliberadamente.

**Deterministic scan:** `impeccable detect --json src/pages/home src/shared/components/Header.tsx` -> **limpio (0 findings)**. Sin hallazgos mecánicos.

**Visual overlays:** sin overlay — no hay tool de browser disponible en esta sesión, así que no hay inspección visual en vivo ni se puede medir el contraste del glass sobre las fotos (el gap conocido del detector headless).

## Overall Impression

Craft real y una decisión de producto bien planteada: la primera acción del visitante es su decisión real (las fechas). El mayor riesgo no es el diseño, es la coherencia interna: el mundo "film oscuro" del hero y el "estudio claro" del 3D conviven sin transición, el carro del hero se mueve solo, y el texto cita el país equivocado. El turntable 3D es el momento memorable de la página y merece que el resto no le compita.

## What's Working

1. **El hero es el producto, no un eslogan.** La cápsula glass (Recogida -> Devolución -> CTA teal) ejecuta la decisión nº1 del cliente en el primer viewport, con validación de rango embebida (HomeDatePicker) y un CTA que nunca es callejón sin salida.
2. **El turntable 3D es genuinamente memorable y específico.** Cinco GLB de flota real, gesto híbrido swipe/rotate pausable al hover, y la tarjeta de nombre en glass (FeaturedVehicles) — esto no lo tiene "cualquier rentadora".
3. **OWN-WORLD ejecutado con disciplina.** Crema/grafito/teal aplicados solo en superficies, --accent-bg/--accent-border, Plus Jakarta, radios consistentes — y cumplimiento AA donde se mide.

## Priority Issues

**[P1] Copia de país incorrecta: "Colombia" vs. Honduras**
HeroSection.tsx:93 ("Renta de carros en Colombia") y :106 ("moverte por Colombia").
- Why: PRODUCT.md y el surface brief fijan Honduras + es-HN + HNL. Un usuario de Honduras leyendo Colombia duda de si este es su sitio — es el primer mensaje de la marca.
- Fix: Poner "Honduras", o confirmar un pivote de país real y migrar la moneda y locale con él.
- Command: /impeccable clarify

**[P2] El carro del hero rota solo cada 6s y lastra la carga**
HeroSection.tsx:39-60,132-146 — crossfade de 4 PNGs TODOS loading="eager", mientras el brief eliminó el carrusel y fijó "elegido al azar por carga".
- Why: el auto-crossfade compite con el CTA de fechas, revive el patrón que se descartó, y 4 imágenes eager (Supabase) retrasan la LCP.
- Fix: una sola imagen estática por carga (preload solo la primera, resto lazy) o rotación mucho más lenta solo en desktop.
- Command: /impeccable distill (+ /impeccable optimize)

**[P3] Stage 3D a viewport completo: difiere del brief y no respeta reduced-motion**
FeaturedVehicles.tsx:62 -> h-[68svh]/h-svh frameless (el brief documenta una tarjeta 360–520px con escenario con gradiente).
- Why: auto-advance 7s corre aunque prefers-reduced-motion: reduce; rotar el carro no tiene equivalente de teclado; y el corte oscuro->claro tras el hero es brusco.
- Fix: decidir si el stage full-viewport es la dirección nueva (actualizar el brief) o reducirlo a tarjeta; gatear auto-advance y transiciones con reduced-motion.
- Command: /impeccable adapt (+ /impeccable audit)

**[P4] Seis fetches del catálogo en una landing**
WhyRentX (lista completa para el contador), PopularCategories (categorías) y 4x useVehicles({id_categoria}) solo para sacar UNA foto por card.
- Why: primer load pesado y frágil contra el API; si una categoría no tiene foto, la card devuelve null y el grid queda agujereado sin mensaje.
- Fix: un único query compartido (derivar contador y foto por categoría client-side) + estado vacío explícito en el grid.
- Command: /impeccable optimize

**[P3] Overlay del hero en negro puro, no grafito cálido**
HeroSection.tsx:79 usa rgba(0,0,0,…); el mundo OWN-WORLD y el brief son #2B241E/rgba(20,15,10,…).
- Why: el black lavado enfría la foto y choca con las secciones crema; la calidez de la marca se pierde justo en su gesto más grande.
- Fix: reemplazar por tonos cálidos de grafito manteniendo AA sobre el texto.
- Command: /impeccable colorize

## Persona Red Flags

**Jordan (Primera vez):** El kicker "Renta de carros en Colombia" lo hará dudar si entró al sitio correcto (Honduras) — riesgo de rebote inmediato. "Agrega fecha" x2 + CTA teal son claros; el auto-crossfade del carro puede leerse como publicidad en vez de contenido.

**Casey (Mobile distraído):** Los 5 GLB se pre-cargan y el Canvas corre a dpr [1,2] en un viewport completo (Car3DViewer) — kilómetros de GPU + datos móviles en una landing. El gesto híbrido con umbral 10px y ratio 1.5 (Car3DViewer:265-271) atasca el pulgar: quería girar y cambió de carro.

**Riley (Stress tester):** Elegir solo "Devolución" produce /catalogo?fecha_fin=… sin fecha_inicio (HomeDatePicker) — link mal formado para el catálogo. Con el API caído, las categorías desaparecen sin mensaje y el contador muestra '—' + una frase que no aclara nada (WhyRentX).

## Minor Observations

- isDesktop se congela al mount (HeroSection:42-47): rotar de móvil->desktop nunca activa el parallax.
- El crossfade del carro deja "fantasma" (dos carros superpuestos) durante la transición de 1s.
- El brief menciona FeaturedVehicleCard.tsx y un stage 360–520px con gradiente que ya no existe en código — brief y build divergieron; decidir cuál es la dirección documentada.
- El footer tiene un solo link (HomeFooter): correcto, pero pobre para explorar una landing.
- CTA del hero sin fechas -> /catalogo sin filtro (bien que no sea dead-end); el label "Buscar carros disponibles" descoloca un poco cuando no hay fechas puestas.

## Questions to Consider

- ¿El hero debería mostrar el mismo carro que el turntable 3D, para que el "film oscuro" y el "estudio claro" se sientan un solo producto?
- ¿"Colombia" es un pivote real? Si lo es, hay que migrar HNL y es-HN; si no, es un copy-error que se corrige en una línea.
- ¿Cuál es la identidad de Home: el film oscuro del hero o el estudio claro del 3D? Hoy conviven sin transición.
- ¿Un solo query del catálogo (caché compartida) pagaría contador + categorías + destacados?
