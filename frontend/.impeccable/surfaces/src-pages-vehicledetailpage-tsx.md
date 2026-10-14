---
version: 1
slug: "src-pages-vehicledetailpage-tsx"
primary_target: "src/pages/VehicleDetailPage.tsx"
related_targets: ["src/features/vehicles/components/VehicleDetailInfo.tsx","src/features/vehicles/components/ReservationRail.tsx","src/features/vehicles/components/VehicleDetailSkeleton.tsx","src/features/vehicles/hooks/useVehicles.ts","src/features/vehicles/components/VehicleCardHorizontal.tsx","src/pages/VehicleCatalogPage.tsx"]
---

# Surface: Detalle de vehículo (`/carros/:id`)

- **Scope y modo:** página pública, sin auth. Cliente llega desde el catálogo (o el home) ya con intención de reservar; modo Operate.
- **Audiencia/trabajo:** cliente con fechas en mente (heredadas por URL o elige aquí); lo que decide es si el carro le sirve y si está disponible para su rango; total en COP claro antes de actuar.
- **Acción/prueba:** ver foto y especificaciones reales del vehículo, confirmar disponibilidad para su rango de fechas (llamada real a `/api/rentals/check-availability`) y conocer el total COP calculado de `tarifa × días`. CTA "Reservar" es el hand-off del flujo futuro de renta: presente y honesto, avisa que el flujo se habilita pronto, sin simular una confirmación.
- **Restricciones:** nombres de campo en español del backend intactos; COP `es-CO`; `formatTarifa`/`transmisionLabel`/`categoriaLabel` reutilizados; idioma español; realidad del scope demo (sin inventar claims ni un flujo de reserva ficticio); layout en dos columnas en desktop — imagen/especificaciones a la izquierda, rail de reserva sticky a la derecha; fechas editables inline (reutiliza `FechaRangeInputs`); fechas sembradas desde URL (`fecha_inicio`/`fecha_fin`) y sincronizadas de vuelta a la URL al editarlas; único CTA primario = Reservar.
- **Dirección elegida y momento memorable:** las especificaciones y la foto cuentan el carro; el rail teal/luz de disponibilidad decide si ese carro es tuyo en esas fechas. El momento memorable es el veredicto de disponibilidad: "Disponible en estas fechas" con total COP, único lugar donde el existe-to-existisse se vuelve concreto.

## Direction contract

**THESIS:** el detalle no es una ficha decorativa, es el momento de decisión: quién decide es el veredicto de disponibilidad con su total, no una galería de fotos con un botón muerto — rechaza la ficha-catálogo genérica (specs interminables + CTA que lleva a otro formulario).

**OWN-WORLD:** herencia del mundo incumbente en código (fondo crema, grafito cálido, acento teal `#0F766E` en superficies/bordes/iconos, texto `#F4FAF9` sobre acento, `#8FD9CE` solo sobre oscuro, `#8FD9CE` prohibido como texto sobre claro, usar `accent-border`/`accent-bg`); Plus Jakarta Sans; radios 10px; `Card`, `Badge`, `Button`, `FechaRangeInputs`, `formatTarifa`/`transmisionLabel`/`categoriaLabel`; precios `tabular-nums`.

**STORY:** el cliente llega con (o elige) fechas, ve el carro completo —foto, specs reales, equipamiento—, y en un solo veredicto teal sabe si está disponible, cuánto cuesta el rango completo en COP y qué botón tocar; si falta disponibilidad o fechas, se lo dice con la misma claridad y puede corregirlo inline.

**FIRST VIEWPORT:** encabezado del carro (nombre + año + badge de mantenimiento si aplica) con volver al catálogo; gran imagen 4:3 a la izquierda con las especificaciones y el equipamiento bajo ella; a la derecha (sticky en desktop, apilado en móvil) el rail de reserva: selector de fechas inline, veredicto de disponibilidad (estados: elegir fechas / verificando / disponible / no disponible / error con reintento), desglose COP (tarifa/día × N días = total) y el único CTA teal "Reservar", honesto respecto al flujo pendiente.

**FORM:** rail de reserva sticky con veredicto de disponibilidad como mecanismo, dentro del mundo existente (forma 3 de una extensión de superficie operativa); sin seed de script (no aplica rodado ni comp; build code-led).

**FINISH:** unreviewed and undocumented is unfinished; esta build termina con capturas desktop/mobile, el detector, el finish review y el documento de extensión tras la revisión visual del usuario.
