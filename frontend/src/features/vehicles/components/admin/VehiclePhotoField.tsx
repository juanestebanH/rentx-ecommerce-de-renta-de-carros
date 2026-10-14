import { useRef, useState } from 'react';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { VehiclePhotoFrame } from '../VehiclePhotoFrame';
import { vehicleErrorMensaje } from '../../utils/vehicle.format';
import {
  leerDimensionesArchivo,
  textoRecomendacionFoto,
  validarFotoVehiculo,
  type FotoDimensiones,
} from '../../utils/vehiclePhoto';

interface VehiclePhotoFieldProps {
  foto: string | null;
  dimensiones: FotoDimensiones | null;
  nombre: string;
  disabled: boolean;
  /** Error que ya vive en el padre (foto guardada no conforme): bloquea el
   *  guardado, así que se muestra aquí aunque no haya subida en curso. */
  aviso: string | null;
  /** El padre guarda el error de la foto rechazada: bloquea el guardado. */
  onPhotoRejected: (mensaje: string) => void;
  onPhotoAccepted: (dimensiones: FotoDimensiones | null) => void;
  onChange: (foto: string | null) => void;
  onUploadPhoto: (file: File) => Promise<string>;
}

export function VehiclePhotoField({
  foto,
  dimensiones,
  nombre,
  disabled,
  aviso,
  onPhotoRejected,
  onPhotoAccepted,
  onChange,
  onUploadPhoto,
}: VehiclePhotoFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const medidas = await leerDimensionesArchivo(file);
      const validacion = validarFotoVehiculo({
        dimensiones: medidas,
        bytes: file.size,
        mime: file.type,
      });
      if (!validacion.ok) {
        setError(validacion.mensaje);
        onPhotoRejected(validacion.mensaje);
        return;
      }
      const url = await onUploadPhoto(file);
      onChange(url);
      onPhotoAccepted(medidas);
    } catch (uploadError) {
      setError(
        vehicleErrorMensaje(
          uploadError,
          'No se pudo subir la foto. Intenta de nuevo.',
        ),
      );
    } finally {
      setUploading(false);
    }
  };

  const quitarFoto = () => {
    setError(null);
    onChange(null);
    onPhotoAccepted(null);
  };

  return (
    <section aria-labelledby="foto-titulo" className="rounded-xl border bg-card p-5 shadow-sm">
      <h3 id="foto-titulo" className="text-base font-semibold tracking-tight">
        Foto
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Imagen principal del vehículo en el catálogo. {textoRecomendacionFoto()}.
      </p>
      {dimensiones && (
        <p className="mt-1 text-xs font-medium text-muted-foreground">
          Dimensiones actuales: {dimensiones.ancho}×{dimensiones.alto} px
        </p>
      )}

      <div className="relative mt-4">
        <VehiclePhotoFrame
          src={foto}
          alt={nombre || 'Vehículo'}
          className="rounded-2xl"
          overlay={
            <div className="absolute inset-x-0 bottom-0 flex gap-2 bg-black/50 p-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={disabled || uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <ImagePlus className="size-4" aria-hidden="true" />
                )}
                {uploading ? 'Subiendo…' : foto ? 'Cambiar foto' : 'Subir foto'}
              </Button>
              {foto && (
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={disabled || uploading}
                  onClick={quitarFoto}
                >
                  <X className="size-4" aria-hidden="true" />
                  Quitar
                </Button>
              )}
            </div>
          }
        />
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        aria-hidden="true"
        tabIndex={-1}
        className="sr-only"
        disabled={disabled}
        onChange={(event) => {
          void handleUpload(event.target.files?.[0]);
          event.target.value = '';
        }}
      />

      {(error ?? aviso) && (
        <p role="alert" className="mt-3 text-sm font-medium text-destructive">
          {error ?? aviso}
        </p>
      )}
    </section>
  );
}