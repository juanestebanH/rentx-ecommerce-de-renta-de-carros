---
name: RentX
description: Plataforma moderna de alquiler de autos en Colombia
colors:
  background: '#faf7f2'
  foreground: '#2b241e'
  card: '#faf7f2'
  card-foreground: '#2b241e'
  popover: '#faf7f2'
  popover-foreground: '#2b241e'
  primary: '#0f766e'
  primary-foreground: '#f4faf9'
  secondary: '#f2eae0'
  secondary-foreground: '#584f3f'
  muted: '#f2eae0'
  muted-foreground: '#7d7463'
  accent: '#e9f7f5'
  accent-foreground: '#1f5e58'
  accent-band: '#ecf7f7'
  destructive: '#a6322c'
  destructive-foreground: '#fff5ee'
  border: '#e7ded0'
  input: '#e7ded0'
  ring: '#0f766e'
  chart-1: '#178f8a'
  chart-2: '#33b5a3'
  chart-3: '#ffb24d'
  chart-blue: '#4f7bd9'
...

# Design System: RentX

## Overview

**Creative North Star:** "Confianza cálida y profesional.`n
RentX es una plataforma de alquiler de vehículos en Colombia que transmite confianza, transparencia y cercanía. El sistema de diseño apuesta por una estética sobria con toques cálidos: fondo crema arena (#FAF7F2), acentos en teal profesional (#0F766E) y textos en grafito cálido (#2B241E) que favorecen la legibilidad y generan una sensación acogedora.

**Key Characteristics:**
- **Cálido y profesional:** Combina tonos terrosos y teales para generar confianza sin perder cercanía.
- **Transparente y honesto:** El diseño prioriza claridad, precios visibles y sin elementos decorativos engañosos.
- **Funcional por diseño:** Enfatiza usabilidad, accesibilidad y jerarquía clara para facilitar la toma de decisiones.

## Colors

La paleta está pensada para transmitir confianza y calidez, con neutros cálidos y un acento teal profesional que guía la acción.

### Primary
- **Teal profesional** (#0F766E / oklch(0.5109 0.0861 186.4)): Color principal para botones, acciones y elementos destacados. Usado para guiar al usuario hacia la conversión.

### Secondary
- **Arena suave** (#F2EAE0 / oklch(0.9378 0.0188 75.3)): Fondos secundarios y sutiles separadores para crear ritmo visual sin romper la armonía.

### Accent
- **Teal tenue** (#E9F7F5 / oklch(0.9429 0.0212 189.6)): Superficies destacadas y estados hover suaves. Complementa el primary sin competir con él.
- **Banda teal clara** (#ECF7F7 / oklch(0.936 0.029 191.5)): Usado para secciones destacadas (ccent-band) que necesitan diferenciarse del fondo base crema.

### Neutral
- **Crema hueso** (#FAF7F2 / oklch(0.9771 0.0074 80.7)): Fondo base por defecto. Proporciona calidez y reduce el contraste agresivo.
- **Grafito cálido** (#2B241E / oklch(0.2662 0.0152 62.7)): Color de texto principal. Alto contraste sobre fondos claros.
- **Gris cálido medio** (#7D7463 / oklch(0.549 0.0247 69.5)): Texto secundario y descripciones. Equilibra legibilidad y jerarquía.
- **Arena borde** (#E7DED0 / oklch(0.8997 0.0213 72.1)): Bordes, inputs y separadores sutiles.

### Semantic
- **Destructivo** (#A6322C / oklch(0.5001 0.1456 31.1)): Acciones peligrosas (cerrar sesión, eliminar). Siempre con texto blanco (#FFF5EE).

### Data Visualization
- **Chart 1 - Teal** (#178F8A / oklch(0.54 0.086 186.4)): Datos operativos y disponibilidad.
- **Chart 2 - Teal claro** (#33B5A3 / oklch(0.62 0.075 188.5)): Estados complementarios.
- **Chart 3 - Ámbar** (#FFB24D / oklch(0.66 0.12 58)): Usado intencionalmente para destacar flota en mantenimiento, rompiendo la gama teal.
- **Chart Blue - Azul acero** (#4F7BD9 / oklch(0.58 0.09 238)): Diferencia "Rentados" de "Disponibles".

### Named Rules
**The Warm-Neutral Rule.** Los neutros son cálidos (arena, nunca gris frío). Esto mantiene la coherencia con el tono acogedor de la marca.

**The Accent Discipline Rule.** El color primary (#0F766E) se reserva para CTAs principales y acciones críticas. Su uso debe ser intencional para preservar su impacto visual.
## Typography

**Display Font:** Plus Jakarta Sans Variable (fallback: Plus Jakarta Sans, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif)
**Body Font:** Plus Jakarta Sans Variable (fallback: Plus Jakarta Sans, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif)
**Label/Mono Font:** ui-monospace, SF Mono, JetBrains Mono, Consolas, Liberation Mono, monospace (para código)

**Character:** Tipografía moderna sin serif, con gran legibilidad y tono profesional pero cálido. Plus Jakarta Sans transmite solidez y contemporaneidad, coherente con la identidad RentX.

### Hierarchy
- **Display** (700, clamp(2.25rem, 5.5vw, 3.75rem), line-height 1.05, letter-spacing -0.025em): Usado en H1 de hero y títulos principales de alta jerarquía. Genera impacto y define la narrativa de la página.
- **Headline** (600, clamp(1.5rem, 3vw, 2.25rem), line-height 1.15, letter-spacing -0.02em): Títulos de sección (H2). Estructura el contenido y guía la lectura.
- **Title** (600, clamp(1.125rem, 2.2vw, 1.5rem), line-height 1.2, letter-spacing -0.015em): Subtítulos y encabezados de tarjetas (H3). Jerarquiza información dentro de bloques.
- **Body** (400, 1rem, line-height 1.65, letter-spacing 0.01125rem): Texto de cuerpo principal. Optimizado para lectura cómoda con ancho máximo recomendado de 65-75ch.
- **Label** (500, 0.875rem, line-height 1.25, letter-spacing 0.01em): Botones, etiquetas, chips y texto de interfaz. Prioriza claridad y reconocimiento.

### Named Rules
**The Balanced Tracking Rule.** El espaciado entre letras es negativo en títulos (-0.015em a -0.025em) para mejorar la densidad visual y legibilidad a gran tamaño, mientras que en cuerpo es levemente positivo (0.01125rem) para facilitar la lectura prolongada.

**The Responsive Scale Rule.** Los tamaños display/headline/title utilizan clamp() para escalar fluidamente entre breakpoints, evitando saltos bruscos y manteniendo proporciones armoniosas.
## Layout

El sistema utiliza un enfoque centrado en contenedores con espaciado rítmico y diseño responsive mobile-first.

- **Contenedor principal:** max-w-6xl (1152px) con padding horizontal px-4 sm:px-6 para márgenes seguros en todos los breakpoints.
- **Espaciado base:** Escala modular basada en múltiplos de 4 (4, 8, 16, 24, 32, 48). Usa incrementos consistentes para crear ritmo vertical y horizontal predecible.
- **Grid y flex:** Layouts predominantemente en Flexbox y Grid CSS. Las secciones usan espaciados consistentes (gap-6, gap-4) según densidad del contenido.
- **Breakpoints:** Mobile-first con sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px). En móvil el tamaño de fuente base baja a 16px (vs 18px en desktop) para optimizar legibilidad.
- **Densidad:** Layouts de catálogo usan sidebar lateral en pantallas con varios filtros (no barra horizontal), siguiendo la convención del proyecto. Cards usan gap-6 interno y espaciado generoso para respiración visual.
- **Ritmo vertical:** Secciones separadas con padding vertical py-16 sm:py-20 para crear jerarquía entre bloques de contenido.

### Named Rules
**The Container Consistency Rule.** Todas las secciones principales comparten el mismo ancho máximo (max-w-6xl) y padding horizontal, creando una línea vertical invisible que guía la lectura a lo largo de la página.

**The Breathing Room Rule.** Se prioriza el espacio negativo (padding/margin generosos) sobre la compresión. Esto mejora la legibilidad y transmite la sensación de transparencia que caracteriza la marca.
## Elevation & Depth

RentX utiliza un enfoque **layered-flat**: las superficies son mayormente planas por defecto, con elevación sutil aplicada solo para estados interactivos y elementos flotantes.

- **Superficies base:** Fondo crema (#FAF7F2) plano. Cards usan shadow-sm (sombra muy tenue) para crear separación sutil del fondo sin romper la estética minimalista.
- **Elevación interactiva:** En elementos con hover (cards de vehículos), se incrementa la sombra a shadow-md con transición suave (duration-300 ease-out) para dar feedback táctil sin distracciones.
- **Elementos flotantes:** Dropdowns, modales y drawers utilizan sombras para elevarse sobre el contenido. Los overlays mantienen opacidad suficiente para no oscurecer excesivamente el fondo cálido.
- **Profundidad mediante color:** En lugar de depender exclusivamente de sombras, el sistema usa capas tonales (ej. ccent-band vs ackground) para crear jerarquía visual. Esto refuerza el carácter cálido y minimalista.

### Named Rules
**The Flat-By-Default Rule.** Las superficies permanecen planas en reposo. La elevación aparece únicamente como respuesta a estado (hover, focus, open) para guiar la atención del usuario de forma intencional.

**The Subtly-Lifted Rule.** Cuando hay elevación, es tenue y cálida. Nunca se usan sombras duras o frías que rompan la armonía cromática del sistema.
## Shapes

El lenguaje formal de RentX es **suave y profesional**, con bordes redondeados moderados que transmiten accesibilidad sin perder solidez.

- **Radio base:** --radius: 10px (definido en :root). Escala derivada estilo shadcn: sm: calc(radius-4)=6px, md: calc(radius-2)=8px, lg: 10px, xl: calc(radius+4)=14px.
- **Botones:** Radio md (8px) - redondeado suficiente para look moderno, pero no infantil.
- **Cards:** Radio xl (14px) - más redondeado para dar suavidad y carácter distintivo a las superficies de contenido.
- **Inputs y controles:** Radio md (8px) - coherente con botones para crear ritmo visual unificado.
- **Chips/Badges:** Radio md (8px) o acorde al componente. Usan padding compacto para mantener legibilidad.
- **Esquinas:** Predominantemente redondeadas. No se usan esquinas completamente cuadradas (0px) salvo casos muy puntuales en elementos decorativos o divisores.
- **Bordes:** order-border (#E7DED0) con grosor 1px. Sutiles, casi imperceptibles, sirven para separar sin romper la continuidad visual.

### Named Rules
**The Measured Roundness Rule.** El redondeo es mesurado (8-14px). Ni excesivamente redondeado (look infantil), ni completamente anguloso (look frío o corporativo rígido). Busca el punto medio entre calidez y profesionalismo.

**The Unified Radius Rule.** Se mantiene coherencia entre grupos afines (botones + inputs comparten md) para crear familias visuales reconocibles.
## Components

Los componentes siguen la filosofía shadcn/ui con personalización acorde a la identidad RentX. Cada componente prioriza accesibilidad, estados claros y feedback visual coherente.

### Buttons
- **Shape:** Radio md (8px). Altura por defecto 36px (h-9), padding 16px horizontal.
- **Primary (default):** Fondo primary (#0F766E), texto primary-foreground (#F4FAF9). Hover: g-primary/90 (ligero oscurecimiento). Transición suave para feedback táctil.
- **Secondary:** Fondo secondary (#F2EAE0), texto secondary-foreground (#584F3F). Hover: g-secondary/80. Ideal para acciones secundarias.
- **Outline:** Fondo ackground (#FAF7F2), borde order (#E7DED0), texto oreground (#2B241E). Hover: g-accent (#E9F7F5). Ofrece alternativa neutra con presencia.
- **Ghost:** Fondo transparente, texto oreground. Hover: g-accent (#E9F7F5). Para acciones de baja jerarquía en navegación.
- **Destructive:** Fondo destructive (#A6322C), texto blanco. Hover: g-destructive/90. Con focus ring rojo para indicar peligro.
- **Link:** Texto primary (#0F766E), subrayado al hover. Para navegación contextual.
- **Focus:** Ring de 3px con color ing (#0F766E) y opacidad 50% (ocus-visible:ring-ring/50). Cumple con indicadores de foco accesibles.
- **Sizes:** xs (24px), sm (32px), default (36px), lg (40px), icon variants para acciones compactas.

### Cards
- **Shape:** Radio xl (14px), borde 1px (order), fondo card (#FAF7F2), sombra shadow-sm. Padding interno 24px (py-6 px-6).
- **Character:** Superficies acogedoras y respiradas. Usadas para listados de vehículos, features y contenedores de contenido.
- **Header/Content/Footer:** Estructura modular con espaciados consistentes. Soportan acciones en header mediante grid layout.
- **Hover (interactive):** En cards clicables (VehicleCardHorizontal), hover:shadow-md con 	ransition-shadow duration-300 ease-out y sutil scale-[1.03] en imagen para dinamismo orgánico.

### Inputs & Fields
- **Style:** Fondo ackground, borde input (#E7DED0), radio md (8px), altura h-9, padding px-3. Texto oreground, placeholder muted-foreground.
- **Focus:** Borde ing (#0F766E) con ring de foco visible. Transición suave.
- **States:** Disabled con opacidad 50%, aria-invalid con borde destructive y ring destructivo.
- **Calendar/Select/Popover:** Heredan tokens del sistema (fondos cálidos, bordes coherentes, sombras sutiles).

### Badges
- **Style:** Radio md (8px), padding compacto, variante secondary por defecto. Usados para estados (ej. no activo) con fondo secondary y texto secondary-foreground.
- **Character:** Etiquetas discretas que comunican estado sin robar atención al contenido principal.

### Navigation (Header)
- **Style:** Fondo card (#FAF7F2) con borde inferior order. En modo transparente (Home hero), fondo dinámico: film (gba(0,0,0,0)) → glass (gba(250,247,242,0.95)) al hacer scroll (umbral 80px).
- **Links:** Ghost buttons con transición de color. En hero transparente, texto blanco con sombra suave para contraste sobre imagen.
- **Logo:** Ícono con badge redondeado (ounded-full) en tono accent sobre primary para reforzar identidad.
- **Mobile:** Menú lateral con overlay, animado con framer-motion, cierra con ESC o click fuera.

### Dropdown Menu
- **Style:** Fondo popover (#FAF7F2), borde order, radio md (8px), sombra para elevación. Items con hover ccent, item destructivo con color destructive.
- **Alignment:** End por defecto para menú de usuario.

### Skeletons
- **Style:** Animación pulse con fondo muted (#F2EAE0). Usados para estados de carga (catálogo, estadísticas).

### Data Display (Cards con métricas)
- **KPI Cards:** Usan fondo blanco sobre ccent-band en secciones destacadas, con íconos en círculo con ccent-bg (#E9F7F5) y color primary (#0F766E). Transiciones sutiles con spring en hover para feedback orgánico.

### Named Rules
**The Tactile Feedback Rule.** Todos los elementos interactivos (botones, cards clicables, links) tienen feedback visual claro (cambio de color, sombra o escala sutil) con transiciones de 200-300ms para sensación natural.

**The Accessible Focus Rule.** El focus ring primario usa color ring (#0F766E) con suficiente contraste y grosor (3px) visible. Nunca se elimina el focus-visible sin proporcionar alternativa accesible.

**The Consistent Family Rule.** Componentes relacionados comparten radio, espaciado y patrones de color para crear familias visuales reconocibles y predecibles.
## Do's and Don'ts

### Do
- **Do** usar el tema claro por defecto. El fondo crema (#FAF7F2) es el lienzo base en toda la aplicación.
- **Do** priorizar el acento teal (#0F766E) solo para CTAs principales y acciones críticas. Su rareza preserva su impacto.
- **Do** mantener neutros cálidos (arena/borde crema-oscuro) — nunca introducir grises fríos en superficies principales.
- **Do** respetar el espaciado rítmico (múltiplos de 4). Usa gap-6, p-6, py-16 para mantener coherencia.
- **Do** aplicar elevación solo en respuesta a estado (hover, focus, open). Las superficies en reposo deben permanecer planas.
- **Do** usar clamp() y unidades relativas para tipografía responsive. Mantén el tracking negativo solo en títulos.
- **Do** preservar nombres de campos en español tal como vienen del backend — esto es un contrato, no un detalle de UI.
- **Do** diseñar pensando en legibilidad: texto secundario (#7D7463) solo sobre fondos claros con suficiente contraste.

### Don't
- **Don't** usar el color primary como texto sobre fondo claro. Usa siempre primary-foreground (#F4FAF9) sobre fondos primary, o ccent-foreground (#1F5E58) sobre superficies accent.
- **Don't** añadir comentarios al código generado a menos que el usuario lo solicite explícitamente (principio del proyecto).
- **Don't** anidar cards (card dentro de card). Esto rompe la jerarquía visual y la respiración del diseño.
- **Don't** inventar claims o testimonios inexistentes. El proyecto es demo — sé honesto sobre el alcance.
- **Don't** traducir nombres de entidades del backend al inglés. Los tipos deben mantener los nombres en español.
- **Don't** forzar modo oscuro. La variante dark solo aplica con clase .dark (toggle manual futuro), nunca por prefers-color-scheme.
- **Don't** usar sombras duras o excesivas. Opta por sombras sutiles (shadow-sm/shadow-md) que armonicen con el tono cálido del fondo.
