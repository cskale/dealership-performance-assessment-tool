import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-1 text-label transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-border bg-primary text-primary-foreground",
        primary:
          "border-transparent bg-primary text-primary-foreground",
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
          "bg-success/10 text-success border-success/20",
        "maturity-advanced":
          "bg-primary/10 text-primary border-primary/20",
        "maturity-developing":
          "bg-warning/10 text-warning border-warning/20",
        "maturity-foundational":
          "bg-destructive/10 text-destructive border-destructive/20",
        "maturity-inconsistent":
          "bg-warning/10 text-warning border-warning/20",
        "maturity-critical":
          "bg-muted text-muted-foreground border-border",

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
