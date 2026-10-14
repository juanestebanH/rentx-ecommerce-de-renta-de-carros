import { useCallback, useEffect, useRef, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { cn } from 'cn';
import { Button } from '@/shared/components/ui/button';
import { AdminDrawer } from './AdminDrawer';
import { AdminSidebar } from './AdminSidebar';

const COLLAPSED_KEY = 'rentx:admin-sidebar-collapsed';

function readCollapsed(): boolean {
  try {
    return window.localStorage.getItem(COLLAPSED_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * Shell del panel de administración. A diferencia de Layout (sitio público)
 * no monta HomeFooter ni HelpWidget: el panel es una herramienta interna y
 * no debe enlazar a páginas de cliente ni abrir FAQs de renters.
 *
 * Navegación vertical colapsable (riel de íconos) en escritorio y drawer
 * off-canvas en móvil. El estado plegado se recuerda en localStorage.
 */
export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(COLLAPSED_KEY, String(collapsed));
    } catch {
      // Modo privado o storage bloqueado: el estado vive solo en memoria.
    }
  }, [collapsed]);

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const toggleCollapsed = useCallback(
    () => setCollapsed((value) => !value),
    [],
  );

  return (
    <div className="flex min-h-svh flex-col lg:h-svh lg:flex-row lg:overflow-hidden">
      <aside
        className={cn(
          'hidden shrink-0 border-r border-border bg-card transition-[width] duration-200 motion-reduce:transition-none lg:flex lg:flex-col',
          collapsed ? 'w-16' : 'w-64',
        )}
      >
        <AdminSidebar
          collapsed={collapsed}
          onToggleCollapsed={toggleCollapsed}
        />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col lg:overflow-y-auto lg:overflow-x-clip lg:contain-paint">
        <div className="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-card px-3 lg:hidden">
          <Button
            ref={menuButtonRef}
            variant="ghost"
            size="icon-sm"
            onClick={() => setDrawerOpen(true)}
            aria-label="Abrir menú de administración"
            aria-expanded={drawerOpen}
            aria-controls="admin-drawer"
            className="text-muted-foreground"
          >
            <Menu className="size-4" aria-hidden="true" />
          </Button>
          <span className="text-sm font-semibold tracking-tight">RentX</span>
        </div>

        <main className="flex-1">
          <Outlet />
        </main>
      </div>

      <AdminDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        triggerRef={menuButtonRef}
      />
    </div>
  );
}
