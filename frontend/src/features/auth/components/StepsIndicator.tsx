import { cn } from 'cn';
import type { RegisterWizardStep } from './steps';

interface StepsIndicatorProps {
  step: number;
  steps: RegisterWizardStep[];
}

export function StepsIndicator({ step, steps }: StepsIndicatorProps) {
  return (
    <div className="grid gap-1">
      <div className="flex items-center justify-between">
        <p className="my-0 text-sm font-medium text-foreground">
          Paso {step} de {steps.length}
        </p>
        <p className="my-0 text-xs text-muted-foreground">
          {steps.find((s) => s.number === step)?.label}
        </p>
      </div>
      <div className="flex gap-1.5" aria-hidden="true">
        {steps.map((s) => (
          <span
            key={s.number}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-colors duration-300',
              s.number <= step ? 'bg-primary' : 'bg-[var(--accent-bg)]',
            )}
          />
        ))}
      </div>
    </div>
  );
}