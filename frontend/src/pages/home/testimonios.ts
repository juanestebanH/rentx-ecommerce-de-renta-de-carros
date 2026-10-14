// EJEMPLO — copy genérico de demostración, sin personas reales.
// Reemplazar por reseñas reales (o vaciar) antes de cualquier uso real.
// Desviación autorizada por el usuario respecto a PRODUCT.md §Evidence
// ("future work must not fabricate them") y DESIGN.md (no inventar testimonios).
export interface Testimonio {
  texto: string;
  contexto: string;
}

export const TESTIMONIOS: Testimonio[] = [
  {
    texto: 'Reservar fue rápido y el carro estaba impecable al recogerlo.',
    contexto: 'Viaje de fin de semana',
  },
  {
    texto: 'Encontré disponibilidad para mis fechas en segundos.',
    contexto: 'Viaje de negocios',
  },
  {
    texto: 'Sin sorpresas con el precio, y el soporte respondió al instante.',
    contexto: 'Viaje familiar',
  },
];
