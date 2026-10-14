import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';

export type CatalogSortValue = 'precio-asc' | 'precio-desc' | 'recientes';

const SORT_OPTIONS: { value: CatalogSortValue; label: string }[] = [
  { value: 'precio-asc', label: 'Precio: menor a mayor' },
  { value: 'precio-desc', label: 'Precio: mayor a menor' },
  { value: 'recientes', label: 'Más recientes' },
];

interface CatalogSortSelectProps {
  value: CatalogSortValue;
  onValueChange: (value: CatalogSortValue) => void;
}

export function CatalogSortSelect({
  value,
  onValueChange,
}: CatalogSortSelectProps) {
  return (
    <Select
      value={value}
      onValueChange={(value) => onValueChange(value as CatalogSortValue)}
    >
      <SelectTrigger className="w-56" aria-label="Ordenar por">
        <SelectValue placeholder="Ordenar" />
      </SelectTrigger>
      <SelectContent>
        {SORT_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}