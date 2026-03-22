import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground",
        outline: "text-foreground",
        success:
          "border-transparent bg-success/10 text-success-foreground",
        warning:
          "border-transparent bg-warning/10 text-warning-foreground",
        info:
          "border-transparent bg-info/10 text-info-foreground",
        discovery:
          "border-transparent bg-discovery/10 text-discovery-foreground",

        // Maturity variants
        "maturity-advanced":
          "text-[11px] px-2.5 py-[3px] bg-[hsl(var(--dd-green-light))] text-[hsl(160,60%,22%)] border border-[#6ee7b7] font-medium",
        "maturity-developing":
          "text-[11px] px-2.5 py-[3px] bg-[hsl(var(--dd-accent-light))] text-[hsl(var(--dd-accent))] border border-[hsl(var(--dd-accent-mid))] font-medium",
        "maturity-inconsistent":
          "text-[11px] px-2.5 py-[3px] bg-[hsl(var(--dd-amber-light))] text-[hsl(38,70%,28%)] border border-[#fcd34d] font-medium",
        "maturity-foundational":
          "text-[11px] px-2.5 py-[3px] bg-[hsl(var(--dd-red-light))] text-[hsl(0,60%,35%)] border border-[#fca5a5] font-medium",
        "maturity-critical":
          "text-[11px] px-2.5 py-[3px] bg-[hsl(var(--dd-fog))] text-[hsl(var(--dd-muted))] border border-[hsl(var(--dd-rule))] font-medium",

        // Module variants
        "module-nvs":
          "text-[11px] px-2.5 py-[3px] bg-[hsl(var(--dd-teal-light))] text-[hsl(var(--dd-teal))] border border-[#7dd3fc] font-medium",
        "module-uvs":
          "text-[11px] px-2.5 py-[3px] bg-[hsl(var(--dd-accent-light))] text-[hsl(var(--dd-accent))] border border-[hsl(var(--dd-accent-mid))] font-medium",
        "module-service":
          "text-[11px] px-2.5 py-[3px] bg-[hsl(var(--dd-green-light))] text-[hsl(var(--dd-green))] border border-[#6ee7b7] font-medium",
        "module-financial":
          "text-[11px] px-2.5 py-[3px] bg-[hsl(var(--dd-amber-light))] text-[hsl(var(--dd-amber))] border border-[#fcd34d] font-medium",
        "module-parts":
          "text-[11px] px-2.5 py-[3px] bg-[hsl(var(--dd-fog))] text-[hsl(var(--dd-muted))] border border-[hsl(var(--dd-rule))] font-medium",

        // Priority variants
        "priority-critical":
          "text-[11px] px-2.5 py-[3px] bg-[hsl(var(--dd-red-light))] text-[hsl(var(--dd-red))] border border-[#fca5a5] font-medium",
        "priority-high":
          "text-[11px] px-2.5 py-[3px] bg-[hsl(var(--dd-amber-light))] text-[hsl(var(--dd-amber))] border border-[#fcd34d] font-medium",
        "priority-medium":
          "text-[11px] px-2.5 py-[3px] bg-[hsl(var(--dd-accent-light))] text-[hsl(var(--dd-accent))] border border-[hsl(var(--dd-accent-mid))] font-medium",
        "priority-low":
          "text-[11px] px-2.5 py-[3px] bg-[hsl(var(--dd-fog))] text-[hsl(var(--dd-muted))] border border-[hsl(var(--dd-rule))] font-medium",

        // Phase variants
        "phase-30":
          "text-[11px] px-2.5 py-[3px] bg-[hsl(var(--dd-green-light))] text-[hsl(var(--dd-green))] border border-[#6ee7b7] font-medium",
        "phase-60":
          "text-[11px] px-2.5 py-[3px] bg-[hsl(var(--dd-accent-light))] text-[hsl(var(--dd-accent))] border border-[hsl(var(--dd-accent-mid))] font-medium",
        "phase-90":
          "text-[11px] px-2.5 py-[3px] bg-[hsl(var(--dd-fog))] text-[hsl(var(--dd-muted))] border border-[hsl(var(--dd-rule))] font-medium",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
