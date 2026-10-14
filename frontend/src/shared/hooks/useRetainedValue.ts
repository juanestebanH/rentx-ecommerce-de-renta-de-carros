import { useState } from 'react';

/**
 * Devuelve el último valor no nulo recibido. Sirve para que un panel en
 * animación de salida siga mostrando su contenido después de que el `open`
 * pasa a false y el dato original se limpia en el padre.
 */
export function useRetainedValue<T>(value: T | null): T | null {
  const [retained, setRetained] = useState<T | null>(value);

  if (value !== null && value !== retained) {
    setRetained(value);
  }

  return value ?? retained;
}
