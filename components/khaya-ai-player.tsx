"use client"

import { useRef, useState } from "react"
import { Volume2, VolumeX, Loader2, ChevronDown } from "lucide-react"

type LangCode = "tw" | "ee" | "gaa" | "dag" | "fat"

const LANGUAGES: { code: LangCode; label: string }[] = [
  { code: "tw", label: "Twi" },
  { code: "ee", label: "Ewe" },
  { code: "gaa", label: "Ga" },
  { code: "dag", label: "Dagbani" },
  { code: "fat", label: "Fante" },
]

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

    const key = cacheKey(text, language)
    const cached = audioCache.get(key)
    if (cached) {
      const newAudio = new Audio(cached)
      newAudio.addEventListener("ended", () => {
        setIsPlaying(false)
        audioRef.current = null
      })
      newAudio.addEventListener("error", () => {
        setIsPlaying(false)
        audioRef.current = null
        setError("Audio playback failed.")
      })
      audioRef.current = newAudio
      setIsPlaying(true)
      await newAudio.play()
      return
    }

    setIsLoading(true)

    try {
      // Step 1: Translate English text → selected language via GhanaNLP
      const langLabel = LANGUAGES.find((l) => l.code === language)?.label ?? language
      const translateRes = await fetch("/api/translate-project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language: langLabel }),
      })

      if (!translateRes.ok) {
        const data = await translateRes.json().catch(() => ({})) as { error?: string }
        throw new Error(data.error ?? "Translation failed")
      }

      const { text: translatedText } = await translateRes.json() as { text: string }

      // Step 2: Synthesize translated text via Khaya TTS
      const ttsRes = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: translatedText, language }),
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

  const langLabel = LANGUAGES.find((l) => l.code === language)?.label ?? language

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
