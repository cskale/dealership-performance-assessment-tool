import * as React from "react"
import { cn } from "@/lib/utils"

interface SignalCardProps {
  title: string
  body: string
  department: string
  severity: 'critical' | 'warning' | 'info' | 'good'
  className?: string
}

const severityBorderColor: Record<SignalCardProps['severity'], string> = {
  critical: 'border-l-[hsl(var(--dd-red))]',
  warning: 'border-l-[hsl(var(--dd-amber))]',
  info: 'border-l-[hsl(var(--dd-accent))]',
  good: 'border-l-[hsl(var(--dd-green))]',
}

function SignalCard({ title, body, department, severity, className }: SignalCardProps) {
  return (
    <div
      className={cn(
        "bg-white border border-[hsl(var(--dd-rule))] rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-all hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]",
        "border-l-[3px]",
        severityBorderColor[severity],
        className
      )}
    >
      <div className="flex items-start gap-2.5 mb-2">
        <span className="text-[13px] font-medium text-[hsl(var(--dd-ink))] flex-1">
          {title}
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--dd-ghost))] bg-[hsl(var(--dd-fog))] px-2 py-0.5 rounded shrink-0">
          {department}
        </span>
      </div>
      <p className="text-[12px] text-[hsl(var(--dd-muted))] leading-relaxed">
        {body}
      </p>
    </div>
  )
}

export { SignalCard }
export type { SignalCardProps }
