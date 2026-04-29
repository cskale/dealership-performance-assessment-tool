import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ChipInputProps {
  value: string[];
  onChange: (val: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function ChipInput({ value, onChange, placeholder, disabled }: ChipInputProps) {
  const [inputValue, setInputValue] = useState('');

  const addChip = () => {
    const nextValue = inputValue.trim();
    if (!nextValue) return;
    onChange([...value, nextValue]);
    setInputValue('');
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addChip();
    }
  };

  return (
    <div
      className={cn(
        'flex flex-wrap gap-1.5 border border-[hsl(var(--neutral-300))] rounded-lg px-3 py-2 focus-within:ring-1 focus-within:ring-[hsl(var(--brand-500))]',
        disabled && 'opacity-50 cursor-not-allowed',
      )}
    >
      {value.map(chip => (
        <Badge
          key={chip}
          variant="outline"
          className="bg-[hsl(var(--brand-100))] text-[hsl(var(--brand-700))] border-[hsl(var(--brand-200))] text-xs px-2 py-0.5 rounded-full"
        >
          <span>{chip}</span>
          <button
            type="button"
            className="ml-1 text-[hsl(var(--brand-700))] hover:text-[hsl(var(--neutral-900))] focus:outline-none"
            onClick={() => onChange(value.filter(v => v !== chip))}
            disabled={disabled}
            aria-label={`Remove ${chip}`}
          >
            ×
          </button>
        </Badge>
      ))}
      <input
        value={inputValue}
        onChange={event => setInputValue(event.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          if (!inputValue.trim()) setInputValue('');
        }}
        placeholder={placeholder}
        disabled={disabled}
        className="min-w-[120px] flex-1 border-0 bg-transparent p-0 text-sm leading-6 outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
      />
    </div>
  );
}