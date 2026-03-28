/** Consistent civic fund formatting — every pesewa visible. */

export function formatGHS(amount: number): string {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatCompact(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`
  return num.toString()
}

export function formatRegion(region: string): string {
  return region
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ")
}

export function formatTimestamp(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const hours = diffMs / (1000 * 60 * 60)
  if (hours < 24) {
    const m = Math.floor(diffMs / (1000 * 60))
    if (m < 1) return "just now"
    if (m < 60) return `${m} min ago`
    const h = Math.floor(m / 60)
    return `${h} hour${h === 1 ? "" : "s"} ago`
  }
  return date.toLocaleDateString("en-GH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function getMilestone(percent: number): "25" | "50" | "75" | "100" | undefined {
  if (percent >= 100) return "100"
  if (percent >= 75) return "75"
  if (percent >= 50) return "50"
  if (percent >= 25) return "25"
  return undefined
}
