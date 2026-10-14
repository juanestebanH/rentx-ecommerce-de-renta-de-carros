import { SideDrawer } from '@/shared/components/ui/SideDrawer';
import { useRetainedValue } from '@/shared/hooks/useRetainedValue';
import type { RentalConVehiculo } from '@/features/rentals/types/rental.types';
import type { Client } from '../types/clients.types';
import { HistorialRentas } from './HistorialRentas';

interface HistorialProps {
  data?: RentalConVehiculo[];
  isLoading: boolean;
  error: unknown;
  onRetry: () => void;
}

interface ClientsHistoryDrawerProps {
  client: Client | null;
  historial: HistorialProps;
  onClose: () => void;
}

export function ClientsHistoryDrawer({
  client,
  historial,
  onClose,
}: ClientsHistoryDrawerProps) {
  // Se conserva el último cliente para que la animación de salida no muestre
  // el panel vacío cuando el padre limpia la selección al cerrar.
  const contenido = useRetainedValue(client);
  const nombreCompleto = contenido
    ? `${contenido.nombres} ${contenido.apellidos}`
    : '';

  return (
    <SideDrawer
      open={client !== null}
      onClose={onClose}
      eyebrow="Historial de rentas"
      title={nombreCompleto}
      subtitle={
        contenido ? `${contenido.numero_licencia} · ${contenido.email}` : ''
      }
    >
      <HistorialRentas
        data={historial.data}
        isLoading={historial.isLoading}
        error={historial.error}
        onRetry={historial.onRetry}
      />
    </SideDrawer>
  );
}
