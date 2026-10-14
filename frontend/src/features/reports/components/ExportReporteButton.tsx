import { useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  construirCsv,
  descargarCsv,
  motivoExportDeshabilitado,
  nombreArchivoCsv,
  puedeExportar,
  type DatosExportables,
  type Periodo,
} from '../utils/reporte.format';

interface ExportReporteButtonProps {
  periodo: Periodo;
  datos: DatosExportables;
}

export function ExportReporteButton({ periodo, datos }: ExportReporteButtonProps) {
  const [exportado, setExportado] = useState(false);
  const habilitado = puedeExportar(datos);

  if (!habilitado) {
    return (
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled
        title={motivoExportDeshabilitado(datos)}
      >
        <Download aria-hidden="true" />
        Exportar CSV
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {exportado && (
        <span role="status" className="text-xs text-accent-foreground">
          CSV descargado.
        </span>
      )}
      <Button
        type="button"
        size="sm"
        onClick={() => {
          descargarCsv(nombreArchivoCsv(periodo), construirCsv(datos));
          setExportado(true);
        }}
      >
        <Download aria-hidden="true" />
        Exportar CSV
      </Button>
    </div>
  );
}