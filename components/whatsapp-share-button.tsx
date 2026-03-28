"use client"

import { MessageCircle } from "lucide-react"

interface WhatsAppShareButtonProps {
  projectTitle: string
  projectUrl: string
}

export function WhatsAppShareButton({
  projectTitle,
  projectUrl,
}: WhatsAppShareButtonProps) {
  const shareText = `Support "${projectTitle}" on Evolucent — transparent civic funding. ${projectUrl}`

  return (
    <a
      href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex w-fit items-center gap-2 rounded-md bg-[#25D366] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#1ebe5a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2"
    >
      <MessageCircle className="size-4" />
      Share on WhatsApp
    </a>
  )
}
