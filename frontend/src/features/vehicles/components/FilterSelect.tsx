import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';

interface FilterSelectProps {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  label: string;
  placeholder: string;
  options: readonly string[];
  formatOption?: (value: string) => string;
}

export function FilterSelect({
  value,
  onChange,
  label,
  placeholder,
  options,
  formatOption = (option) => option,
}: FilterSelectProps) {
  return (
    <Select
      value={value ?? ''}
      onValueChange={(next) => onChange(next || undefined)}
    >
      <SelectTrigger
        className={`w-full ${value ? 'border-[var(--accent-border)] text-accent-foreground' : ''}`}
        aria-label={label}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="">{placeholder}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {formatOption(option)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}