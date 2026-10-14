import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  useDashboardReport,
  useEstadoFlota,
  useIngresosMensuales,
  useRentasRecientes,
} from '@/features/reports/hooks/useReports';
import { KpiBand } from '@/features/reports/components/KpiBand';
import { IngresosAreaChart } from '@/features/reports/components/IngresosAreaChart';
import { FlotaDonut } from '@/features/reports/components/FlotaDonut';
import { ReservasRecientes } from '@/features/reports/components/ReservasRecientes';

function AdminDashboardPage() {
  const dashboard = useDashboardReport();
  const ingresos = useIngresosMensuales();
  const recientes = useRentasRecientes();
  const flota = useEstadoFlota();
  const [updateStatus, setUpdateStatus] = useState<string | null>(null);

  const updating =
    dashboard.isFetching ||
    ingresos.isFetching ||
    recientes.isFetching ||
    flota.isFetching;

  const handleRefresh = async () => {
    setUpdateStatus(null);
    try {
      const results = await Promise.all([
        dashboard.refetch(),
        ingresos.refetch(),
        recientes.refetch(),
        flota.refetch(),
      ]);
      const fallo = results.some((result) => result.isError);
      const hora = new Date().toLocaleTimeString('es-CO', {
        hour: '2-digit',
        minute: '2-digit',
      });
      setUpdateStatus(
        fallo ? 'No se pudo actualizar los datos' : `Datos actualizados · ${hora}`,
      );
    } catch {
      setUpdateStatus('No se pudo actualizar los datos');
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="my-0 text-3xl font-semibold tracking-tight">Panel</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Resumen de la operación en tiempo real.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={updating}
        >
          <RefreshCw
            className={`size-4 ${updating ? 'animate-spin' : ''}`}
            aria-hidden="true"
          />
          Actualizar
        </Button>
      </div>

      <p aria-live="polite" className="sr-only">
        {updateStatus}
      </p>

      <section aria-label="Indicadores principales">
        <KpiBand
          report={dashboard.data}
          isLoading={dashboard.isLoading}
          error={dashboard.error}
          onRetry={() => void dashboard.refetch()}
        />
      </section>

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <IngresosAreaChart
            data={ingresos.data}
            isLoading={ingresos.isLoading}
            error={ingresos.error}
            onRetry={() => void ingresos.refetch()}
          />
        </div>
        <div className="lg:col-span-4">
          <FlotaDonut
            data={flota.data}
            isLoading={flota.isLoading}
            error={flota.error}
            onRetry={() => void flota.refetch()}
          />
        </div>
      </div>

      <ReservasRecientes
        data={recientes.data}
        isLoading={recientes.isLoading}
        error={recientes.error}
        onRetry={() => void recientes.refetch()}
      />
    </div>
  );
}

export default AdminDashboardPage;