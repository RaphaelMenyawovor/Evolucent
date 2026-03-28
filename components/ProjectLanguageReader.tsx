"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const LANGUAGES = [
  { code: "English" as const, label: "English", flag: "🇬🇧" },
  { code: "Twi" as const, label: "Twi", flag: "🇬🇭" },
  { code: "Ewe" as const, label: "Ewe", flag: "🇬🇭" },
  { code: "Ga" as const, label: "Ga", flag: "🇬🇭" },
  { code: "Dagbani" as const, label: "Dagbani", flag: "🇬🇭" },
  { code: "Fante" as const, label: "Fante", flag: "🇬🇭" },
];

type Props = {
  projectTitle: string;
  projectDescription: string;
  projectRegion: string;
  amountRaised: number;
  targetAmount: number;
};

type State = "idle" | "loading" | "playing" | "done" | "error";

export function ProjectLanguageReader({
  projectTitle,
  projectDescription,
  projectRegion,
  amountRaised,
  targetAmount,
}: Props) {
  const [selectedLang, setSelectedLang] = useState<string | null>(null);
  const [state, setState] = useState<State>("idle");
  const [translatedText, setTranslatedText] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  function stopAudio() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    if (typeof window !== "undefined") {
      window.speechSynthesis?.cancel();
    }
  }

  useEffect(() => () => stopAudio(), []);

  const handleLanguageSelect = async (lang: string) => {
    stopAudio();
    setSelectedLang(lang);
    setState("loading");
    setTranslatedText("");

    try {
      // Step 1: Translate via GhanaNLP (English returns original text unchanged)
      const translateRes = await fetch("/api/translate-project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectTitle,
          projectDescription,
          projectRegion,
          amountRaised,
          targetAmount,
          language: lang,
        }),
      });

      const translateData = (await translateRes.json()) as {
        text?: string;
        langCode?: string;
        error?: string;
      };

      if (!translateRes.ok || !translateData.text) {
        setState("error");
        return;
      }

      const text = translateData.text;
      const langCode = translateData.langCode;
      setTranslatedText(text);

      // Step 2: Synthesize — Khaya TTS for Ghanaian languages, browser for English
      if (lang === "English" || !langCode || langCode === "en") {
        if (typeof window !== "undefined" && window.speechSynthesis) {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = "en-GH";
          utterance.rate = 0.92;
          utterance.onend = () => setState("done");
          utterance.onerror = () => setState("done");
          window.speechSynthesis.speak(utterance);
        }
        setState("playing");
        return;
      }

      const ttsRes = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language: langCode }),
      });

      if (!ttsRes.ok) {
        // TTS failure is non-fatal — translated text is already visible
        setState("done");
        return;
      }

      const blob = await ttsRes.blob();
      const url = URL.createObjectURL(blob);
      blobUrlRef.current = url;

      const audio = new Audio(url);
      audioRef.current = audio;

      const cleanup = () => {
        URL.revokeObjectURL(url);
        blobUrlRef.current = null;
        audioRef.current = null;
      };
      audio.addEventListener("ended", () => { setState("done"); cleanup(); });
      audio.addEventListener("error", () => { setState("done"); cleanup(); });

      setState("playing");
      await audio.play();
    } catch {
      setState("error");
    }
  };

  const handleStop = () => {
    stopAudio();
    setState("done");
  };

  return (
    <div className="mb-6 rounded-[var(--radius-lg)] border-[1.5px] border-border bg-evolucent-off-white p-5 dark:bg-card md:px-6">
      <div className="mb-4 flex items-center gap-2.5">
        <span className="text-lg" aria-hidden>
          🔊
        </span>
        <span className="font-sans text-[13px] font-semibold uppercase tracking-[0.06em] text-foreground">
          Listen to this project
        </span>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {LANGUAGES.map((lang) => {
          const isActive = selectedLang === lang.code;
          const isLoading = isActive && state === "loading";
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => handleLanguageSelect(lang.code)}
              disabled={isLoading}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border-[1.5px] px-4 py-2 text-[13px] font-medium transition-all duration-150",
                isActive
                  ? "border-civic-green bg-civic-green-light font-semibold text-civic-green-dark dark:bg-civic-green/15 dark:text-civic-green-light"
                  : "border-border bg-card text-muted-foreground hover:border-foreground/20"
              )}
            >
              {isLoading ? (
                <span
                  className="inline-block size-3 animate-spin rounded-full border-2 border-civic-green border-t-transparent"
                  aria-hidden
                />
              ) : (
                <span className="text-sm" aria-hidden>
                  {lang.flag}
                </span>
              )}
              {lang.label}
              {isActive && state === "playing" ? (
                <span
                  className="ml-0.5 inline-block size-1.5 animate-pulse-live rounded-full bg-civic-green"
                  aria-hidden
                />
              ) : null}
            </button>
          );
        })}
      </div>

      {state !== "idle" ? (
        <div
          className={cn(
            "flex items-start justify-between gap-3 rounded-[10px] border px-4 py-3",
            state === "error"
              ? "border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/30"
              : "border-civic-green/30 bg-civic-green-light dark:border-civic-green/30 dark:bg-civic-green/10"
          )}
        >
          <div className="min-w-0 flex-1">
            {state === "loading" ? (
              <p className="m-0 font-sans text-[13px] text-civic-green-dark dark:text-civic-green-light">
                Translating into {selectedLang}…
              </p>
            ) : null}
            {(state === "playing" || state === "done") && translatedText ? (
              <>
                <p className="mb-1.5 m-0 font-sans text-[13px] font-medium text-civic-green-dark dark:text-civic-green-light">
                  {state === "playing"
                    ? `▶ Playing in ${selectedLang}…`
                    : `✓ ${selectedLang} translation`}
                </p>
                <p className="m-0 font-sans text-sm leading-relaxed text-foreground">
                  {translatedText}
                </p>
              </>
            ) : null}
            {state === "error" ? (
              <p className="m-0 font-sans text-[13px] text-[var(--evolucent-red)]">
                Could not translate or read aloud. Check your connection and API
                setup, then try again.
              </p>
            ) : null}
          </div>
          {state === "playing" ? (
            <button
              type="button"
              onClick={handleStop}
              className="shrink-0 rounded-full border-[1.5px] border-civic-green bg-card px-3.5 py-1.5 font-sans text-xs font-semibold text-civic-green hover:bg-muted"
            >
              ■ Stop
            </button>
          ) : null}
        </div>
      ) : null}

      <p className="mt-3 font-sans text-[11px] leading-snug text-muted-foreground">
        Powered by Khaya AI · GhanaNLP. Native Ghanaian language voices.
      </p>
    </div>
  );
}
