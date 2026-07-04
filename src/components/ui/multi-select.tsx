import * as React from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface MultiSelectOption {
  value: string;
  label: string;
  mandatory?: boolean;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  selected: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select…",
  disabled,
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const toggle = (value: string, mandatory?: boolean) => {
    if (mandatory) return;
    const next = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value];
    onChange(next);
  };

  const remove = (value: string, mandatory?: boolean, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (mandatory) return;
    onChange(selected.filter((v) => v !== value));
  };

  const selectedOptions = options.filter((o) => selected.includes(o.value));

  return (
    <Popover open={open} onOpenChange={(v) => !disabled && setOpen(v)}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "flex min-h-10 w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-sm text-left ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
        >
          <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">
            {selectedOptions.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              selectedOptions.map((o) => (
                <span
                  key={o.value}
                  className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--dd-accent-light))] text-[hsl(var(--dd-accent))] px-2 py-0.5 text-xs font-medium"
                >
                  {o.label}
                  {!o.mandatory && !disabled && (
                    <span
                      role="button"
                      tabIndex={-1}
                      onClick={(e) => remove(o.value, o.mandatory, e)}
                      className="hover:opacity-70 cursor-pointer"
                      aria-label={`Remove ${o.label}`}
                    >
                      <X className="h-3 w-3" />
                    </span>
                  )}
                </span>
              ))
            )}
          </div>
          <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="p-1 w-[--radix-popover-trigger-width] max-h-72 overflow-y-auto"
        align="start"
      >
        <div className="flex flex-col">
          {options.map((opt) => {
            const isSelected = selected.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggle(opt.value, opt.mandatory)}
                disabled={opt.mandatory}
                className={cn(
                  "flex items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-sm text-left hover:bg-accent hover:text-accent-foreground disabled:cursor-default disabled:opacity-70"
                )}
              >
                <span className="flex items-center gap-2">
                  <span
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded border",
                      isSelected
                        ? "bg-[hsl(var(--dd-accent))] border-[hsl(var(--dd-accent))] text-white"
                        : "border-input"
                    )}
                  >
                    {isSelected && <Check className="h-3 w-3" />}
                  </span>
                  <span>{opt.label}</span>
                </span>
                {opt.mandatory && (
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Required</span>
                )}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
