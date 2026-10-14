import type { ReactNode } from 'react';
import { Dialog as DialogPrimitive } from 'radix-ui';
import { X } from 'lucide-react';
import { cn } from 'cn';
import { Button } from './button';
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from './dialog';

interface SideDrawerProps {
  open: boolean;
  onClose: () => void;
  eyebrow: string;
  title: string;
  subtitle: string;
  footer?: ReactNode;
  children: ReactNode;
}

/**
 * Panel lateral modal. Va sobre las primitivas de `Dialog` para heredar el
 * portal a `body` (el `lg:contain-paint` de `AdminLayout` atraparía un `fixed`
 * inline), focus trap, bloqueo de scroll, Escape y foco de retorno.
 */
function SideDrawer({
  open,
  onClose,
  eyebrow,
  title,
  subtitle,
  footer,
  children,
}: SideDrawerProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(siguiente) => {
        if (!siguiente) onClose();
      }}
    >
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          data-slot="side-drawer"
          className={cn(
            'fixed inset-y-0 right-0 z-50 flex h-full w-full flex-col border-l border-border bg-card shadow-[0_0_48px_-8px_rgba(43,36,30,0.35)] outline-none sm:w-[36rem] sm:max-w-[90vw]',
            'data-[state=open]:animate-in data-[state=open]:slide-in-from-right data-[state=open]:duration-300',
            'data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=closed]:duration-300',
          )}
        >
          <div className="flex items-start justify-between gap-3 border-b border-border px-5 pb-4 pt-5">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {eyebrow}
              </p>
              <DialogTitle className="mt-1 truncate text-lg font-semibold tracking-tight">
                {title}
              </DialogTitle>
              <DialogDescription className="mt-1 truncate text-sm text-muted-foreground">
                {subtitle}
              </DialogDescription>
            </div>
            <DialogClose asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Cerrar"
                className="shrink-0 text-muted-foreground"
              >
                <X className="size-4" aria-hidden="true" />
              </Button>
            </DialogClose>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>

          {footer ? (
            <div className="border-t border-border px-5 py-4">{footer}</div>
          ) : null}
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}

export { SideDrawer };
