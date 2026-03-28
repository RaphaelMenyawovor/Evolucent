"use client"

import { MessageCircle } from "lucide-react"

interface WhatsAppShareButtonProps {
  projectTitle: string
  /** Optional absolute URL. Defaults to window.location.href at click time. */
  projectUrl?: string
}

export function WhatsAppShareButton({
  projectTitle,
  projectUrl,
}: WhatsAppShareButtonProps) {
  function handleShare() {
    const url =
      projectUrl ??
      (typeof window !== "undefined" ? window.location.href : "")
    const text = `Support "${projectTitle}" on Evolucent — transparent civic funding. ${url}`

    // Use native Web Share API when available (mobile browsers)
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator
        .share({ title: projectTitle, text, url })
        .catch(() => openWhatsApp(text))
    } else {
      openWhatsApp(text)
    }
  }

  function openWhatsApp(text: string) {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer"
    )
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex w-fit items-center gap-2 rounded-md bg-[#25D366] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#1ebe5a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2"
    >
      <MessageCircle className="size-4" />
      Share on WhatsApp
    </button>
  )
}
