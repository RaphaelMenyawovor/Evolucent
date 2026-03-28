"use client"

import { useState } from "react"
import { Volume2, VolumeX, Loader2, ChevronDown } from "lucide-react"

const LANGUAGES = [
  { code: "tw", label: "Twi" },
  { code: "gaa", label: "Ga" },
  { code: "ee", label: "Ewe" },
  { code: "fat", label: "Fante" },
  { code: "dag", label: "Dagbani" },
] as const

type LangCode = (typeof LANGUAGES)[number]["code"]

interface KhayaAIPlayerProps {
  text: string
}

const audioCache = new Map<string, string>()

function cacheKey(text: string, lang: LangCode) {
  return `${lang}::${text}`
}

export function KhayaAIPlayer({ text }: KhayaAIPlayerProps) {
  const [language, setLanguage] = useState<LangCode>("tw")
  const [isLoading, setIsLoading] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)

  const langLabel = LANGUAGES.find((l) => l.code === language)!.label

  async function handlePlay() {
    if (isPlaying && audio) {
      audio.pause()
      audio.currentTime = 0
      setIsPlaying(false)
      setAudio(null)
      return
    }

    setError(null)

    const key = cacheKey(text, language)
    const cached = audioCache.get(key)
    if (cached) {
      const newAudio = new Audio(cached)
      newAudio.addEventListener("ended", () => {
        setIsPlaying(false)
        setAudio(null)
      })
      newAudio.addEventListener("error", () => {
        setIsPlaying(false)
        setAudio(null)
        setError("Audio playback failed.")
      })
      setAudio(newAudio)
      setIsPlaying(true)
      await newAudio.play()
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? "Could not generate audio. Please try again.")
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)

      audioCache.set(key, url)

      const newAudio = new Audio(url)

      newAudio.addEventListener("ended", () => {
        setIsPlaying(false)
        setAudio(null)
      })

      newAudio.addEventListener("error", () => {
        setIsPlaying(false)
        setAudio(null)
        setError("Audio playback failed.")
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
      <div className="flex items-center gap-2">
        <div className="relative">
          <select
            aria-label="Select language"
            value={language}
            onChange={(e) => setLanguage(e.target.value as LangCode)}
            disabled={isLoading || isPlaying}
            className="appearance-none rounded-md border border-zinc-200 bg-white py-2 pl-3 pr-8 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-zinc-400" />
        </div>

        <button
          type="button"
          onClick={handlePlay}
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
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
              Listen in {langLabel}
            </>
          )}
        </button>
      </div>
      {error && (
        <p role="alert" className="text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}
