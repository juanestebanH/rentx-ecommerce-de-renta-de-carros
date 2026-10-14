const CATEGORIA_LABELS: Record<string, string> = {
  cars: 'Autos',
  suvs: 'SUVs',
  hatchbacks: 'Hatchbacks',
  sedans: 'Sedanes',
  camionetas: 'Camionetas',
  pickups: 'Pickups',
  vans: 'Vans',
  economicos: 'Económicos',
  lujo: 'Lujo',
};

function capitalizarCategoria(value: string): string {
  return value
    .split('_')
    .map((palabra) => palabra.charAt(0).toUpperCase() + palabra.slice(1))
    .join(' ');
}

/**
 * El catálogo guarda las categorías como identificadores normalizados
 * (`sedans`, `suvs`), así que se humanizan para mostrarlas en la interfaz.
 */
export function categoriaLabel(value: string): string {
  return CATEGORIA_LABELS[value.toLowerCase()] ?? capitalizarCategoria(value);
}