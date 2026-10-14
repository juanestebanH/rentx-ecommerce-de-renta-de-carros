/**
 * Estándar de fotos de vehículo. Las pantallas las muestran en cajas 16:9 con
 * `object-contain` sobre un fondo desenfocado, así que ninguna proporción se
 * corta; el estándar solo existe para que la foto se vea nítida y sin bandas.
 */
export const FOTO_IDEAL_ANCHO = 1600;
export const FOTO_IDEAL_ALTO = 900;
export const FOTO_MIN_ANCHO = 1200;
export const FOTO_MIN_ALTO = 675;
export const FOTO_RATIO_MIN = 1.6;
export const FOTO_RATIO_MAX = 2;
export const FOTO_MAX_BYTES = 5 * 1024 * 1024;
export const FOTO_MIMES = ['image/jpeg', 'image/png', 'image/webp'];

export interface FotoDimensiones {
  ancho: number;
  alto: number;
}

export type ResultadoValidacionFoto =
  | { ok: true }
  | { ok: false; mensaje: string };

export function textoRecomendacionFoto(): string {
  return `Recomendado ${FOTO_IDEAL_ANCHO}×${FOTO_IDEAL_ALTO} px (16:9), mínimo ${FOTO_MIN_ANCHO}×${FOTO_MIN_ALTO} px · JPG, PNG o WebP · máx. ${FOTO_MAX_BYTES / (1024 * 1024)} MB`;
}

function ratio(dimensiones: FotoDimensiones): number {
  return dimensiones.ancho / dimensiones.alto;
}

export function validarFotoVehiculo(input: {
  dimensiones: FotoDimensiones;
  bytes?: number;
  mime?: string;
}): ResultadoValidacionFoto {
  const { ancho, alto } = input.dimensiones;

  if (input.mime && !FOTO_MIMES.includes(input.mime)) {
    return {
      ok: false,
      mensaje: 'La foto debe ser un archivo JPG, PNG o WebP.',
    };
  }

  if (
    typeof input.bytes === 'number' &&
    input.bytes > FOTO_MAX_BYTES
  ) {
    return {
      ok: false,
      mensaje: `La foto pesa ${(input.bytes / (1024 * 1024)).toFixed(1)} MB y el máximo es ${FOTO_MAX_BYTES / (1024 * 1024)} MB.`,
    };
  }

  if (ancho < FOTO_MIN_ANCHO || alto < FOTO_MIN_ALTO) {
    return {
      ok: false,
      mensaje: `La foto mide ${ancho}×${alto} px y el mínimo es ${FOTO_MIN_ANCHO}×${FOTO_MIN_ALTO} px. Sube una imagen más grande o recórtala sin perder resolución.`,
    };
  }

  const r = ratio(input.dimensiones);
  if (r < FOTO_RATIO_MIN || r > FOTO_RATIO_MAX) {
    return {
      ok: false,
      mensaje: `La foto mide ${ancho}×${alto} px (proporción ${r.toFixed(2)}) y se espera una de 16:9 (${FOTO_IDEAL_ANCHO}×${FOTO_IDEAL_ALTO} px).`,
    };
  }

  return { ok: true };
}

export async function leerDimensionesArchivo(
  file: File,
): Promise<FotoDimensiones> {
  if (typeof createImageBitmap === 'function') {
    const bitmap = await createImageBitmap(file);
    const dimensiones = { ancho: bitmap.width, alto: bitmap.height };
    bitmap.close();
    return dimensiones;
  }

  return new Promise<FotoDimensiones>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ ancho: img.naturalWidth, alto: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('No se pudo leer la imagen.'));
    };
    img.src = url;
  });
}

/** Dimensiones de una foto ya subida. `naturalWidth` sí es legible
 *  cross-origin, a diferencia de los píxeles del canvas, así que funciona con
 *  las URLs públicas del bucket sin configurar CORS. */
export async function leerDimensionesUrl(
  url: string,
): Promise<FotoDimensiones | null> {
  return new Promise<FotoDimensiones | null>((resolve) => {
    const img = new Image();
    img.onload = () =>
      resolve({ ancho: img.naturalWidth, alto: img.naturalHeight });
    img.onerror = () => resolve(null);
    img.src = url;
  });
}