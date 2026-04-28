import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-border bg-primary text-primary-foreground",
        primary:
          "border-transparent bg-[hsl(var(--brand-500))] text-white",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground",
        outline: "border-border text-foreground",
        success:
          "border-transparent bg-success/10 text-success-foreground",
        warning:
          "border-transparent bg-warning/10 text-warning-foreground",
        info:
          "border-transparent bg-info/10 text-info-foreground",
        discovery:
          "border-transparent bg-discovery/10 text-discovery-foreground",

        // Maturity variants — 4-level: foundational / developing / advanced / leading
        "maturity-leading":
          "text-[11px] px-2.5 py-[3px] bg-[hsl(var(--dd-green-light))] text-[hsl(160,60%,22%)] border border-[#6ee7b7] font-medium",
        "maturity-advanced":
          "text-[11px] px-2.5 py-[3px] bg-[hsl(var(--dd-accent-light))] text-[hsl(var(--dd-accent))] border border-[hsl(var(--dd-accent-mid))] font-medium",
        "maturity-developing":
          "text-[11px] px-2.5 py-[3px] bg-[hsl(var(--dd-amber-light))] text-[hsl(38,70%,28%)] border border-[#fcd34d] font-medium",
        "maturity-foundational":
          "text-[11px] px-2.5 py-[3px] bg-[hsl(var(--dd-red-light))] text-[hsl(0,60%,35%)] border border-[#fca5a5] font-medium",
        "maturity-inconsistent":
          "text-[11px] px-2.5 py-[3px] bg-[hsl(var(--dd-amber-light))] text-[hsl(38,70%,28%)] border border-[#fcd34d] font-medium",
        "maturity-critical":
          "text-[11px] px-2.5 py-[3px] bg-[hsl(var(--dd-fog))] text-[hsl(var(--dd-muted))] border border-[hsl(var(--dd-rule))] font-medium",

        // Module variants
        "module-nvs":
          "bg-muted text-muted-foreground border-border",
        "module-uvs":
          "bg-muted text-muted-foreground border-border",
        "module-service":
          "bg-muted text-muted-foreground border-border",
        "module-financial":
          "bg-muted text-muted-foreground border-border",
        "module-parts":
          "bg-muted text-muted-foreground border-border",

        // Priority variants
        "priority-critical":
          "bg-muted text-muted-foreground border-border",
        "priority-high":
          "bg-muted text-muted-foreground border-border",
        "priority-medium":
          "bg-muted text-muted-foreground border-border",
        "priority-low":
          "bg-muted text-muted-foreground border-border",

        // Phase variants
        "phase-30":
          "bg-muted text-muted-foreground border-border",
        "phase-60":
          "bg-muted text-muted-foreground border-border",
        "phase-90":
          "bg-muted text-muted-foreground border-border",
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
