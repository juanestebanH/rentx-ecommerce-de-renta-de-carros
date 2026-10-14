import { NavLink } from 'react-router-dom';
import {
  BarChart3,
  CarFront,
  LayoutDashboard,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  ReceiptText,
  Tags,
  UserCog,
  Users,
} from 'lucide-react';
import { cn } from 'cn';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useLogout } from '@/features/auth/hooks/useAuth';
import { Button } from '@/shared/components/ui/button';
import { ThemeToggle } from '@/shared/components/ThemeToggle';

const ADMIN_LINKS = [
  { to: '/admin', label: 'Panel', icon: LayoutDashboard, end: true },
  { to: '/admin/reportes', label: 'Reportes', icon: BarChart3, end: false },
  { to: '/admin/clientes', label: 'Clientes', icon: Users, end: false },
  { to: '/admin/rentas', label: 'Rentas', icon: ReceiptText, end: false },
  { to: '/admin/vehiculos', label: 'Vehículos', icon: CarFront, end: false },
  { to: '/admin/catalogo', label: 'Catálogo', icon: Tags, end: false },
  { to: '/admin/usuarios', label: 'Usuarios', icon: UserCog, end: false },
] as const;

function initialsOf(nombre: string): string {
  const parts = nombre.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part.charAt(0).toUpperCase()).join('') || 'AD';
}

interface AdminSidebarProps {
  collapsed: boolean;
  onToggleCollapsed?: () => void;
  onNavigate?: () => void;
  className?: string;
}

export function AdminSidebar({
  collapsed,
  onToggleCollapsed,
  onNavigate,
  className,
}: AdminSidebarProps) {
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();

  const nombre = user?.nombre ?? 'Administrador';
  const iniciales = initialsOf(nombre);

  return (
    // Sin `overflow`: el panel tiene scroll propio, y un contenedor con
    // overflow recortaría los tooltips que sobresalen del riel de íconos.
    <div
      className={cn(
        'flex min-h-full flex-col gap-4 px-3 py-4',
        className,
      )}
    >
      <div
        className={cn(
          'flex gap-2 px-1',
          collapsed ? 'flex-col items-center' : 'items-center',
        )}
      >
        <NavLink
          to="/admin"
          onClick={onNavigate}
          className="flex min-w-0 items-center gap-2"
          aria-label="RentX - panel de administración"
        >
          <span className={cn('truncate font-semibold tracking-tight', collapsed && 'sr-only')}>
            RentX
          </span>
        </NavLink>

        {onToggleCollapsed && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onToggleCollapsed}
            aria-expanded={!collapsed}
            aria-controls="admin-sidebar-nav"
            aria-label={collapsed ? 'Desplegar menú' : 'Plegar menú'}
            className={cn('shrink-0 text-muted-foreground', !collapsed && 'ml-auto')}
          >
            {collapsed ? (
              <PanelLeftOpen aria-hidden="true" />
            ) : (
              <PanelLeftClose aria-hidden="true" />
            )}
          </Button>
        )}
      </div>

      <nav
        id="admin-sidebar-nav"
        aria-label="Administración"
        className="flex flex-col gap-1"
      >
        {ADMIN_LINKS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-[var(--accent-bg)] text-accent-foreground before:absolute before:inset-y-1.5 before:left-0 before:w-0.5 before:rounded-full before:bg-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                collapsed && 'justify-center px-0',
              )
            }
          >
            <Icon className="size-4 shrink-0" aria-hidden="true" />
            <span className={cn(collapsed && 'sr-only')}>{label}</span>
            {collapsed && (
              <span
                role="tooltip"
                className="pointer-events-none absolute left-full top-1/2 z-10 ml-2 hidden -translate-y-1/2 whitespace-nowrap rounded-md border border-border bg-card px-2 py-1 text-xs text-foreground shadow-md group-hover:block group-focus-visible:block"
              >
                {label}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-2 border-t border-border pt-4">
        <div
          className={cn(
            'flex items-center gap-3 rounded-md px-1 py-1',
            collapsed && 'justify-center px-0',
          )}
        >
          <span
            aria-hidden="true"
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground"
          >
            {iniciales}
          </span>
          <span
            className={cn(
              'flex min-w-0 flex-col leading-tight',
              collapsed && 'sr-only',
            )}
          >
            <span className="truncate text-sm font-medium text-foreground">
              {nombre}
            </span>
            {user?.email && (
              <span className="truncate text-xs text-muted-foreground">
                {user.email}
              </span>
            )}
          </span>
        </div>

        <ThemeToggle
          showLabel
          className={cn(
            'h-9 justify-start rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground',
            collapsed && 'justify-center px-0',
          )}
          labelClassName={cn(collapsed && 'sr-only')}
        />

        <Button
          variant="ghost"
          onClick={() => {
            void logout();
          }}
          aria-label="Cerrar sesión"
          className={cn(
            'justify-start gap-3 text-destructive hover:bg-destructive/10 hover:text-destructive',
            collapsed && 'justify-center px-0',
          )}
        >
          <LogOut className="size-4 shrink-0" aria-hidden="true" />
          <span className={cn(collapsed && 'sr-only')}>Cerrar sesión</span>
        </Button>
      </div>
    </div>
  );
}
