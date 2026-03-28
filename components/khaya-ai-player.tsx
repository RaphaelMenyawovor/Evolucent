"use client"

import { useState } from "react"
import { Volume2, VolumeX, Loader2 } from "lucide-react"

interface KhayaAIPlayerProps {
  text: string
}

export function KhayaAIPlayer({ text }: KhayaAIPlayerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)

  async function handlePlay() {
    if (isPlaying && audio) {
      audio.pause()
      audio.currentTime = 0
      setIsPlaying(false)
      setAudio(null)
      return
    }

    setError(null)
    setIsLoading(true)

    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? "Could not generate audio. Please try again.")
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const newAudio = new Audio(url)

      newAudio.addEventListener("ended", () => {
        setIsPlaying(false)
        setAudio(null)
        URL.revokeObjectURL(url)
      })

      newAudio.addEventListener("error", () => {
        setIsPlaying(false)
        setAudio(null)
        setError("Audio playback failed.")
        URL.revokeObjectURL(url)
      })

      setAudio(newAudio)
      setIsPlaying(true)
      await newAudio.play()
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
