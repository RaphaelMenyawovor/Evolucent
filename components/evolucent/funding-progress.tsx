import * as React from "react"
import { cn } from "@/lib/utils"
import { formatGHS, getMilestone } from "@/lib/format"

type FundingProgressProps = {
  raised: number
  target: number
  className?: string
  showMeta?: boolean
}

export function FundingProgress({
  raised,
  target,
  className,
  showMeta = true,
}: FundingProgressProps) {
  const percent = Math.min(100, Math.round((raised / target) * 100))
  const milestone = getMilestone(percent)

  return (
    <div className={cn("space-y-2", className)}>
      <div className="progress-container">
        <div
          className="relative h-2 w-full overflow-hidden rounded-full bg-evolucent-sand"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="relative h-full rounded-full bg-gradient-to-r from-civic-green to-[#00B87A] transition-[width] duration-[1200ms] [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] progress-fill"
            style={{ width: `${percent}%` }}
            {...(milestone ? { "data-milestone": milestone } : {})}
          />
        </div>
        {showMeta ? (
          <div className="progress-meta mt-2 flex flex-wrap items-center gap-2 text-sm">
            <span className="font-mono font-medium text-foreground">
              {formatGHS(raised)}
            </span>
            <span className="rounded-full bg-gold-light px-2 py-0.5 font-mono text-xs font-semibold text-gold-dark">
              {percent}%
            </span>
            <span className="text-muted-foreground">
              of{" "}
              <span className="font-mono font-medium text-foreground">
                {formatGHS(target)}
              </span>
            </span>
          </div>
        ) : null}
      </div>
    </div>
  )
}
