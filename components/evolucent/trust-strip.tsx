import * as React from "react"
import { cn } from "@/lib/utils"

function TrustBadge({
  icon,
  label,
  sub,
}: {
  icon: string
  label: string
  sub: string
}) {
  return (
    <div className="flex min-w-[140px] flex-1 flex-col gap-0.5 rounded-lg border border-border bg-card/80 px-3 py-2">
      <span className="text-sm" aria-hidden>
        {icon}
      </span>
      <span className="font-display text-xs font-bold tracking-tight text-foreground">
        {label}
      </span>
      <span className="text-[11px] leading-snug text-muted-foreground">{sub}</span>
    </div>
  )
}

export function TrustStrip({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-2 sm:grid-cols-4",
        className
      )}
      role="region"
      aria-label="Trust and escrow"
    >
      <TrustBadge
        icon="🔒"
        label="Escrow protected"
        sub="Stanbic · Ecobank · Fidelity"
      />
      <TrustBadge
        icon="✓"
        label="Audited release"
        sub="Independent verification"
      />
      <TrustBadge
        icon="👁"
        label="100% visible"
        sub="Every pesewa tracked"
      />
      <TrustBadge
        icon="🏛"
        label="Board governed"
        sub="6/8 votes to release funds"
      />
    </div>
  )
}
