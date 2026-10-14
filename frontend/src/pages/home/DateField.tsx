import { format } from 'date-fns';
import { es as esDateFns } from 'date-fns/locale';
import { CalendarDays } from 'lucide-react';
import { es as esDayPicker } from 'react-day-picker/locale';
import { Calendar } from '@/shared/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover';

export interface DateFieldProps {
  label: string;
  date?: Date;
  placeholder: string;
  ariaLabel: string;
  onSelect: (date?: Date) => void;
  minDate: Date;
  defaultMonth: Date;
}

export function DateField({
  label,
  date,
  placeholder,
  ariaLabel,
  onSelect,
  minDate,
  defaultMonth,
}: DateFieldProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={ariaLabel}
          className="flex w-full items-center gap-3 rounded-full px-4 py-2.5 text-left transition-colors hover:bg-white/10 sm:px-5 sm:py-2"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-[#8FD9CE]">
            <CalendarDays className="size-4" aria-hidden="true" />
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="text-[11px] font-medium uppercase tracking-wide text-primary-foreground/70">
              {label}
            </span>
            <span className="truncate text-sm font-semibold text-primary-foreground">
              {date
                ? format(date, 'dd MMM yyyy', { locale: esDateFns })
                : placeholder}
            </span>
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onSelect}
          locale={esDayPicker}
          defaultMonth={defaultMonth}
          disabled={{ before: minDate }}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}