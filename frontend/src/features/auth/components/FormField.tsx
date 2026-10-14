import * as React from 'react';
import { cn } from 'cn';
import { Input } from '@/shared/components/ui/input';

interface FormFieldProps
  extends Omit<React.ComponentProps<'input'>, 'id' | 'className'> {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  endAdornment?: React.ReactNode;
  className?: string;
}

export function FormField({
  id,
  label,
  error,
  hint,
  icon,
  endAdornment,
  className,
  ...inputProps
}: FormFieldProps) {
  const describedBy = [error ? `${id}-error` : null, hint ? `${id}-hint` : null]
    .filter(Boolean)
    .join(' ') || undefined;

  return (
    <div className={cn('grid gap-1', className)}>
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            {icon}
          </span>
        )}
        <Input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(icon && 'pl-9', endAdornment && 'pr-10')}
          {...inputProps}
        />
        {endAdornment && (
          <span className="absolute right-1.5 top-1/2 -translate-y-1/2">
            {endAdornment}
          </span>
        )}
      </div>
      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}