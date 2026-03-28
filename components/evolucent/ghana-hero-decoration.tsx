import * as React from "react"

/** Stylized Ghana outline for hero backgrounds — symbolic, not geographic survey. */
export function GhanaHeroDecoration({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M100 8 L165 42 L188 95 L175 155 L130 198 L70 205 L32 168 L15 110 L28 52 Z"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="currentColor"
        fillOpacity="0.06"
      />
      <path
        d="M100 28 L148 54 L162 98 L152 142 L118 176 L78 180 L48 150 L38 105 L52 58 Z"
        stroke="currentColor"
        strokeWidth="0.8"
        fill="currentColor"
        fillOpacity="0.04"
      />
    </svg>
  )
}

export function FlagStripeBar({ className }: { className?: string }) {
  return (
    <div
      className={className}
      style={{
        height: 3,
        background:
          "linear-gradient(90deg, #CE1126 0%, #CE1126 33%, #FCD116 33%, #FCD116 66%, #006B3F 66%, #006B3F 100%)",
      }}
      role="presentation"
    />
  )
}
