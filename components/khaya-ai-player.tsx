"use client"

import { useRef, useState } from "react"
import { Volume2, VolumeX, Loader2 } from "lucide-react"

interface KhayaAIPlayerProps {
  text: string
}

export function KhayaAIPlayer({ text }: KhayaAIPlayerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const blobUrlRef = useRef<string | null>(null)

  async function handlePlay() {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current)
        blobUrlRef.current = null
      }
      setIsPlaying(false)
      return
    }

    setError(null)
    setIsLoading(true)

    try {
      // Step 1: Translate English text → Twi via GhanaNLP
      const translateRes = await fetch("/api/translate-project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language: "Twi" }),
      })

      if (!translateRes.ok) {
        const data = await translateRes.json().catch(() => ({})) as { error?: string }
        throw new Error(data.error ?? "Translation failed")
      }

      const { text: twiText } = await translateRes.json() as { text: string }

      // Step 2: Synthesize Twi text via Khaya TTS
      const ttsRes = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: twiText, language: "tw" }),
      })

      if (!ttsRes.ok) {
        const data = await ttsRes.json().catch(() => ({})) as { error?: string }
        throw new Error(data.error ?? "Could not generate audio. Please try again.")
      }

      const blob = await ttsRes.blob()
      const url = URL.createObjectURL(blob)
      blobUrlRef.current = url

      const audio = new Audio(url)
      audioRef.current = audio

      audio.addEventListener("ended", () => {
        setIsPlaying(false)
        audioRef.current = null
        URL.revokeObjectURL(url)
        blobUrlRef.current = null
      })

      audio.addEventListener("error", () => {
        setIsPlaying(false)
        audioRef.current = null
        setError("Audio playback failed.")
        URL.revokeObjectURL(url)
        blobUrlRef.current = null
      })

      setIsPlaying(true)
      await audio.play()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Playback failed. Please try again.")
      setIsPlaying(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <button
        type="button"
        onClick={handlePlay}
        disabled={isLoading}
        className="inline-flex w-fit items-center gap-2 rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        {isLoading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Loading…
          </>
        ) : isPlaying ? (
          <>
            <VolumeX className="size-4" />
            Stop
          </>
        ) : (
          <>
            <Volume2 className="size-4" />
            Play in Twi
          </>
        )}
      </button>
      {error && (
        <p role="alert" className="text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}
